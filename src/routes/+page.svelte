<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Loader from '$lib/components/Loader.svelte';
	import HomeFeed, { type Tile } from '$lib/components/HomeFeed.svelte';
	import { intro } from '$lib/state/intro.svelte';
	import { imgOpt, imgSrcset, mainVisual, mainVisualImage } from '$lib/js/img';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let introCompleted = $state(false);

	// PC gets the Figma "Log" feed; SP keeps the existing vertical archives stream.
	let isPC = $state(false);

	const padNumber = (n: number) => String(n + 1).padStart(2, '0');

	const works = $derived(data.works);
	const firstWork = $derived(works[0]);
	const restWorks = $derived(works.slice(1, 10));

	// Square work tiles for the right-hand vertical feed (5 selected projects).
	// Uses main_visual (Cloudflare video or image), falling back to thumbnail.
	const feedTiles = $derived.by<Tile[]>(() =>
		works
			.map((w) => ({ w, v: mainVisual(w) }))
			.filter((x): x is { w: (typeof works)[number]; v: NonNullable<typeof x.v> } => x.v !== null)
			.slice(0, 5)
			.map(({ w, v }) =>
				v.isVideo
					? { src: v.src, srcset: '', isVideo: true, alt: w.title, href: `/archives/${w.id}` }
					: {
							src: imgOpt(v.src, 800),
							srcset: imgSrcset(v.src, [400, 600, 800, 1200]),
							isVideo: false,
							alt: w.title,
							href: `/archives/${w.id}`
						}
			)
	);

	// 3 filler frames + firstWork = 4 frames revealed in the loader.
	// The last frame matches Archives card-01 so the handoff is seamless.
	// Image-only (the loader can't play video) — main_visual image / thumbnail.
	const loaderFrames = $derived.by(() => {
		const fw = firstWork;
		const frame = (w: (typeof works)[number]) => {
			const img = mainVisualImage(w)!;
			return {
				id: w.id,
				src: imgOpt(img.url, 1600),
				srcset: imgSrcset(img.url, [800, 1200, 1600, 2400]),
				alt: w.title
			};
		};
		if (!fw || !mainVisualImage(fw)) {
			return works.filter((w) => mainVisualImage(w)).slice(0, 4).map(frame);
		}
		const others = works.filter((w) => mainVisualImage(w) && w.id !== fw.id).slice(0, 3);
		return [...others, fw].map(frame);
	});

	onMount(() => {
		if (!browser) return;

		const pcMq = window.matchMedia('(min-width: 1024px)');
		isPC = pcMq.matches;
		const onPcChange = (e: MediaQueryListEvent) => (isPC = e.matches);
		pcMq.addEventListener('change', onPcChange);

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;

		if (prefersReducedMotion) {
			introCompleted = true;
			intro.completed = true;
			return () => pcMq.removeEventListener('change', onPcChange);
		}

		// Hide Header until loader completes
		intro.completed = false;

		return () => {
			pcMq.removeEventListener('change', onPcChange);
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

	{#if isPC}
		<!-- PC: Figma "Log" — vertical work feed + ethos statement -->
		<HomeFeed tiles={feedTiles} />

		<!-- After the feed: a dark band, then a light band (placeholder content
		     — Contact / studio info), then the global black Footer. -->
		<section class="band band--dark">
			<div class="band__inner">
				<p class="band__eyebrow" lang="en">Contact</p>
				<a class="band__lead" href="mailto:hi@takumiisobe.com" lang="en"
					>hi@takumiisobe.com</a
				>
				<p class="band__note" lang="en">
					For new projects across product, furniture, typeface, web and
					branding — we'd love to hear from you.
				</p>
			</div>
		</section>

		<section class="band band--light">
			<div class="band__inner">
				<p class="band__eyebrow" lang="en">Office</p>
				<p class="band__lead band__lead--text" lang="en">
					Office / TAKUMI ISOBE — a multi-disciplinary design office working
					across visual identity and design engineering.
				</p>
				<p class="band__note" lang="en">Tokyo, Japan</p>
			</div>
		</section>
	{:else}
		<!-- SP: Archives stream 01 → 10 (unchanged) -->
		<section class="Archives">
		<div class="wrapper">
			{#if firstWork}
				{@const fwImg = mainVisualImage(firstWork)}
				<a class="card card-01" href="/archives/{firstWork.id}">
					<div class="image">
						{#if fwImg}
							<img
								src={imgOpt(fwImg.url, 1600)}
								srcset={imgSrcset(fwImg.url, [800, 1200, 1600, 2400])}
								sizes="(min-width: 1024px) 60vw, 100vw"
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

			<!-- 02 〜 10: aspect-ratio temporarily disabled, natural height.
			     `--aspect` is computed from thumbnail dimensions so PC styles can
			     cap card width by `min(predefined, calc(90vh * aspect))` — this
			     shrinks the card for portrait images so the meta below aligns
			     with the rendered image width. -->
			{#each restWorks as work, i (work.id)}
				{@const wImg = mainVisualImage(work)}
				{@const aspect = wImg && wImg.width && wImg.height ? wImg.width / wImg.height : 1}
				<a
					class="card card-{padNumber(i + 1)}"
					href="/archives/{work.id}"
					style="--aspect: {aspect}"
				>
					<div class="image">
						{#if wImg}
							<img
								src={imgOpt(wImg.url, 1200)}
								srcset={imgSrcset(wImg.url, [600, 900, 1200, 1800])}
								sizes="(min-width: 1024px) 45vw, 90vw"
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
	{/if}
</main>

<style>
	.Home {
		min-height: 100dvh;
	}

	/* ----- Bands after the feed (dark Contact / light Office) ----- */
	.Home .band {
		min-height: 88vh;
		display: flex;
		align-items: center;
		padding: 120px var(--padding);
	}
	.Home .band--dark {
		background: var(--color-bg-dark);
	}
	.Home .band--dark :global(*) {
		color: #fff;
	}
	.Home .band--light {
		background: var(--color-bg);
	}
	.Home .band__inner {
		max-width: 760px;
	}
	.Home .band__eyebrow {
		margin: 0 0 24px;
		font-size: var(--fs-h6);
		font-weight: var(--fw-medium);
		opacity: 0.5;
	}
	.Home .band__lead {
		display: block;
		margin: 0;
		font-size: var(--fs-h2);
		line-height: 1.2;
		text-decoration: none;
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	.Home a.band__lead:hover {
		opacity: 0.6;
	}
	.Home .band__lead--text {
		font-weight: var(--fw-lead);
		font-variation-settings: 'wght' var(--fw-lead);
	}
	.Home .band__note {
		margin: 24px 0 0;
		font-size: var(--fs-p-en);
		opacity: 0.6;
		max-width: 48ch;
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
		font-weight: var(--fw-base);
	}

	/* base.css sets color directly on span — keep meta text black */
	.Home .Archives .card .meta .num,
	.Home .Archives .card .meta .code,
	.Home .Archives .card .meta .brand {
		color: var(--color-text);
	}

	.Home .Archives .card .meta .num {
		opacity: 0.6;
	}

	.Home .Archives .card .meta .brand {
		text-align: right;
		opacity: 0.6;
		font-weight: var(--fw-base);
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

		.Home .Archives .wrapper {
			gap: 120px;
		}

		.Home .Archives .card .meta {
			font-size: var(--fs-h5);
		}

		/* PC: cap tall (portrait) images at 90vh without cropping.
		   Image scales down proportionally, centered within the card,
		   and the gray placeholder background is removed so the empty
		   sides blend into the page rather than showing a gray block. */
		.Home .Archives .card:not(.card-01) .image {
			display: flex;
			justify-content: center;
			background: transparent;
		}

		.Home .Archives .card:not(.card-01) .image img {
			/* The card is already capped to the image's real width at 90vh via
			   max-width: min(px, calc(90vh * aspect)), so width:100% makes
			   image width == card width == meta width (no centering gap). The
			   height stays card-width / aspect <= 90vh, so nothing is cropped. */
			width: 100%;
			height: auto;
			max-width: 100%;
			max-height: 90vh;
		}

		/* 01 — hero, centered on first viewport */
		.Home .Archives .card-01 {
			width: 380px;
			padding-top: calc((100vh - 570px) / 2);
			margin-bottom: calc((100vh - 570px) / 2);
		}

		/* 02 — right-shifted medium */
		.Home .Archives .card-02 {
			width: 50vw;
			max-width: min(720px, calc(90vh * var(--aspect, 999)));
			margin-left: auto;
			margin-right: 0;
		}
		.Home .Archives .card-02 .meta {
			padding-inline: 0;
		}

		/* 03 — full-bleed wide */
		.Home .Archives .card-03 {
			width: 90vw;
			max-width: min(1400px, calc(90vh * var(--aspect, 999)));
			margin-left: auto;
			margin-right: auto;
		}
		.Home .Archives .card-03 .meta {
			padding-inline: 0;
		}

		/* 04 — left-shifted narrow */
		.Home .Archives .card-04 {
			width: 32vw;
			max-width: min(500px, calc(90vh * var(--aspect, 999)));
			margin-left: 8vw;
			margin-right: auto;
		}

		/* 05 — centered medium-wide */
		.Home .Archives .card-05 {
			width: 60vw;
			max-width: min(900px, calc(90vh * var(--aspect, 999)));
			margin-left: auto;
			margin-right: auto;
		}
		.Home .Archives .card-05 .meta {
			padding-inline: 0;
		}

		/* 06 — right-shifted medium */
		.Home .Archives .card-06 {
			width: 45vw;
			max-width: min(700px, calc(90vh * var(--aspect, 999)));
			margin-left: auto;
			margin-right: 8vw;
		}

		/* 07 — left-shifted small */
		.Home .Archives .card-07 {
			width: 38vw;
			max-width: min(580px, calc(90vh * var(--aspect, 999)));
			margin-left: 8vw;
			margin-right: auto;
		}

		/* 08 — centered medium */
		.Home .Archives .card-08 {
			width: 50vw;
			max-width: min(800px, calc(90vh * var(--aspect, 999)));
			margin-left: auto;
			margin-right: auto;
		}

		/* 09 — full-bleed wide */
		.Home .Archives .card-09 {
			width: 90vw;
			max-width: min(1400px, calc(90vh * var(--aspect, 999)));
			margin-left: auto;
			margin-right: auto;
		}
		.Home .Archives .card-09 .meta {
			padding-inline: 0;
		}

		/* 10 — right-shifted narrow */
		.Home .Archives .card-10 {
			width: 35vw;
			max-width: min(540px, calc(90vh * var(--aspect, 999)));
			margin-left: auto;
			margin-right: 8vw;
		}
	}
</style>
