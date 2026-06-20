<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { browser } from '$app/environment';
	import Logo from '$lib/components/Logo.svelte';

	type Frame = {
		id: string;
		src: string;
		srcset?: string;
		alt: string;
	};

	type Props = {
		frames: Frame[];
		num: string;
		title: string;
		brand?: string;
		// Toggle the original logo lock-up step (kept for future re-enable).
		showLogo?: boolean;
		onComplete?: () => void;
		// Fires at the start of stage 3 (text reveal) — for syncing Header etc.
		onTextReveal?: () => void;
	};

	let {
		frames,
		num,
		title,
		brand = '',
		showLogo = false,
		onComplete,
		onTextReveal
	}: Props = $props();

	// ── Tunable timings ──
	const LOGO_HOLD = 0.8;
	const LOGO_OUT_DURATION = 0.3;
	const REVEAL_DURATION = 1.2;
	const REVEAL_STAGGER = 0.35;
	const FRAME_SCALE_FROM = 1;
	const FRAME_SCALE_TO = 1.1;
	const BG_FADE_DELAY = 0.3; // pause after frame reveal completes before bg fades to white
	const BG_FADE_DURATION = 0.9;
	const META_DURATION = 0.9;
	const META_STAGGER = 0.08;
	const HANDOFF_HOLD = 0.5;
	const HANDOFF_FADE_DURATION = 0.7;

	let rootEl = $state<HTMLElement | null>(null);
	let logoEl = $state<HTMLElement | null>(null);
	let frameEls = $state<HTMLImageElement[]>([]);
	let metaEl = $state<HTMLElement | null>(null);
	let metaCells = $state<HTMLElement[]>([]);

	onMount(() => {
		if (!browser) return;

		const prefersReducedMotion = window.matchMedia(
			'(prefers-reduced-motion: reduce)'
		).matches;

		if (prefersReducedMotion) {
			if (rootEl) rootEl.style.display = 'none';
			onComplete?.();
			return;
		}

		// Lock scroll while loader is on screen
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		let cancelled = false;
		import('gsap').then(async ({ gsap }) => {
			if (cancelled) return;
			// Wait for bind:this on each items to populate
			await tick();
			if (cancelled) return;

			// Defensive: drop any holes/null refs from $state arrays
			const validFrames = [...frameEls].filter(Boolean);
			const validCells = [...metaCells].filter(Boolean);

			if (validFrames.length === 0) {
				document.body.style.overflow = prevOverflow;
				onComplete?.();
				return;
			}

			const tl = gsap.timeline();

			// Initial state
			gsap.set(validFrames, {
				clipPath: 'inset(100% 0% 0% 0%)',
				scale: FRAME_SCALE_FROM
			});
			gsap.set(validCells, { yPercent: 120, filter: 'blur(3px)', opacity: 0 });
			if (logoEl) gsap.set(logoEl, { opacity: showLogo ? 0 : 0 });

			// Stage 0 (optional): Logo lock-up
			if (showLogo && logoEl) {
				tl.to(logoEl, {
					opacity: 1,
					duration: 0.4,
					ease: 'power2.out'
				});
				tl.to(
					logoEl,
					{
						opacity: 0,
						duration: LOGO_OUT_DURATION,
						delay: LOGO_HOLD,
						ease: 'power2.in'
					},
					'>'
				);
			}

			// Stage 1: Reveal each frame (stacked) bottom-up via clip-path,
			// while inner media zooms 1 → 1.2 simultaneously
			validFrames.forEach((el, i) => {
				tl.to(
					el,
					{
						clipPath: 'inset(0% 0% 0% 0%)',
						scale: FRAME_SCALE_TO,
						duration: REVEAL_DURATION,
						ease: 'power3.out'
					},
					i === 0 ? '>' : `>-${REVEAL_DURATION - REVEAL_STAGGER}`
				);
			});

			// Stage 2: Background black → white (smooth) — pause first to make the "switch" obvious
			tl.to(
				rootEl,
				{
					backgroundColor: '#ffffff',
					duration: BG_FADE_DURATION,
					ease: 'power2.inOut'
				},
				`>${BG_FADE_DELAY}`
			);

			// Stage 2b: Scale the LAST frame back to 1 so handoff to Archives card-01 is seamless
			const lastFrame = validFrames[validFrames.length - 1];
			if (lastFrame) {
				tl.to(
					lastFrame,
					{
						scale: FRAME_SCALE_FROM,
						duration: BG_FADE_DURATION,
						ease: 'power2.inOut'
					},
					'<'
				);
			}

			// Stage 3: Meta text reveal — fire onTextReveal at the same instant
			if (validCells.length > 0) {
				tl.to(
					validCells,
					{
						yPercent: 0,
						filter: 'blur(0px)',
						opacity: 1,
						duration: META_DURATION,
						stagger: META_STAGGER,
						ease: 'power3.out',
						onStart: () => onTextReveal?.()
					},
					'<+0.1'
				);
			} else {
				// No meta cells (edge case) — still fire onTextReveal so Header doesn't get stuck
				tl.call(() => onTextReveal?.(), [], '<+0.1');
			}

			// Stage 4: Hand off to archives — release scroll then fade loader out
			tl.addLabel('handoff', `>+${HANDOFF_HOLD}`);
			tl.call(
				() => {
					document.body.style.overflow = prevOverflow;
					onComplete?.();
				},
				[],
				'handoff'
			);

			tl.to(
				rootEl,
				{
					opacity: 0,
					duration: HANDOFF_FADE_DURATION,
					ease: 'power2.inOut',
					onComplete: () => {
						if (rootEl) rootEl.style.display = 'none';
					}
				},
				'handoff'
			);
		});

		return () => {
			cancelled = true;
			document.body.style.overflow = prevOverflow;
		};
	});
