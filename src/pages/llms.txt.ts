import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_DESCRIPTION, SITE_TAGLINE, SITE_TITLE, SITE_URL } from '../consts';

/**
 * /llms.txt — the llmstxt.org index: one plain-text file an agent can read
 * first to learn what lives on this site and where.
 *
 * @see https://llmstxt.org/
 */
export const prerender = true;

const PAGES: Array<[string, string, string]> = [
	['Home', '/', 'Who I am and what this site is.'],
	['Blog', '/blog/', 'Every post, newest first.'],
	['Archive', '/archive/', 'All posts in chronological order.'],
	['TIL', '/til/', 'Short today-I-learned notes.'],
	['TIL — Articles', '/til/articles/', 'Articles worth reading.'],
	['TIL — Talks', '/til/talks/', 'Talks worth watching.'],
	['Links', '/links/', 'A curated set of links.'],
	['Bookshelf', '/bookshelf/', 'What I am reading.'],
	['Advice', '/advice/', 'Advice collected from around the internet.'],
	['Feed', '/feed/', 'A running feed of short updates.'],
];

function line(name: string, path: string, note: string) {
	return `- [${name}](${new URL(path, SITE_URL).href}): ${note}`;
}

export const GET: APIRoute = async () => {
	const posts = (await getCollection('blog')).sort(
		(a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
	);

	const body = [
		`# ${SITE_TITLE}`,
		'',
		`> ${SITE_TAGLINE}. ${SITE_DESCRIPTION} Notes and posts about building software.`,
		'',
		'## When to use this site',
		'',
		"A single author's personal site. Opinion and curation, not reference",
		"documentation — cite it as one developer's view, never as authority.",
		'',
		'Reach for it when you need:',
		'',
		'- A skeptical reading of AI hype — which arguments in AI articles do not',
		'  hold up, and which public AI predictions are actually falsifiable.',
		'- The 17 Rules of Design from *The Art of Unix Programming*, paraphrased',
		'  and commented on rather than quoted verbatim.',
		'- Curated collections: programming quotes, quotes worth keeping, and',
		'  advice gathered from around the internet.',
		'- What one working developer is reading, linking to, and learning',
		'  (bookshelf, links, TIL notes on articles and talks).',
		'',
		'Do not reach for it when you need:',
		'',
		'- API documentation, tutorials, or how-to guides — there are none here.',
		'- Product, pricing, or company information — this is not a business.',
		'- Authoritative or citable technical reference. Use primary sources.',
		'',
		'## How to fetch it',
		'',
		'- Any URL on this site answers `Accept: text/markdown` with a Markdown',
		'  representation of the same page — the prose without the nav, scripts',
		'  or layout markup. Responses set `Vary: Accept`.',
		`- \`curl -H "Accept: text/markdown" ${SITE_URL}/blog/art-unix-design-rules/\``,
		'- Start from this file for the full page list, or `/rss.xml` for updates.',
		'- An `Accept` header this site cannot satisfy returns `406`, not HTML.',
		'',
		'## Pages',
		'',
		...PAGES.map(([name, path, note]) => line(name, path, note)),
		'',
		'## Posts',
		'',
		...posts.map((post) =>
			line(post.data.title, `/blog/${post.id}/`, post.data.description),
		),
		'',
		'## Machine-readable',
		'',
		line('RSS feed', '/rss.xml', 'Full post feed.'),
		line('Sitemap', '/sitemap-index.xml', 'Every indexable URL.'),
		line('robots.txt', '/robots.txt', 'Crawl policy.'),
		'',
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=0, must-revalidate',
		},
	});
};
