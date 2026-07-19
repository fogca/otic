import { getVisibleWorks } from '$lib/js/microcms';
import { mainVisual } from '$lib/js/img';
import type { PageServerLoad } from './$types';

// Deterministic string hash → number
function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash;
	}
	return Math.abs(hash);
}

type GalleryImage = {
	url: string;
	width: number;
	height: number;
	workId: string;
	workTitle: string;
	isThumbnail: boolean;
	/** Cloudflare-hosted video row (pj_videos). Dimensions are 0 — the client
	    reads them from the <video> metadata to size the masonry cell. */
	isVideo?: boolean;
};

// Flagship work(s) whose thumbnail should lead the grid even more reliably
// than the rest — pinned to the very front of the work order (round 1,
// position 1) rather than score-biased the way the old patternShuffle did.
const BOOSTED_IDS = new Set(['steiner']);

// Fixed-seed shuffle of the *work order* (not the images themselves) — same
// order every load. Boosted work(s) are pinned to the front regardless of
// hash.
function patternWorkOrder(workIds: string[], seed: number): string[] {
	const boosted = workIds.filter((id) => BOOSTED_IDS.has(id));
	const rest = workIds.filter((id) => !BOOSTED_IDS.has(id));
	const shuffled = [...rest].sort((a, b) => {
		const hashA = (hashString(a) + seed) % 1_000_000;
		const hashB = (hashString(b) + seed) % 1_000_000;
		return hashA - hashB;
	});
	return [...boosted, ...shuffled];
}

// True random shuffle (Fisher–Yates) of the work order — a genuinely fresh,
// unpredictable order on every single page load/reload, still pinning
// boosted work(s) to the front. Alternate to patternWorkOrder above; toggle
// which one runs via SHUFFLE_MODE below.
function randomWorkOrder(workIds: string[]): string[] {
	const boosted = workIds.filter((id) => BOOSTED_IDS.has(id));
	const rest = workIds.filter((id) => !BOOSTED_IDS.has(id));
	for (let i = rest.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[rest[i], rest[j]] = [rest[j], rest[i]];
	}
	return [...boosted, ...rest];
}

// Round-robin interleave across works: round 1 = each work's own 1st image
// (visited in workOrder), round 2 = each work's 2nd image, etc. Guarantees
// two images from the same work are always separated by every other
// still-active work, instead of just "usually" via a random/hash shuffle —
// each work's own images stay in their natural (CMS-authored) order, only
// the *order works are visited in* is shuffled.
function interleaveByWork(
	imagesByWork: Map<string, GalleryImage[]>,
	workOrder: string[]
): GalleryImage[] {
	const result: GalleryImage[] = [];
	for (let round = 0; ; round++) {
		let pushedAny = false;
		for (const id of workOrder) {
			const list = imagesByWork.get(id);
			if (list && round < list.length) {
				result.push(list[round]);
				pushedAny = true;
			}
		}
		if (!pushedAny) break;
	}
	return result;
}

// Round-robin's one structural blind spot: once every other work has run
// out of images, whichever work still has the most left gets stuck alone in
// several trailing rounds — and those land adjacent (sometimes 3+ in a row)
// right at the END of the flat result, since there's nothing left after
// them to interleave with. Repair pass, two steps:
//  1. Walk through once, only keeping an image if it differs from the
//     result-so-far's last — anything that would clash gets set aside
//     instead of appended. `result` can never have an adjacent dupe by
//     construction, since every append is checked against the immediately
//     preceding one.
//  2. Slot each set-aside image into the first EARLIER gap where both its
//     new neighbors differ from it (scanning from the front). A forward-only
//     swap can't fix a clash with nothing after it, but re-inserting works
//     regardless of where the clash originally landed.
// Falls back to appending at the very end (accepting the occasional
// unavoidable clash) only if literally no safe gap exists anywhere — e.g.
// one work outnumbers every other work combined.
function deClumpAdjacent(images: GalleryImage[]): GalleryImage[] {
	const result: GalleryImage[] = [];
	const deferred: GalleryImage[] = [];

	for (const img of images) {
		const last = result[result.length - 1];
		if (last && last.workId === img.workId) {
			deferred.push(img);
		} else {
			result.push(img);
		}
	}

	for (const img of deferred) {
		let inserted = false;
		for (let i = 1; i < result.length; i++) {
			if (result[i - 1].workId !== img.workId && result[i].workId !== img.workId) {
				result.splice(i, 0, img);
				inserted = true;
				break;
			}
		}
		if (!inserted) result.push(img);
	}

	return result;
}

// ── Shuffle mode ──────────────────────────────────────────────────────
// 'pattern' (default, current behaviour): fixed-seed, same work order every
//   load.
// 'random': genuinely reshuffles the work order on every request.
// Flip the return value here to switch — both implementations stay intact
// so either is a one-line revert away. (Returned from a function, not a
// literal-typed const, so TS doesn't narrow it to a single literal and flag
// the SHUFFLE_MODE === 'random' check below as unreachable.)
function getShuffleMode(): 'pattern' | 'random' {
	return 'pattern';
}
const SHUFFLE_MODE = getShuffleMode();

