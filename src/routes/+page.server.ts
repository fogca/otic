import { getVisibleWorks } from '$lib/js/microcms';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// getVisibleWorks (not getList) so `hidden`-flagged works never surface on
	// the home feed — matches the archives listings. orders:'order' honours the
	// CMS-curated sequence (the archives loader does the same).
	const data = await getVisibleWorks({ limit: 10, orders: 'order' });
	return { works: data.contents };
};
