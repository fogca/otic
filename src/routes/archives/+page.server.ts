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
	/** 0 = thumbnail, 1/2 = the first couple of extra images per work,
	    undefined = everything else. Drives the upward bias in
	    patternShuffle — thumbnails lean up the most, the next couple of
	    images per work lean up a bit too (tapering), everything else is
	    unbiased. */
	priorityTier?: number;
	/** Cloudflare-hosted video row (pj_videos). Dimensions are 0 — the client
	    reads them from the <video> metadata to size the masonry cell. */
	isVideo?: boolean;
};

// Bias strength per tier — [bonus when ratio<0.5, bonus when ratio>=0.5].
// Thumbnails lean up the most (a clear step above tier 1/2, not just double)
// so they dominate the top over the first couple of extra images per work,
// which lean up a bit themselves, tapering off; anything beyond tier 2 is
// unbiased.
const PRIORITY_BIAS: Record<number, [number, number]> = {
	0: [4_000_000, 1_000_000],
	1: [1_000_000, 250_000],
	2: [500_000, 125_000]
};

// Fixed-seed shuffle that biases thumbnails (and the first couple of extra
// images per work) toward the upper half so they dominate the top of the
// masonry while remaining sprinkled below. Same order on every load
// (deterministic) — this is the current default.
function patternShuffle(items: GalleryImage[], seed: number): GalleryImage[] {
	return [...items].sort((a, b) => {
		const hashA = (hashString(a.url + a.workId) + seed) % 1_000_000;
		const hashB = (hashString(b.url + b.workId) + seed) % 1_000_000;

		const priority = (hash: number, tier?: number): number => {
			const bias = tier !== undefined ? PRIORITY_BIAS[tier] : undefined;
			if (!bias) return 0;
			const ratio = (hash % 100) / 100;
			return ratio < 0.5 ? (0.5 - ratio) * bias[0] : (1.0 - ratio) * bias[1];
		};

		const scoreA = priority(hashA, a.priorityTier) + hashA;
		const scoreB = priority(hashB, b.priorityTier) + hashB;
		return scoreB - scoreA;
	});
}

// True random shuffle (Fisher–Yates) — a genuinely fresh, unpredictable
// order on every single page load/reload. No thumbnail bias: every image
// has equal odds at every position. Alternate to patternShuffle above;
// toggle which one runs via SHUFFLE_MODE below.
function trueRandomShuffle(items: GalleryImage[]): GalleryImage[] {
	const arr = [...items];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

// ── Shuffle mode ──────────────────────────────────────────────────────
// 'pattern' (default, current behaviour): fixed-seed, same order every
//   load, thumbnails biased toward the top of the masonry.
// 'random': genuinely reshuffles on every request via trueRandomShuffle.
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
	const TAIL_REPEAT_ONLY: Record<string, number> = {
		ondo: 2
	};

	const images: GalleryImage[] = [];

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
						width: row.pj_images.width,
						height: row.pj_images.height,
						workId: work.id,
						workTitle: work.title,
						isThumbnail: false
					});
				}
			}
		} else {
			// Normal rule: main_visual (video/image, falls back to thumbnail)
			// + all repeat + repeatImg
			const mv = mainVisual(work);
			if (mv) {
				workImages.push({
					url: mv.src,
					width: mv.width ?? 0,
					height: mv.height ?? 0,
					workId: work.id,
					workTitle: work.title,
					isThumbnail: true,
					priorityTier: 0,
					isVideo: mv.isVideo
				});
			}

			// Tags the first couple of extra (non-thumbnail) images per work
			// with a tapering priority tier — see PRIORITY_BIAS above.
			let extraCount = 0;
			const nextExtraTier = (): number | undefined => {
				const tier = extraCount < 2 ? extraCount + 1 : undefined;
				extraCount++;
				return tier;
			};

			if (work.repeat) {
				for (const row of work.repeat) {
					const videoUrl = row.pj_videos?.trim();
					if (videoUrl) {
						// Mix Cloudflare videos into the grid alongside images.
						workImages.push({
							url: videoUrl,
							width: 0,
							height: 0,
							workId: work.id,
							workTitle: work.title,
							isThumbnail: false,
							priorityTier: nextExtraTier(),
							isVideo: true
						});
					} else if (row.pj_images?.url) {
						workImages.push({
							url: row.pj_images.url,
							width: row.pj_images.width,
							height: row.pj_images.height,
							workId: work.id,
							workTitle: work.title,
							isThumbnail: false,
							priorityTier: nextExtraTier()
						});
					}
				}
			}

			if (work.repeatImg) {
				const list = Array.isArray(work.repeatImg)
					? work.repeatImg
					: [work.repeatImg];
				for (const row of list) {
					if (row && 'images' in row && row.images?.url) {
						workImages.push({
							url: row.images.url,
							width: row.images.width ?? 0,
							height: row.images.height ?? 0,
							workId: work.id,
							workTitle: work.title,
							isThumbnail: false,
							priorityTier: nextExtraTier()
						});
					}
				}
			}
		}

		images.push(...workImages);
	}

	// Trailing IDs: PJs that should always appear at the back of the grid,
	// regardless of shuffle priority. Useful for archived / low-emphasis works.
	const TRAILING_IDS = new Set(['ondo', 'thalassic']);

	const main = images.filter((img) => !TRAILING_IDS.has(img.workId));
	const trailing = images.filter((img) => TRAILING_IDS.has(img.workId));

	const shuffledMain =
		SHUFFLE_MODE === 'random' ? trueRandomShuffle(main) : patternShuffle(main, 23456);

	return { images: [...shuffledMain, ...trailing], works: data.contents };
};
