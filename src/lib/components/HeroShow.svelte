<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import { stopLenis, startLenis } from '$lib/state/lenis';

	export type Slide = {
		id: string;
		title: string;
		brand: string;
		heroSrc: string;
		heroSrcset: string;
		detailSrc: string;
		detailSrcset: string;
		href: string;
	};

	// `playing` gates auto-advance: parent flips it true once the intro Loader
	// has handed off, so the cycle doesn't run behind the loader.
	let { slides = [], playing = true }: { slides?: Slide[]; playing?: boolean } = $props();

	const DWELL = 4500; // ms each slide holds before advancing

	const n = $derived(slides.length);

	// Two stacked layers ping-pong: `front` is the visible one, the other holds
	// the preloaded next slide. idx[layer] = which slide each layer shows.
	let front = $state(0);
	let idx = $state<[number, number]>([0, 0]);

	let heroEls = $state<HTMLElement[]>([]);
	let detailEls = $state<HTMLElement[]>([]);
	let capEls = $state<HTMLElement[]>([]);

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let gsapRef: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let activeTl: any = null;
	let gsapReady = $state(false);
	let reduced = $state(false);
	let animating = false;
	let destroyed = false;
	let timer: ReturnType<typeof setInterval> | null = null;

	function stopTimer() {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	}
	function startTimer() {
		stopTimer();
		if (n > 1) timer = setInterval(() => advance(), DWELL);
	}
	// Resume only if conditions still hold (used on focus-out).
	function maybeStart() {
		if (playing && gsapReady && !reduced && n > 1) startTimer();
	}

	function advance() {
		const g = gsapRef;
		if (!g || animating || n < 2) return;
		animating = true;
		const back = 1 - front;
		const bHero = heroEls[back];
		const bDet = detailEls[back];
		const bCap = capEls[back];
		const fDet = detailEls[front];
		const fCap = capEls[front];

		// Promote only the animated elements, only for the transition's duration.
		const moving = [bHero, bDet, bCap, fDet, fCap].filter(Boolean);
		g.set(moving, { willChange: 'transform, opacity, clip-path, filter' });

		// Fresh from-state on the incoming (back) layer.
		g.set(bHero, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 });
		g.set(bDet, { opacity: 0, scale: 1.04 });
		g.set(bCap, { yPercent: 120, filter: 'blur(6px)', opacity: 0 });

		activeTl = g.timeline({
			onComplete: async () => {
				if (destroyed) return;
				front = back;
				// Park the now-back (old front) layer on the next-next slide,
				// hidden, so it's preloaded for the following advance.
				const nb = 1 - back;
				idx[nb] = (idx[back] + 1) % n;
				idx = [...idx] as [number, number];
				await tick();
				if (destroyed) return;
				g.set(heroEls[nb], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 });
				g.set(detailEls[nb], { opacity: 0 });
				g.set(capEls[nb], { opacity: 0 });
				// Release the GPU promotion now nothing is animating.
				g.set(moving, { willChange: 'auto' });
				activeTl = null;
				animating = false;
			}
		});
		const tl = activeTl;
		// Incoming reveals bottom-up + settles its zoom (loader signature).
		tl.to(bHero, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1.1, ease: 'power3.out' }, 0);
		tl.to(bDet, { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 0.15);
		tl.to(bCap, { yPercent: 0, filter: 'blur(0px)', opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.2);
		// Outgoing caption lifts away; outgoing detail cross-fades out.
		tl.to(fCap, { yPercent: -80, filter: 'blur(4px)', opacity: 0, duration: 0.6, ease: 'power2.in' }, 0);
		tl.to(fDet, { opacity: 0, duration: 0.7, ease: 'power1.inOut' }, 0.1);
	}

	// Start/stop the auto-cycle as `playing` flips (intro handoff) — only once
	// GSAP is ready and motion is allowed.
	$effect(() => {
		if (!browser) return;
		if (playing && gsapReady && !reduced && n > 1) startTimer();
		else stopTimer();
	});

	onMount(() => {
		if (!browser) return;

		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// This page is a single ambient screen — lock global smooth scroll.
		stopLenis();
		document.documentElement.style.overflowY = 'hidden';

		idx = [0, n > 1 ? 1 : 0];

		let cancelled = false;

		const reveal = (g: typeof gsapRef | null) => {
			// Front visible, back hidden (pre-roll state).
			const set = (el: HTMLElement | undefined, v: Record<string, unknown>) => {
				if (!el) return;
				if (g) g.set(el, v);
				else Object.assign(el.style, v);
			};
			set(heroEls[front], { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, opacity: 1 });
			set(detailEls[front], { opacity: 1, scale: 1 });
			set(capEls[front], { yPercent: 0, filter: 'blur(0px)', opacity: 1 });
			set(heroEls[1 - front], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.06 });
			set(detailEls[1 - front], { opacity: 0 });
			set(capEls[1 - front], { yPercent: 120, opacity: 0 });
		};

		if (reduced) {
			// No GSAP, no cycle — just show slide 0.
			tick().then(() => reveal(null));
		} else {
			import('gsap').then(async ({ gsap }) => {
				if (cancelled) return;
				gsapRef = gsap;
				await tick();
				reveal(gsap);
				gsapReady = true;
			});
		}

		return () => {
			cancelled = true;
			destroyed = true;
			activeTl?.kill();
			stopTimer();
			document.documentElement.style.overflowY = '';
			startLenis();
		};
	});