export const load: PageServerLoad = async () => {
	const data = await getVisibleWorks({
		limit: 100,
		orders: 'order',
		fields: ['id', 'title', 'thumbnail', 'main_visual', 'repeat', 'repeatImg', 'hidden']
	});

	// Per-PJ image selection override. Listed PJs skip thumbnail and use only
	// the last N images from `repeat`. Useful for low-emphasis works that we
	// still want represented in the grid via specific image picks.
	const TAIL_REPEAT_ONLY: Record<string, number> = {};

	// Works that should always sit at the very back of the grid, regardless
	// of shuffle order. Useful for archived / low-emphasis works.
	const TRAILING_IDS = new Set<string>();

	// Each work's own images, kept in their natural order — that order IS
	// the round order interleaveByWork() consumes below.
	const imagesByWork = new Map<string, GalleryImage[]>();

	for (const work of data.contents) {
		const workImages: GalleryImage[] = [];
		const tailN = TAIL_REPEAT_ONLY[work.id];

		if (tailN !== undefined) {
			// Special rule: pick only the last N images from repeat, skip thumbnail.
			const repeatImgs = (work.repeat ?? [])
				.filter((r) => r.pj_images?.url)
				.slice(-tailN);
			for (const row of repeatImgs) {
				if (row.pj_images?.url) {
					workImages.push({
						url: row.pj_images.url,
						width: row.pj_images.width ?? 0,
						height: row.pj_images.height ?? 0,
						workId: work.id,
						workTitle: work.title,
						isThumbnail: false
					});
				}
			}
		} else {
			// Normal rule: main_visual (video/image, falls back to thumbnail) leads,
			// followed by repeat + repeatImg in their natural CMS order.
			const mv = mainVisual(work);
			const thumbnail: GalleryImage | null = mv
				? {
						url: mv.src,
						width: mv.width ?? 0,
						height: mv.height ?? 0,
						workId: work.id,
						workTitle: work.title,
						isThumbnail: true,
						isVideo: mv.isVideo
					}
				: null;

			// `pj_images_priority` (CMS: "優先表示") lets an editor promote a
			// specific repeat image ahead of the thumbnail for round 1 — e.g. a
			// stronger shot than the official thumbnail. Only the first flagged
			// row wins that slot; the thumbnail isn't dropped, just demoted to
			// join the rest of the extras. Any further flagged rows are treated
			// as regular extras (the field is a toggle, not a rank).
			let priorityImage: GalleryImage | null = null;
			const extras: GalleryImage[] = [];

			if (work.repeat) {
				for (const row of work.repeat) {
					const videoUrl = row.pj_videos?.trim();
					const img: GalleryImage | null = videoUrl
						? {
								url: videoUrl,
								width: 0,
								height: 0,
								workId: work.id,
								workTitle: work.title,
								isThumbnail: false,
								isVideo: true
							}
						: row.pj_images?.url
							? {
									url: row.pj_images.url,
									width: row.pj_images.width ?? 0,
									height: row.pj_images.height ?? 0,
									workId: work.id,
									workTitle: work.title,
									isThumbnail: false
								}
							: null;
					if (!img) continue;
					if (row.pj_images_priority && !priorityImage) {
						priorityImage = img;
					} else {
						extras.push(img);
					}
				}
			}

			if (work.repeatImg) {
				const list = Array.isArray(work.repeatImg) ? work.repeatImg : [work.repeatImg];
				for (const row of list) {
					if (row && 'images' in row && row.images?.url) {
						extras.push({
							url: row.images.url,
							width: row.images.width ?? 0,
							height: row.images.height ?? 0,
							workId: work.id,
							workTitle: work.title,
							isThumbnail: false
						});
					}
				}
			}

			if (priorityImage) {
				workImages.push(priorityImage);
				if (thumbnail) extras.unshift(thumbnail);
			} else if (thumbnail) {
				workImages.push(thumbnail);
			}
			workImages.push(...extras);
		}

		if (workImages.length > 0) {
			imagesByWork.set(work.id, workImages);
		}
	}

	const allWorkIds = [...imagesByWork.keys()];
	const mainWorkIds = allWorkIds.filter((id) => !TRAILING_IDS.has(id));
	const trailingWorkIds = allWorkIds.filter((id) => TRAILING_IDS.has(id));

	const workOrder =
		SHUFFLE_MODE === 'random'
			? randomWorkOrder(mainWorkIds)
			: patternWorkOrder(mainWorkIds, 23456);

	const images = deClumpAdjacent([
		...interleaveByWork(imagesByWork, workOrder),
		...interleaveByWork(imagesByWork, trailingWorkIds)
	]);

	return { images, works: data.contents };
};
