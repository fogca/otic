<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import Logo from '$lib/components/Logo.svelte';
	import { typeText } from '$lib/actions/typeText';
	import { imgOpt, imgSrcset } from '$lib/js/img';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type Frame = { src: string; srcset: string; alt: string };

	const toFrame = (url: string | undefined, alt: string): Frame | null => {
		if (!url) return null;
		// Quality 85, not the site-wide default 72 — frames render large
		// (up to 60vw/60vh), where compression artifacts read clearly.
		return {
			src: imgOpt(url, 1400, 85),
			srcset: imgSrcset(url, [700, 1000, 1400, 2000], 85),
			alt
		};
	};

	// Up to two frames per work — main_visual and repeat's first entry
	// (repeat[0]) — images only. A work whose main_visual/repeat[0] is a
	// video, or absent, simply contributes no frame for that slot: this is
	// a still-image flip cycle, and a video doesn't suit a quarter-second
	// turn anyway.
	//
	// Two passes, not one frame right after the other per work: lap 1 is
	// every work's main_visual, lap 2 every work's repeat[0], so a full
	// round of the catalogue completes before any work's second image comes
	// up — showing a work's two visuals back to back would read as "this
	// project again" rather than fresh variety (same reasoning the old
	// multi-lap version of this page used).
	//
	// Two deliberate exceptions, each pulled in as its own extra lap: Ondo
	// Sake's repeat[3] and MILES 158's repeat[4]. Not a general "Nth repeat
	// entry for every work" rule (most works' later repeat entries haven't
	// been vetted for this cycle) — just these two requested additions.
	const ondo = data.works.find((w) => w.title === 'Ondo Sake');
	const miles158 = data.works.find((w) => w.title === 'MILES 158');
	const frames: Frame[] = [
		...data.works.map((w) => toFrame(w.main_visual?.pj_images?.url, w.title)),
		...data.works.map((w) => toFrame(w.repeat?.[0]?.pj_images?.url, w.title)),
		toFrame(ondo?.repeat?.[3]?.pj_images?.url, 'Ondo Sake'),
		toFrame(miles158?.repeat?.[4]?.pj_images?.url, 'MILES 158')
	].filter((f): f is Frame => f !== null);

	// Straight cut, no crossfade — every frame is already in the DOM (see
	// markup below), so a "switch" only ever toggles which one is opaque;
	// none of them wait on a network fetch mid-cycle. That's what keeps a
	// 250ms interval readable as a flip rather than a stutter.
	const FRAME_INTERVAL = 250; // ms
	let activeIndex = $state(0);

	// Intro sequence: the logo masks in first; only once that finishes do
	// the frame cycle and the tagline's typewriter start ("そこから" per
	// the brief — sequential, not simultaneous with the logo).
	let logoEl = $state<HTMLDivElement | null>(null);
	let taglineEl = $state<HTMLParagraphElement | null>(null);
	let logoRevealed = $state(false);
	let taglineTyped = $state(false);

	onMount(() => {
		if (!browser) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;
		if (prefersReducedMotion) {
			logoRevealed = true;
			return;
		}

		let cancelled = false;
		import('gsap').then(async ({ gsap }) => {
			if (cancelled) return;
			// Same defensive wait Loader.svelte's own GSAP reveal uses:
			// tick() alone isn't reliably enough for bind:this + a real
			// paint to have settled before a tween starts (confirmed live
			// there as a genuine race, not a theoretical one — see that
			// file's comment on this exact wait).
			await tick();
			if (cancelled) return;
			await new Promise((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(resolve))
			);
			if (cancelled || !logoEl) return;

			// Plain fade-in, the whole wordmark as one block — no stagger,
			// no per-glyph anything.
			gsap.set(logoEl, { opacity: 0 });
			gsap.to(logoEl, {
				opacity: 1,
				duration: 0.5,
				ease: 'power2.out',
				onComplete: () => {
					logoRevealed = true;
				}
			});
		});

		return () => {
			cancelled = true;
		};
	});

	// logo -> tagline -> images, strictly in sequence: the frame cycle
	// waits on taglineTyped (set by typeText's onComplete below), not on
	// logoRevealed directly, so images don't start until the tagline has
	// actually finished typing, not just once the logo is done.
	$effect(() => {
		if (!browser || !taglineTyped || frames.length < 2) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const iv = setInterval(() => {
			activeIndex = (activeIndex + 1) % frames.length;
		}, FRAME_INTERVAL);

		return () => clearInterval(iv);
	});

	// typeText is a plain function, not exclusively a use:-directive action
	// — called directly here (instead of declared via use:typeText on the
	// element) so its start can be gated on logoRevealed rather than firing
	// on mount.
	$effect(() => {
		if (!browser || !logoRevealed || !taglineEl) return;
		typeText(taglineEl, {
			onComplete: () => {
				taglineTyped = true;
			}
		});
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
			<div class="logo" bind:this={logoEl}>
				<Logo />
			</div>
		</div>

		{#if frames.length > 0}
			<!-- All frames render simultaneously (opacity-toggled, not
			     src-swapped) so none of them have to fetch mid-cycle — at
			     250ms a network wait would show as a blank flash. is-active
			     also requires taglineTyped, so frame 0 (activeIndex's
			     default) stays fully transparent until BOTH the logo has
			     finished revealing AND the tagline has finished typing —
			     logo -> tagline -> images, strictly in that order. Keyed by
			     index, not src: microCMS reuses some assets across works,
			     so src isn't guaranteed unique. aria-hidden as a group for
			     the same reason as the mark above — a screen reader has no
			     use for ~20 alt texts flickering past at 4/sec. -->
			<div class="frame-layer" aria-hidden="true">
				{#each frames as frame, i (i)}
					<img
						class="frame"
						class:is-active={taglineTyped && i === activeIndex}
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

	<p class="tagline" class:is-visible={logoRevealed} lang="en" bind:this={taglineEl}>
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
		   out WIDE (currently 80vh) before the rotate transform is applied
		   (transforms affect paint, not layout), so the box itself is far
		   wider than the viewport pre-rotation. */
		overflow: hidden;
	}

	/* On PC, fills whatever height .tagline's own flex space leaves. On SP
	   .tagline is pulled out of flow entirely (see the max-width:1023px
	   block), so this fills the Teaser column's full height there — the
	   mark and the frame cycle both centre themselves inside this box
	   either way. */
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
		   vh/vw widths below get silently squeezed down to whatever fits
		   .mark-layer's own box (its viewport-width box, well under either)
		   instead of actually rendering at that size — confirmed via
		   getBoundingClientRect before this fix: 390px wide (== 100vw)
		   instead of the intended size. */
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
		/* --fw-medium resolves to exactly 400 in the current scale. */
		font-weight: var(--fw-medium);
		font-variation-settings: 'wght' var(--fw-medium);
		line-height: var(--lh-en);
		color: var(--color-text);
		text-align: center;
		letter-spacing: 0;
		/* Hidden until the logo's typewriter finishes (.is-visible is
		   toggled by the same logoRevealed flag) — fades in just as
		   typeText() clears the static text and starts re-typing it, so
		   what actually fades into view is the cursor, immediately
		   followed by the characters. */
		opacity: 0;
		transition: opacity 0.4s var(--ease-default);
	}
	.Teaser .tagline.is-visible {
		opacity: 1;
	}

	/* Not scoped to .tagline — the logo's own SVG cursor rect (added at
	   runtime, see the script above) needs the same blink. */
	.Teaser :global(.type-cursor) {
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
		   to 80vh wide is deliberate: after the 90° turn that width becomes
		   the mark's on-screen HEIGHT, so it reads as a slender wordmark
		   spanning 80% of the viewport top-to-bottom. */
		.Teaser .logo {
			width: 80vh;
			transform: rotate(90deg);
		}

		.Teaser .frame {
			max-width: 90vw;
			max-height: 65vh;
		}

		/* Pinned to the bottom edge, out of .stage's flex space — .stage
		   (flex:1 1 auto) now fills the Teaser column's full height, since
		   this no longer reserves its own row. Painting order needs no
		   explicit z-index: both this and .stage are positioned elements
		   (non-static) and direct children of .Teaser, so at equal z-index
		   (auto) the later one in DOM order — this — paints on top of
		   .stage's entire stacking context (mark + frames included). */
		.Teaser .tagline {
			position: absolute;
			top: auto;
			bottom: 0;
			left: 50%;
			transform: translateX(-50%);
			width: 100%;
			/* viewport-fit=cover (set site-wide in app.html) lets this box
			   extend into iOS Safari's bottom safe area — without the
			   env() term the text sits right under the floating tab bar,
			   same fix as .corner-logo in +layout.svelte. */
			padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
		}
	}

	@media (min-width: 1024px) {
		.Teaser .logo {
			width: 90vw;
		}

		.Teaser .frame {
			max-width: 60vw;
			max-height: 60vh;
		}
	}
</style>
