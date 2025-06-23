import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
	prefetch: true,
	site: 'https://markoutcalt.com',
	integrations: [mdx(), sitemap(), react()],
	server: {
		host: true, // Listen on all network interfaces
		port: 4321
	},
	image: {
	    responsiveStyles: true,
        layout: 'constrained',
	},
	vite: {
		server: {
			watch: {
				usePolling: true, // This can help with file watching issues
			}
		}
	}
});