// Archives grid videos: `src` is deferred entirely until the item is near
// the viewport (rootMargin) — off-screen tiles show only the plain light-gray
// placeholder, no video fetch happens at all, so the grid's FIRST layout
// pass never waits on network for anything off-screen.
//
// Just as important: leaving the viewport fully RELEASES the video again
// (pause + detach src + load()), not just pause(). On iOS every <video>
// that still has a src holds a hardware decoder slot and its buffered data
// in memory — pause() frees neither. Scrolling a long grid used to
// accumulate one per passed video until the decoder pool / memory ran out:
// videos went black (decoder eviction), then the tab itself crashed
// (jetsam). Detaching returns the slot and the buffer; the wrapper keeps
// the corrected aspect-ratio (set once via onMeta) so layout never shifts,
// and re-entering the viewport simply re-attaches the src, re-buffering
// from the HTTP cache.
type Opts = {
	src: string;
	onMeta: (node: HTMLVideoElement, width: number, height: number) => void;
	rootMargin?: string;
};

export function lazyGridVideo(node: HTMLVideoElement, opts: Opts) {
	// 400px (not the old 800px) halves the "active window" of simultaneously
	// loaded/decoding videos — the largest single memory lever here — while
	// still starting buffering roughly a screen ahead of visibility.
	const { src, onMeta, rootMargin = '400px' } = opts;
	let loaded = false;
	let metaReported = false;

	const onLoadedMeta = () => {
		// Report once: the wrapper's aspect-ratio survives unload/reload
		// cycles, so re-reporting would only churn debounced re-layouts.
		if (metaReported) return;
		if (node.videoWidth && node.videoHeight) {
			metaReported = true;
			onMeta(node, node.videoWidth, node.videoHeight);
		}
	};
	node.addEventListener('loadedmetadata', onLoadedMeta);

	const startLoad = () => {
		if (loaded) return;
		loaded = true;
		node.src = src;
		node.preload = 'auto';
		node.load();
	};

	const unload = () => {
		if (!loaded) return;
		loaded = false;
		node.pause();
		// The canonical WebKit way to free a media element's decoder +
		// buffer: drop the src attribute, then load() to reset the element.
		node.removeAttribute('src');
		node.load();
	};

	if (typeof IntersectionObserver === 'undefined') {
		startLoad();
		node.play?.().catch(() => {});
		return {
			destroy() {
				node.removeEventListener('loadedmetadata', onLoadedMeta);
			}
		};
	}

	const io = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					startLoad();
					node.play?.().catch(() => {});
				} else {
					unload();
				}
			}
		},
		{ rootMargin }
	);
	io.observe(node);

	return {
		destroy() {
			io.disconnect();
			node.removeEventListener('loadedmetadata', onLoadedMeta);
			unload();
		}
	};
}
