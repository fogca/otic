import { getVisibleWorks } from '$lib/js/microcms';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// main_visual + repeat's first entry (repeat[0]) — up to two image
	// frames per work, not the full repeat array.
	const data = await getVisibleWorks({
		limit: 100,
		orders: 'order',
		fields: ['id', 'title', 'main_visual', 'repeat', 'hidden']
	});
	return { works: data.contents };
};
