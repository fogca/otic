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

/** Cloudflare Media Transformations CDN root — used by videoFrame() below.
    NOT used for video `src` itself: mode=video ignores Range requests
    entirely (confirmed directly — a Range: bytes=0-1023 request against a
    transformed URL comes back 200 with the full file and no Content-Range
    header, while the same request against the raw R2 URL correctly returns
    206/Content-Range). Browsers — Safari especially — rely on real range
    support to start playback before the whole file arrives; without it a
    video effectively has to fully download first, which read as "stuck
    loading, still blurred" on larger files. Video `src` therefore uses the
    raw URL directly everywhere (see git history for the removed videoOpt). */
const VIDEO_CDN = 'https://cdn.takumiisobe.com/';

/** Tiny first-frame capture of a CDN video (Media Transformations
    mode=frame) — used as an LQIP background under <video> elements so
    loading/unloaded videos show a soft low-res preview of themselves
    instead of a flat gray/white box (~1KB each). The blur is free: a
    64px capture upscaled to fill its box by background-size:cover is
    naturally soft. Returns '' for non-CDN URLs (callers skip the
    background); if transformations are ever disabled the URL 404s and
    the background simply doesn't render — the plain wrapper shows,
    exactly the pre-LQIP behavior. */
export const videoFrame = (url: string, width = 64): string => {
	if (!url.startsWith(VIDEO_CDN)) return '';
	const path = url.slice(VIDEO_CDN.length);
	return `${VIDEO_CDN}cdn-cgi/media/mode=frame,time=0s,format=jpg,width=${width},fit=scale-down/${path}`;
};

/** Responsive srcset for a microCMS image across the given widths. */
export const imgSrcset = (url: string | undefined, widths: number[], quality = 72): string => {
	if (!url) return '';
	return widths.map((w) => `${imgOpt(url, w, quality)} ${w}w`).join(', ');
};
