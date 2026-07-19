<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { lazyGridVideo } from '$lib/actions/lazyGridVideo';
	import { imgOpt, imgSrcset, videoFrame } from '$lib/js/img';
	import ArchivesTitleBar from '$lib/components/ArchivesTitleBar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Grid cell is ~18vw on PC (5 cols), ~48vw on SP (2 cols).
	const GRID_SIZES = '(min-width: 1024px) 18vw, 48vw';
	const GRID_WIDTHS = [180, 320, 480, 700, 940];

	const images = $derived(
		data.images.map((img) => {
			const isMicrocms = img.url.includes('microcms-assets.io');
			return {
				...img,
				isMicrocms,
				// Optimised src + responsive srcset (microCMS/Imgix params). Non-CMS
				// images (rare) and videos keep the raw url. imgOpt uses auto=format
				// so supporting browsers still get WebP.
				src: isMicrocms ? imgOpt(img.url, 700, 60) : img.url,
				srcset: isMicrocms ? imgSrcset(img.url, GRID_WIDTHS, 60) : undefined,
				// LQIP under every tile: a ~1KB soft preview of the media itself
				// (videos: first-frame capture; images: tiny imgix rendition),
				// stretched by background-size:cover — so loading/unloaded tiles
				// show a blurred version of their own content instead of a flat
				// gray box, and the real media's blur-reveal fades in over it.
				lqip: img.isVideo
					? videoFrame(img.url, 64)
					: isMicrocms
						? imgOpt(img.url, 32, 30)
						: '',
				// Videos have no CMS dimensions and their `src` is deferred (loaded
				// only near the viewport — see lazyGridVideo) — start at a neutral
				// 1:1 guess so the FIRST layout pass never waits on video network;
				// handleVideoMeta() corrects it once the real size is known.
				aspectRatio: img.isVideo ? '1 / 1' : `${img.width} / ${img.height}`
			};
		})
	);

	let isLoading = $state(true);

	// Preload window for grid videos. Tighter on phones: the sources are 4K,
	// and decoder memory scales with resolution (not file size) — a single
	// active 4K decode costs on the order of 100MB on iOS, so every
	// simultaneously-attached video matters on mobile.
	const videoMargin =
		browser && !window.matchMedia('(min-width: 1024px)').matches ? '200px' : '400px';

	// Column count by viewport: SP = 2, Laptop+ (≥1024) = 5
	function getColumnCount(): number {
		if (!browser) return 5;
		return window.matchMedia('(min-width: 1024px)').matches ? 5 : 2;
	}

	// Grid gap: PC = 15px, SP = 10px
	function getGap(): number {
		if (!browser) return 15;
		return window.matchMedia('(min-width: 1024px)').matches ? 15 : 10;
	}

	function layoutMasonry() {
		if (!browser) return;
		const container = document.getElementById('grid-gallery');
		const items = document.querySelectorAll<HTMLElement>('.grid_gallery_item');
		if (!container || items.length === 0) return;

		const columnCount = getColumnCount();
		const gap = getGap();
		// Absolutely-positioned children ignore their containing block's own
		// padding entirely (a `left`/`top` of 0 lands at the padding edge,
		// not the content edge) — .Gallery's padding-inline would otherwise
		// be invisible, items rendering flush against the viewport instead
		// of inset like every other section. Read it directly and apply it
		// as a manual left offset / width reduction below.
		const padLeft = parseFloat(getComputedStyle(container).paddingLeft) || 0;
		const containerWidth = container.offsetWidth - padLeft * 2;
		// A transient collapsed measurement (mid page-transition / rotation /
		// browser-chrome resize) would lay every item out at ~2px wide and pin
		// the container height to ~200px — a fully broken grid that sticks
		// until the next re-layout. Skip; whatever event follows the transient
		// state (resize, video meta) re-runs layout once geometry is sane.
		if (containerWidth < 100) return;
		const columnWidth = (containerWidth - gap * (columnCount - 1)) / columnCount;

		items.forEach((item) => {
			item.style.width = `${columnWidth}px`;
		});

		// Greedy shortest-column placement (standard masonry balancing) — the
		// previous `index % columnCount` round-robin ignored actual accumulated
		// height, so columns could drift noticeably uneven when item heights
		// varied a lot (e.g. a run of tall thumbnails landing in one column).
		const columnHeights = Array(columnCount).fill(0);
		items.forEach((item) => {
			let column = 0;
			for (let c = 1; c < columnCount; c++) {
				if (columnHeights[c] < columnHeights[column]) column = c;
			}
			const x = padLeft + column * (columnWidth + gap);
			const y = columnHeights[column];
			const itemHeight = item.offsetHeight;
			item.style.left = `${x}px`;
			item.style.top = `${y}px`;
			columnHeights[column] += itemHeight + gap;
		});

		container.style.height = `${Math.max(...columnHeights)}px`;
	}


	let resizeTimer: number;
	let metaTimer: number;

	// Correct a video wrapper's aspect-ratio and re-run layout (debounced —
	// several corrections can land at once and each would otherwise trigger
	// its own full re-layout). Fed from two sources: the LQIP frame probes in
	// onMount (all videos, right after mount) and each video's own metadata
	// once it actually loads near the viewport.
	function setVideoRatio(wrapper: HTMLElement | null, width: number, height: number) {
		if (!wrapper || !width || !height) return;
		// Skip when the ratio is already right (e.g. metadata confirming what
		// the frame probe set — same frame, only rounded differently): a
		// sub-pixel "correction" isn't worth reshuffling the masonry for.
		const [w, h] = (wrapper.style.aspectRatio || '1 / 1').split('/').map(parseFloat);
		if (w && h && Math.abs(w / h - width / height) / (width / height) < 0.02) return;
		wrapper.style.aspectRatio = `${width} / ${height}`;
		clearTimeout(metaTimer);
		metaTimer = window.setTimeout(layoutMasonry, 120);
	}

	function handleVideoMeta(node: HTMLVideoElement, width: number, height: number) {
		setVideoRatio(node.closest<HTMLElement>('.image-wrapper'), width, height);
	}

	onMount(() => {
		if (!browser) return;

		const imageElements = document.querySelectorAll<HTMLImageElement>('.grid_gallery_item img');
		const videoElements = document.querySelectorAll<HTMLVideoElement>('.grid_gallery_item video');

		// Reveal each media element individually as its bytes arrive (own
		// lazy-load blur fade). This is decoupled from layout below.
		imageElements.forEach((img) => {
			if (img.complete && img.naturalWidth > 0) {
				img.classList.add('loaded');
			} else {
				img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
				img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
			}
		});
		videoElements.forEach((video) => {
			video.addEventListener('loadeddata', () => video.classList.add('loaded'), { once: true });
		});

		// Every item already has a definite size (images: real CMS dimensions;
		// videos: the 1:1 default) — layout can run immediately, no waiting on
		// any network request. This is what used to block on every video's
		// metadata before showing anything.
		layoutMasonry();
		setTimeout(() => {
			isLoading = false;
		}, 80);

		// Resolve every video's real proportions from its LQIP frame capture
		// (~1KB, same aspect ratio as the video) immediately and in parallel —
		// NOT gated on the viewport like the videos themselves. Without this,
		// each video kept its 1:1 placeholder ratio until its own metadata
		// loaded near the viewport, so the masonry reshuffled under the user
		// again and again while scrolling (reported as "layout drifting
		// further and further"). All probes land within the debounce window
		// on a warm cache, collapsing into one early re-layout right after
		// mount, before the user has scrolled anywhere.
		const wrappers = document.querySelectorAll<HTMLElement>(
			'.grid_gallery_item .image-wrapper'
		);
		images.forEach((img, i) => {
			if (!img.isVideo || !img.lqip) return;
			const wrapper = wrappers[i]; // template renders one item per image, in order
			const probe = new Image();
			let retried = false;
			probe.onload = () =>
				setVideoRatio(wrapper, probe.naturalWidth, probe.naturalHeight);
			// A frame's very first extraction (cold edge transform) can fail or
			// time out; one delayed retry catches it once warmed (a fresh Image
			// instance — re-setting the same src on an errored one can be a
			// no-op). If both attempts fail, the video's own metadata still
			// corrects the ratio when it loads near the viewport (the pre-probe
			// behavior).
			probe.onerror = () => {
				if (retried) return;
				retried = true;
				setTimeout(() => {
					const retry = new Image();
					retry.onload = () =>
						setVideoRatio(wrapper, retry.naturalWidth, retry.naturalHeight);
					retry.src = img.lqip;
				}, 2500);
			};
			probe.src = img.lqip;
		});

		const handleResize = () => {
			clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(layoutMasonry, 100);
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(resizeTimer);
			clearTimeout(metaTimer);
		};
	});
