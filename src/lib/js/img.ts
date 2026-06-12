// microCMS (imgix Rendering API) image optimization helpers.
// Pure string utilities — safe to import in client components (no env access).
//
// auto=format → imgix serves AVIF/WebP per the browser's Accept header.
// compress    → extra lossless/lossy optimization.
// q (def 72)  → output quality. fit=max → never upscales past the source.

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
