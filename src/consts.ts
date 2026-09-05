// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

/**
 * The one name this site goes by — header, feed, page titles, structured data.
 * It matches the domain on purpose: a brand-name search only resolves to you if
 * the name, the domain and the header all agree.
 */
export const SITE_TITLE = 'Mark Outcalt';

/**
 * The name the site used to carry. Kept as an `alternateName` so anything that
 * already refers to the site by it still resolves to the same entity.
 */
export const FORMER_SITE_TITLE = "Mark's Blog";

export const SITE_DESCRIPTION = 'Welcome to my corner of the web!';

/**
 * Canonical, apex-domain origin. Everything that emits an absolute URL —
 * structured data, feeds, the sitemap — must agree on this one string so search
 * engines and agents resolve a single brand identity instead of splitting it
 * between the apex and `www.` hosts.
 */
export const SITE_URL = 'https://markoutcalt.com';

export const SITE_TAGLINE = 'Software Developer';
export const AUTHOR_NAME = 'Mark Outcalt';

/** Profiles that corroborate the brand, for `sameAs` in structured data. */
export const SAME_AS = [
	'https://github.com/mtoutcalt',
	'https://mastodon.social/@markoutcalt',
	'https://www.linkedin.com/in/mark-outcalt-b3391529/',
];
