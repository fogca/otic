<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Logo from '$lib/components/Logo.svelte';
	import { typeText } from '$lib/actions/typeText';
	import { imgOpt, imgSrcset, mainVisualImage } from '$lib/js/img';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Frame = { src: string; srcset: string; alt: string; portrait: boolean };

	// Each work contributes up to 2 frames — its main visual, and (if present)
	// the first image in `repeat` — same visuals used elsewhere on the site,
	// no new asset work needed. Image-only: this is a static cycle, not a
	// video player (matches how the home Loader also can't play video).
	// `portrait` (height >= width — square counts too, from microCMS's own
	// image metadata) lets SP use a taller-or-square subset — its slider is
	// now a full-screen 100vw/100dvh backdrop, and a landscape source cropped
	// into that tall a frame reads badly. Strictly-portrait-only left the
	// pool too thin to feel like a real rotation.
	const allFrames: Frame[] = (() => {
		const list: Frame[] = [];
		const push = (img: { url: string; width?: number; height?: number } | undefined, alt: string) => {
			if (!img) return;
			// Quality 85, not the site-wide default 72 — these fill the whole
			// screen (SP: literally 100vw/100dvh) instead of sitting as a
			// thumbnail, so compression artifacts read much more.
			list.push({
				src: imgOpt(img.url, 1200, 85),
				srcset: imgSrcset(img.url, [600, 900, 1200, 1800], 85),
				alt,
				portrait: !!(img.width && img.height && img.height >= img.width)
			});
		};
		for (const w of data.works) {
			push(mainVisualImage(w), w.title);
			push(w.repeat?.find((r) => r.pj_images)?.pj_images, w.title);
		}
		return list;
	})();

	const portraitFrames = allFrames.filter((f) => f.portrait);
	// Fall back to the full set if too few portrait sources exist to cycle
	// through meaningfully — a static/near-static SP slider would be worse
	// than mixing in a landscape crop.
	const spFrames = portraitFrames.length >= 2 ? portraitFrames : allFrames;

	// Always false at init (both SSR and the client's first pass — reading
	// `window` here instead would make the client's initial value disagree
	// with what the server rendered, and that hydration mismatch was
	// actually corrupting the each-block: the DOM stayed on the SSR'd
	// (unfiltered) list even after `frames` recomputed correctly). Corrected
	// in onMount, which only ever runs client-side, after hydration has
	// already settled — a plain reactive update from there works correctly.
	let isMobile = $state(false);
	const frames = $derived(isMobile ? spFrames : allFrames);

	let frameEls = $state<HTMLImageElement[]>([]);

	onMount(() => {
		if (!browser) return;
		// A one-time read would latch whatever isMobile happened to be at
		// mount time and never correct itself again (e.g. rotating a device,
		// or resizing a window across the breakpoint) — listen for the query
		// to actually change instead of just reading it once.
		const mq = window.matchMedia('(max-width: 1023px)');
		const update = () => {
			isMobile = mq.matches;
		};
		update();
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	});

	// Re-runs whenever `frames` changes identity (the onMount correction
	// above, or in principle a breakpoint crossing) — tears down the
	// previous cycle via its cleanup and restarts against the new elements.
	$effect(() => {
		const currentFrames = frames;
		if (!browser) return;
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion || currentFrames.length < 2) return;

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let index = 0;

		import('gsap').then(({ gsap }) => {
			if (cancelled) return;
			const els = frameEls.filter(Boolean);
			if (els.length < 2) return;

			const HOLD = 450; // ms each frame stays fully revealed
			const REVEAL = 0.85; // s wipe duration

			// Bottom-up clip-path wipe — same visual language as the home
			// Loader's own frame reveal, just looping instead of running once.
			gsap.set(els, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1, zIndex: 0 });
			gsap.set(els[0], { clipPath: 'inset(0% 0% 0% 0%)', zIndex: 1 });

			const advance = () => {
				if (cancelled) return;
				const prev = index;
				index = (index + 1) % els.length;
				gsap.set(els[index], { clipPath: 'inset(100% 0% 0% 0%)', scale: 1, zIndex: 2 });
				gsap.to(els[index], {
					clipPath: 'inset(0% 0% 0% 0%)',
					scale: 1.05,
					duration: REVEAL,
					ease: 'power3.out',
					onComplete: () => {
						gsap.set(els[prev], { zIndex: 0 });
						gsap.set(els[index], { zIndex: 1 });
						if (!cancelled) timer = setTimeout(advance, HOLD);
					}
				});
			};

			timer = setTimeout(advance, HOLD);
		});

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
	});
