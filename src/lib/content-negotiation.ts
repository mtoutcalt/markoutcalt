/**
 * RFC 9110 §12.5.1 Accept-header negotiation.
 *
 * Implements the parsing rules acceptmarkdown.com requires for compliance:
 * q-values are honoured, more specific media ranges beat less specific ones
 * regardless of q, and an explicit `q=0` is a rejection rather than a
 * low-priority preference.
 *
 * @see https://acceptmarkdown.com/guides/accept-parsing
 */

export const HTML = 'text/html';
export const MARKDOWN = 'text/markdown';

/** Representations this site can produce, in server-preference order. */
export const PRODUCES = [HTML, MARKDOWN] as const;

export type Produced = (typeof PRODUCES)[number];

type AcceptEntry = { type: string; q: number; specificity: number };

function parseAccept(header: string): AcceptEntry[] {
	return header
		.split(',')
		.map((raw) => raw.trim())
		.filter(Boolean)
		.map((raw) => {
			const parts = raw.split(';').map((s) => s.trim());
			const type = parts[0].toLowerCase();
			let q = 1;
			for (const param of parts.slice(1)) {
				const [name, value] = param.split('=').map((s) => s.trim());
				if (name?.toLowerCase() === 'q') {
					const parsed = Number(value);
					if (!Number.isNaN(parsed)) q = Math.max(0, Math.min(1, parsed));
				}
			}
			// */* is the least specific range, type/* sits in between, and a
			// fully-qualified type wins outright.
			const specificity = type === '*/*' ? 0 : type.endsWith('/*') ? 1 : 2;
			return { type, q, specificity };
		});
}

function matches(entry: AcceptEntry, candidate: string): boolean {
	if (entry.type === '*/*') return true;
	if (entry.type.endsWith('/*')) return candidate.startsWith(entry.type.slice(0, -1));
	return entry.type === candidate;
}

/**
 * Pick the representation to serve.
 *
 * Returns `null` only when the client sent an Accept header that genuinely
 * excludes everything we can produce — the one case where 406 is correct.
 */
export function preferredType(header: string | null | undefined): Produced | null {
	if (!header || !header.trim()) return PRODUCES[0];

	const entries = parseAccept(header);
	if (entries.length === 0) return PRODUCES[0];

	let best: Produced | null = null;
	let bestQ = -1;
	let bestPosition = Infinity;

	for (const candidate of PRODUCES) {
		// Find the *most specific* range matching this candidate. Specific
		// ranges override less specific ones regardless of q, so
		// `text/html;q=0, */*` correctly rejects HTML instead of letting the
		// wildcard resurrect it.
		let matched: AcceptEntry | null = null;
		let matchedPosition = Infinity;
		for (let idx = 0; idx < entries.length; idx++) {
			const entry = entries[idx];
			if (!matches(entry, candidate)) continue;
			if (
				matched === null ||
				entry.specificity > matched.specificity ||
				(entry.specificity === matched.specificity && idx < matchedPosition)
			) {
				matched = entry;
				matchedPosition = idx;
			}
		}
		if (matched === null) continue;
		if (matched.q <= 0) continue; // explicit rejection

		// Across candidates: highest q wins, ties break on client order so
		// `Accept: text/markdown, text/html` picks Markdown.
		if (matched.q > bestQ || (matched.q === bestQ && matchedPosition < bestPosition)) {
			bestQ = matched.q;
			bestPosition = matchedPosition;
			best = candidate;
		}
	}

	return best;
}

/** Add `Accept` to an existing Vary header without clobbering what's there. */
export function appendVaryAccept(headers: Headers): void {
	const existing = headers.get('Vary');
	if (!existing) {
		headers.set('Vary', 'Accept');
		return;
	}
	if (existing.trim() === '*') return;
	const tokens = existing.split(',').map((s) => s.trim().toLowerCase());
	if (!tokens.includes('accept')) {
		headers.set('Vary', `${existing}, Accept`);
	}
}