</script>

<svelte:head>
	<title>Archives — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Archives">
	<ArchivesTitleBar active="image" />

	<section class="Gallery" class:loading={isLoading} id="grid-gallery">
		{#each images as image, i (i + image.workId + image.url)}
			<a
				class="grid_gallery_item"
				href={`/archives/${image.workId}`}
				aria-label={image.workTitle}
				draggable="false"
			>
				<div
					class="image-wrapper"
					style:aspect-ratio={image.aspectRatio}
					style:background-image={image.lqip ? `url(${image.lqip})` : undefined}
				>
					{#if image.isVideo}
						<video
							use:lazyGridVideo={{
								src: image.url,
								onMeta: handleVideoMeta,
								rootMargin: videoMargin
							}}
							loop
							muted
							playsinline
							aria-label={image.workTitle}
							draggable="false"
						></video>
					{:else}
						<img
							src={image.src}
							srcset={image.srcset}
							sizes={image.srcset ? GRID_SIZES : undefined}
							alt={image.workTitle}
							loading="lazy"
							decoding="async"
							width={image.width}
							height={image.height}
							draggable="false"
						/>
					{/if}
				</div>
			</a>
		{/each}
	</section>
</main>

<style>
	.Archives {
		padding-top: 120px;
		padding-bottom: 120px;
		padding-inline: 0;
	}

	/* Override base.css `section { padding-inline: var(--padding) }`
	   — every section inside .Archives sets its own padding. */
	.Archives section {
		padding-inline: 0;
	}

	/* SP: Gallery's left/right edges align with the Header's own
	   var(--padding) inset, not a near-edge-to-edge custom value. */
	.Archives .Gallery {
		padding-inline: var(--padding);
	}

	/* Masonry */
	.Archives .Gallery {
		position: relative;
		opacity: 1;
		transition: opacity 0.6s ease-out;
	}

	.Archives .Gallery.loading {
		opacity: 0;
		/* Hold a viewport of height before the first layout so the Footer
		   can't peek through while dimensions are still resolving. */
		min-height: 100vh;
	}

	.Archives .grid_gallery_item {
		position: absolute;
		display: block;
		cursor: pointer;
		color: inherit;
		text-decoration: none;
	}

	.Archives .image-wrapper {
		position: relative;
		width: 100%;
		overflow: hidden;
		/* LQIP placeholder: the inline background-image (a ~1KB capture of the
		   tile's own media, set in the template) stretched to fill — a 64px
		   source upscaled by cover is naturally soft, no CSS filter needed
		   (filters would pin a compositing layer per tile). The gray sits
		   underneath while the LQIP itself is still in flight. */
		background-color: var(--color-bg-gray);
		background-size: cover;
		background-position: center;
	}

	.Archives .image-wrapper img,
	.Archives .image-wrapper video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		/* Hidden until bytes arrive — the gray wrapper background is the
		   placeholder. No static filter here: an invisible element doesn't
		   need the blur, and WebKit can keep a compositing layer alive for
		   every element with a filter — ~100 grid items' worth of GPU
		   textures on a page that already fights iOS memory limits. */
		opacity: 0;
	}

	.Archives .image-wrapper img:global(.loaded),
	.Archives .image-wrapper video:global(.loaded) {
		opacity: 1;
		/* Blur+fade reveal as a one-shot ANIMATION (not a transition to
		   filter: blur(0)): once it finishes, the computed style carries no
		   filter at all, so no per-item filter layer lingers after load. */
		animation: media-reveal 0.6s ease;
	}

	@keyframes media-reveal {
		from {
			opacity: 0;
			filter: blur(12px);
		}
		to {
			opacity: 1;
			filter: blur(0);
		}
	}

	@media (min-width: 1024px) {
		.Archives {
			padding-top: 150px;
			padding-bottom: 160px;
			padding-inline: var(--padding);
			/* Up to ~16-inch (1640px) viewport: behaves like header (100% minus padding).
			   Beyond ~1822px viewport (where 90vw > 1640): cap shifts to 90vw, gradually. */
			max-width: max(1640px, 90vw);
			margin-inline: auto;
		}

		/* PC: Gallery inherits .Archives padding-inline, no own padding
		   (ArchivesTitleBar handles its own PC padding). */
		.Archives .Gallery {
			padding-inline: 0;
		}
	}
</style>
