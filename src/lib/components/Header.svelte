<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { intro } from '$lib/state/intro.svelte';
	import Logo from '$lib/components/Logo.svelte';

	const isArchives = $derived(
		page.url.pathname === '/' || page.url.pathname.startsWith('/archives')
	);
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
>
	<nav class="nav">
		<a
			href="/archives"
			class="link"
			class:is-active={isArchives}
			class:is-mute={!isArchives}
			lang="en"
		>
			Archives
		</a>
		<a
			href="/office"
			class="link"
			class:is-active={isOffice}
			class:is-mute={!isOffice}
			lang="en"
		>
			Office
		</a>
	</nav>

	<a href="/" class="logo" aria-label="Home">
		<Logo />
	</a>
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
		mix-blend-mode: difference;
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

	/* ----- Nav (left) ----- */
	.Header .nav {
		display: flex;
		gap: 27px;
	}

	.Header .link {
		font-size: 11px;
		line-height: 1;
		color: var(--white);
		font-weight: 400;
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	.Header .link.is-mute {
		opacity: 0.3;
	}

	.Header .link:hover {
		opacity: 1;
	}

	/* ----- Logo (right) ----- */
	.Header .logo {
		width: 200px;
		color: var(--white);
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
			gap: 40px;
		}

		.Header .link {
			font-size: var(--fs-h5);
		}

		.Header .logo {
			width: 280px;
		}
	}
</style>
