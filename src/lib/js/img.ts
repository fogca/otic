// microCMS (imgix Rendering API) image optimization helpers.
// Pure string utilities — safe to import in client components (no env access).
//
// auto=format → imgix serves AVIF/WebP per the browser's Accept header.
// compress    → extra lossless/lossy optimization.
// q (def 72)  → output quality. fit=max → never upscales past the source.

import type { Work } from './microcms';

/** A work's primary visual: the `main_visual` custom field (Cloudflare video
    via `pj_videos`, else its `pj_images` image), falling back to the legacy
    `thumbnail` image. Returns null when nothing is set. Client-safe (this file
    holds no env access), so components can derive visuals directly. */
export type Visual = {
	src: string;
	isVideo: boolean;
	width?: number;
	height?: number;
};

export const mainVisual = (w: Work): Visual | null => {
	const video = w.main_visual?.pj_videos?.trim();
	if (video) return { src: video, isVideo: true };
	const img = w.main_visual?.pj_images;
	if (img?.url) return { src: img.url, isVideo: false, width: img.width, height: img.height };
	if (w.thumbnail?.url)
		return { src: w.thumbnail.url, isVideo: false, width: w.thumbnail.width, height: w.thumbnail.height };
	return null;
};

export const imgOpt = (url: string | undefined, width: number, quality = 72): string => {
	if (!url) return '';
	const sep = url.includes('?') ? '&' : '?';
	return `${url}${sep}auto=format,compress&q=${quality}&w=${width}&fit=max`;
};

/** Responsive srcset for a microCMS image across the given widths. */
export const imgSrcset = (url: string | undefined, widths: number[], quality = 72): string => {
	if (!url) return '';
	return widths.map((w) => `${imgOpt(url, w, quality)} ${w}w`).join(', ');
};
