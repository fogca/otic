<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { intro } from '$lib/state/intro.svelte';
	import { lang } from '$lib/state/lang.svelte';
	// Reverted to the "Office / TAKUMIISOBE.com" wordmark (Wordmark.svelte
	// stays available if we swap back later).
	import Logo from '$lib/components/Logo.svelte';

	// Underline only on the Archives index/list — not on individual project
	// pages (/archives/[slug]).
	const isArchives = $derived(['/archives', '/archives/list'].includes(page.url.pathname));
	const isOffice = $derived(page.url.pathname.startsWith('/office'));

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
		let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

		function onScroll() {
			// Scroll resume (idle → scrolling): re-anchor and show
			if (!isScrolling) {
				isScrolling = true;
				headerShown = true;
				scrollAnchor = window.scrollY;
			}
			// Hide once scrolled HIDE_DISTANCE from anchor
			if (Math.abs(window.scrollY - scrollAnchor) >= HIDE_DISTANCE) {
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
		align-items: center;
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
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	/* Current page: 3px dot to the left of the text (・Office) */
	.Header .link.is-current::before {
		content: '';
		position: absolute;
		right: 100%;
		top: 50%;
		transform: translateY(-50%);
		margin-right: 3px;
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: currentColor;
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
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	.lang-toggle:hover {
		opacity: 1;
	}

	/* ----- Logo (right) ----- */
	.Header .logo {
		width: 200px;
		color: var(--color-text);
	}

	.Header .logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	@media (min-width: 1024px) {
		.Header {
			padding: 28px var(--padding);
		}

		.Header .nav {
			gap: 30px;
		}

		.Header .link {
			font-size: var(--fs-h5);
		}

		.lang-toggle {
			font-size: var(--fs-h5);
		}

		/* PC: hide the top-right wordmark site-wide — the wordmark is pinned
		   bottom-left globally by CornerLogo in the layout. */
		.Header .logo {
			display: none;
		}
	}
</style>
