<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { stopLenis, startLenis } from '$lib/state/lenis';

	export type Tile = { src: string; srcset: string; alt: string; href: string };

	let { tiles = [] }: { tiles?: Tile[] } = $props();

	onMount(() => {
		if (!browser) return;
		// Single ambient screen: lock page scroll. The right column scrolls
		// internally (manual — no auto-play).
		stopLenis();
		document.documentElement.style.overflowY = 'hidden';
		return () => {
			document.documentElement.style.overflowY = '';
			startLenis();
		};
	});
</script>

<div class="feed-stage">
	<!-- Left: ethos statement (Figma "Log") -->
	<div class="ethos">
		<p class="ethos__eyebrow" lang="en">Our Ethos</p>
		<p class="ethos__line" lang="en">Embodied humanism.</p>
	</div>

	<!-- Right: vertical work feed (manual scroll) -->
	<div class="feed">
		<ul class="feed__track">
			{#each tiles as t (t.href)}
				<li class="feed__item">
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

	/* ── Right: feed column (manual scroll, widened) ── */
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
		padding: 24px 0 32px;
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
