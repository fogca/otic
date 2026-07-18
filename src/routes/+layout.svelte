<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { onNavigate, afterNavigate } from '$app/navigation';
	import gsap from 'gsap';
	import { CustomEase } from 'gsap/CustomEase';
	import { intro } from '$lib/state/intro.svelte';
	import { lang } from '$lib/state/lang.svelte';
	import { footerNear } from '$lib/state/footerNear.svelte';
	import { officeIntro } from '$lib/state/officeIntro.svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import LangSwitchOverlay from '$lib/components/LangSwitchOverlay.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { setLenis } from '$lib/state/lenis';

	// Office's corner-logo starts oversized at the bottom (same left inset,
	// just wider) until the user scrolls at all (officeIntro.pastHero, set
	// by office/+page.svelte), then immediately shrinks down to its normal
	// bottom-left size, same as every other page.
	const isOffice = $derived(page.url.pathname.startsWith('/office'));
	const officeHero = $derived(isOffice && !officeIntro.pastHero);

	// Contact and the Legal pages have a dark (charcoal/black) background —
	// same reasoning as Header's own is-dark: the corner wordmark's default
	// var(--color-text) is black, invisible there. Mirrors Header.svelte's
	// DARK_PAGES list — keep the two in sync.
	const DARK_PAGES = ['/contact', '/legal/privacy', '/legal/imprint', '/legal/company'];
	const isDarkPage = $derived(DARK_PAGES.includes(page.url.pathname));

	// Teaser is a standalone pre-launch placeholder — none of the real
	// site's chrome (nav, footer, lang toggle, corner wordmark) should show;
	// it's meant to reveal nothing about the site underneath.
	const isTeaser = $derived(page.url.pathname === '/teaser');

	// Sync the reactive lang.current from the session (app.html's inline script
	// already set <html data-lang> pre-paint — this just reconciles the store so
	// UI reading lang.current, e.g. the Header's label, matches it). Runs during
	// component init, not onMount, so it's settled before first render.
	if (browser) lang.restore();

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

	// Transition-surface geometry, in raw px and DOCUMENT coordinates.
	// Two iOS 26 floating-tab facts drive this (measured on device via
	// /debug-viewport + user screenshots):
	// 1. No CSS viewport unit reaches the physical screen bottom (physical
	//    812 vs lvh 704, dvh/innerHeight 610-704, safe-area env 0) —
	//    screen.height is the only metric spanning the tab zone.
	// 2. The position:fixed layer is CLIPPED at the layout viewport (ends
	//    above the tab), while the scroll layer paints edge-to-edge — so
	//    the transition surfaces are position:absolute inside the scroll
	//    layer, boxed around the current scrollY each navigation.
	// Desktop (fine pointer) uses innerHeight: exact there, while
	// screen.height (the whole monitor) would only add dead travel.
	const SURFACE_PAD = 150; // coverage beyond the viewport on each side
	function panelMetrics() {
		const coarse = window.matchMedia('(pointer: coarse)').matches;
		const physical = coarse
			? Math.max(window.screen.height, window.innerHeight)
			: window.innerHeight;
		return {
			top: window.scrollY - SURFACE_PAD, // document-coord box top
			height: physical + SURFACE_PAD * 2, // pad above + screen + pad below
			// translateY that parks the box's top edge just below the
			// physical screen bottom (rising starts here, ends at y:0).
			offY: physical + SURFACE_PAD + 20
		};
	}

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

	// One-time cleanup: the service worker used to runtime-cache whole video
	// files from cdn.takumiisobe.com ('cdn-media', CacheFirst — rule now
	// removed in vite.config.ts). Workbox's cleanupOutdatedCaches only clears
	// precache versions, never runtime caches, so devices that already
	// visited keep those multi-MB video blobs on disk forever unless the page
	// deletes the cache explicitly.
	onMount(() => {
		if (!browser || !('caches' in window)) return;
		caches.delete('cdn-media').catch(() => {});
	});

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

	// Flip footerNear.near once the Footer is about to scroll into view, so
	// any position:fixed content (corner wordmark, slug's fixed lead, home's
	// fixed ethos) can fade out before it — otherwise those sit on top of and
	// visually crash into the Footer as it scrolls up underneath them. The
	// Footer itself lives outside {@render children()}, so it's created once
	// and persists across client-side navigation — one observer for the
	// whole session is enough.
	onMount(() => {
		if (!browser) return;
		const footerEl = document.querySelector('.Footer');
		if (!footerEl) return;

		// On a short page (e.g. an archives/[slug] with few gallery images),
		// the Footer already sits inside the 300px pre-emptive margin below at
		// scrollY:0 — isIntersecting is true from the very first callback, with
		// no scrolling at all, which faded out the title/lead/corner-logo
		// immediately on load. Gate on genuine scroll progress too.
		let isIntersecting = false;
		const recompute = () => {
			footerNear.near = isIntersecting && window.scrollY > 0;
		};

		const io = new IntersectionObserver(
			([entry]) => {
				isIntersecting = entry.isIntersecting;
				recompute();
			},
			// Expand the bottom of the effective viewport by 300px so this
			// fires slightly BEFORE the Footer is actually on screen.
			{ rootMargin: '0px 0px 300px 0px' }
		);
		io.observe(footerEl);

		// IntersectionObserver only re-fires when isIntersecting itself
		// flips — on a short page it can stay true through any amount of
		// scrolling (the Footer never leaves the margin), so the callback
		// above never fires again after the first one. Recompute on scroll
		// too, so the "hasn't scrolled yet" suppression correctly lifts the
		// moment the user actually scrolls.
		window.addEventListener('scroll', recompute, { passive: true });

		return () => {
			io.disconnect();
			window.removeEventListener('scroll', recompute);
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

		// Set transform-origin to visible viewport center (in element coords).
		// iOS Safari: window.innerHeight already tracks the CURRENT visible
		// height (shrinks while the bottom toolbar is showing), but
		// window.visualViewport.height is the more reliable, purpose-built API
		// for "what's actually visible right now" — prefer it where available.
		// (This must match the box's own sizing, which uses 100dvh below, not
		// the static 100vh/100lvh a toolbar-state mismatch would otherwise
		// cause the scale-down to pivot around the wrong point and appear to
		// stop short of the true screen bottom.)
		const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
		const scrollY = window.scrollY;
		const vhCenter = scrollY + viewportHeight / 2;
		gsap.set('.page-wrapper', {
			transformOrigin: `50% ${vhCenter}px`
		});

		// Panel color: black for home (hands off to Loader), white otherwise.
		// Geometry is set entirely in PX at navigation time — no viewport
		// units. Measured on-device (iPhone, floating tab bar): physical
		// screen 812, but lvh=704, dvh/innerHeight=610-704, safe-area env=0 —
		// i.e. the ~110px zone behind the floating tab is invisible to every
		// CSS viewport unit, while the page canvas does paint there
		// (viewport-fit=cover). screen.height is the only metric that spans
		// it. Desktop (fine pointer) keeps innerHeight: it's exact there, and
		// screen.height (the monitor) would add dead travel before the edge
		// appears. yPercent is explicitly zeroed: the resets below park the
		// panel via yPercent, and GSAP tracks y and yPercent as SEPARATE
		// channels that add together — without this, every navigation after
		// the first started from yPercent:100 + y:<px> combined and the panel
		// never entered the screen at all.
		const m = panelMetrics();
		const panelColor = isHomeNav ? '#121212' : '#ffffff';
		gsap.set('.transition-panel', {
			display: 'block',
			top: m.top,
			height: m.height,
			y: m.offY,
			yPercent: 0,
			backgroundColor: panelColor
		});
		gsap.set('.darken-overlay', { display: 'block', top: m.top, height: m.height });

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

			// White panel slides up — silky Awwwards-style ease, slower.
			// y in px (from the physical-bottom start set above), not '0%'.
			tl.to(
				'.transition-panel',
				{
					y: 0,
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
			// (the Loader has its own dark bg + animation).
			// Park in PX (same channel the slide animates on) — a '100%'
			// reset would set GSAP's separate yPercent channel, which ADDS to
			// the px y on the next navigation and kept the panel offscreen.
			// display:none while idle keeps them out of the paint tree.
			gsap.set('.page-wrapper', { clearProps: 'all' });
			gsap.set('.transition-panel', {
				display: 'none',
				y: panelMetrics().offY,
				yPercent: 0,
				clearProps: 'backgroundColor'
			});
			gsap.set('.darken-overlay', { display: 'none', opacity: 0 });
			isHomeNav = false;
			lenisInstance?.start();
			return;
		}

		// The outgoing box (top/height) was computed from scrollY at the OLD
		// page — SvelteKit resets scroll to 0 for a normal navigation, so by
		// now that box sits low, document-coordinate-wise, relative to the
		// NEW page's (reset) scroll position. If the user had scrolled down
		// any real amount before navigating, that leaves a gap at the TOP of
		// the new viewport where neither surface reaches — .transition-bg's
		// own black background showed through there for the whole fade-in
		// (briefly, since .page-wrapper starts at opacity:0), read as "the
		// screen flashes black up top, then it's gone." Re-box both to the
		// current scroll position — still fully opaque/covering at this
		// instant, this only moves where that coverage actually sits.
		const m2 = panelMetrics();
		gsap.set(['.transition-panel', '.darken-overlay'], { top: m2.top, height: m2.height });

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
				// Park in PX — see the home branch above for why not '100%'.
				gsap.set('.transition-panel', {
					display: 'none',
					y: panelMetrics().offY,
					yPercent: 0,
					clearProps: 'backgroundColor'
				});
				gsap.set('.darken-overlay', { display: 'none', opacity: 0 });
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
		{@render children()}
		{#if !isTeaser}
			<Footer />
		{/if}
	</div>
	<!-- Transition surfaces live INSIDE the scroll layer (absolute, document
	     coordinates set per-navigation from scrollY), NOT position:fixed:
	     iOS 26 Safari clips the fixed layer at the layout viewport (which
	     ends above the floating tab bar), while in-flow/scroll-layer content
	     paints edge-to-edge to the physical screen bottom — the user-visible
	     proof being that page content shows behind the tab but fixed
	     overlays visibly cut off at the tab's top edge. -->
	<div class="darken-overlay" aria-hidden="true"></div>
	<div class="transition-panel" aria-hidden="true"></div>
</div>

<!-- Header lives OUTSIDE .page-wrapper — the wrapper's `will-change:transform`
     makes it a containing block for ANY position:fixed descendant even at
     rest (transform:none), which was silently breaking Header's fixed
     positioning site-wide (it tracked page-wrapper's scroll position instead
     of staying pinned to the true viewport). Only became visually obvious on
     the Office page once its ScrollTrigger pin made the page much taller,
     but the same drift is present on every page once scrolled far enough.
     Header already hides itself during page transitions via its own
     opacity/transform (intro.completed), so it doesn't need to be inside
     .page-wrapper to participate in the scale-down transition visual.
     Teaser is a standalone pre-launch placeholder — none of this chrome
     should show there. -->
{#if !isTeaser}
	<Header />

	<!-- Global wordmark, PC only, normally bottom-left/small. On Office it
	     starts oversized at the same bottom-left anchor (see .is-hero below)
	     and shrinks to that normal size the instant the user scrolls. Lives
	     OUTSIDE .page-wrapper so its position:fixed resolves to the viewport
	     (the wrapper's will-change transform would otherwise make it a containing
	     block). -->
	<a
		class="corner-logo"
		class:is-revealed={intro.completed && !footerNear.near}
		class:is-hero={officeHero}
		class:is-dark={isDarkPage}
		href="/"
		aria-label="Home"
	>
		<Logo />
	</a>

	<LangSwitchOverlay />
{/if}

<style>
	:global(body) {
		background: black;
	}

	.transition-bg {
		background: black;
		/* 100vh on iOS Safari is pinned to the toolbar-COLLAPSED (large)
		   height, not what's currently visible — 100dvh tracks the real,
		   current viewport so this box's height agrees with the JS
		   (visualViewport-based) transform-origin math above. */
		min-height: 100vh;
		min-height: 100dvh;
		/* Anchor for the absolutely-positioned transition surfaces inside
		   (.darken-overlay / .transition-panel) — its top is the document
		   top, so their JS-set `top` values are plain scrollY offsets. */
		position: relative;
	}

	/* ── Global corner wordmark (PC), normally bottom-left/small. On Office
	   it starts oversized at the bottom (officeHero, driven by
	   officeIntro.pastHero — see office/+page.svelte) and shrinks back to
	   this normal bottom-left size the instant the user scrolls. `left` and
	   `bottom` stay constant across both states (the corner never moves) —
	   only width/max-width change. ── */
	.corner-logo {
		position: fixed;
		left: var(--padding);
		/* viewport-fit=cover lets this extend into the safe area (home
		   indicator / rounded corners) — keep it clear of that. */
		bottom: calc(28px + env(safe-area-inset-bottom, 0px));
		width: 420px;
		max-width: 32vw;
		color: var(--color-text);
		opacity: 0;
		pointer-events: none;
		display: none; /* SP: hidden (Header keeps the top-right logo) */
		z-index: var(--z-header);
		transition:
			opacity 600ms var(--ease-out),
			width 700ms var(--ease-out),
			max-width 700ms var(--ease-out);
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
	/* Contact / Legal pages: dark background — invert to white, same as
	   Header.is-dark. */
	.corner-logo.is-dark {
		color: #fff;
	}
	@media (min-width: 1024px) {
		.corner-logo {
			display: block;
		}
		/* Hero state: 100% of the page's own padded content width, not the
		   raw 100vw — left stays at the same var(--padding) as the resting
		   state, and width subtracts that same padding again on the right,
		   so it reads as a balanced, symmetrically-inset "full width"
		   rather than a literal edge-to-edge maximum.

		   max-width is 100vw here, not `none` — `none` is a keyword, not a
		   length, so it can't interpolate against the resting state's 32vw:
		   the transition instead flips discretely partway through, clamping
		   the still-animating width down to 32vw for a frame (visible as an
		   instant snap) before the width transition catches up and finishes
		   shrinking the last few px — exactly the "snaps small, then a few
		   more px" jank reported when scrolling away from top:0. 100vw is a
		   real length that transitions smoothly against 32vw, and never
		   actually constrains anything here since the calc() above is
		   always < 100vw (padding > 0). */
		.corner-logo.is-hero {
			width: calc(100% - var(--padding) * 2);
			max-width: 100vw;
		}
	}

	.page-wrapper {
		background: var(--color-bg, white);
		/* See .transition-bg above — dvh keeps this in sync with the
		   visualViewport-based transform-origin used for the scale animation. */
		min-height: 100vh;
		min-height: 100dvh;
		position: relative;
		will-change: transform, opacity;
	}

	.darken-overlay {
		/* Absolute in the scroll layer, NOT fixed: iOS 26 clips the fixed
		   layer at the layout viewport (ends above the floating tab), while
		   scroll-layer content paints to the physical screen bottom — the
		   only way this veil can actually cover the whole screen there.
		   top/height are set per-navigation from scrollY + physical screen
		   height (with padding both ways); left/right span the document. */
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 100px; /* placeholder — JS sets the real box every navigation */
		background: black;
		opacity: 0;
		z-index: 998;
		pointer-events: none;
		will-change: opacity;
		/* display:none while idle — keeps it out of Safari's Liquid Glass
		   background sampling and out of the paint tree entirely. The
		   transition timeline flips display on/off around the animation. */
		display: none;
	}

	.transition-panel {
		/* Absolute in the scroll layer for the same iOS 26 fixed-layer-clip
		   reason as .darken-overlay above — the rising sheet can only reach
		   the physical screen bottom from inside the scroll layer. Its box
		   (top/height) is set per-navigation from scrollY + physical screen
		   height; the slide is a px translateY within that box. */
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100px; /* placeholder — JS sets the real box every navigation */
		background: white;
		transform: translateY(100%);
		z-index: 1000;
		pointer-events: none;
		will-change: transform;
		/* display:none while idle — out of Liquid Glass sampling and the
		   paint tree; the timeline flips display around the animation. */
		display: none;
	}
</style>
