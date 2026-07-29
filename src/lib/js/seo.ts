// Single source of truth for canonical URLs and social-card metadata.
//
// SITE_URL is hardcoded to the custom domain on purpose — NOT derived from
// page.url.origin. While the site is still reachable at otic.pages.dev, a
// canonical pointing at takumiisobe.com is exactly what we want: it tells
// crawlers which host is authoritative and keeps the pages.dev copy from
// competing as duplicate content. Deriving it from the request would emit
// pages.dev on pages.dev and defeat the point.
export const SITE_URL = 'https://takumiisobe.com';
/** og:site_name — the studio's name as it should read in a social card. */
export const SITE_NAME = 'Office / TAKUMI ISOBE';
/** Title suffix, matching the existing <title> convention across the site
    ("Archives — TAKUMIISOBE.com"). Deliberately NOT SITE_NAME: pairing them
    would render "Office — Office / TAKUMI ISOBE". */
export const TITLE_SUFFIX = 'TAKUMIISOBE.com';

// Lifted from the Office page's own lead copy so the card and the site say
// the same thing (src/routes/office/+page.svelte, .panel-lead).
export const DEFAULT_DESCRIPTION =
	'A creative office in Tokyo, working across identity, product, and digital craft.';
export const DEFAULT_DESCRIPTION_JA =
	'東京を拠点に、アイデンティティ・プロダクト・デジタルの領域を横断するクリエイティブオフィスです。';

// Lives in static/, not src/lib/assets/, so the URL stays stable: social
// platforms cache OG images by URL, and a Vite content hash would change on
// every re-export and orphan those caches.
export const OG_IMAGE = `${SITE_URL}/OGP.png`;
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type Seo = {
	title: string;
	description: string;
	/** Absolute URL. Falls back to OG_IMAGE. */
	image?: string;
	/** og:type — 'article' for individual works, 'website' otherwise. */
	type?: 'website' | 'article';
};

// Pages that have no load function of their own get their metadata here
// rather than growing a +page.ts just to carry two strings. Keys are exact
// pathnames; /archives/[slug] is handled by its own load (see
// archives/[slug]/+page.server.ts).
const PAGE_SEO: Record<string, Seo> = {
	'/': {
		// The home card leads with the studio name itself, not a section label.
		title: `${SITE_NAME} — ${TITLE_SUFFIX}`,
		description: DEFAULT_DESCRIPTION
	},
	'/archives': {
		title: `Archives — ${TITLE_SUFFIX}`,
		description: 'Selected work — identity, product, type, and digital craft.'
	},
	'/archives/list': {
		title: `Archives — ${TITLE_SUFFIX}`,
		description: 'Selected work — identity, product, type, and digital craft.'
	},
	'/office': {
		title: `Office — ${TITLE_SUFFIX}`,
		description: DEFAULT_DESCRIPTION
	},
	'/services': {
		title: `Services — ${TITLE_SUFFIX}`,
		description:
			'What we do, how to commission it, and what to expect — identity, product, image, and digital.'
	}
};

/** Resolve the metadata for a page: an `seo` object from the page's own load
    function wins, then the static map above, then the site defaults. */
export function resolveSeo(pathname: string, fromLoad?: Seo | null): Seo {
	const base = fromLoad ?? PAGE_SEO[pathname];
	return {
		title: base?.title ?? `${SITE_NAME} — ${TITLE_SUFFIX}`,
		description: base?.description ?? DEFAULT_DESCRIPTION,
		image: base?.image ?? OG_IMAGE,
		type: base?.type ?? 'website'
	};
}

/** og:image:width/height may only be declared for the site card, whose
    dimensions we actually know. Per-work images come from microCMS with
    `fit=max`, which caps the WIDTH and lets height fall where the aspect
    ratio puts it — declaring 630 there would be a lie, and platforms lay
    the card out from the declared box before the file arrives. */
export function hasKnownImageSize(image: string | undefined): boolean {
	return image === OG_IMAGE;
}

/** Absolute canonical URL. Trailing slashes are stripped (except the root)
    so /office and /office/ can never present as two different canonicals. */
export function canonicalUrl(pathname: string): string {
	const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '';
	return `${SITE_URL}${clean}`;
}
