<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onNavigate, afterNavigate } from '$app/navigation';
	import gsap from 'gsap';
	import { CustomEase } from 'gsap/CustomEase';
	import { intro } from '$lib/state/intro.svelte';
	import { lang } from '$lib/state/lang.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	// Wordmark = current (2026) lock-up; the previous one lives in Logo.svelte.
	import Wordmark from '$lib/components/Wordmark.svelte';
	import { setLenis } from '$lib/state/lenis';

	// Office has its own prominent wordmark + dark reversal — skip the corner logo there.
	const isOffice = $derived(page.url.pathname.startsWith('/office'));

	// Reflect the chosen language onto <html data-lang> so the show/hide CSS
	// (in pages with bilingual copy) switches between EN and JA.
	$effect(() => {
		if (browser) document.documentElement.dataset.lang = lang.current;
	});

	gsap.registerPlugin(CustomEase);

	// Awwwards-style silk easing for the white panel
	CustomEase.create('panelSilk', 'M0,0 C0.76,0 0.24,1 1,1');
	// Quintic out — soft, slow-landing ease for content fade-in
	CustomEase.create('contentFade', 'M0,0 C0.22,1 0.36,1 1,1');

	let { children } = $props();

	// ── Page transition timing (adjust freely) ──
	const OUT_DURATION = 1.0; // s — base duration for shrink + darken
	const FADE_IN_DELAY = 0.3; // s — hold the white panel before content fades in
	const FADE_IN_DURATION = 0.9; // s — incoming (page content fade in over panel)
	const PAGE_SCALE = 0.85;
	const DARKEN_OPACITY = 0.35;
	const DARKEN_DELAY_RATIO = 0.25;
	const DARKEN_DURATION_RATIO = 0.75;
	const PANEL_DELAY_RATIO = 0.45;
	const PANEL_DURATION = 0.95; // s — panel slide-up duration (independent, slower & silky)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let lenisInstance: any;
	let needsEntryAnim = false;
	let isHomeNav = false; // navigating to "/" — use black panel + hand off to Loader

	// FONTPLUS (Tazugane webfont) loads via a deferred <script> in app.html, so the
	// global may not exist yet when navigation callbacks fire. Poll briefly, then run.
	type FontplusApi = { reload: (init?: boolean) => void };
	function whenFontplusReady(cb: (fp: FontplusApi) => void, timeoutMs = 6000) {
		const startedAt = performance.now();
		const poll = () => {
			const fp = (window as unknown as { FONTPLUS?: FontplusApi }).FONTPLUS;
			if (fp && typeof fp.reload === 'function') {
				cb(fp);
				return;
			}
			if (performance.now() - startedAt > timeoutMs) return; // give up silently
			setTimeout(poll, 60);
		};
		poll();
	}

	onMount(() => {
		if (!browser) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion) return;

		let rafId: number | undefined;

		import('lenis').then(({ default: Lenis }) => {
			lenisInstance = new Lenis({
				duration: 1.2,
				easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
				wheelMultiplier: 1,
				smoothWheel: true
			});
			setLenis(lenisInstance);

			const raf = (time: number) => {
				lenisInstance?.raf(time);
				rafId = requestAnimationFrame(raf);
			};
			rafId = requestAnimationFrame(raf);
		});

		return () => {
			if (rafId !== undefined) cancelAnimationFrame(rafId);
			lenisInstance?.destroy();
		};
	});

	// ── Outgoing: shrink + darken (overlay) + white panel up ──
	onNavigate((navigation) => {
		if (!navigation.from) return;
		if (navigation.from.url.pathname === navigation.to?.url.pathname) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion) return;

		needsEntryAnim = true;
		isHomeNav = navigation.to?.url.pathname === '/';
		lenisInstance?.stop();
		// Hide Header during transition — it slides back in via existing animation when intro.completed = true
		intro.completed = false;

		// Set transform-origin to visible viewport center (in element coords)
		const scrollY = window.scrollY;
		const vhCenter = scrollY + window.innerHeight / 2;
		gsap.set('.page-wrapper', {
			transformOrigin: `50% ${vhCenter}px`
		});

		// Panel color: black for home (hands off to Loader), white otherwise
		gsap.set('.transition-panel', {
			backgroundColor: isHomeNav ? '#121212' : '#ffffff'
		});

		return new Promise<void>((resolve) => {
			const tl = gsap.timeline({
				onComplete: () => {
					if (isHomeNav) {
						// Home nav: keep page-wrapper visible so Loader can run immediately under the panel
						gsap.set('.page-wrapper', {
							scale: 1,
							transformOrigin: 'center center'
						});
					} else {
						// Non-home: prep for fade-in on top of white panel
						gsap.set('.page-wrapper', {
							scale: 1,
							opacity: 0,
							zIndex: 1100,
							transformOrigin: 'center center'
						});
					}
					resolve();
				}
			});

			// Scale: starts immediately
			tl.to(
				'.page-wrapper',
				{
					scale: PAGE_SCALE,
					duration: OUT_DURATION,
					ease: 'power2.inOut'
				},
				0
			);

			// Darken overlay (replaces filter brightness — avoids GPU compositing flash)
			tl.to(
				'.darken-overlay',
				{
					opacity: DARKEN_OPACITY,
					duration: OUT_DURATION * DARKEN_DURATION_RATIO,
					ease: 'power2.inOut'
				},
				OUT_DURATION * DARKEN_DELAY_RATIO
			);

			// White panel slides up — silky Awwwards-style ease, slower
			tl.to(
				'.transition-panel',
				{
					y: '0%',
					duration: PANEL_DURATION,
					ease: 'panelSilk'
				},
				OUT_DURATION * PANEL_DELAY_RATIO
			);
		});
	});

	// ── Incoming: fade in over the white panel (or hand off to Loader on home) ──
	afterNavigate((nav) => {
		// SvelteKit navigates client-side, so FONTPLUS never re-scans the new DOM
		// on its own — re-extract the freshly rendered page so Tazugane is applied.
		// First load (type 'enter') → reload(true): reset + fetch all.
		// Real navigations → reload(false): keep subset, fetch newly seen chars.
		if (browser) {
			whenFontplusReady((fp) => fp.reload(nav.type === 'enter'));
		}

		if (!needsEntryAnim) return;
		needsEntryAnim = false;
		if (!browser) return;

		if (isHomeNav) {
			// Hand off to Home page Loader: instant reset, no fade-in
			// (the Loader has its own dark bg + animation)
			gsap.set('.page-wrapper', { clearProps: 'all' });
			gsap.set('.transition-panel', { y: '100%', clearProps: 'backgroundColor' });
			gsap.set('.darken-overlay', { opacity: 0 });
			isHomeNav = false;
			lenisInstance?.start();
			return;
		}

		gsap.to('.page-wrapper', {
			opacity: 1,
			duration: FADE_IN_DURATION,
			delay: FADE_IN_DELAY,
			ease: 'contentFade',
			onStart: () => {
				// Trigger Header slide-in alongside content fade
				intro.completed = true;
			},
			onComplete: () => {
				gsap.set('.page-wrapper', { clearProps: 'all' });
				gsap.set('.transition-panel', { y: '100%', clearProps: 'backgroundColor' });
				gsap.set('.darken-overlay', { opacity: 0 });
				lenisInstance?.start();
			}
		});
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/favicon.png" />
	<title>TAKUMIISOBE.com</title>
	<!-- FONTPLUS (Tazugane) loader lives in app.html <head>: loads once and
	     survives SPA navigation. Re-applied per navigation via afterNavigate. -->
</svelte:head>

<div class="transition-bg">
	<div class="page-wrapper">
		<Header />
		{@render children()}
		<Footer />
	</div>
</div>

<!-- Global wordmark, pinned bottom-left on PC. Lives OUTSIDE .page-wrapper so
     its position:fixed resolves to the viewport (the wrapper's will-change
     transform would otherwise make it a containing block). -->
<a
	class="corner-logo"
	class:is-revealed={intro.completed}
	class:is-suppressed={isOffice}
	href="/"
	aria-label="Home"
>
	<Wordmark />
</a>

<div class="darken-overlay" aria-hidden="true"></div>
<div class="transition-panel" aria-hidden="true"></div>

<style>
	:global(body) {
		background: black;
	}

	.transition-bg {
		background: black;
		min-height: 100vh;
	}

	/* ── Global corner wordmark (PC, bottom-left) ── */
	.corner-logo {
		position: fixed;
		left: var(--padding);
		bottom: 28px;
		width: 420px;
		max-width: 32vw;
		color: var(--color-text);
		opacity: 0;
		pointer-events: none;
		display: none; /* SP: hidden (Header keeps the top-right logo) */
		z-index: var(--z-header);
		transition: opacity 600ms var(--ease-out);
	}
	.corner-logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}
	.corner-logo.is-revealed {
		opacity: 1;
		pointer-events: auto;
	}
	@media (min-width: 1024px) {
		.corner-logo {
			display: block;
		}
		.corner-logo.is-suppressed {
			display: none;
		}
	}

	.page-wrapper {
		background: var(--color-bg, white);
		min-height: 100vh;
		position: relative;
		will-change: transform, opacity;
	}

	.darken-overlay {
		position: fixed;
		inset: 0;
		background: black;
		opacity: 0;
		z-index: 998;
		pointer-events: none;
		will-change: opacity;
	}

	.transition-panel {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		/* Use the LARGE viewport height so translateY(100%) always clears the
		   collapsed-toolbar height on iOS (prevents a white band at the bottom). */
		height: 100vh;
		height: 100lvh;
		background: white;
		transform: translateY(100%);
		z-index: 1000;
		pointer-events: none;
		will-change: transform;
	}
</style>
