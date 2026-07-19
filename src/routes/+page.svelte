<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Loader from '$lib/components/Loader.svelte';
	import { intro } from '$lib/state/intro.svelte';
	import { imgOpt, imgSrcset, mainVisual, mainVisualImage } from '$lib/js/img';
	import { lazyVideo } from '$lib/actions/lazyVideo';
	import { padNumber } from '$lib/js/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let introCompleted = $state(false);

	const works = $derived(data.works);
	const firstWork = $derived(works[0]);
	const restWorks = $derived(works.slice(1, 10));

	// Meta's third column: first 2 scope tags, e.g. "Branding / Web" — matches
	// the convention already used in archives/list/+page.svelte.
	const workScope = (w: { scope?: string[] }) => (w.scope ?? []).slice(0, 2).join(' / ');

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

		// card-01 hands off from the Loader's frame-stack, which centers
		// itself on the PHYSICAL screen height measured in JS (no CSS
		// viewport unit reaches the true bottom on iOS 26 Safari's
		// floating-tab UI — see Loader.svelte). card-01's own centering
		// math used raw 100dvh, which resolves to a different, smaller
		// value on that UI, so the card visibly jumped the instant the
		// loader faded out. Mirror the same measurement here so the two
		// agree; --physical-vh falls back to 100dvh (the CSS default) for
		// the instant before this runs, which the opaque Loader covers
		// entirely, so there's nothing to see anyway.
		{
			const coarse = window.matchMedia('(pointer: coarse)').matches;
			const physical = coarse
				? Math.max(window.screen.height, window.innerHeight)
				: window.innerHeight;
			document.documentElement.style.setProperty('--physical-vh', `${physical}px`);
		}

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
		brand={firstWork ? workScope(firstWork) : ''}
		showLogo={false}
		onTextReveal={handleTextReveal}
		onComplete={handleLoaderComplete}
	/>

	<!-- Archives stream 01 → 10 — same layout on every viewport (PC previously
	     swapped in a work-feed + contact/office bands; reverted to this simpler
	     stream for now). The min-width:1024px block below still varies each
	     card's width/position on desktop; only the SP/PC branch split and the
	     bands were removed. -->
	<section class="Archives">
		<div class="wrapper">
			{#if firstWork}
				{@const fwVisual = mainVisual(firstWork)}
				<a class="card card-01" href="/archives/{firstWork.id}">
					<div class="image">
						{#if fwVisual?.isVideo}
							<!-- Hero is already in view on load — play directly, no
							     lazy-load gate needed. -->
							<video
								src={fwVisual.src}
								autoplay
								loop
								muted
								playsinline
								aria-label={firstWork.title}
							></video>
						{:else if fwVisual}
							<!-- Fixed 257px (320px @768, 380px @1024) — size the srcset to
							     that, not 100vw, and prioritise it as the LCP. -->
							<img
								src={imgOpt(fwVisual.src, 640)}
								srcset={imgSrcset(fwVisual.src, [400, 640, 800, 1200])}
								sizes="(min-width: 768px) 320px, 257px"
								alt={firstWork.title}
								loading="eager"
								fetchpriority="high"
								decoding="async"
							/>
						{/if}
					</div>
					<div class="meta">
						<span class="num" lang="en">{padNumber(0)}</span>
						<span class="code" lang="en">{firstWork.title}</span>
						<span class="scope" lang="en">{workScope(firstWork)}</span>
					</div>
				</a>
			{/if}

			<!-- 02 〜 10: aspect-ratio temporarily disabled, natural height.
			     `--aspect` is computed from thumbnail dimensions so PC styles can
			     cap card width by `min(predefined, calc(90vh * aspect))` — this
			     shrinks the card for portrait images so the meta below aligns
			     with the rendered image width. -->
			{#each restWorks as work, i (work.id)}
				{@const wVisual = mainVisual(work)}
				{@const aspect = wVisual && wVisual.width && wVisual.height ? wVisual.width / wVisual.height : 1}
				<a
					class="card card-{padNumber(i + 1)}"
					href="/archives/{work.id}"
					style="--aspect: {aspect}"
				>
					<div class="image">
						{#if wVisual?.isVideo}
							<video
								use:lazyVideo
								src={wVisual.src}
								loop
								muted
								playsinline
								aria-label={work.title}
							></video>
						{:else if wVisual}
							<img
								src={imgOpt(wVisual.src, 1200)}
								srcset={imgSrcset(wVisual.src, [600, 900, 1200, 1800])}
								sizes="(min-width: 1024px) 45vw, 90vw"
								alt={work.title}
								loading="lazy"
							/>
						{/if}
					</div>
					<div class="meta">
						<span class="num" lang="en">{padNumber(i + 1)}</span>
						<span class="code" lang="en">{work.title}</span>
						<span class="scope" lang="en">{workScope(work)}</span>
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
		padding-bottom: 0;
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

	.Home .Archives .card .image img,
	.Home .Archives .card .image video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Cards 02–10: natural height (aspect-ratio temporarily disabled) */
	.Home .Archives .card:not(.card-01) .image img,
	.Home .Archives .card:not(.card-01) .image video {
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
	.Home .Archives .card .meta .scope {
		color: var(--color-text);
	}

	.Home .Archives .card .meta .num {
		opacity: 0.6;
	}

	.Home .Archives .card .meta .scope {
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
		/* --physical-vh (set in onMount, see comment there) so this centres on
		   the same physical screen height the Loader's frame-stack handed off
		   from — 100dvh is only the pre-JS fallback. */
		padding-top: calc((var(--physical-vh, 100dvh) - 385px) / 2);
		margin-bottom: calc((var(--physical-vh, 100dvh) - 385px) / 2 - 103px);
	}

	.Home .Archives .card-01 .image {
		aspect-ratio: 257 / 385;
	}

	/* 02 — 90% centered */
	.Home .Archives .card-02 {
		width: 90%;
		margin-inline: auto;
	}

	/* 03 — full bleed image, meta stays inside padding */
	.Home .Archives .card-03 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Home .Archives .card-03 .meta {
		padding-inline: var(--padding);
	}

	/* 04 — narrow, centered */
	.Home .Archives .card-04 {
		width: 62.5vw;
		margin-inline: auto;
	}

	/* 05 — full bleed image, meta stays inside padding */
	.Home .Archives .card-05 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Home .Archives .card-05 .meta {
		padding-inline: var(--padding);
	}

	/* 06 — 85% centered */
	.Home .Archives .card-06 {
		width: 85%;
		margin-inline: auto;
	}

	/* 07 — 70% centered */
	.Home .Archives .card-07 {
		width: 70%;
		margin-inline: auto;
	}

	/* 08 — 80% centered */
	.Home .Archives .card-08 {
		width: 80%;
		margin-inline: auto;
	}

	/* 09 — full bleed image, meta stays inside padding */
	.Home .Archives .card-09 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Home .Archives .card-09 .meta {
		padding-inline: var(--padding);
	}

	/* 10 — narrow, centered */
	.Home .Archives .card-10 {
		width: 62.5vw;
		margin-inline: auto;
	}

	/* ----- Tablet+ ----- */
	@media (min-width: 768px) {
		.Home .Archives .card-01 {
			width: 320px;
			padding-top: calc((var(--physical-vh, 100dvh) - 480px) / 2);
			margin-bottom: calc((var(--physical-vh, 100dvh) - 480px) / 2);
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

		.Home .Archives .card:not(.card-01) .image img,
		.Home .Archives .card:not(.card-01) .image video {
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
			padding-top: calc((var(--physical-vh, 100dvh) - 570px) / 2);
			margin-bottom: calc((var(--physical-vh, 100dvh) - 570px) / 2);
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