</script>

<svelte:head>
	<title>OTIC</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Teaser">
	<div class="logo" aria-label="OTIC">
		<Logo />
	</div>

	{#if frames.length > 0}
		<div class="slider">
			{#each frames as frame, i (frame.src)}
				<img
					class="frame"
					bind:this={frameEls[i]}
					src={frame.src}
					srcset={frame.srcset}
					sizes="(min-width: 1024px) 900px, 100vw"
					alt={frame.alt}
					loading={i === 0 ? 'eager' : 'lazy'}
					fetchpriority={i === 0 ? 'high' : undefined}
					decoding="async"
				/>
			{/each}
		</div>
	{/if}

	<p class="tagline" lang="en" use:typeText>
		Our office's digital archive will be launching in August.
	</p>
</main>

<style>
	.Teaser {
		width: 100%;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		align-items: center;
		background: var(--color-bg);
		padding: 20px var(--padding) 48px;
	}

	.Teaser .logo {
		position: relative;
		z-index: 1;
		flex: none;
		width: calc(100vw - var(--padding) * 2);
		color: var(--color-text);
	}

	.Teaser .logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	/* PC default (unchanged): a contained box in normal flow. SP gets a
	   completely different, full-bleed treatment below — easier to add that
	   as a max-width override than to reset this back per-property inside
	   a min-width block. */
	.Teaser .slider {
		position: relative;
		z-index: 0;
		width: 100%;
		max-width: 900px;
		aspect-ratio: 16 / 9;
		margin-top: 40px;
		overflow: hidden;
		background: var(--color-bg-gray);
	}

	.Teaser .frame {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		z-index: 0;
		will-change: clip-path, transform;
	}
	/* No-JS / pre-hydration baseline: first frame on top, fully visible;
	   the rest sit behind it at the same position (JS takes over from here). */
	.Teaser .frame:first-child {
		z-index: 1;
	}

	.Teaser .tagline {
		position: relative;
		z-index: 1;
		flex: none;
		margin-top: 32px;
		font-family: var(--font-en);
		font-size: var(--fs-h6);
		font-weight: var(--fw-base);
		line-height: var(--lh-en);
		color: var(--color-text);
		text-align: center;
		letter-spacing: 0.02em;
	}

	.Teaser .tagline :global(.type-cursor) {
		animation: type-blink 1s step-end infinite;
	}

	@keyframes type-blink {
		50% {
			opacity: 0;
		}
	}

	/* SP: slider becomes a full-bleed backdrop (100vw/100dvh, fixed — this is
	   a single-screen page, nothing to scroll), logo + tagline overlaid on
	   top. White + shadow, not the default black, since it now sits over
	   arbitrary photo content instead of the page's own white background. */
	@media (max-width: 1023px) {
		.Teaser {
			padding: 0;
		}

		.Teaser .logo,
		.Teaser .tagline {
			color: #fff;
			text-shadow: 0 1px 8px rgba(0, 0, 0, 0.5);
		}

		.Teaser .logo {
			position: fixed;
			z-index: 2;
			top: 20px;
			left: var(--padding);
			width: calc(100vw - var(--padding) * 2);
		}

		.Teaser .slider {
			position: fixed;
			z-index: 0;
			inset: 0;
			width: 100vw;
			height: 100vh;
			height: 100dvh;
			max-width: none;
			aspect-ratio: auto;
			margin-top: 0;
		}

		.Teaser .tagline {
			position: fixed;
			z-index: 2;
			left: var(--padding);
			right: var(--padding);
			bottom: 24px;
			margin-top: 0;
		}
	}
</style>
