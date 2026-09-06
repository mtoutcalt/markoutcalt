/**
 * Adds a browser cache policy for HTML to the built route table.
 *
 * Vercel ignores `vercel.json` routing config for projects that use the Build
 * Output API (which `@astrojs/vercel` does), so this patches
 * `.vercel/output/config.json` directly, as a post-build step.
 *
 * Why it matters: `prefetch: true` in astro.config.mjs prefetches post HTML on
 * hover, but Vercel's default for static HTML is `max-age=0, must-revalidate`,
 * which forbids the browser from reusing that prefetched response without a
 * revalidation round trip — so the prefetch is paid for and never cashed in.
 * A short `max-age` covers the seconds between hover and click, and
 * `stale-while-revalidate` keeps repeat navigation instant while the browser
 * refreshes in the background.
 *
 * The rule is inserted before `handle: "filesystem"`: header routes have to be
 * matched before the file is served, or they never apply to it.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONFIG = join('.vercel', 'output', 'config.json');

// Only extensionless paths — the HTML pages. Hashed `_astro/` assets already
// carry `immutable` from the adapter, and everything with a file extension
// (images, fonts, .md twins, feeds) keeps the platform default.
const HTML_ROUTE = {
	src: '^/(?!_astro/)[^.]*$',
	headers: { 'cache-control': 'public, max-age=60, stale-while-revalidate=86400' },
	continue: true,
};

const config = JSON.parse(await readFile(CONFIG, 'utf8'));
config.routes ??= [];

if (config.routes.some((route) => route.src === HTML_ROUTE.src)) {
	console.log('cache-headers: HTML cache rule already present');
} else {
	config.routes.unshift(HTML_ROUTE);
	await writeFile(CONFIG, `${JSON.stringify(config, null, '\t')}\n`, 'utf8');
	console.log(`cache-headers: ${HTML_ROUTE.headers['cache-control']}`);
}
