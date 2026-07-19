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

	// The tag/theme line under the title: `description` holds JA and EN in
	// one field, "ja!en" (a literal "!" between them, JA first) — editors
	// write both languages there instead of separate fields. No "!" at all
	// means the field is JA-only. Falls back to the older single-language
	// `headline` field for works not yet migrated to this format.
	function splitTag(description: string): { ja: string; en: string } {
		const i = description.indexOf('!');
		if (i === -1) return { ja: description.trim(), en: '' };
		return { ja: description.slice(0, i).trim(), en: description.slice(i + 1).trim() };
	}
	const tag = work.description
		? splitTag(work.description)
		: { ja: work.headline ?? '', en: '' };

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
		descriptionJa: work.body_jp ?? '',
		descriptionEn: work.body_en ?? '',
		headlineJa: tag.ja,
		headlineEn: tag.en,
		// Short "built with" line, shown right under the body copy — separate
		// from Colophon further down the page.
		stack: work.stack ?? '',
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
				})),
			// Alternative free-form rich text version, tried alongside the
			// structured rows above rather than replacing them.
			text: work.colophon_text ?? ''
		}
	};

	return { archive };
};
