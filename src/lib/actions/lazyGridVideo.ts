// Archives grid videos: `src` is deferred entirely until the item is near
// the viewport (rootMargin) — off-screen tiles show only the plain light-gray
// placeholder, no video element is mounted/fetched at all, so the grid's
// FIRST layout pass never waits on network for anything off-screen.
//
// This replaces the old approach of eagerly fetching preload="metadata" for
// every video on mount (all ~10 competing for bandwidth on load, and the
// masonry layout itself blocking until every one reported its real size —
// the actual cause of the slow first paint). The wrapper starts at a
// reasonable default aspect-ratio (set by the caller) so layout can run
// immediately; once real metadata arrives this reports back via `onMeta` so
// the caller can correct it with a (debounced) re-layout.
type Opts = {
	src: string;
	onMeta: (node: HTMLVideoElement, width: number, height: number) => void;
	rootMargin?: string;
};

export function lazyGridVideo(node: HTMLVideoElement, opts: Opts) {
	const { src, onMeta, rootMargin = '800px' } = opts;
	let loaded = false;

	const onLoadedMeta = () => {
		if (node.videoWidth && node.videoHeight) onMeta(node, node.videoWidth, node.videoHeight);
	};
	node.addEventListener('loadedmetadata', onLoadedMeta);

	const startLoad = () => {
		if (loaded) return;
		loaded = true;
		node.src = src;
		node.preload = 'auto';
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
				} else if (loaded) {
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
			node.removeEventListener('loadedmetadata', onLoadedMeta);
		}
	};
}
