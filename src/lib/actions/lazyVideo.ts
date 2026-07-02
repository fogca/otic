// Prioritises Cloudflare video bandwidth toward whatever is actually on
// screen. `src`/`preload` stay untouched by this action (metadata still
// loads immediately for every video — masonry layout depends on knowing
// every item's real aspect ratio up front). What was actually slowing down
// the "first view" was every video on the page competing for buffering
// bandwidth at once (all had `autoplay` + preload="metadata" simultaneously).
// This action instead starts full buffering + playback only once a video is
// near the viewport, and pauses it once it scrolls away — so the video the
// visitor is actually looking at gets the bandwidth, not the other nine.
export function lazyVideo(node: HTMLVideoElement, opts: { rootMargin?: string } = {}) {
	const { rootMargin = '400px' } = opts;
	if (typeof IntersectionObserver === 'undefined') {
		node.play?.().catch(() => {});
		return;
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.preload = 'auto';
					node.play?.().catch(() => {});
				} else {
					node.pause();
				}
			}
		},
		{ rootMargin }
	);
	io.observe(node);

	return {
		destroy() {
			io.disconnect();
		}
	};
}
