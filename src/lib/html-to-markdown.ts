import TurndownService from 'turndown';

/**
 * Converts a rendered page into the Markdown representation served to agents
 * that ask for `Accept: text/markdown`.
 *
 * Only the `<main>` region is converted: nav, footer, inline scripts and the
 * decorative SVG icons are exactly the "nav/scripts/layout markup" the
 * Markdown variant exists to drop. Anything marked `data-md-omit` in the
 * source is decoration with no prose value and is dropped too.
 */

const turndown = new TurndownService({
	headingStyle: 'atx',
	hr: '---',
	bulletListMarker: '-',
	codeBlockStyle: 'fenced',
	emDelimiter: '_',
});

turndown.remove(['script', 'style', 'noscript', 'svg', 'template', 'iframe']);

turndown.addRule('dropOmitted', {
	filter: (node) => {
		if (node.nodeType !== 1) return false;
		const el = node as unknown as Element;
		return el.hasAttribute?.('data-md-omit') || el.classList?.contains('sr-only');
	},
	replacement: () => '',
});

/**
 * Card-style links wrap headings and paragraphs inside a single `<a>`. Turndown
 * would emit the block markup inside the link label; collapse it to one line so
 * the destination stays readable.
 */
turndown.addRule('blockLevelLink', {
	filter: (node) => {
		if (node.nodeName !== 'A') return false;
		const el = node as unknown as Element;
		if (!el.getAttribute?.('href')) return false;
		return Boolean(el.querySelector?.('h1, h2, h3, h4, h5, h6, p, div, li'));
	},
	replacement: (_content, node) => {
		const el = node as unknown as Element;
		// Strip tags rather than reading textContent: Turndown has already
		// collapsed the whitespace between the card's blocks, so the tag
		// boundaries are the only thing left separating the words.
		const text = collapse(decodeEntities((el.innerHTML ?? '').replace(/<[^>]+>/g, ' ')));
		const href = el.getAttribute('href');
		// Block-level in the DOM, so give it its own line: a list of cards would
		// otherwise run together into one unreadable paragraph.
		return text ? `

[${text}](${href})

` : '';
	},
});

function collapse(value: string): string {
	return value.replace(/\s+/g, ' ').trim();
}

const BLOCK_TAG_RE = /<(script|style|noscript|svg|template|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi;

function stripNonContentBlocks(html: string): string {
	return html.replace(BLOCK_TAG_RE, '');
}

function firstMatch(html: string, re: RegExp): string | null {
	const match = re.exec(html);
	return match ? match[1] : null;
}

/** Inner HTML of the first `<main>` element, falling back to `<body>`. */
export function extractMain(html: string): string {
	const main = firstMatch(html, /<main\b[^>]*>([\s\S]*?)<\/main>/i);
	if (main) return main;
	const body = firstMatch(html, /<body\b[^>]*>([\s\S]*?)<\/body>/i);
	return body ?? html;
}

export function extractTitle(html: string): string | null {
	const title = firstMatch(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
	if (!title) return null;
	return decodeEntities(title.trim());
}

function decodeEntities(value: string): string {
	return value
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#0?39;/g, "'")
		.replace(/&#x27;/gi, "'")
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&');
}

/**
 * Rewrite root-relative `href`/`src` values to absolute URLs. An agent that
 * fetched this Markdown has no document base to resolve them against.
 */
function absolutizeUrls(html: string, baseUrl: string): string {
	return html.replace(/\b(href|src)="(\/[^"]*)"/gi, (_match, attr: string, path: string) => {
		try {
			return `${attr}="${new URL(path, baseUrl).href}"`;
		} catch {
			return `${attr}="${path}"`;
		}
	});
}

export interface HtmlToMarkdownOptions {
	/** Absolute page URL: resolves relative links and is emitted as canonical. */
	canonical?: string;
}

export function htmlToMarkdown(html: string, options: HtmlToMarkdownOptions = {}): string {
	const cleaned = stripNonContentBlocks(html);
	let main = stripNonContentBlocks(extractMain(cleaned));
	if (options.canonical) main = absolutizeUrls(main, options.canonical);

	let body = turndown.turndown(main).trim();

	// Every Markdown document should open with a single top-level heading.
	// Most pages already render one inside <main>; the rest borrow <title>.
	if (!/^#\s/m.test(body)) {
		const title = extractTitle(cleaned);
		if (title) body = `# ${title}\n\n${body}`;
	}

	// Collapse the runs of blank lines Turndown leaves behind around removed
	// nodes so the output stays compact for a context window.
	body = body.replace(/\n{3,}/g, '\n\n');

	if (options.canonical) {
		body += `\n\n---\n\nCanonical URL: ${options.canonical}\n`;
	}

	return `${body}\n`;
}
