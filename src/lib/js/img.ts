// microCMS (imgix Rendering API) image optimization helpers.
// Pure string utilities — safe to import in client components (no env access).
//
// auto=format → imgix serves AVIF/WebP per the browser's Accept header.
// compress    → extra lossless/lossy optimization.
// q (def 72)  → output quality. fit=max → never upscales past the source.

import type { MicroCMSImage } from 'microcms-js-sdk';
import type { Work } from './microcms';

/** A work's primary visual: the `main_visual` custom field — a Cloudflare
    video (`pj_videos`) or its image (`pj_images`). The legacy `thumbnail` is
    intentionally NOT used (migrated into main_visual). Returns null when
    main_visual is unset. Client-safe (no env access), so components can derive
    visuals directly. */
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
	return null;
};

/** Image-only resolution for contexts that can't play video (intro Loader,
    SP archive cards): main_visual's image. (No thumbnail fallback.) */
export const mainVisualImage = (w: Work): MicroCMSImage | undefined =>
	w.main_visual?.pj_images;

export const imgOpt = (url: string | undefined, width: number, quality = 72): string => {
	if (!url) return '';
	const sep = url.includes('?') ? '&' : '?';
	return `${url}${sep}auto=format,compress&q=${quality}&w=${width}&fit=max`;
};

/** Serve-time video optimization — the video analog of imgOpt. Rewrites a
    cdn.takumiisobe.com URL through Cloudflare Media Transformations
    (`/cdn-cgi/media/…`), which resizes + re-encodes at the edge and caches
    the result; the R2 original is untouched. The sources are 4K renders,
    and decoder memory scales with resolution — a 720px rendition decodes
    at ~1/25th the frame memory of 3840x2160, which is what iOS needs.
    Non-CDN URLs pass through unchanged.

    REQUIRES the zone toggle: Cloudflare dashboard -> takumiisobe.com zone
    -> Stream -> Transformations -> enable. Until then these URLs 404 —
    every <video> call site pairs this with the raw URL as an on-error
    fallback (see lazyVideo / lazyGridVideo), so playback works either way
    and upgrades automatically once the toggle is on. */
const VIDEO_CDN = 'https://cdn.takumiisobe.com/';
export const videoOpt = (url: string, width: number): string => {
	if (!url.startsWith(VIDEO_CDN)) return url;
	const path = url.slice(VIDEO_CDN.length);
	return `${VIDEO_CDN}cdn-cgi/media/mode=video,width=${width},fit=scale-down/${path}`;
};

/** Responsive srcset for a microCMS image across the given widths. */
export const imgSrcset = (url: string | undefined, widths: number[], quality = 72): string => {
	if (!url) return '';
	return widths.map((w) => `${imgOpt(url, w, quality)} ${w}w`).join(', ');
};
