<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	type Props = {
		src: string;
		alt: string;
		loading?: 'lazy' | 'eager';
		// Vertical travel range in % of inner image height (one side).
		// e.g. 8 means the image translates from -8% to +8% across the scroll.
		intensity?: number;
		className?: string;
	};

	let {
		src,
		alt,
		loading = 'lazy',
		intensity = 5,
		className = ''
	}: Props = $props();

	let wrapperEl = $state<HTMLDivElement | null>(null);
	let imgEl = $state<HTMLImageElement | null>(null);

	onMount(() => {
		if (!browser || !wrapperEl || !imgEl) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion) return;

		let ctx: { kill?: () => void } | null = null;
		let cancelled = false;

		Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
			([gsapMod, stMod]) => {
				if (cancelled || !wrapperEl || !imgEl) return;
				const gsap = gsapMod.gsap ?? gsapMod.default;
				const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;
				gsap.registerPlugin(ScrollTrigger);

				const tween = gsap.fromTo(
					imgEl,
					{ yPercent: -intensity },
					{
						yPercent: intensity,
						ease: 'none',
						scrollTrigger: {
							trigger: wrapperEl,
							start: 'top bottom',
							end: 'bottom top',
							scrub: true
						}
					}
				);
				ctx = { kill: () => tween.scrollTrigger?.kill() };
			}
		);

		return () => {
			cancelled = true;
			ctx?.kill?.();
		};
	});
</script>

<div class="parallax-wrap {className}" bind:this={wrapperEl}>
	<img
		bind:this={imgEl}
		{src}
		{alt}
		{loading}
		class="parallax-img"
	/>
</div>

<style>
	.parallax-wrap {
		position: relative;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.parallax-img {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		/* slightly taller than wrapper so translateY has room without exposing edges */
		height: 110%;
		object-fit: cover;
		display: block;
		will-change: transform;
		backface-visibility: hidden;
		transform: translateZ(0);
	}
</style>
