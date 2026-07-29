import { error } from '@sveltejs/kit';
import { getDetail, getVisibleWorks } from '$lib/js/microcms';
import { mainVisual, imgOpt, videoFrame } from '$lib/js/img';
import { TITLE_SUFFIX } from '$lib/js/seo';
import type { PageServerLoad } from './$types';

// Count of shared `scope` values — the more overlap with the current work,
// the more likely two projects read as related (e.g. two typeface/V.I.
// works vs. a typeface work next to a pure web-dev one).
function scopeOverlap(a: string[], b: string[]): number {
	const setA = new Set(a);
	return b.reduce((count, s) => count + (setA.has(s) ? 1 : 0), 0);
}

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
	// means the field is JA-only. A literal "?" within either half is a
	// manual line break (rendered via .lead__tag's white-space:pre-line, the
	// same technique .lead__body already uses for body_jp/body_en) — taglines
	// are short/declarative, so a real "?" as punctuation is unlikely, but
	// note the tradeoff if one's ever needed. Falls back to the older
	// single-language `headline` field for works not yet migrated to this
	// format.
	function splitTag(description: string): { ja: string; en: string } {
		const breakify = (s: string) => s.trim().replace(/\?/g, '\n');
		const i = description.indexOf('!');
		if (i === -1) return { ja: breakify(description), en: '' };
		return { ja: breakify(description.slice(0, i)), en: breakify(description.slice(i + 1)) };
	}
	const tag = work.description
		? splitTag(work.description)
		: { ja: work.headline ?? '', en: '' };

	// Adapt microCMS Work → the legacy `archive` shape used by +page.svelte.
	// Each `repeat` row can carry either an image (pj_images) or a video URL
	// (pj_videos). When pj_videos is set we treat that row as a looping
	// video slide; otherwise the image is used. Rows with neither are dropped.
	// `caption` is the row's own pj_images_title (admin-labeled "PJ imaegs
	// description") — optional, most rows don't have one set yet.
	type GalleryItem = { src: string; isVideo: boolean; caption: string; aspect?: number };
	const gallery: GalleryItem[] = (work.repeat ?? [])
		.map((r): GalleryItem | null => {
			const caption = r.pj_images_title ?? '';
			const videoUrl = r.pj_videos?.trim();
			if (videoUrl) return { src: videoUrl, isVideo: true, caption };
			const img = r.pj_images;
			if (img?.url) {
				// aspect (w/h) feeds the PC gallery's --ar so the ITEM BOX can
				// shrink to the exact width a max-height-capped portrait image
				// renders at — keeping in-box content (the caption) aligned to
				// the visible image edge. Video rows have no dimensions
				// server-side, so they stay on the plain % width.
				const aspect = img.width && img.height ? img.width / img.height : undefined;
				return { src: img.url, isVideo: false, caption, aspect };
			}
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
		heroImagePc: work.pc_thumbnail?.url ?? '',
		descriptionJa: work.body_jp ?? '',
		descriptionEn: work.body_en ?? '',
		headlineJa: tag.ja,
		headlineEn: tag.en,
		// Selected values from the `scope` multi-select (V.I. / Product /
		// Web / ...), same field + " / " join the archives list page uses,
		// just showing every value instead of list's space-constrained
		// first-2 truncation.
		scope: work.scope ?? [],
		// Year/status line shown right under scope (e.g. "2026" or "on-going").
		year: work.year ?? '',
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
			// structured rows above rather than replacing them. Editors write
			// credit lines " / "-separated on one line (e.g. "Direction: X /
			// Design: Y") — break each onto its own line rather than leaving
			// them run together.
			text: (work.colophon_text ?? '').replace(/ \/ /g, '<br>')
		}
	};

	// "Next" — a few other works to surface below Colophon. Ranked by shared
	// `scope` values with the current work first (a typeface/V.I. piece
	// leads with other typeface/V.I. work, not a random pick); ties (incl.
	// works with no scope overlap at all) keep the catalogue's own `order`
	// via a stable sort, so it degrades to "next few in the catalogue"
	// rather than reshuffling on every visit.
	// Fetch up to 4 (PC's target range is 2-4) — the template renders all of
	// them and SP hides the 3rd/4th via CSS rather than fetching fewer, so
	// there's one shared list instead of two separate viewport-specific ones.
	const otherWorksData = await getVisibleWorks({
		limit: 100,
		orders: 'order',
		fields: ['id', 'title', 'main_visual', 'scope']
	});
	const currentScope = work.scope ?? [];
	const nextWorks = otherWorksData.contents
		.filter((w) => w.id !== work.id)
		.sort(
			(a, b) =>
				scopeOverlap(currentScope, b.scope ?? []) - scopeOverlap(currentScope, a.scope ?? [])
		)
		.slice(0, 4)
		.map((w) => ({
			slug: w.id,
			title: w.title,
			visual: mainVisual(w)
		}));

	// Social card for this specific work — the layout emits the tags, this
	// just supplies the values (see $lib/js/seo.ts / +layout.svelte).
	// og:image must be an ABSOLUTE url: microCMS asset URLs already are, and
	// videoFrame() returns an absolute CDN url, so video-led works get a real
	// poster frame instead of falling back to the generic site card. Width
	// 1200 matches the OG card size platforms render at.
	const heroVisual = mainVisual(work);
	const ogImage = heroVisual
		? heroVisual.isVideo
			? videoFrame(heroVisual.src, 1200)
			: imgOpt(heroVisual.src, 1200)
		: undefined;
	// Strip the "ja!en" split and any "?" line-break markers out of the
	// tagline — a meta description wants one clean sentence.
	const ogDescription =
		[tag.ja, tag.en].find((s) => s.trim().length > 0)?.replace(/\n/g, ' ').trim() ||
		`${work.title} — ${(work.scope ?? []).join(' / ')}`;

	const seo = {
		title: `${work.title} — ${TITLE_SUFFIX}`,
		description: ogDescription,
		image: ogImage,
		type: 'article' as const
	};

	return { archive, nextWorks, seo };
};
