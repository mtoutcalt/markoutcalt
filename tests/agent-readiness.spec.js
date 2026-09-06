import { test, expect } from '@playwright/test';

/**
 * Agent-readiness contract.
 *
 * These are HTTP-level tests on purpose: what an AI agent or crawler sees is
 * the raw response, before any JavaScript runs.
 */

const MARKDOWN = 'text/markdown';
const HTML_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';

/** Visible text an agent would extract from raw HTML, with no JS executed. */
function visibleText(html) {
	return html
		.replace(/<(script|style|noscript|svg|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
		.replace(/<!--[\s\S]*?-->/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&[a-zA-Z#0-9]+;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}

function headingLevels(html) {
	return [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
}

function jsonLdBlocks(html) {
	return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) =>
		JSON.parse(m[1]),
	);
}

/** Flatten `@graph` wrappers so tests can look for node types directly. */
function jsonLdNodes(html) {
	return jsonLdBlocks(html).flatMap((block) => block['@graph'] ?? [block]);
}

test.describe('Markdown twins', () => {
	test('every post has a Markdown twin at <path>.md', async ({ request }) => {
		const response = await request.get('/blog/art-unix-design-rules.md');

		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain(MARKDOWN);

		const body = await response.text();
		expect(body).toMatch(/^#\s/m);
		expect(body.length).toBeGreaterThan(500);
	});

	test('the HTML page stays HTML and is statically cacheable', async ({ request }) => {
		const response = await request.get('/blog/art-unix-design-rules/', {
			headers: { Accept: HTML_ACCEPT },
		});

		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('text/html');
		// The site is prerendered now: nothing may pin a per-request
		// `Vary: Accept` on a page, because that is what stopped browsers
		// reusing prefetched HTML.
		expect(response.headers()['vary']?.toLowerCase() ?? '').not.toContain('accept');
	});

	test('data-driven posts convert to real prose, not an empty JSX map', async ({ request }) => {
		// `quotes` has no prose in its source at all — the body is a single
		// `{quotes.map(...)}`. It only survives conversion because the twin is
		// rendered before it is converted.
		const body = await (await request.get('/blog/quotes.md')).text();

		expect(body).toMatch(/^#\s/m);
		expect(body.length).toBeGreaterThan(300);
		expect(body).not.toContain('.map(');
		expect(body).not.toContain('import {');
	});

	test('emits absolute links and a canonical URL', async ({ request }) => {
		const body = await (await request.get('/blog/quotes.md')).text();

		expect(body).not.toMatch(/\]\(\/[^)]/);
		expect(body).toMatch(/Canonical URL: https?:\/\/[^\s]+\/blog\/quotes\//);
	});

	test('llms.txt points agents at the twins', async ({ request }) => {
		const body = await (await request.get('/llms.txt')).text();

		expect(body).toContain('/blog/art-unix-design-rules.md');
		expect(body).not.toContain('Accept: text/markdown');
	});

	test('twins stay out of the sitemap', async ({ request }) => {
		const index = await (await request.get('/sitemap-index.xml')).text();
		const sitemapUrl = index.match(/<loc>([^<]+sitemap-0\.xml)<\/loc>/)?.[1];
		expect(sitemapUrl).toBeTruthy();

		const body = await (await request.get(new URL(sitemapUrl).pathname)).text();
		expect(body).toContain('/blog/art-unix-design-rules/');
		expect(body).not.toContain('.md<');
	});
});

test.describe('Agent-friendly 404s', () => {
	const MISSING = '/some-path-that-does-not-exist';

	test('returns a real 404 status, never a 200 app shell', async ({ request }) => {
		const response = await request.get(MISSING, { headers: { Accept: HTML_ACCEPT } });
		expect(response.status()).toBe(404);
	});

	test('missing blog posts 404 rather than rendering an empty post', async ({ request }) => {
		const response = await request.get('/blog/definitely-not-a-real-post/');
		expect(response.status()).toBe(404);
	});

	test('the HTML 404 lists the same machine-readable entry points', async ({ request }) => {
		const html = await (await request.get(MISSING, { headers: { Accept: HTML_ACCEPT } })).text();

		expect(html).toContain('href="/llms.txt"');
		expect(html).toContain('href="/sitemap-index.xml"');
		expect(html).toContain('content="noindex, follow"');
	});
});

test.describe('Content without JavaScript', () => {
	test('the raw homepage carries substantial readable text', async ({ request }) => {
		const html = await (await request.get('/', { headers: { Accept: HTML_ACCEPT } })).text();

		expect(visibleText(html).length).toBeGreaterThanOrEqual(500);
	});

	test('the homepage lists recent posts in the raw HTML', async ({ request }) => {
		const html = await (await request.get('/', { headers: { Accept: HTML_ACCEPT } })).text();
		const text = visibleText(html);

		// Real post titles and descriptions, present without running any
		// JavaScript — this is what an agent reads to describe the site.
		const postLinks = [...html.matchAll(/href="\/blog\/[^\"]+\/"/g)];
		expect(postLinks.length).toBeGreaterThanOrEqual(3);
		expect(text).toContain('Recent posts');
		expect(text).toContain('All posts');
	});

	test('headings start at h1 and never skip a level', async ({ request }) => {
		const html = await (await request.get('/', { headers: { Accept: HTML_ACCEPT } })).text();
		const levels = headingLevels(html);

		expect(levels.length).toBeGreaterThan(0);
		expect(levels[0]).toBe(1);
		expect(levels.filter((level) => level === 1)).toHaveLength(1);

		let deepest = levels[0];
		for (const level of levels) {
			expect(level).toBeLessThanOrEqual(deepest + 1);
			deepest = Math.max(deepest, level);
		}
	});
});

test.describe('Structured data', () => {
	test('the homepage identifies a Person and a WebSite', async ({ request }) => {
		const html = await (await request.get('/', { headers: { Accept: HTML_ACCEPT } })).text();
		const nodes = jsonLdNodes(html);
		const types = nodes.map((node) => node['@type']);

		expect(types).toContain('Person');
		expect(types).toContain('WebSite');

		const person = nodes.find((node) => node['@type'] === 'Person');
		expect(person.name).toBe('Mark Outcalt');
		expect(person.url).toBe('https://markoutcalt.com');
		expect(person.sameAs.every((url) => url.startsWith('https://'))).toBe(true);
	});

	test('blog posts declare a BlogPosting authored by the same Person', async ({ request }) => {
		const html = await (
			await request.get('/blog/quotes/', { headers: { Accept: HTML_ACCEPT } })
		).text();
		const nodes = jsonLdNodes(html);
		const posting = nodes.find((node) => node['@type'] === 'BlogPosting');

		expect(posting).toBeTruthy();
		expect(posting.url).toBe('https://markoutcalt.com/blog/quotes/');
		expect(posting.author['@id']).toBe('https://markoutcalt.com/#person');
		expect(posting.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}T/);
	});

	test('every absolute URL uses the apex domain, never www', async ({ request }) => {
		for (const path of ['/', '/blog/quotes/']) {
			const html = await (await request.get(path, { headers: { Accept: HTML_ACCEPT } })).text();
			expect(html).not.toContain('www.markoutcalt.com');
		}
	});
});

test.describe('Brand and machine-readable files', () => {
	test('page titles carry the brand name', async ({ request }) => {
		const home = await (await request.get('/')).text();
		expect(home).toContain('<title>Mark Outcalt — Software Developer</title>');

		const post = await (await request.get('/blog/quotes/')).text();
		expect(post).toContain('<title>Quotes | Mark Outcalt</title>');
	});

	test('every page has a title of its own', async ({ request }) => {
		const paths = ['/', '/blog', '/archive', '/game', '/feed', '/blog/quotes/'];
		const titles = [];

		for (const path of paths) {
			const html = await (await request.get(path)).text();
			const title = html.match(/<title>([\s\S]*?)<\/title>/)[1];

			// Every page claims the brand, and no two pages claim the same title:
			// duplicate titles give a search engine nothing to tell them apart.
			expect(title).toContain('Mark Outcalt');
			titles.push(title);
		}

		expect(new Set(titles).size).toBe(paths.length);
	});

	test('the feed is published under the brand name', async ({ request }) => {
		const body = await (await request.get('/rss.xml')).text();
		expect(body).toContain('<title>Mark Outcalt</title>');
	});

	test('llms.txt indexes the site for agents', async ({ request }) => {
		const response = await request.get('/llms.txt');

		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('text/plain');

		const body = await response.text();
		expect(body).toMatch(/^# Mark Outcalt/);

		// Guidance for agents deciding whether this site is worth consulting:
		// what it is good for, what it is not, and how to fetch it.
		expect(body).toContain('## When to use this site');
		expect(body).toContain('Reach for it when you need:');
		expect(body).toContain('Do not reach for it when you need:');
		expect(body).toContain('## How to fetch it');
		expect(body).toContain('.md');

		expect(body).toContain('## Pages');
		expect(body).toContain('## Posts');
		expect(body).toContain('https://markoutcalt.com/blog/');
		expect(body).toContain('https://markoutcalt.com/sitemap-index.xml');
	});

	test('unlisted pages stay reachable but out of search', async ({ request }) => {
		const page = await request.get('/game');
		expect(page.status()).toBe(200);
		expect(await page.text()).toContain('content="noindex, nofollow"');

		const sitemap = await (await request.get('/sitemap-0.xml')).text();
		expect(sitemap).not.toContain('/game');
	});

	test('robots.txt points at the sitemap and the agent index', async ({ request }) => {
		const body = await (await request.get('/robots.txt')).text();

		expect(body).toContain('Sitemap: https://markoutcalt.com/sitemap-index.xml');
		expect(body).toContain('https://markoutcalt.com/llms.txt');
	});
});
