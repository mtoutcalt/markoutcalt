import { defineConfig, logHandlers } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import { satteri } from '@astrojs/markdown-satteri';
import markdownTwins from './src/integrations/markdown-twins';

const SITE = 'https://markoutcalt.com';

/**
 * Pages that stay reachable at their URL but are kept out of the sitemap and
 * out of search. Nothing on the site links to them. Each one also carries its
 * own `<meta name="robots" content="noindex, nofollow">` — this list only
 * controls the sitemap, so the two have to be changed together.
 */
const UNLISTED_PATHS = ['/game/'];

export default defineConfig({
	prefetch: true,
	site: SITE,
	// Every route is prerendered at build time and served from Vercel's CDN.
	// The site used to render on demand so middleware could content-negotiate
	// Markdown per request; that cost real visitors a `max-age=0,
	// must-revalidate` on every page, which cancelled the `prefetch` above.
	// Agents now get Markdown from the prerendered `.md` twins instead.
	output: 'static',
	adapter: vercel(),
	integrations: [
		mdx(),
		sitemap({
			filter: (page) => !UNLISTED_PATHS.includes(new URL(page).pathname),
		}),
		react(),
		// Last: it reads the HTML the rest of the build just produced. The twins
		// are written after the sitemap is generated, so they never appear in it.
		markdownTwins({ site: SITE }),
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
