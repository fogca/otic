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
//
// `src` is always the raw R2 file — NOT routed through Cloudflare Media
// Transformations. That was tried (see git history) to cut decode memory
// via a smaller rendition; the disqualifiers are the 2000px output cap and
// the non-streaming cold transform, NOT Range support (see the detailed
// note on VIDEO_CDN in $lib/js/img.ts — an earlier version of this comment
// had the causality wrong). The right lever is smaller SOURCES.
import { acquireVideoSlot, releaseVideoSlot } from './videoBudget';

type Opts = {
	src: string;
	onMeta: (node: HTMLVideoElement, width: number, height: number) => void;
	rootMargin?: string;
};

export function lazyGridVideo(node: HTMLVideoElement, opts: Opts) {
	// 150px (was 400, before that 800): the grid is dense enough that a
	// 400px margin kept up to 8 videos active at once on SP (15 on PC,
	// measured live) — and with mostly-4K sources that concurrency alone
	// was enough to jetsam the tab. A slimmer margin plus the global
	// videoBudget cap below bounds the working set; tiles outside it show
	// their designed LQIP placeholder until a slot frees.
	const { src, onMeta, rootMargin = '150px' } = opts;
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
					// Gated by the global decoder budget — may start now, later
					// (when a slot frees, nearest-first), or not at all if the
					// tile scrolls away again while still waiting.
					acquireVideoSlot(node, () => {
						startLoad();
						node.play?.().catch(() => {});
					});
				} else {
					releaseVideoSlot(node);
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
			releaseVideoSlot(node);
			unload();
		}
	};
}
