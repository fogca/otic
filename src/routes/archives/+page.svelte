<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { lazyVideo } from '$lib/actions/lazyVideo';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Optimise microCMS image URLs via Imgix-style query params.
	const images = $derived(
		data.images.map((img) => {
			const optimised = img.url.includes('microcms-assets.io')
				? `${img.url}?fm=webp&q=60&w=700&fit=max&auto=compress`
				: img.url;
			return {
				...img,
				url: optimised,
				// Videos have no CMS dimensions; aspect is set from <video> metadata at runtime.
				aspectRatio: img.isVideo ? undefined : `${img.width} / ${img.height}`
			};
		})
	);

	let isLoading = $state(true);

	// Column count by viewport: SP = 2, Laptop+ (≥1024) = 5
	function getColumnCount(): number {
		if (!browser) return 5;
		return window.matchMedia('(min-width: 1024px)').matches ? 5 : 2;
	}

	// Grid gap: PC = 15px, SP = 5px
	function getGap(): number {
		if (!browser) return 15;
		return window.matchMedia('(min-width: 1024px)').matches ? 15 : 5;
	}

	function layoutMasonry() {
		if (!browser) return;
		const container = document.getElementById('grid-gallery');
		const items = document.querySelectorAll<HTMLElement>('.grid_gallery_item');
		if (!container || items.length === 0) return;

		const columnCount = getColumnCount();
		const gap = getGap();
		const containerWidth = container.offsetWidth;
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
			const x = column * (columnWidth + gap);
			const y = columnHeights[column];
			const itemHeight = item.offsetHeight;
			item.style.left = `${x}px`;
			item.style.top = `${y}px`;
			columnHeights[column] += itemHeight + gap;
		});

		container.style.height = `${Math.max(...columnHeights)}px`;
	}

	function navigateToWork(workId: string) {
		goto(`/archives/${workId}`);
	}

	let resizeTimer: number;

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

		// Masonry layout needs DIMENSIONS, not bytes: images carry CMS
		// width/height (aspect known up-front), videos only need metadata. So we
		// lay out as soon as every video has reported its size — the grid gets
		// its real height immediately and the Footer never peeks through.
		let pendingVideoMeta = videoElements.length;
		const runLayout = () => {
			layoutMasonry();
			setTimeout(() => {
				isLoading = false;
			}, 80);
		};
		const onVideoMeta = (video: HTMLVideoElement) => {
			const wrapper = video.closest<HTMLElement>('.image-wrapper');
			if (wrapper && video.videoWidth && video.videoHeight) {
				wrapper.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
			}
			pendingVideoMeta--;
			if (pendingVideoMeta <= 0) runLayout();
		};

		if (videoElements.length === 0) {
			runLayout();
		} else {
			videoElements.forEach((video) => {
				if (video.readyState >= 1 /* HAVE_METADATA */) {
					onVideoMeta(video);
				} else {
					video.addEventListener('loadedmetadata', () => onVideoMeta(video), { once: true });
					video.addEventListener('error', () => onVideoMeta(video), { once: true });
				}
			});
		}

		const handleResize = () => {
			clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(layoutMasonry, 100);
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
			clearTimeout(resizeTimer);
		};
	});
</script>

<svelte:head>
	<title>Archives — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Archives">
	<section class="Title">
		<h1 class="title" lang="en">Work Archives</h1>
	</section>

	<section class="ViewSwitch">
		<div class="wrapper">
			<span class="link is-active" lang="en">Index</span>
			<a href="/archives/list" class="link is-mute" lang="en">List</a>
		</div>
	</section>

	<section class="Gallery" class:loading={isLoading} id="grid-gallery">
		{#each images as image, i (i + image.workId + image.url)}
			<div
				class="grid_gallery_item"
				role="button"
				tabindex="0"
				onclick={() => navigateToWork(image.workId)}
				onkeydown={(e) => e.key === 'Enter' && navigateToWork(image.workId)}
				aria-label={image.workTitle}
			>
				<div class="image-wrapper" style:aspect-ratio={image.aspectRatio}>
					{#if image.isVideo}
						<video
							src={image.url}
							use:lazyVideo
							loop
							muted
							playsinline
							preload="metadata"
							aria-label={image.workTitle}
							draggable="false"
						></video>
					{:else}
						<img
							src={image.url}
							alt={image.workTitle}
							loading="lazy"
							width={image.width}
							height={image.height}
							draggable="false"
						/>
					{/if}
				</div>
			</div>
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

	/* SP: Title / ViewSwitch align with header padding,
	   Gallery hugs closer to the edge for the masonry rhythm. */
	.Archives .Title,
	.Archives .ViewSwitch {
		padding-inline: var(--padding);
	}

	.Archives .Gallery {
		padding-inline: 5px;
	}

	/* Title */
	.Archives .Title {
		padding-block: 24px 0;
	}

	.Archives .Title .title {
		font-size: var(--fs-h1);
		font-weight: var(--fw-base);
		margin: 0;
	}

	/* View switch */
	.Archives .ViewSwitch {
		padding-block: 8px 24px;
	}

	.Archives .ViewSwitch .wrapper {
		display: flex;
		gap: 16px;
	}

	.Archives .ViewSwitch .link {
		font-size: var(--fs-h6);
		font-weight: var(--fw-base);
	}

	.Archives .ViewSwitch .link.is-mute {
		opacity: 0.3;
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	.Archives .ViewSwitch .link.is-mute:hover {
		opacity: 1;
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
		cursor: pointer;
	}

	.Archives .image-wrapper {
		position: relative;
		width: 100%;
		overflow: hidden;
		background: var(--color-bg-gray);
	}

	.Archives .image-wrapper img,
	.Archives .image-wrapper video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		/* Self lazy-load reveal: blur + fade in once the bytes arrive.
		   The gray wrapper background acts as the placeholder underneath. */
		opacity: 0;
		filter: blur(12px);
		transition: opacity 0.6s ease, filter 0.6s ease;
	}

	.Archives .image-wrapper img:global(.loaded),
	.Archives .image-wrapper video:global(.loaded) {
		opacity: 1;
		filter: blur(0);
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

		/* PC: child sections inherit .Archives padding-inline, no own padding. */
		.Archives .Title,
		.Archives .ViewSwitch,
		.Archives .Gallery {
			padding-inline: 0;
		}

		.Archives .Title {
			padding-block: 32px 0;
		}

		.Archives .ViewSwitch {
			padding-block: 12px 32px;
		}

		.Archives .ViewSwitch .link {
			font-size: var(--fs-h5);
		}
	}
</style>
