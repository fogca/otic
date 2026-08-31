import { getVisibleWorks } from '$lib/js/microcms';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// One frame per work — its main_visual image only. No `repeat` fields:
	// the flip cycle is one image per work now, not a multi-lap rotation
	// through each work's extra frames.
	const data = await getVisibleWorks({
		limit: 100,
		orders: 'order',
		fields: ['id', 'title', 'main_visual', 'hidden']
	});
	return { works: data.contents };
};
