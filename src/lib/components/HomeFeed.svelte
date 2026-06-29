<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { stopLenis, startLenis } from '$lib/state/lenis';

	export type Tile = { src: string; srcset: string; alt: string; href: string };

	let { tiles = [] }: { tiles?: Tile[] } = $props();

	let stageEl: HTMLElement | undefined = $state();
	let feedEl: HTMLElement | undefined = $state();
	let trackEl: HTMLElement | undefined = $state();
	let tileEls = $state<HTMLElement[]>([]);

	onMount(() => {
		if (!browser) return;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// Single ambient screen: lock the page; the thumbnail column scrolls
		// internally (smooth, via its own Lenis).
		stopLenis();
		document.documentElement.style.overflowY = 'hidden';

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let lenis: any = null;
		let rafId = 0;
		let snapTimer: ReturnType<typeof setTimeout> | undefined;
		let cancelled = false;

		// Snap the nearest project tile to the vertical centre once scrolling
		// settles. (lenis/snap assumes window scroll, so it can't be used on a
		// custom wrapper — we compute the centre target ourselves.)
		const snapToNearest = () => {
			if (!lenis || !feedEl || tileEls.length === 0) return;
			const feedTop = feedEl.getBoundingClientRect().top;
			const viewCenter = feedEl.clientHeight / 2;
			let target: number | null = null;
			let best = Infinity;
			for (const tile of tileEls) {
				if (!tile) continue;
				const r = tile.getBoundingClientRect();
				const centerInScroll = r.top - feedTop + lenis.scroll + r.height / 2;
				const candidate = centerInScroll - viewCenter;
				const dist = Math.abs(candidate - lenis.scroll);
				if (dist < best) {
					best = dist;
					target = candidate;
				}
			}
			if (target != null && Math.abs(target - lenis.scroll) > 4) {
				lenis.scrollTo(target, { duration: 0.6 });
			}
		};

		if (!reduced && feedEl && trackEl && stageEl) {
			import('lenis').then(({ default: Lenis }) => {
				if (cancelled) return;
				lenis = new Lenis({
					wrapper: feedEl,
					content: trackEl,
					// Listen for wheel/touch on the whole stage so scrolling
					// anywhere drives the thumbnail column.
					eventsTarget: stageEl,
					orientation: 'vertical',
					gestureOrientation: 'vertical',
					smoothWheel: true,
					duration: 1.1
				});
				// Debounce: snap to the nearest tile centre after scrolling stops.
				lenis.on('scroll', () => {
					clearTimeout(snapTimer);
					snapTimer = setTimeout(snapToNearest, 130);
				});
				const raf = (time: number) => {
					lenis?.raf(time);
					rafId = requestAnimationFrame(raf);
				};
				rafId = requestAnimationFrame(raf);
			});
		}

		return () => {
			cancelled = true;
			clearTimeout(snapTimer);
			if (rafId) cancelAnimationFrame(rafId);
			lenis?.destroy();
			document.documentElement.style.overflowY = '';
			startLenis();
		};
	});
</script>

<div class="feed-stage" bind:this={stageEl}>
	<!-- Left: ethos statement (Figma "Log") -->
	<div class="ethos">
		<p class="ethos__eyebrow" lang="en">Our Ethos</p>
		<p class="ethos__line" lang="en">Embodied humanism.</p>
	</div>

	<!-- Right: vertical work feed — smooth (Lenis) + centre-snap per project -->
	<div class="feed" bind:this={feedEl}>
		<ul class="feed__track" bind:this={trackEl}>
			{#each tiles as t, i (t.href)}
				<li class="feed__item" bind:this={tileEls[i]}>
					<a class="feed__tile" href={t.href} aria-label={t.alt}>
						<img src={t.src} srcset={t.srcset} sizes="36vw" alt={t.alt} loading="lazy" />
					</a>
				</li>
			{/each}
		</ul>
	</div>
</div>

<style>
	.feed-stage {
		position: relative;
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
		background: var(--color-bg);
	}

	/* ── Left: ethos caption ── */
	.ethos {
		position: absolute;
		left: var(--padding);
		top: 43vh;
		z-index: 2;
	}
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

	/* ── Right: feed column (Lenis-driven smooth scroll + centre snap) ── */
	.feed {
		position: absolute;
		top: 0;
		bottom: 0;
		right: 1.3vw;
		width: min(520px, 36vw);
		overflow-y: auto;
		overflow-x: hidden;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.feed::-webkit-scrollbar {
		display: none;
	}
	.feed__track {
		list-style: none;
		margin: 0;
		/* Top/bottom room so the first/last tile can reach the vertical centre. */
		padding-block: calc(50dvh - min(260px, 18vw));
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
	.feed__tile img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* PC-only experience */
	@media (max-width: 1023px) {
		.feed-stage {
			display: none;
		}
	}
</style>
