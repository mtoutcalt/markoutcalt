import { readdirSync } from 'node:fs';
import { defineConfig, logHandlers } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { satteri } from '@astrojs/markdown-satteri';

const SITE = 'https://markoutcalt.com';

/**
 * Pages that stay reachable at their URL but are kept out of the sitemap and
 * out of search. Nothing on the site links to them. Each one also carries its
 * own `<meta name="robots" content="noindex, nofollow">` — this list only
 * controls the sitemap, so the two have to be changed together.
 */
const UNLISTED_PATHS = ['/game/'];

/**
 * Blog posts are rendered on demand so they can be content-negotiated, which
 * means @astrojs/sitemap can't discover them from the build output. Derive the
 * same ids the glob loader does (path relative to the collection, extension
 * dropped, `_`-prefixed files excluded) and hand them over as custom pages.
 */
function blogPostUrls(dir = 'src/content/blog', prefix = '') {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		if (entry.name.startsWith('_')) return [];
		if (entry.isDirectory()) {
			return blogPostUrls(`${dir}/${entry.name}`, `${prefix}${entry.name}/`);
		}
		if (!/\.mdx?$/.test(entry.name)) return [];
		const id = `${prefix}${entry.name.replace(/\.mdx?$/, '')}`;
		return [`${SITE}/blog/${id}/`];
	});
}

export default defineConfig({
	prefetch: true,
	site: SITE,
	// Server output so `src/middleware.ts` runs per request. Astro middleware
	// only performs Accept negotiation at request time; under the default
	// static output it would run once at build and every agent would get HTML.
	// https://acceptmarkdown.com/recipes/astro
	output: 'server',
	adapter: vercel(),
	integrations: [
		mdx(),
		sitemap({
			customPages: blogPostUrls(),
			filter: (page) => !UNLISTED_PATHS.includes(new URL(page).pathname),
		}),
		react(),
	],
	markdown: {
		processor: satteri(),
	},
	server: {
		host: true, // Listen on all network interfaces
		port: 4321
	},
	image: {
	    responsiveStyles: true,
        layout: 'constrained',
	},
	logger: logHandlers.json(),
	vite: {
		server: {
			watch: {
				usePolling: true, // This can help with file watching issues
			}
		}
	}
});