</script>

<div class="loader" bind:this={rootEl} aria-hidden="true">
	{#if showLogo}
		<div class="logo-mark" bind:this={logoEl}>
			<Logo />
		</div>
	{/if}

	<div class="frame-stack">
		{#each frames as frame, i (frame.id)}
			<img
				class="frame"
				bind:this={frameEls[i]}
				src={frame.src}
				srcset={frame.srcset}
				sizes="100vw"
				alt={frame.alt}
				loading="eager"
			/>
		{/each}
	</div>

	<div class="meta" bind:this={metaEl}>
		<span class="cell num"><span bind:this={metaCells[0]}>{num}</span></span>
		<span class="cell title"><span bind:this={metaCells[1]} lang="en">{title}</span></span>
		<span class="cell brand"
			><span bind:this={metaCells[2]} lang="en">{brand}</span></span
		>
	</div>
</div>

<style>
	.loader {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: var(--color-bg-dark, #121212);
		z-index: 9999;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		pointer-events: none;
		color: var(--color-text);
		overflow: hidden;
	}

	/* Logo step (kept for future re-enable via showLogo prop) */
	.logo-mark {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 220px;
		max-width: 70%;
		margin: auto;
		color: var(--color-text);
		opacity: 0;
	}

	/* Card sized to match Home card-01 exactly so handoff is seamless */
	.frame-stack {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 257px;
		aspect-ratio: 257 / 385;
		overflow: hidden; /* clip the inner media zoom (scale 1 → 1.2) */
	}

	.frame {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		clip-path: inset(100% 0% 0% 0%); /* hidden until GSAP reveals — prevents flash before gsap loads */
		will-change: clip-path, transform;
	}

	/* Meta sits below the image at 8px gap, mirroring card-01 .meta */
	.meta {
		position: absolute;
		left: 50%;
		top: calc(50% + (385px / 2) + 8px);
		transform: translateX(-50%);
		width: 257px;
		display: grid;
		grid-template-columns: 12.5% 1fr auto;
		align-items: baseline;
		gap: 8px;
		font-size: var(--fs-h6);
		font-weight: var(--fw-base);
		color: var(--color-text);
	}

	.cell {
		display: block;
		overflow: hidden;
	}

	.cell > span {
		display: inline-block;
		will-change: transform, filter, opacity;
	}

	.cell.num > span {
		opacity: 0.6;
	}

	.cell.brand {
		text-align: right;
	}

	.cell.brand > span {
		opacity: 0.6;
	}

	@media (min-width: 768px) {
		.frame-stack {
			width: 320px;
			aspect-ratio: 320 / 480;
		}
		.meta {
			width: 320px;
			top: calc(50% + (480px / 2) + 8px);
		}
	}

	@media (min-width: 1024px) {
		.frame-stack {
			width: 380px;
			aspect-ratio: 380 / 570;
		}
		.meta {
			width: 380px;
			top: calc(50% + (570px / 2) + 8px);
			font-size: var(--fs-h5);
		}
	}
</style>
