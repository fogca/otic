import { getVisibleWorks } from '$lib/js/microcms';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Image-only fields (main_visual + repeat thumbnails) — the slider is a
	// static image cycle, not a video player, so no video fields needed.
	// limit:8 was under half the catalogue (16 works) and made for a thin
	// rotation — pull the whole catalogue instead.
	const data = await getVisibleWorks({
		limit: 100,
		orders: 'order',
		fields: ['id', 'title', 'main_visual', 'repeat', 'hidden']
	});
	return { works: data.contents };
};
