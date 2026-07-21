<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { intro } from '$lib/state/intro.svelte';
	import { lang } from '$lib/state/lang.svelte';
	import Logo from '$lib/components/Logo.svelte';

	// Underline only on the Archives index/list — not on individual project
	// pages (/archives/[slug]).
	const isArchives = $derived(['/archives', '/archives/list'].includes(page.url.pathname));
	const isOffice = $derived(page.url.pathname.startsWith('/office'));
	const isServices = $derived(page.url.pathname.startsWith('/services'));
	// Contact and the Legal pages (Privacy/Imprint/Company) have a dark
	// (charcoal/black) page background — the nav's default var(--color-text)
	// is black, effectively invisible there, so invert to white on these.
	const DARK_PAGES = ['/contact', '/legal/privacy', '/legal/imprint', '/legal/company'];
	const isDark = $derived(DARK_PAGES.includes(page.url.pathname));

	// ── Header visibility settings (adjust freely) ──
	const HIDE_DISTANCE = 500; // px — scroll distance from resume point that triggers hide
	const SCROLL_END_DELAY = 150; // ms — debounce to detect scroll-stop

	let headerShown = $state(false);

	// Sync Header visibility to intro.completed:
	// false → hide (slides up via translateY -100%)
	// true → show (slides down — existing silk animation)
	$effect(() => {
		headerShown = intro.completed;
	});

	onMount(() => {
		if (!browser) return;

		let isScrolling = false;
		let scrollAnchor = 0; // scrollY when scrolling resumed (reference for distance)
		let lastScrollY = window.scrollY; // previous position, to detect direction
		let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

		function onScroll() {
			const currentY = window.scrollY;
			const scrollingUp = currentY < lastScrollY;
			lastScrollY = currentY;

			// Scroll resume (idle → scrolling): re-anchor and show
			if (!isScrolling) {
				isScrolling = true;
				headerShown = true;
				scrollAnchor = currentY;
			}

			if (scrollingUp) {
				// Scrolling back up: always show, regardless of distance —
				// only continuous downward scroll past HIDE_DISTANCE hides it.
				headerShown = true;
			} else if (Math.abs(currentY - scrollAnchor) >= HIDE_DISTANCE) {
				headerShown = false;
			}

			// Re-arm scroll-end detection
			if (scrollEndTimer) clearTimeout(scrollEndTimer);
			scrollEndTimer = setTimeout(() => {
				// Scroll stopped: show, no auto-hide while idle
				isScrolling = false;
				headerShown = true;
			}, SCROLL_END_DELAY);
		}

		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
			if (scrollEndTimer) clearTimeout(scrollEndTimer);
		};
	});
</script>

<header
	class="Header"
	class:is-revealed={intro.completed}
	class:is-shown={headerShown}
	class:is-office={isOffice}
	class:is-dark={isDark}
