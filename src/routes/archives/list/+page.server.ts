import { getVisibleWorks } from '$lib/js/microcms';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const data = await getVisibleWorks({ limit: 100, orders: 'order' });
	return { works: data.contents };
};
