import type { MicroCMSImage, MicroCMSQueries } from 'microcms-js-sdk';
import { createClient } from 'microcms-js-sdk';
import { MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY } from '$env/static/private';

const client = createClient({
	serviceDomain: MICROCMS_SERVICE_DOMAIN,
	apiKey: MICROCMS_API_KEY
});

// Type definitions
export type Work = {
	id: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	revisedAt: string;
	title: string;
	brand?: string;
	order?: number;
	/** CMS boolean field. When true, the work is dropped from the archives
	    grid/list. Used instead of microCMS "公開終了" (CLOSED lags in the
	    Content API and isn't exposed there). */
	hidden?: boolean;
	description: string;
	scope: string[];
	body_jp: string;
	body_en: string;
	headline?: string;
	/** Short "built with" line shown right under the body copy on the work
	    detail page (e.g. "SvelteKit / Cloudflare / microCMS") — separate
	    from the Colophon section further down. Not yet a live CMS field;
	    optional until added. */
	stack?: string;
	category: string | null;
	thumbnail?: MicroCMSImage;
	/** Optional SP-specific thumbnail; falls back to `thumbnail` when absent. */
	sp_thumbnail?: MicroCMSImage;
	/** Optional PC-specific hero image (e.g. a horizontal crop for works whose
	    main_visual is portrait) — falls back to main_visual when absent. Not
	    yet a live CMS field; optional until added. */
	pc_thumbnail?: MicroCMSImage;
	/** Primary visual (custom field) — supports a Cloudflare video (`pj_videos`)
	    or an image (`pj_images`). Migrated from `thumbnail`. */
	main_visual?: {
		fieldId: string;
		pj_images?: MicroCMSImage;
		pj_videos?: string;
		pj_images_title?: string;
	};
	repeat: Array<{
		fieldId: string;
		pj_images?: MicroCMSImage;
		pj_videos?: string;
		pj_images_title: string;
		/** CMS boolean ("優先表示"). Marks this row's image/video as the one to
		    lead the archives grid's round-robin for this work, ahead of the
		    thumbnail — see archives/+page.server.ts. */
		pj_images_priority?: boolean;
	}>;
	repeatImg?:
		| Array<{
				fieldId: string;
				images?: MicroCMSImage;
		  }>
		| {
				fieldId?: string;
				images?: MicroCMSImage;
		  }
		| MicroCMSImage;
	/** Colophon rows — free-form "label: value" credit lines (Direction,
	    Design, Photography, ...). Set `url` to make a row a clickable link
	    instead (value becomes the link text, falling back to the URL itself
	    when left blank). One field for both credits and links. Not yet a
	    live CMS field; optional until added. */
	colophon?: Array<{
		fieldId: string;
		label?: string;
		value?: string;
		url?: string;
	}>;
	/** Colophon as free-form rich text (richEditor — raw HTML) — an
	    alternative to the structured `colophon` rows above, tried alongside
	    it rather than replacing it. Not yet a live CMS field; optional
	    until added. */
	colophon_text?: string;
};

// Sort: works with `order` field come first (asc), others fall back to API's default order
export const sortByOrder = (works: Work[]): Work[] => {
	return [...works].sort((a, b) => {
		const ao = a.order;
		const bo = b.order;
		if (ao != null && bo != null) return ao - bo;
		if (ao != null) return -1;
		if (bo != null) return 1;
		return 0;
	});
};

export type WorkResponse = {
	totalCount: number;
	offset: number;
	limit: number;
	contents: Work[];
};

// API calls
export const getList = async (queries?: MicroCMSQueries) => {
	return await client.get<WorkResponse>({ endpoint: 'works', queries });
};

/** getList + drop works flagged `hidden`. Prefer this for public listings.
    When narrowing with `fields`, include 'hidden' or the flag won't be read.
    The hidden exclusion is applied server-side (via `filters`), not just
    filtered out of the response after the fact — a caller-supplied `limit`
    must cap the VISIBLE count, otherwise a hidden work occupying one of the
    first N raw slots silently pushes a real, visible work out of the page
    entirely (confirmed live: order=9 had a hidden dupe crowding out order=10
    "thalassic" from the home page's top-10 query). */
export const getVisibleWorks = async (queries?: MicroCMSQueries) => {
	const hiddenFilter = 'hidden[not_equals]true';
	const filters = queries?.filters ? `(${queries.filters})[and](${hiddenFilter})` : hiddenFilter;
	const data = await getList({ ...queries, filters });
	return { ...data, contents: data.contents.filter((w) => w.hidden !== true) };
};

export const getDetail = async (contentId: string, queries?: MicroCMSQueries) => {
	return await client.getListDetail<Work>({
		endpoint: 'works',
		contentId,
		queries
	});
};
