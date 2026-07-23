import { getVisibleWorks, type Work } from '$lib/js/microcms';
import { mainVisual } from '$lib/js/img';
import type { PageServerLoad } from './$types';

// Total media count shown in the list's right-most (PC-only) column: the
// thumbnail (main_visual) plus every `repeat` row that actually carries an
// image or video — same non-null test as the gallery built in
// archives/[slug]/+page.server.ts, so the number always matches what's
// actually on the detail page.
function mediaCount(work: Work): number {
	const galleryCount = (work.repeat ?? []).filter(
		(r) => r.pj_videos?.trim() || r.pj_images?.url
	).length;
	return (mainVisual(work) ? 1 : 0) + galleryCount;
}

export const load: PageServerLoad = async () => {
	const data = await getVisibleWorks({ limit: 100, orders: 'order' });
	const works = data.contents.map((work) => ({ ...work, mediaCount: mediaCount(work) }));
	return { works };
};
