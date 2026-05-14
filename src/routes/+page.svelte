<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Loader from '$lib/components/Loader.svelte';
	import { intro } from '$lib/state/intro.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let introCompleted = $state(false);

	const padNumber = (n: number) => String(n + 1).padStart(2, '0');

	const works = $derived(data.works);
	const firstWork = $derived(works[0]);
	const restWorks = $derived(works.slice(1, 10));

	// 3 filler frames + firstWork = 4 frames revealed in the loader.
	// The last frame matches Archives card-01 so the handoff is seamless.
	const loaderFrames = $derived.by(() => {
		const fw = firstWork;
		if (!fw || !fw.thumbnail) {
			return works
				.filter((w) => w.thumbnail)
				.slice(0, 4)
				.map((w) => ({ id: w.id, src: w.thumbnail!.url, alt: w.title }));
		}
		const others = works
			.filter((w) => w.thumbnail && w.id !== fw.id)
			.slice(0, 3);
		return [...others, fw].map((w) => ({
			id: w.id,
			src: w.thumbnail!.url,
			alt: w.title
		}));
	});

	onMount(() => {
		if (!browser) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;

		if (prefersReducedMotion) {
			introCompleted = true;
			intro.completed = true;
			return;
		}

		// Hide Header until loader completes
		intro.completed = false;

		return () => {
			intro.completed = true;
		};
	});

	// Fires when Loader's text reveal starts — sync Header slide-in to text-in timing
	const handleTextReveal = () => {
		intro.completed = true;
	};

	const handleLoaderComplete = () => {
		introCompleted = true;
		intro.completed = true; // idempotent — already true from handleTextReveal
	};
</script>