>
	<nav class="nav">
		<a
			href="/archives"
			class="link"
			class:is-current={isArchives}
			lang="en"
		>
			Archives
		</a>
		<a
			href="/office"
			class="link"
			class:is-current={isOffice}
			lang="en"
		>
			Office
		</a>
		<a
			href="/services"
			class="link"
			class:is-current={isServices}
			lang="en"
		>
			Services
		</a>
		<!-- Language toggle: shows the CURRENT language only; click switches to
		     the other (site-wide bilingual body copy) and fires the confirmation
		     overlay (LangSwitchOverlay). -->
		<button
			type="button"
			class="lang-toggle"
			onclick={() => lang.toggle()}
			aria-label={lang.current === 'en' ? 'Switch to Japanese' : 'Switch to English'}
			lang="en"
		>
			{lang.current === 'en' ? 'EN' : 'JP'}
		</button>
		<!-- Announces the language change to screen readers (the EN/JP label
		     alone doesn't say what happened). -->
		<span class="sr-only" aria-live="polite">
			{lang.current === 'en' ? 'English' : '日本語'}
		</span>
	</nav>

	<div class="head-end">
		<!-- SP keeps the top-right wordmark. On PC it's hidden and the wordmark is
		     pinned bottom-left globally by CornerLogo in the layout. -->
		<a href="/" class="logo" aria-label="Home">
			<Logo />
		</a>
	</div>
</header>

<style>
	/* Awwwards-style smooth easing */
	.Header {
		--ease-silk: cubic-bezier(0.76, 0, 0.24, 1);

		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 25px var(--padding);
		z-index: var(--z-header);
		opacity: 0;
		transform: translateY(-100%);
		transition:
			opacity 600ms var(--ease-out),
			transform 1200ms var(--ease-silk);
	}

	/* After intro: fade in opacity (transform stays at -100% until scroll) */
	.Header.is-revealed {
		opacity: 1;
	}

	/* Show triggered by scroll: slide down */
	.Header.is-revealed.is-shown {
		transform: translateY(0);
	}

	/* Office page: match the page text color (blue) */
	.Header.is-office .link,
	.Header.is-office .logo {
		color: var(--color-text);
	}

	/* Contact / Legal pages: dark (charcoal/black) background — invert the
	   nav to white so it's actually visible against it. */
	.Header.is-dark .link,
	.Header.is-dark .lang-toggle,
	.Header.is-dark .logo {
		color: #fff;
	}

	/* ----- Nav (left): Archives / Office / lang toggle ----- */
	.Header .nav {
		display: flex;
		align-items: center;
		/* SP: tight 10px rhythm across all three items */
		gap: 10px;
	}

	.Header .link {
		position: relative;
		font-size: 11px;
		line-height: 1;
		color: var(--color-text);
		font-weight: var(--fw-base);
		/* Grow the tap target to ~35px tall without moving the text — the
		   negative margin cancels the padding's layout effect (baseline stays
		   put), so this is a hit-area-only change. WCAG 2.5.8. */
		padding: 12px 4px;
		margin: -12px -4px;
		/* Mobile's default tap-highlight flash is clipped to the element's own
		   border-box, so this also rounds that flash — not just a resting-state
		   style (there's no visible background/border normally). */
		border-radius: 6px;
		transition: opacity var(--duration-fast) var(--ease-default);
		/* base.css sets font-feature-settings:"palt" directly on `a` (a bare
		   type-selector rule applied straight to the element), which
		   suppresses even the browser's default "liga" ligature — kills the
		   ffi in "Office". Override with the same mechanism, keeping "palt"
		   and adding "liga" (same technique as .OfficePage in
		   office/+page.svelte). */
		font-feature-settings:
			'palt' 1,
			'liga' 1;
	}

	/* Current page: dimmed instead of the dot marker */
	.Header .link.is-current {
		opacity: 0.5;
	}

	.Header .link:hover {
		opacity: 1;
	}

	/* ----- Right cluster (lang toggle + SP logo) ----- */
	.head-end {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.lang-toggle {
		font-size: 11px;
		line-height: 1;
		color: var(--color-text);
		font-weight: var(--fw-base);
		opacity: 0.7;
		/* Same hit-area-only enlargement as .link above (WCAG 2.5.8). */
		padding: 12px 4px;
		margin: -12px -4px;
		/* Rounds the mobile tap-highlight flash, same reasoning as .link. */
		border-radius: 6px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	/* Visually hidden, but announced by screen readers. */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
	.lang-toggle:hover {
		opacity: 1;
	}

	/* ----- Logo (right on desktop layout order; SP flips this — see below) ----- */
	.Header .logo {
		/* Fluid, not a flat 200px: at a fixed px the logo reads noticeably
		   bigger relative to the screen on an iPhone mini (~375px) than a
		   Pro Max (~430px) — scale with viewport width instead, clamped so
		   it neither shrinks too far on the smallest phones nor keeps
		   growing past a comfortable size on larger SP/tablet widths. */
		width: clamp(160px, 50vw, 220px);
		color: var(--color-text);
	}

	.Header .logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	/* SP: logo left, nav right — order flips visual position without
	   touching DOM order (nav stays first for tab/reading order). */
	@media (max-width: 1023px) {
		.Header .head-end {
			order: -1;
		}
	}

	@media (min-width: 1024px) {
		.Header {
			padding: 28px var(--padding);
		}

		.Header .nav {
			gap: 30px;
		}

		.Header .link {
			font-size: var(--fs-h6);
		}

		.lang-toggle {
			font-size: var(--fs-h6);
		}

		/* PC: hide the top-right wordmark site-wide — the wordmark is pinned
		   bottom-left globally by CornerLogo in the layout. */
		.Header .logo {
			display: none;
		}
	}
</style>
