<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { getLenis } from '$lib/state/lenis';

	export type Tile = {
		src: string;
		srcset: string;
		alt: string;
		href: string;
		isVideo: boolean;
	};

	let { tiles = [] }: { tiles?: Tile[] } = $props();

	let ethosEl: HTMLElement | undefined = $state();
	let feedEl: HTMLElement | undefined = $state();
	let tileEls = $state<HTMLElement[]>([]);

	// Ethos is pinned bottom... no — centred-left while the thumbnails scroll.
	// .page-wrapper's transform breaks position:fixed for descendants, so we
	// portal it to <body> (same trick as the slug lead).
	const ETHOS_FIXED: Record<string, string> = {
		position: 'fixed',
		left: 'var(--padding)',
		top: '50%',
		transform: 'translateY(-50%)',
		zIndex: '4',
		pointerEvents: 'none',
		transition: 'opacity 0.4s var(--ease-default)'
	};

	function ethosPortal(node: HTMLElement) {
		if (!browser) return;
		const mq = window.matchMedia('(min-width: 1024px)');
		const anchor = document.createComment('ethos');
		let out = false;
		const sync = () => {
			if (mq.matches && !out) {
				node.replaceWith(anchor);
				document.body.appendChild(node);
				Object.assign(node.style, ETHOS_FIXED);
				out = true;
			} else if (!mq.matches && out) {
				node.removeAttribute('style');
				anchor.replaceWith(node);
				out = false;
			}
		};
		sync();
		mq.addEventListener('change', sync);
		return {
			destroy() {
				mq.removeEventListener('change', sync);
				if (out) node.remove();
			}
		};
	}

	onMount(() => {
		if (!browser) return;
		if (!window.matchMedia('(min-width: 1024px)').matches) return; // PC only
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let lenis: any = null;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let snap: any = null;
		let cancelled = false;
		let pollId = 0;

		// Fade the fixed ethos out once the thumbnails have scrolled past, so it
		// doesn't overlap the sections below.
		const onScroll = () => {
			if (!ethosEl || !feedEl) return;
			const heroEnd = feedEl.offsetTop + feedEl.offsetHeight - window.innerHeight * 0.6;
			const y = lenis ? lenis.scroll : window.scrollY;
			ethosEl.style.opacity = y > heroEnd ? '0' : '1';
		};

		const attach = async () => {
			if (cancelled) return;
			lenis = getLenis();
			if (!lenis) {
				pollId = window.setTimeout(attach, 80); // wait for layout to create it
				return;
			}
			lenis.on('scroll', onScroll);
			onScroll();
			if (!reduced) {
				const { default: Snap } = await import('lenis/snap');
				if (cancelled) return;
				// Snap each project tile to the viewport centre (proximity: the
				// sections below still scroll freely).
				snap = new Snap(lenis, { type: 'proximity', duration: 0.6 });
				snap.addElements([...tileEls].filter(Boolean), { align: ['center'] });
			}
		};
		attach();

		return () => {
			cancelled = true;
			if (pollId) clearTimeout(pollId);
			snap?.destroy();
			lenis?.off?.('scroll', onScroll);
		};
	});
</script>

<section class="home-hero">
	<!-- Left: ethos statement (portaled to <body>, fixed centre-left on PC) -->
	<div class="ethos" bind:this={ethosEl} use:ethosPortal>
		<p class="ethos__eyebrow" lang="en">Our Ethos</p>
		<p class="ethos__line" lang="en">Embodied humanism.</p>
	</div>

	<!-- Right: vertical work feed (5 projects) — page scroll, centre-snap -->
	<ul class="feed" bind:this={feedEl}>
		{#each tiles as t, i (t.href)}
			<li class="feed__item" bind:this={tileEls[i]}>
				<a class="feed__tile" href={t.href} aria-label={t.alt}>
					{#if t.isVideo}
						<video src={t.src} autoplay loop muted playsinline preload="metadata"></video>
					{:else}
						<img
							src={t.src}
							srcset={t.srcset}
							sizes="36vw"
							alt={t.alt}
							loading={i < 2 ? 'eager' : 'lazy'}
						/>
					{/if}
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.home-hero {
		position: relative;
		width: 100%;
	}

	/* ── Ethos (centre-left, fixed via portal on PC) ── */
	.ethos__eyebrow {
		margin: 0 0 10px;
		font-size: var(--fs-h6);
		font-weight: var(--fw-medium);
	}
	.ethos__line {
		margin: 0;
		font-size: var(--fs-h4); /* 20px PC */
		line-height: 1.3;
	}

	/* ── Feed: right-aligned column, scrolls with the page ── */
	.feed {
		list-style: none;
		margin: 0;
		/* Room so the first/last tile can reach the viewport centre when snapping. */
		padding-block: calc(50dvh - min(260px, 18vw));
		width: min(520px, 36vw);
		margin-left: auto;
		margin-right: 1.3vw;
		display: flex;
		flex-direction: column;
		gap: 2vh;
	}
	.feed__item {
		display: block;
	}
	.feed__tile {
		display: block;
		width: 100%;
		aspect-ratio: 1 / 1;
		overflow: hidden;
		background: var(--color-bg-gray);
	}
	.feed__tile img,
	.feed__tile video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* ── SP: simple stacked feed (ethos on top, full-bleed-ish tiles) ── */
	@media (max-width: 1023px) {
		.ethos {
			padding: 88px var(--padding) 0;
		}
		.feed {
			width: 90%;
			margin-inline: auto;
			padding-block: 40px;
		}
	}
</style>
