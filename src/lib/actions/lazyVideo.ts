// Prioritises Cloudflare video bandwidth AND memory toward whatever is
// actually on screen. Markup keeps src + preload="metadata", so every video
// still reports its intrinsic size up front (the gallery's heights depend on
// it) — that part is cheap: metadata alone holds no decoder.
//
// Near the viewport: switch to full buffering + play. Once it scrolls away
// again: fully RELEASE the video (pause + detach src + load()), not just
// pause() — on iOS every <video> that keeps a src keeps a hardware decoder
// slot and its buffer in memory, and long pages accumulated one per passed
// video until decoders/memory ran out (videos went black, then the tab
// crashed). Before detaching, the current aspect-ratio is frozen as an
// inline style so the element's rendered height survives losing its
// intrinsic size (no layout jump); re-entering re-attaches the same src,
// re-buffered from the HTTP cache.
export function lazyVideo(node: HTMLVideoElement, opts: { rootMargin?: string } = {}) {
	const { rootMargin = '400px' } = opts;
	// Remember the markup src so it can be re-attached after a release.
	const src = node.getAttribute('src') ?? '';
	let active = false;

	const activate = () => {
		if (!node.getAttribute('src') && src) {
			node.setAttribute('src', src);
			node.load();
		}
		active = true;
		node.preload = 'auto';
		node.play?.().catch(() => {});
	};

	const release = () => {
		// Only videos that were actually activated hold heavy resources —
		// never-approached ones stay in their cheap metadata-only state, so
		// their first-layout intrinsic sizing keeps working exactly as before.
		if (!active) {
			node.pause();
			return;
		}
		active = false;
		node.pause();
		// Freeze the rendered proportions before the intrinsic size is lost
		// with the src (width:100%/height:auto would otherwise collapse to
		// the 300x150 default and jump the scroll position).
		if (node.videoWidth && node.videoHeight && !node.style.aspectRatio) {
			node.style.aspectRatio = `${node.videoWidth} / ${node.videoHeight}`;
		}
		// The canonical WebKit way to free the decoder + buffer.
		node.removeAttribute('src');
		node.load();
	};

	if (typeof IntersectionObserver === 'undefined') {
		node.play?.().catch(() => {});
		return;
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					activate();
				} else {
					release();
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
