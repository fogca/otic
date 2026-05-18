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

	const images: GalleryImage[] = [];

	for (const work of data.contents) {
		if (work.thumbnail) {
			images.push({
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
					images.push({
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
			const list = Array.isArray(work.repeatImg) ? work.repeatImg : [work.repeatImg];
			for (const row of list) {
				if (row && 'images' in row && row.images?.url) {
					images.push({
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

	const shuffled = patternShuffle(images, 23456);

	return { images: shuffled, works: data.contents };
};
