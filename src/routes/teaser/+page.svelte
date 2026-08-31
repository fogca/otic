<script lang="ts">
	import { browser } from '$app/environment';
	import Logo from '$lib/components/Logo.svelte';
	import { typeText } from '$lib/actions/typeText';
	import { imgOpt, imgSrcset } from '$lib/js/img';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Frame = { src: string; srcset: string; alt: string };

	// One frame per work — its main_visual image only. Works whose
	// main_visual is a video (or has none at all) are skipped: this is a
	// still-image flip cycle, and a video doesn't suit a quarter-second turn anyway.
	const frames: Frame[] = data.works
		.map((w) => {
			const img = w.main_visual?.pj_images;
			if (!img?.url) return null;
			// Quality 85, not the site-wide default 72 — frames render large
			// (up to 60vw/60vh), where compression artifacts read clearly.
			return {
				src: imgOpt(img.url, 1400, 85),
				srcset: imgSrcset(img.url, [700, 1000, 1400, 2000], 85),
				alt: w.title
			} satisfies Frame;
		})
		.filter((f): f is Frame => f !== null);

	// Straight cut, no crossfade — every frame is already in the DOM (see
	// markup below), so a "switch" only ever toggles which one is opaque;
	// none of them wait on a network fetch mid-cycle. That's what keeps a
	// 250ms interval readable as a flip rather than a stutter.
	const FRAME_INTERVAL = 250; // ms
	let activeIndex = $state(0);

	$effect(() => {
		if (!browser || frames.length < 2) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const iv = setInterval(() => {
			activeIndex = (activeIndex + 1) % frames.length;
		}, FRAME_INTERVAL);

		return () => clearInterval(iv);
	});
</script>

<svelte:head>
	<title>OTIC</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Teaser">
	<div class="stage">
		<!-- Decorative background mark — the flip cycle plays over it, not
		     alongside it (see .frame-layer's z-index below). Hidden from AT:
		     purely visual, the tagline carries the page's actual content. -->
		<div class="mark-layer" aria-hidden="true">
			<div class="logo">
				<Logo />
			</div>
		</div>

		{#if frames.length > 0}
			<!-- All frames render simultaneously (opacity-toggled, not
			     src-swapped) so none of them have to fetch mid-cycle — at
			     250ms a network wait would show as a blank flash. Keyed by
			     index, not src: microCMS reuses some assets across works, so
			     src isn't guaranteed unique. aria-hidden as a group for the
			     same reason as the mark above — a screen reader has no use
			     for ~16 alt texts flickering past at 4/sec. -->
			<div class="frame-layer" aria-hidden="true">
				{#each frames as frame, i (i)}
					<img
						class="frame"
						class:is-active={i === activeIndex}
						src={frame.src}
						srcset={frame.srcset}
						sizes="60vw"
						alt={frame.alt}
						loading="eager"
						fetchpriority={i === 0 ? 'high' : undefined}
						decoding="async"
					/>
				{/each}
			</div>
		{/if}
	</div>

	<p class="tagline" lang="en" use:typeText>
		Our Digital Archive will be launching in September.
	</p>
</main>

<style>
	.Teaser {
		position: relative;
		width: 100%;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
		/* Belt-and-braces on top of base.css's global html/body
		   overflow-x:hidden: the SP logo's un-rotated box (see below) lays
		   out at up to 85vh WIDE before the rotate transform is applied
		   (transforms affect paint, not layout), so the box itself is far
		   wider than the viewport pre-rotation. */
		overflow: hidden;
	}

	/* Fills whatever height .tagline's own flex space leaves — the mark and
	   the frame cycle both centre themselves inside this box. */
	.Teaser .stage {
		position: relative;
		flex: 1 1 auto;
		min-height: 0;
	}

	.Teaser .mark-layer,
	.Teaser .frame-layer {
		position: absolute;
		inset: 0;
	}

	.Teaser .mark-layer {
		z-index: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.Teaser .logo {
		/* flex:none, not the default shrink:1 — .mark-layer is a flex
		   container, and a flex item's explicit width is only a starting
		   point the algorithm is free to shrink from. Without this, the
		   85vh/50vw widths below get silently squeezed down to whatever
		   fits .mark-layer's own box (its viewport-width box, well under
		   85vh) instead of actually rendering at that size — confirmed via
		   getBoundingClientRect before this fix: 390px wide (== 100vw)
		   instead of the intended 759.6px (90vh at 844px tall, the size
		   tried before 85vh — same fix, same bug, either width). */
		flex: none;
		color: var(--color-text);
	}
	.Teaser .logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.Teaser .frame-layer {
		z-index: 1;
	}

	/* top/left/translate centring, not the mark-layer's flex trick: each
	   frame's rendered size varies (max-width/max-height cap its own
	   intrinsic aspect ratio, not a fixed box — that variance is the point,
	   see the max-width/max-height rules below), and every frame has to
	   share the exact same centre point regardless of its own size. */
	.Teaser .frame {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: block;
		width: auto;
		height: auto;
		opacity: 0;
		/* Hard cut — no transition. A crossfade would read as a dissolve;
		   the brief was a flip-book. */
		transition: none;
	}
	.Teaser .frame.is-active {
		opacity: 1;
	}

	.Teaser .tagline {
		flex: none;
		padding: 24px var(--padding);
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

	@media (max-width: 1023px) {
		/* Rotate the wordmark on its own centre — a rotate leaves the
		   centre point fixed, so this stays centred inside .mark-layer's
		   flex box without any extra offset math. Sizing the UN-rotated box
		   to 85vh wide is deliberate: after the 90° turn that width becomes
		   the mark's on-screen HEIGHT, so it reads as a slender wordmark
		   spanning 85% of the viewport top-to-bottom. */
		.Teaser .logo {
			width: 85vh;
			transform: rotate(90deg);
		}

		.Teaser .frame {
			max-width: 80vw;
			max-height: 70vh;
		}
	}

	@media (min-width: 1024px) {
		.Teaser .logo {
			width: 50vw;
		}

		.Teaser .frame {
			max-width: 60vw;
			max-height: 60vh;
		}
	}
</style>
