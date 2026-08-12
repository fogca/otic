<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { goto, afterNavigate } from '$app/navigation';
	import { intro } from '$lib/state/intro.svelte';
	import { lang } from '$lib/state/lang.svelte';
	import Logo from '$lib/components/Logo.svelte';

	const realPath = $derived(page.url.pathname);

	// The path the user just clicked, held until that navigation lands. The
	// capsule and .is-active follow THIS rather than the real pathname, so
	// the highlight visibly slides to the clicked target before the page
	// transition starts covering it — same sequence as ArchivesTitleBar's
	// Image/Text switch.
	let pendingPath: string | null = $state(null);
	const navPath = $derived(pendingPath ?? realPath);

	// Underline only on the Archives index/list — not on individual project
	// pages (/archives/[slug]).
	const isHome = $derived(navPath === '/');
	const isArchives = $derived(['/archives', '/archives/list'].includes(navPath));
	const isOffice = $derived(navPath.startsWith('/office'));
	const isContact = $derived(navPath === '/contact');

	// Theming stays on the REAL path — flipping the header's colours before
	// the page underneath has actually changed would read as a glitch.
	const isOfficeTheme = $derived(realPath.startsWith('/office'));
	// The Legal pages (Privacy/Imprint/Company) have a dark (charcoal/black)
	// page background — the nav's default var(--color-text) is black,
	// effectively invisible there, so invert to white on these. Contact
	// itself is white now, same as every other page — no longer in this list.
	const DARK_PAGES = ['/legal/privacy', '/legal/imprint', '/legal/company'];
	const isDark = $derived(DARK_PAGES.includes(realPath));

	// Matches --duration-fast (200ms), the highlight's own transition length,
	// plus a small margin so it's visibly settled before navigating.
	const SLIDE_BEFORE_NAV = 250; // ms

	function handleNavClick(event: MouseEvent, href: string) {
		// Modified/non-primary clicks (open in new tab, etc.) keep the
		// browser's normal link behavior — only a plain left click runs the
		// slide-then-navigate sequence.
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}
		event.preventDefault();
		// Already here — nothing to slide to, and re-navigating would replay
		// the page transition for no reason.
		if (href === realPath) return;
		pendingPath = href;
		setTimeout(() => goto(href), SLIDE_BEFORE_NAV);
	}

	// Hand control back to the real pathname once the navigation lands (by
	// then they agree, so the capsule doesn't move again).
	afterNavigate(() => {
		pendingPath = null;
	});

	// SP-only segmented-pill nav (see .switch-highlight below, same design
	// language as ArchivesTitleBar's view switch) — a sliding black capsule
	// tracks whichever of Home/Archives/Office/Contact is current. The lang
	// toggle sits in the same pill but never becomes "active" itself (it's
	// a persistent setting, not a page). Hidden (opacity:0) when none of
	// the four match rather than left pointing at a stale one.
	let homeEl: HTMLElement | null = $state(null);
	let archivesEl: HTMLElement | null = $state(null);
	let officeEl: HTMLElement | null = $state(null);
	let contactEl: HTMLElement | null = $state(null);
	let highlightEl: HTMLElement | null = $state(null);
	let highlightReady = $state(false);

	$effect(() => {
		const target = isHome
			? homeEl
			: isArchives
				? archivesEl
				: isOffice
					? officeEl
					: isContact
						? contactEl
						: null;
		if (!highlightEl) return;
		if (!target) {
			highlightEl.style.opacity = '0';
			return;
		}
		highlightEl.style.opacity = '1';
		highlightEl.style.width = `${target.offsetWidth}px`;
		highlightEl.style.transform = `translateX(${target.offsetLeft}px)`;
		if (!highlightReady) {
			requestAnimationFrame(() => {
				highlightReady = true;
			});
		}
	});

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
	class:is-office={isOfficeTheme}
	class:is-dark={isDark}
