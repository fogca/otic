import { getList } from '$lib/js/microcms';
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
};

// Fixed-seed shuffle that biases thumbnails toward the upper half so they
// dominate the top of the masonry while remaining sprinkled below.
function patternShuffle(items: GalleryImage[], seed: number): GalleryImage[] {
	return [...items].sort((a, b) => {
		const hashA = (hashString(a.url + a.workId) + seed) % 1_000_000;
		const hashB = (hashString(b.url + b.workId) + seed) % 1_000_000;

		const priority = (hash: number, isThumb: boolean): number => {
			if (!isThumb) return 0;
			const ratio = (hash % 100) / 100;
			return ratio < 0.5 ? (0.5 - ratio) * 2_000_000 : (1.0 - ratio) * 500_000;
		};

		const scoreA = priority(hashA, a.isThumbnail) + hashA;
		const scoreB = priority(hashB, b.isThumbnail) + hashB;
		return scoreB - scoreA;
	});
}

export const load: PageServerLoad = async () => {
	const data = await getList({
		limit: 100,
		orders: 'order',
		fields: ['id', 'title', 'thumbnail', 'repeat', 'repeatImg']
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
			// Normal rule: thumbnail + all repeat + repeatImg
			if (work.thumbnail) {
				workImages.push({
					url: work.thumbnail.url,
					width: work.thumbnail.width,
					height: work.thumbnail.height,
					workId: work.id,
					workTitle: work.title,
					isThumbnail: true
				});
			}

			if (work.repeat) {
				for (const row of work.repeat) {
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
							isThumbnail: false
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

	const shuffledMain = patternShuffle(main, 23456);

	return { images: [...shuffledMain, ...trailing], works: data.contents };
};
