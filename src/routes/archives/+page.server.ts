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

// ── Shuffle mode ──────────────────────────────────────────────────────
// 'pattern' (default, current behaviour): fixed-seed, same order every load.
// 'random': genuinely reshuffles on every request.
// Flip the return value here to switch — both implementations stay intact
// so either is a one-line revert away. (Returned from a function, not a
// literal-typed const, so TS doesn't narrow it to a single literal and flag
// the SHUFFLE_MODE === 'random' check below as unreachable.)
function getShuffleMode(): 'pattern' | 'random' {
	return 'pattern';
}
const SHUFFLE_MODE = getShuffleMode();

// Fixed-seed shuffle — same order every load. `keyOf` extracts the string
// each item is hashed by (combined with `seed`) — kept generic so the same
// function drives both the work-order shuffle and each work's own
// extra-images shuffle below without their patterns correlating.
function patternShuffle<T>(items: T[], keyOf: (item: T) => string, seed: number): T[] {
	return [...items].sort((a, b) => {
		const hashA = (hashString(keyOf(a)) + seed) % 1_000_000;
		const hashB = (hashString(keyOf(b)) + seed) % 1_000_000;
		return hashA - hashB;
	});
}

// True random shuffle (Fisher–Yates) — a genuinely fresh, unpredictable
// order on every single page load/reload.
function trueRandomShuffle<T>(items: T[]): T[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

function shuffle<T>(items: T[], keyOf: (item: T) => string, seed: number): T[] {
	return SHUFFLE_MODE === 'random' ? trueRandomShuffle(items) : patternShuffle(items, keyOf, seed);
}

const WORK_ORDER_SEED = 23456;
const EXTRAS_SEED = 91011;

// Round-robin interleave across works: round 0 = each work's own 1st image,
// round 1 = each work's 2nd image, etc. Guarantees two images from the same
// work are always separated by every other still-active work, instead of
// just "usually" via a random/hash shuffle. Round 0 and every later round
// can use DIFFERENT work orders — see the two callers below: round 0 stays
// in the Top page's own curated order for a clean first impression, later
// rounds shuffle so the grid doesn't just repeat that same sequence.
function interleaveByWork(
	imagesByWork: Map<string, GalleryImage[]>,
	round0Order: string[],
	laterOrder: string[]
): GalleryImage[] {
	const result: GalleryImage[] = [];
	for (let round = 0; ; round++) {
		const order = round === 0 ? round0Order : laterOrder;
		let pushedAny = false;
		for (const id of order) {
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
//  2. Slot each set-aside image back in near where it originally sat
//     (searching outward from that position for the nearest safe gap) — NOT
//     just the first safe gap scanning from the front. The clash is almost
//     always near the tail (see above), so a front-scan would splice it all
//     the way up to the top of the grid instead, badly over-representing
//     that work early on.
// Falls back to appending at the very end (accepting the occasional
// unavoidable clash) only if literally no safe gap exists anywhere — e.g.
// one work outnumbers every other work combined.
function deClumpAdjacent(images: GalleryImage[]): GalleryImage[] {
	const result: GalleryImage[] = [];
	const deferred: Array<{ img: GalleryImage; originalIndex: number }> = [];

	images.forEach((img, originalIndex) => {
		const last = result[result.length - 1];
		if (last && last.workId === img.workId) {
			deferred.push({ img, originalIndex });
		} else {
			result.push(img);
		}
	});

	const isSafe = (pos: number, workId: string): boolean => {
		const before = result[pos - 1];
		const after = result[pos];
		return (!before || before.workId !== workId) && (!after || after.workId !== workId);
	};

	for (const { img, originalIndex } of deferred) {
		const target = Math.round((originalIndex / images.length) * result.length);
		let insertAt = -1;
		for (let d = 0; d <= result.length; d++) {
			if (target + d <= result.length && isSafe(target + d, img.workId)) {
				insertAt = target + d;
				break;
			}
			if (d > 0 && target - d >= 0 && isSafe(target - d, img.workId)) {
				insertAt = target - d;
				break;
			}
		}
		result.splice(insertAt === -1 ? result.length : insertAt, 0, img);
	}

	return result;
}

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

	// Each work's own images. workImages[0] is round 0's pick (thumbnail, or
	// the pj_images_priority row if one's flagged); everything after it is
	// shuffled — see the push below — since round 1+ visits index 1, 2, 3...
	// across every work.
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
			// Normal rule: main_visual (video/image, falls back to thumbnail) leads.
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
			// specific repeat image ahead of the thumbnail for round 0 — e.g. a
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

			// Round 1+: shuffle each work's own remaining images. Left in their
			// natural CMS order, every work's 2nd/3rd/4th... image would tend to
			// share the same "role" (logo, then print, then web, say — a common
			// case-study narrative) — so round 1 across the WHOLE grid would read
			// as all-logos, round 2 all-print, etc. Shuffling per work breaks
			// that alignment without touching round 0 (still thumbnail-led).
			workImages.push(...shuffle(extras, (img) => img.url + img.workId, EXTRAS_SEED));
		}

		if (workImages.length > 0) {
			imagesByWork.set(work.id, workImages);
		}
	}

	// Round 0's work order mirrors the Top page's own curated order — data
	// already comes back from getVisibleWorks sorted that way (orders:
	// 'order', same field the Top page uses), so this is just data.contents'
	// own order filtered to works that made it into imagesByWork (a work with
	// zero usable images is naturally absent). Keeps the grid's very first
	// pass reading as deliberately arranged (e.g. RC1 → August → ...) instead
	// of shuffled from the start.
	const topOrder = data.contents.map((w) => w.id).filter((id) => imagesByWork.has(id));
	const mainTopOrder = topOrder.filter((id) => !TRAILING_IDS.has(id));
	const trailingTopOrder = topOrder.filter((id) => TRAILING_IDS.has(id));

	// Round 1+: a shuffled work order, independent of round 0's Top order —
	// otherwise the same sequence would just repeat every round.
	const laterOrder = shuffle(mainTopOrder, (id) => id, WORK_ORDER_SEED);
	const laterTrailingOrder = shuffle(trailingTopOrder, (id) => id, WORK_ORDER_SEED);

	const images = deClumpAdjacent([
		...interleaveByWork(imagesByWork, mainTopOrder, laterOrder),
		...interleaveByWork(imagesByWork, trailingTopOrder, laterTrailingOrder)
	]);

	return { images, works: data.contents };
};
