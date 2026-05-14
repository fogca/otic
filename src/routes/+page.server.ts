import { getList } from '$lib/js/microcms';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const data = await getList({ limit: 10 });
	return { works: data.contents };
};
