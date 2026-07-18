<script lang="ts">
	import { browser } from '$app/environment';
	import Logo from '$lib/components/Logo.svelte';
	import { typeText } from '$lib/actions/typeText';
	import { imgOpt, imgSrcset } from '$lib/js/img';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Frame = { src: string; srcset: string; alt: string; isVideo: boolean };
	type VisualSource = { pj_images?: { url: string }; pj_videos?: string } | undefined;

	// Two full laps rather than each work's 2 frames back to back: first lap
	// is every work's main visual, second lap is every work's second frame
	// (repeat) — so a "round" of the whole catalogue completes before any
	// work repeats. Both visuals reused from elsewhere on the site, no new
	// asset work needed — and now video-eligible (previously image-only),
	// so a work whose main/repeat is video-only is no longer skipped.
	const frames: Frame[] = (() => {
		const list: Frame[] = [];
		const push = (source: VisualSource, alt: string) => {
			if (!source) return;
			const video = source.pj_videos?.trim();
			if (video) {
				list.push({ src: video, srcset: '', alt, isVideo: true });
				return;
			}
			const img = source.pj_images;
			if (!img?.url) return;
			// Quality 85, not the site-wide default 72 — these render large
			// (PC: 900px wide; SP: up to 70vw/60vh) instead of sitting as a
			// thumbnail, so compression artifacts read much more.
			list.push({
				src: imgOpt(img.url, 1200, 85),
				srcset: imgSrcset(img.url, [600, 900, 1200, 1800], 85),
				alt,
				isVideo: false
			});
		};
		for (const w of data.works) {
			push(w.main_visual, w.title);
		}
		for (const w of data.works) {
			push(
				w.repeat?.find((r) => r.pj_images || r.pj_videos),
				w.title
			);
		}
		return list;
	})();

	let frameEls = $state<(HTMLImageElement | HTMLVideoElement)[]>([]);

	// PC: stacked-frame clip-path wipe (unchanged). CSS hides the whole
	// .slider on SP, but this loop still runs regardless of viewport — it
	// costs nothing while hidden, and running it unconditionally means
	// there's no JS viewport branching (and so no risk of the SSR/client
	// mismatch that caused an earlier bug — see the SP effect below, which
	// keeps this same "always run, let CSS decide what's visible" shape).
	$effect(() => {
		if (!browser) return;
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion || frames.length < 2) return;

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | undefined;
		let index = 0;
		let z = 1;

		import('gsap').then(({ gsap }) => {
			if (cancelled) return;
			const els = frameEls.filter(Boolean);
			if (els.length < 2) return;

			// Same reveal duration + stagger as the home Loader
			// (Loader.svelte's REVEAL_DURATION/REVEAL_STAGGER) so this loop
			// shares its exact speed feel: each next frame starts while the
			// current one is still mid-wipe, not after it finishes — that
			// overlap is what makes the Loader read as fast.
			const DURATION = 1.2; // s wipe duration
			const STAGGER = 0.35; // s of overlap with the next frame
			const INTERVAL = (DURATION - STAGGER) * 1000; // ms between frame starts

			// Bottom-up clip-path wipe — same visual language as the home
			// Loader's own frame reveal, just looping instead of running once.
			gsap.set(els, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1, zIndex: 0 });
			gsap.set(els[0], { clipPath: 'inset(0% 0% 0% 0%)', zIndex: z });
			if (els[0] instanceof HTMLVideoElement) els[0].play().catch(() => {});

			// Each new frame gets a strictly higher z-index, so it always
			// wipes in over everything before it — no separate step to
			// demote older frames needed once overlap is in play. Video
			// frames aren't given the `autoplay` attribute: every stacked
			// frame is simultaneously in the DOM here (unlike a scrolling
			// gallery), so autoplaying all of them at once would contend for
			// the same limited hardware decoder pool that bit the archive
			// gallery (see lazyVideo.ts) — only the current turn's video
			// plays, explicitly, and the one it replaces is paused.
			const advance = () => {
				if (cancelled) return;
				const prevEl = els[index];
				index = (index + 1) % els.length;
				const nextEl = els[index];
				z++;
				if (prevEl instanceof HTMLVideoElement) prevEl.pause();
				gsap.set(nextEl, { clipPath: 'inset(100% 0% 0% 0%)', scale: 1, zIndex: z });
				if (nextEl instanceof HTMLVideoElement) {
					nextEl.currentTime = 0;
					nextEl.play().catch(() => {});
				}
				gsap.to(nextEl, {
					clipPath: 'inset(0% 0% 0% 0%)',
					scale: 1.05,
					duration: DURATION,
					ease: 'power3.out'
				});
				timer = setTimeout(advance, INTERVAL);
			};

			timer = setTimeout(advance, INTERVAL);
		});

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
		};
	});

	// SP: no wipe — each frame shows at its own natural size (capped by
	// max-width/max-height in CSS, so it varies frame to frame) instead of
	// being cover-cropped into a fixed box, so there's nothing for GSAP to
	// animate. Just swap which one is current on the same cadence as the
	// PC loop above (1.2s - 0.35s stagger = 850ms).
	let spIndex = $state(0);

	$effect(() => {
		if (!browser) return;
		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion || frames.length < 2) return;

		const INTERVAL = 850;
		const iv = setInterval(() => {
			spIndex = (spIndex + 1) % frames.length;
		}, INTERVAL);

		return () => clearInterval(iv);
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
				{#if frame.isVideo}
					<!-- preload="auto" unconditionally, unlike the image branch's
					     i===0 split: a video only gets ~850ms between its turn
					     starting and the next frame's turn pausing it again, so
					     it needs to already be buffered by the time that turn
					     arrives — metadata-only fetches from cdn.takumiisobe.com
					     don't finish in time and the video never visibly plays. -->
					<video
						class="frame"
						bind:this={frameEls[i]}
						src={frame.src}
						loop
						muted
						playsinline
						preload="auto"
						aria-label={frame.alt}
					></video>
				{:else}
					<img
						class="frame"
						bind:this={frameEls[i]}
						src={frame.src}
						srcset={frame.srcset}
						sizes="900px"
						alt={frame.alt}
						loading={i === 0 ? 'eager' : 'lazy'}
						fetchpriority={i === 0 ? 'high' : undefined}
						decoding="async"
					/>
				{/if}
			{/each}
		</div>

		{#if frames[spIndex].isVideo}
			<video
				class="frame-simple"
				src={frames[spIndex].src}
				autoplay
				loop
				muted
				playsinline
				preload="auto"
				aria-label={frames[spIndex].alt}
			></video>
		{:else}
			<img
				class="frame-simple"
				src={frames[spIndex].src}
				srcset={frames[spIndex].srcset}
				sizes="70vw"
				alt={frames[spIndex].alt}
				loading="eager"
				fetchpriority="high"
				decoding="async"
			/>
		{/if}
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
		justify-content: center;
		background: var(--color-bg);
		padding: 48px var(--padding);
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

	/* PC only (hidden on SP below): a contained, cover-cropped 900px/16:9
	   box with the stacked-frame wipe. */
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

	/* SP only (hidden on PC below): no fixed box, no crop — each frame
	   renders at its own natural aspect ratio, just capped so nothing
	   overflows. Size varies frame to frame by design. No margin: SP pins
	   tagline/logo to the two edges (below) and lets this sit in whatever
	   space that leaves between them. */
	.Teaser .frame-simple {
		display: block;
		max-width: 70vw;
		max-height: 60vh;
		width: auto;
		height: auto;
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

	/* Exactly one of the two frame elements is ever in the DOM's visible
	   flow — .slider (PC wipe) or .frame-simple (SP plain swap) — both JS
	   loops above always run; only visibility is viewport-gated, so there's
	   no JS breakpoint branching to get wrong on hydration. */
	@media (max-width: 1023px) {
		.Teaser .slider {
			display: none;
		}

		/* PC centers logo/frame/tagline as one group (justify-content:center
		   on the shared rule above) — SP instead pins tagline to the top edge
		   and logo to the bottom (order flips their visual position without
		   touching DOM order), so neither moves as frame-simple's own size
		   varies frame to frame. space-between, not position:absolute/fixed,
		   is what keeps them pinned. */
		.Teaser {
			justify-content: space-between;
		}

		.Teaser .tagline {
			order: -1;
			margin-top: 0;
			font-size: var(--fs-h5);
		}

		.Teaser .logo {
			order: 1;
		}
	}

	@media (min-width: 1024px) {
		.Teaser .frame-simple {
			display: none;
		}
	}
</style>
