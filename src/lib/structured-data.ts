import {
	AUTHOR_NAME,
	FORMER_SITE_TITLE,
	SAME_AS,
	SITE_DESCRIPTION,
	SITE_TAGLINE,
	SITE_TITLE,
	SITE_URL,
} from '../consts';

/**
 * Shared schema.org fragments.
 *
 * Kept in one place so every page emits the same identity — same apex URL,
 * same person, same `sameAs` list. Inconsistent copies were previously
 * pointing at `www.` and at a shortened author name, which splits the brand
 * signal that search engines and AI agents use to resolve "Mark Outcalt".
 */

const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;

export const personJsonLd = {
	'@type': 'Person',
	'@id': PERSON_ID,
	name: AUTHOR_NAME,
	url: SITE_URL,
	jobTitle: SITE_TAGLINE,
	image: `${SITE_URL}/favicon.svg`,
	sameAs: SAME_AS,
};

export const websiteJsonLd = {
	'@type': 'WebSite',
	'@id': WEBSITE_ID,
	name: SITE_TITLE,
	alternateName: [FORMER_SITE_TITLE, 'markoutcalt.com'],
	url: SITE_URL,
	description: SITE_DESCRIPTION,
	inLanguage: 'en',
	publisher: { '@id': PERSON_ID },
};

/** `@graph` wrapper so a page can emit one script tag for several nodes. */
export function graph(...nodes: object[]) {
	return {
		'@context': 'https://schema.org',
		'@graph': nodes,
	};
}

export interface BlogPostingInput {
	title: string;
	description: string;
	url: string;
	image?: string;
	pubDate: Date;
	updatedDate?: Date;
	tags?: string[];
}

export function blogPostingJsonLd(post: BlogPostingInput) {
	return {
		'@type': 'BlogPosting',
		headline: post.title,
		description: post.description,
		url: post.url,
		mainEntityOfPage: { '@type': 'WebPage', '@id': post.url },
		image: post.image ? new URL(post.image, SITE_URL).href : undefined,
		keywords: post.tags?.length ? post.tags.join(', ') : undefined,
		datePublished: post.pubDate.toISOString(),
		dateModified: (post.updatedDate ?? post.pubDate).toISOString(),
		author: { '@id': PERSON_ID },
		publisher: { '@id': PERSON_ID },
		isPartOf: { '@id': WEBSITE_ID },
	};
}
