import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { AstroIntegration } from 'astro';
import { htmlToMarkdown } from '../lib/html-to-markdown';

/**
 * Writes `/blog/<id>.md` next to every built post — the Markdown twin agents read.
 *
 * This runs on the built HTML rather than on the MDX source. Source would be
 * simpler, but three posts (`quotes`, `advice`, `programmer-quotes`) have
 * bodies that are a single JSX map over a file in `src/data/`, so their raw
 * source carries no prose at all. The rendered page is the only place every
 * post's content actually exists.
 *
 * It is a build hook rather than a `.md` route because rendering a post from
 * inside an endpoint needs Astro's container API, whose `loadRenderers` does a
 * runtime `import()` that the prerender bundle cannot resolve.
 */
export default function markdownTwins({ site }: { site: string }): AstroIntegration {
	return {
		name: 'markdown-twins',
		hooks: {
			'astro:build:done': async ({ dir, pages, logger }) => {
				const outDir = fileURLToPath(dir);
				const posts = pages.filter(
					({ pathname }) => pathname.startsWith('blog/') && pathname !== 'blog/',
				);

				let written = 0;
				for (const { pathname } of posts) {
					const source = join(outDir, pathname, 'index.html');
					let html: string;
					try {
						html = await readFile(source, 'utf8');
					} catch {
						// A post that produced no HTML file is a build problem worth
						// hearing about, but not worth failing the deploy over.
						logger.warn(`no HTML found for /${pathname}, skipping its .md twin`);
						continue;
					}

					const canonical = new URL(pathname, site).href;
					const target = join(outDir, `${pathname.replace(/\/$/, '')}.md`);
					await writeFile(target, htmlToMarkdown(html, { canonical }), 'utf8');
					written += 1;
				}

				logger.info(`wrote ${written} Markdown twin${written === 1 ? '' : 's'}`);
			},
		},
	};
}
