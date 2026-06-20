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
	category: string | null;
	thumbnail?: MicroCMSImage;
	/** Optional SP-specific thumbnail; falls back to `thumbnail` when absent. */
	sp_thumbnail?: MicroCMSImage;
	repeat: Array<{
		fieldId: string;
		pj_images?: MicroCMSImage;
		pj_videos?: string;
		pj_images_title: string;
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
    When narrowing with `fields`, include 'hidden' or the flag won't be read. */
export const getVisibleWorks = async (queries?: MicroCMSQueries) => {
	const data = await getList(queries);
	return { ...data, contents: data.contents.filter((w) => w.hidden !== true) };
};

export const getDetail = async (contentId: string, queries?: MicroCMSQueries) => {
	return await client.getListDetail<Work>({
		endpoint: 'works',
		contentId,
		queries
	});
};