>
	<nav class="nav">
		<!-- SP-only sliding highlight (see .switch-highlight) — inert on PC,
		     where .switch-option falls back to the plain dimmed-on-current
		     look instead. -->
		<div class="switch-highlight" class:is-ready={highlightReady} bind:this={highlightEl}></div>
		<!-- Left-aligned page-link group (SP: justify-content:space-between
		     on .nav pushes this left and the lang toggle to the right edge;
		     PC just flows left-to-right as before — see the media blocks
		     below). Plain (non-positioned) wrapper — offsetLeft/offsetWidth
		     used to place .switch-highlight above stay relative to .nav. -->
		<div class="nav-links">
			<a
				href="/"
				class="switch-option"
				class:is-active={isHome}
				lang="en"
				bind:this={homeEl}
				onclick={(e) => handleNavClick(e, '/')}
			>
				Home
			</a>
			<a
				href="/archives"
				class="switch-option"
				class:is-active={isArchives}
				lang="en"
				bind:this={archivesEl}
				onclick={(e) => handleNavClick(e, '/archives')}
			>
				Archives
			</a>
			<a
				href="/office"
				class="switch-option"
				class:is-active={isOffice}
				lang="en"
				bind:this={officeEl}
				onclick={(e) => handleNavClick(e, '/office')}
			>
				Office
			</a>
			<a
				href="/contact"
				class="switch-option"
				class:is-active={isContact}
				lang="en"
				bind:this={contactEl}
				onclick={(e) => handleNavClick(e, '/contact')}
			>
				Contact
			</a>
		</div>
		<!-- Language toggle: shows the CURRENT language only; click switches to
		     the other (site-wide bilingual body copy) and fires the confirmation
		     overlay (LangSwitchOverlay). Sits in the same pill but never gets
		     .is-active — it's a persistent setting, not a page. -->
		<button
			type="button"
			class="switch-option lang-toggle"
			onclick={() => lang.toggle()}
			aria-label={lang.current === 'en' ? 'Switch to Japanese' : 'Switch to English'}
			lang="en"
		>
			{lang.current === 'en' ? 'EN' : 'JA'}
		</button>
		<!-- Announces the language change to screen readers (the EN/JA label
		     alone doesn't say what happened). -->
		<span class="sr-only" aria-live="polite">
			{lang.current === 'en' ? 'English' : '日本語'}
		</span>
	</nav>

	<div class="head-end">
		<!-- Top-right wordmark, shown at every breakpoint. -->
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
	.Header.is-office .switch-option,
	.Header.is-office .logo {
		color: var(--color-text);
	}

	/* Contact / Legal pages: dark (charcoal/black) background — invert the
	   nav to white so it's actually visible against it. */
	.Header.is-dark .switch-option,
	.Header.is-dark .logo {
		color: #fff;
	}

	/* ----- Nav (left): Home / Archives / Office / Contact / lang toggle ----- */
	.Header .nav {
		position: relative;
		display: flex;
		align-items: center;
		/* SP: tight 10px rhythm between .nav-links and the lang toggle
		   (moot once space-between spreads them further apart — see the
		   max-width:1023px block). PC keeps this as its real gap (below). */
		gap: 10px;
	}

	/* Home/Archives/Office/Contact as their own group — SP left-aligns this
	   as a unit against the lang toggle pinned to .nav's other end (see the
	   max-width:1023px block, which zeroes the gap there — .switch-option's
	   own padding already spaces the labels out); PC just flows it inline
	   like before, own 30px gap set in the min-width:1024px block. */
	.Header .nav-links {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	/* Shared by every segment (the three page links + the lang-toggle
	   button) — same tap-target/hit-area treatment as before, just
	   consolidated onto one class instead of separate .link/.lang-toggle
	   rules. PC keeps the plain dimmed-on-current look (below); SP repaints
	   this into a segmented pill with a sliding highlight (see the
	   max-width:1023px block) — same design language as
	   ArchivesTitleBar.svelte's view switch. */
	.Header .switch-option {
		position: relative;
		z-index: 1;
		display: inline-block;
		font-size: 11px;
		line-height: 1;
		color: var(--color-text);
		font-weight: var(--fw-base);
		background: none;
		border: none;
		cursor: pointer;
		text-decoration: none;
		opacity: 1;
		/* Grow the tap target to ~35px tall without moving the text — the
		   negative margin cancels the padding's layout effect (baseline stays
		   put), so this is a hit-area-only change. WCAG 2.5.8. */
		padding: 12px 4px;
		margin: -12px -4px;
		/* Mobile's default tap-highlight flash is clipped to the element's own
		   border-box, so this also rounds that flash — not just a resting-state
		   style (there's no visible background/border normally). */
		border-radius: 6px;
		transition:
			opacity var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default);
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

	/* PC default: current page dimmed (no pill/highlight there — see the
	   min-width:1024px block, which doesn't touch opacity/color). */
	.Header .switch-option.is-active {
		opacity: 0.5;
	}

	.Header .switch-option:hover {
		opacity: 1;
	}

	/* SP-only sliding capsule — positioned/sized in Header.svelte's script
	   via offsetLeft/offsetWidth of whichever link is current. Hidden
	   (opacity via inline style) when none of the three match. */
	.switch-highlight {
		position: absolute;
		display: none;
		border-radius: 999px;
		background: var(--color-text);
		opacity: 0;
	}
	.switch-highlight.is-ready {
		transition:
			transform var(--duration-fast) var(--ease-default),
			width var(--duration-fast) var(--ease-default),
			opacity var(--duration-fast) var(--ease-default);
	}

	/* ----- Right cluster (SP logo) ----- */
	.head-end {
		display: flex;
		align-items: center;
		gap: 24px;
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

	/* ----- Logo (right on desktop layout order; SP flips this — see below) ----- */
	.Header .logo {
		/* Fluid, not a flat 200px: at a fixed px the logo reads noticeably
		   bigger relative to the screen on an iPhone mini (~375px) than a
		   Pro Max (~430px) — scale with viewport width instead, clamped so
		   it neither shrinks too far on the smallest phones nor keeps
		   growing past a comfortable size on larger SP/tablet widths. */
		width: clamp(160px, 50vw, 300px);
		color: var(--color-text);
	}

	.Header .logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	/* SP: logo stacked above the nav row (was side-by-side) — order still
	   flips visual position without touching DOM order (nav stays first
	   for tab/reading order). Logo runs full-width within the Header's own
	   padding; the nav row below it keeps its own item gap (10px, set
	   above) and is centered as a whole via justify-content. */
	@media (max-width: 1023px) {
		.Header {
			flex-direction: column;
			align-items: stretch;
			justify-content: flex-start;
			gap: 12px;
		}

		/* Scroll-hide: rise by a flat 50px (not the whole header's -100%,
		   which would take the nav pill with it) — the pill stays visible,
		   just the logo above it tucks out of view.

		   Scoped to .is-revealed so it only covers the post-intro scroll
		   state. Without that it also caught the intro, capping the OP's
		   hide at 50px of a ~117px-tall header — the nav stayed on screen
		   through the opening. The intro now falls through to the base
		   rule's translateY(-100%), which clears the header whatever its
		   height (a fixed -95px would leave ~22px showing at today's). */
		.Header.is-revealed:not(.is-shown) {
			transform: translateY(-50px);
		}

		.Header .head-end {
			order: -1;
			width: 100%;
		}

		.Header .logo {
			width: 100%;
		}

		/* Segmented pill (see ArchivesTitleBar.svelte's .view-switch — same
		   design reused here): light-gray rounded track spanning the full
		   width, page links left-aligned as their own group (.nav-links,
		   moderate 10px gap) and the lang toggle pinned to the right edge. */
		/* Liquid-glass: a translucent (not flat opaque) tint so
		   backdrop-filter's blur actually shows whatever scrolls underneath
		   through it, plus a soft inner highlight/shadow pair standing in
		   for glass's top-edge sheen + depth. */
		.Header .nav {
			justify-content: space-between;
			padding: 6px 12px 5px;
			border-radius: 999px;
			background: rgba(241, 241, 241, 0.55);
			backdrop-filter: blur(20px) saturate(180%);
			-webkit-backdrop-filter: blur(20px) saturate(180%);
			box-shadow:
				inset 0 1px 0 rgba(255, 255, 255, 0.6),
				inset 0 0 0 1px rgba(255, 255, 255, 0.4),
				0 6px 16px rgba(0, 0, 0, 0.05);
		}

		.Header .nav-links {
			gap: 0;
		}

		/* Dark pages (Contact/Legal — see .is-dark above): the light tint
		   would disappear against a dark page background, so swap it for a
		   translucent white one instead — same glass treatment, adjusted
		   opacities for a dark surface underneath. The black sliding
		   highlight (var(--color-text), unaffected by .is-dark) still reads
		   fine against either. */
		.Header.is-dark .nav {
			background: rgba(255, 255, 255, 0.12);
			box-shadow:
				inset 0 1px 0 rgba(255, 255, 255, 0.25),
				inset 0 0 0 1px rgba(255, 255, 255, 0.15),
				0 6px 16px rgba(0, 0, 0, 0.2);
		}

		/* Vertical inset tracks .nav's own padding (6px top / 5px bottom).
		   top+bottom rather than top+height so it stays correct without a
		   calc if that padding is retuned again. Horizontal needs nothing:
		   the script positions this from the target's offsetLeft, which is
		   measured from the same padding-box origin as this element's
		   left:0, so .nav's side padding is already accounted for. */
		.switch-highlight {
			display: block;
			top: 6px;
			bottom: 5px;
			left: 0;
		}

		.Header .switch-option {
			padding: 5px 10px;
			margin: 0;
			opacity: 0.5;
			font-weight: 420;
			font-variation-settings: 'wght' 420;
		}

		/* White text on the black highlight capsule — correct as-is on both
		   light and dark pages (.Header.is-dark .switch-option's own
		   white-text override, further up, already agrees with this one). */
		.Header .switch-option.is-active {
			color: #fff;
			opacity: 1;
		}

		.Header .nav:hover .switch-option:not(.is-active) {
			opacity: 0.8;
		}
	}

	@media (min-width: 1024px) {
		.Header {
			padding: 28px var(--padding);
		}

		.Header .nav {
			gap: 30px;
		}

		.Header .nav-links {
			gap: 30px;
		}

		.Header .switch-option {
			font-size: var(--fs-h6);
		}
	}
</style>
