import { defineMiddleware } from 'astro:middleware';
import { HTML, MARKDOWN, appendVaryAccept, preferredType } from './lib/content-negotiation';
import { htmlToMarkdown } from './lib/html-to-markdown';

/**
 * Markdown content negotiation, acceptmarkdown.com style.
 *
 * Every HTML page on this site has a Markdown twin at the same URL. Agents
 * that send `Accept: text/markdown` get the prose without the nav, scripts and
 * icon markup; browsers keep getting HTML. `Vary: Accept` is set on both so a
 * CDN never hands one audience the other's variant.
 *
 * @see https://acceptmarkdown.com/recipes/astro
 */

/**
 * The site was fully static before it moved to on-demand rendering, and every
 * page was CDN-cached. Keep that: browsers revalidate, Vercel's edge holds each
 * representation for a few minutes and serves it stale while it refreshes.
 * Vercel keys its edge cache on `Vary`, so the HTML and Markdown variants are
 * cached separately. A deploy invalidates the cache, so new posts are never
 * hidden behind it.
 */
const CACHE_CONTROL = 'public, max-age=0, must-revalidate, s-maxage=600, stale-while-revalidate=86400';

/** Body returned when the client accepts neither of our representations. */
function notAcceptable(url: URL): Response {
	const body = [
		'# 406 Not Acceptable',
		'',
		'This URL can be served as `text/html` or `text/markdown`.',
		'Your `Accept` header asked for neither.',
		'',
		`- HTML: \`curl -H "Accept: text/html" ${url.href}\``,
		`- Markdown: \`curl -H "Accept: text/markdown" ${url.href}\``,
		'',
		`Site index for agents: ${new URL('/llms.txt', url).href}`,
		'',
	].join('\n');

	const headers = new Headers({
		'Content-Type': 'text/plain; charset=utf-8',
		Vary: 'Accept',
	});
	return new Response(body, { status: 406, headers });
}

export const onRequest = defineMiddleware(async (context, next) => {
	// Prerendered routes (the OG images, the feeds, /llms.txt) are rendered once
	// at build time, where there is no client Accept header to negotiate on.
	if (context.isPrerendered) {
		context.locals.prefersMarkdown = false;
		return next();
	}

	const chosen = preferredType(context.request.headers.get('accept'));
	context.locals.prefersMarkdown = chosen === MARKDOWN;

	const response = await next();

	const contentType = response.headers.get('content-type') ?? '';
	const servesHtml = contentType.includes(HTML);
	const servesMarkdown = contentType.includes(MARKDOWN);

	// Feeds, images and other assets take part in no negotiation, so they must
	// not pick up `Vary: Accept` and must never be answered with a 406.
	if (!servesHtml && !servesMarkdown) return response;

	appendVaryAccept(response.headers);
	if (response.status === 200 && !response.headers.has('cache-control')) {
		response.headers.set('Cache-Control', CACHE_CONTROL);
	}

	// The route already produced Markdown itself (blog posts serve their
	// original source rather than a conversion of the rendered page).
	if (servesMarkdown) return response;

	if (chosen === null) return notAcceptable(context.url);
	if (chosen !== MARKDOWN) return response;

	// HEAD carries no body to convert, but must still advertise the type it
	// would have returned for a GET.
	if (context.request.method === 'HEAD') {
		const headers = new Headers(response.headers);
		headers.set('Content-Type', 'text/markdown; charset=utf-8');
		return new Response(null, { status: response.status, headers });
	}

	const html = await response.text();
	const markdown = htmlToMarkdown(html, { canonical: context.url.href });

	const headers = new Headers(response.headers);
	headers.set('Content-Type', 'text/markdown; charset=utf-8');
	headers.delete('content-length');

	// Status is preserved deliberately: a 404 stays a 404 and simply gains a
	// Markdown body telling the agent where to look next.
	return new Response(markdown, { status: response.status, headers });
});