<main class="Home" data-intro-completed={introCompleted}>
	<!--
		Loader: ard.ac-inspired sequence — 6 frames clip-path reveal on black,
		then bg fades to white while meta text rises in, then hands off to Archives 01.
		To restore the original logo lock-up intro, set `showLogo={true}`.
	-->
	<Loader
		frames={loaderFrames}
		num={padNumber(0)}
		title={firstWork?.title ?? ''}
		brand={firstWork?.brand ?? ''}
		showLogo={false}
		onTextReveal={handleTextReveal}
		onComplete={handleLoaderComplete}
	/>

	<!-- Archives stream: 01 → 10 -->
	<section class="Archives">
		<div class="wrapper">
			{#if firstWork}
				<a class="card card-01" href="/archives/{firstWork.id}">
					<div class="image">
						{#if firstWork.thumbnail}
							<img
								src={firstWork.thumbnail.url}
								alt={firstWork.title}
								loading="eager"
							/>
						{/if}
					</div>
					<div class="meta">
						<span class="num" lang="en">{padNumber(0)}</span>
						<span class="code" lang="en">{firstWork.title}</span>
						<span class="brand" lang="en">{firstWork.brand ?? ''}</span>
					</div>
				</a>
			{/if}

			<!-- 02 〜 10: aspect-ratio temporarily disabled, natural height -->
			{#each restWorks as work, i (work.id)}
				<a class="card card-{padNumber(i + 1)}" href="/archives/{work.id}">
					<div class="image">
						{#if work.thumbnail}
							<img
								src={work.thumbnail.url}
								alt={work.title}
								loading="lazy"
							/>
						{/if}
					</div>
					<div class="meta">
						<span class="num" lang="en">{padNumber(i + 1)}</span>
						<span class="code" lang="en">{work.title}</span>
						<span class="brand" lang="en">{work.brand ?? ''}</span>
					</div>
				</a>
			{/each}
		</div>
	</section>
</main>

<style>
	.Home {
		min-height: 100dvh;
	}

	/* ----- Archives stream ----- */
	.Home .Archives {
		padding-bottom: 120px;
	}

	.Home .Archives .wrapper {
		display: flex;
		flex-direction: column;
		gap: 80px;
	}

	.Home .Archives .card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	.Home .Archives .card:hover {
		opacity: 0.8;
	}

	.Home .Archives .card .image {
		position: relative;
		width: 100%;
		overflow: hidden;
		background: var(--color-bg-gray);
	}

	.Home .Archives .card .image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Cards 02–10: natural height (aspect-ratio temporarily disabled) */
	.Home .Archives .card:not(.card-01) .image img {
		height: auto;
		object-fit: initial;
	}

	/* ----- Meta (regular weight, follows card width) ----- */
	.Home .Archives .card .meta {
		display: grid;
		grid-template-columns: 12.5% 1fr auto;
		align-items: baseline;
		gap: 8px;
		font-size: var(--fs-h6);
		font-weight: 400;
	}

	.Home .Archives .card .meta .num {
		opacity: 0.6;
	}

	.Home .Archives .card .meta .brand {
		text-align: right;
		opacity: 0.6;
		font-weight: 400;
	}

	/* ----- Mobile only: per-project widths on the CARD itself ----- */
	/* 01 — Top intro continuation: img centered on 100vh */
	.Home .Archives .card-01 {
		width: 257px;
		max-width: 100%;
		margin-inline: auto;
		padding-top: calc((100vh - 385px) / 2);
		margin-bottom: calc((100vh - 385px) / 2 - 103px);
	}

	.Home .Archives .card-01 .image {
		aspect-ratio: 257 / 385;
	}

	/* 02 — 90% centered */
	.Home .Archives .card-02 {
		width: 90%;
		margin-inline: auto;
	}
	.Home .Archives .card-02 .image {
		/* aspect-ratio: 4 / 5; */
	}

	/* 03 — full bleed image, meta stays inside padding */
	.Home .Archives .card-03 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Home .Archives .card-03 .image {
		/* aspect-ratio: 1 / 1; */
	}
	.Home .Archives .card-03 .meta {
		padding-inline: var(--padding);
	}

	/* 04 — narrow, centered */
	.Home .Archives .card-04 {
		width: 62.5vw;
		margin-inline: auto;
	}
	.Home .Archives .card-04 .image {
		/* aspect-ratio: 4 / 5; */
	}

	/* 05 — full bleed image, meta stays inside padding */
	.Home .Archives .card-05 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Home .Archives .card-05 .image {
		/* aspect-ratio: 16 / 9; */
	}
	.Home .Archives .card-05 .meta {
		padding-inline: var(--padding);
	}

	/* 06 — 85% centered */
	.Home .Archives .card-06 {
		width: 85%;
		margin-inline: auto;
	}
	.Home .Archives .card-06 .image {
		/* aspect-ratio: 4 / 5; */
	}

	/* 07 — 70% centered */
	.Home .Archives .card-07 {
		width: 70%;
		margin-inline: auto;
	}
	.Home .Archives .card-07 .image {
		/* aspect-ratio: 4 / 5; */
	}

	/* 08 — 80% centered */
	.Home .Archives .card-08 {
		width: 80%;
		margin-inline: auto;
	}
	.Home .Archives .card-08 .image {
		/* aspect-ratio: 4 / 5; */
	}

	/* 09 — full bleed image, meta stays inside padding */
	.Home .Archives .card-09 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Home .Archives .card-09 .image {
		/* aspect-ratio: 16 / 9; */
	}
	.Home .Archives .card-09 .meta {
		padding-inline: var(--padding);
	}

	/* 10 — narrow, centered */
	.Home .Archives .card-10 {
		width: 62.5vw;
		margin-inline: auto;
	}
	.Home .Archives .card-10 .image {
		/* aspect-ratio: 4 / 5; */
	}

	/* ----- Tablet+ ----- */
	@media (min-width: 768px) {
		.Home .Archives .card-01 {
			width: 320px;
			padding-top: calc((100vh - 480px) / 2);
			margin-bottom: calc((100vh - 480px) / 2);
		}
	}

	/* ----- Desktop ----- */
	@media (min-width: 1024px) {
		.Home .Archives {
			padding-bottom: 160px;
		}

		.Home .Archives .card .meta {
			font-size: var(--fs-h5);
		}

		.Home .Archives .card-01 {
			width: 380px;
			padding-top: calc((100vh - 570px) / 2);
			margin-bottom: calc((100vh - 570px) / 2);
		}
	}
</style>