</script>

<!-- Ambient decorative hero; pause the auto-cycle while a hero link is focused
	 so its destination can't change under a keyboard/SR user (WCAG 2.2.2). -->
<div class="hs-stage" onfocusin={stopTimer} onfocusout={maybeStart}>
	{#each [0, 1] as L (L)}
		<!-- Only the front layer is interactive / in the a11y tree; the
		     preloaded back layer is inert so its <a> isn't tabbable. -->
		<div class="hs-layer" class:is-front={front === L} inert={front !== L} aria-hidden={front !== L}>
			<a class="hs-hero" href={slides[idx[L]]?.href ?? '#'} aria-label={slides[idx[L]]?.title ?? ''}>
				<img
					bind:this={heroEls[L]}
					src={slides[idx[L]]?.heroSrc}
					srcset={slides[idx[L]]?.heroSrcset}
					sizes="44vw"
					alt={slides[idx[L]]?.title ?? ''}
					loading="eager"
				/>
			</a>

			<div class="hs-detail" bind:this={detailEls[L]} aria-hidden="true">
				<img
					src={slides[idx[L]]?.detailSrc}
					srcset={slides[idx[L]]?.detailSrcset}
					sizes="17vw"
					alt=""
					loading="lazy"
				/>
			</div>

			<div class="hs-caption">
				<div class="hs-caption-inner" bind:this={capEls[L]}>
					<span class="hs-title" lang="en">{slides[idx[L]]?.title ?? ''}</span>
					{#if slides[idx[L]]?.brand}
						<span class="hs-brand" lang="en">{slides[idx[L]]?.brand}</span>
					{/if}
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.hs-stage {
		position: relative;
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
		background: var(--color-bg);
	}

	.hs-layer {
		position: absolute;
		inset: 0;
		z-index: 2; /* incoming (back) layer sits above the front during reveal */
	}
	.hs-layer.is-front {
		z-index: 1;
	}

	/* ── Hero: full-height image bleeding off the right edge (Figma 655/1512) ── */
	.hs-hero {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 0;
		width: 43.3vw;
		overflow: hidden;
		display: block;
	}
	.hs-hero img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		/* Pre-GSAP default: hidden (revealed bottom-up on mount/advance).
		   will-change is applied transiently by GSAP only during transitions. */
		clip-path: inset(100% 0% 0% 0%);
	}
	/* Front layer shows immediately before GSAP takes over (loader covers any gap) */
	.hs-layer.is-front .hs-hero img {
		clip-path: inset(0% 0% 0% 0%);
	}

	/* ── Detail: small floating crop (Figma 257×324 at 397,332) ── */
	.hs-detail {
		position: absolute;
		left: 26.3vw;
		top: 33.8vh;
		/* Width drives height via aspect-ratio, but clamp by the vertical space
		   left below `top` so the crop never clips on wide-and-short viewports. */
		width: min(17vw, calc((100dvh - 33.8vh - 24px) * 257 / 324));
		aspect-ratio: 257 / 324;
		overflow: hidden;
		opacity: 0;
	}
	.hs-layer.is-front .hs-detail {
		opacity: 1;
	}
	.hs-detail img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* ── Caption: left-aligned, vertically centred (Figma 40,479) ── */
	.hs-caption {
		position: absolute;
		left: 40px;
		top: 48.8vh;
		max-width: 22vw;
		overflow: hidden; /* mask for the rise-in */
	}
	.hs-caption-inner {
		display: flex;
		flex-direction: column;
		gap: 2px;
		opacity: 0;
	}
	.hs-layer.is-front .hs-caption-inner {
		opacity: 1;
	}
	.hs-title {
		font-size: var(--fs-h5); /* 16px on PC — matches Figma caption */
		line-height: 1.3;
	}
	.hs-brand {
		font-size: var(--fs-h6);
		opacity: 0.5;
		line-height: 1.4;
	}

	/* This whole experience is PC-only; never render below 1024 */
	@media (max-width: 1023px) {
		.hs-stage {
			display: none;
		}
	}
</style>
