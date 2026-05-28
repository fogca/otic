<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
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
				aspectRatio: `${img.width} / ${img.height}`
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

		const columnHeights = Array(columnCount).fill(0);
		items.forEach((item, index) => {
			const column = index % columnCount;
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

		const imageElements = document.querySelectorAll('.grid_gallery_item img');
		let loaded = 0;

		const checkAllLoaded = () => {
			loaded++;
			if (loaded === imageElements.length) {
				layoutMasonry();
				setTimeout(() => {
					isLoading = false;
				}, 80);
			}
		};

		imageElements.forEach((img) => {
			if ((img as HTMLImageElement).complete) {
				checkAllLoaded();
			} else {
				img.addEventListener('load', checkAllLoaded);
				img.addEventListener('error', checkAllLoaded);
			}
		});

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
					<img
						src={image.url}
						alt={image.workTitle}
						loading="lazy"
						width={image.width}
						height={image.height}
						draggable="false"
					/>
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
		font-weight: 400;
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
		font-weight: 400;
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

	.Archives .image-wrapper img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
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
