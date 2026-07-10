import { error } from '@sveltejs/kit';
import { getDetail } from '$lib/js/microcms';
import { mainVisual } from '$lib/js/img';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	let work;
	try {
		work = await getDetail(params.slug);
	} catch {
		throw error(404, `Work "${params.slug}" not found`);
	}

	// Adapt microCMS Work → the legacy `archive` shape used by +page.svelte.
	// Each `repeat` row can carry either an image (pj_images) or a video URL
	// (pj_videos). When pj_videos is set we treat that row as a looping
	// video slide; otherwise the image is used. Rows with neither are dropped.
	type GalleryItem = { src: string; isVideo: boolean };
	const gallery: GalleryItem[] = (work.repeat ?? [])
		.map((r): GalleryItem | null => {
			const videoUrl = r.pj_videos?.trim();
			if (videoUrl) return { src: videoUrl, isVideo: true };
			const imgUrl = r.pj_images?.url;
			if (imgUrl) return { src: imgUrl, isVideo: false };
			return null;
		})
		.filter((x): x is GalleryItem => x !== null);

	const archive = {
		slug: work.id,
		title: work.title,
		brand: work.brand ?? '',
		// Hero = main_visual (Cloudflare video or image), falling back to thumbnail.
		hero: mainVisual(work),
		heroImageSp: work.sp_thumbnail?.url ?? '',
		descriptionJa: work.body_jp ?? work.description ?? '',
		descriptionEn: work.body_en ?? '',
		headline: work.headline ?? '',
		gallery,
		colophonBase: {
			brand: work.brand ?? '',
			// Free-form credit/link rows — plain "label: value" text, or a
			// clickable link when `url` is set. Rows with nothing filled in
			// are dropped rather than shown blank.
			rows: (work.colophon ?? [])
				.filter((r) => r.label?.trim() || r.value?.trim() || r.url?.trim())
				.map((r) => ({
					label: r.label ?? '',
					value: r.value ?? '',
					url: r.url?.trim() || undefined
				}))
		}
	};

	return { archive };
};
