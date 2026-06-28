<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Lenis from 'lenis';
	import { stopLenis, startLenis } from '$lib/state/lenis';
	import Logo from '$lib/components/Logo.svelte';

	let track: HTMLElement | undefined = $state();
	let inner: HTMLElement | undefined = $state();

	onMount(() => {
		if (!browser) return;

		// Horizontal Lenis is desktop-only. On SP the panels stack vertically,
		// so the page keeps native vertical scroll (global Lenis stays active).
		const mq = window.matchMedia('(min-width: 1024px)');
		let lenis: Lenis | null = null;
		let rafId = 0;

		const enable = () => {
			if (lenis || !track || !inner) return;
			// Hand off from global vertical Lenis; lock page vertical scroll.
			stopLenis();
			document.documentElement.style.overflowY = 'hidden';
			// gestureOrientation:'both' maps trackpad/wheel vertical → horizontal.
			lenis = new Lenis({
				wrapper: track,
				content: inner,
				orientation: 'horizontal',
				gestureOrientation: 'both',
				smoothWheel: true,
				duration: 1.2
			});
			const raf = (time: number) => {
				lenis?.raf(time);
				rafId = requestAnimationFrame(raf);
			};
			rafId = requestAnimationFrame(raf);
		};

		const disable = () => {
			if (!lenis) return;
			cancelAnimationFrame(rafId);
			lenis.destroy();
			lenis = null;
			document.documentElement.style.overflowY = '';
			startLenis();
		};

		const onChange = (e: MediaQueryListEvent) => (e.matches ? enable() : disable());
		if (mq.matches) enable();
		mq.addEventListener('change', onChange);

		return () => {
			mq.removeEventListener('change', onChange);
			disable();
		};
	});
</script>

<svelte:head>
	<title>Office — TAKUMIISOBE.com</title>
</svelte:head>

<main class="OfficePage">
	<div class="h-track" bind:this={track}>
		<div class="h-inner" bind:this={inner}>

			<!-- ─── Panel 1: First view ─── -->
			<section class="panel panel--intro">
				<div class="intro-inner">
					<div class="intro-grid">

						<!-- Col 1: Studio description -->
						<div class="col col--studio">
							<p class="col-body" lang="en">
								Office / TAKUMI ISOBE is a creative office based in Tokyo working across
								visual identity and design engineering — experience, brand, product, type,
								furniture, and digital communication. By blending culture, philosophy, and
								design, we create strategies that speak to what makes us human — our
								physicality, our emotion. Day by day, learning further, we strive toward
								better creation.
							</p>
						</div>

						<!-- Col 2: Services -->
						<div class="col col--services">
							<ul class="col-list" lang="en">
								<li>Product & Furniture Design</li>
								<li>V.I. & Typography</li>
								<li>Image Visualisation</li>
								<li>Digital Infrastructure</li>
							</ul>
						</div>

						<!-- Col 3: Connect -->
						<div class="col col--connect">
							<ul class="col-list" lang="en">
								<li><a href="mailto:hi@takumiisobe.com">Email ↗</a></li>
								<li>
									<a
										href="https://www.instagram.com/takumi.isobe"
										target="_blank"
										rel="noopener noreferrer">Instagram ↗</a
									>
								</li>
								<li>
									<a href="https://www.august.tf" target="_blank" rel="noopener noreferrer"
										>August.tf ↗</a
									>
								</li>
								<li>
									<a
										href="https://www.joulejoule.com"
										target="_blank"
										rel="noopener noreferrer">Joule Joule ↗</a
									>
								</li>
							</ul>
							<p class="col-meta" lang="en">Tokyo, Japan</p>
						</div>

					</div>

					<!-- Office logo full-width at the bottom -->
					<div class="wordmark">
						<Logo />
					</div>
				</div>
			</section>

			<!-- ─── Panel 2: Services ─── -->
			<section class="panel panel--services">
				<div class="panel-inner">
					<header class="panel-hd">
						<span class="pn" lang="en">02</span>
						<h2 class="pt" lang="en">Services</h2>
					</header>
				</div>
			</section>

			<!-- ─── Panel 3: Company ─── -->
			<section class="panel panel--company">
				<div class="panel-inner">
					<header class="panel-hd">
						<span class="pn" lang="en">03</span>
						<h2 class="pt" lang="en">Company</h2>
					</header>
				</div>
			</section>

			<!-- ─── Panel 4: Ethos ─── -->
			<section class="panel panel--ethos">
				<div class="panel-inner">
					<header class="panel-hd">
						<span class="pn" lang="en">04</span>
						<h2 class="pt" lang="en">Ethos</h2>
					</header>
				</div>
			</section>

		</div><!-- .h-inner -->
	</div><!-- .h-track -->
</main>

<style>
	/* ── Page host: fills viewport, no spacing ── */
	.OfficePage {
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
		padding: 0;
		margin: 0;
		background: var(--color-bg);
	}

	/* ── Horizontal scroll track (Lenis drives scrollLeft) ──
	   No scroll-snap: it fights Lenis's per-frame scrollLeft writes. */
	.h-track {
		width: 100%;
		height: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.h-track::-webkit-scrollbar {
		display: none;
	}

	/* ── Inner row: panels laid out horizontally ── */
	.h-inner {
		display: flex;
		flex-direction: row;
		height: 100%;
	}

	/* ── Each full-viewport panel ── */
	.panel {
		flex: none;
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
		position: relative;
	}

	/* ── Panel 1: First view ── */
	.panel--intro .intro-inner {
		width: 100%;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* No X padding — full bleed per design intent */
		padding-top: 80px;
		padding-bottom: 0;
	}

	/* 3-column info grid — full-bleed (no side padding) */
	.intro-grid {
		display: grid;
		grid-template-columns: 45% 22% 1fr;
		gap: 48px;
		align-items: start;
	}

	/* Studio body copy — size/line-height/align come from base.css p:lang(en).
	   Only bump one type step above the list items. */
	.col-body {
		font-size: var(--fs-h2);
		margin: 0;
	}

	/* Services / connect lists */
	.col-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.col-list li {
		font-size: var(--fs-h6);
		line-height: 1.4;
	}
	:global(.OfficePage) .col-list a {
		text-decoration: none;
		transition: opacity 0.2s var(--ease-default);
	}
	:global(.OfficePage) .col-list a:hover {
		opacity: 0.45;
	}

	/* Location meta */
	.col-meta {
		font-size: var(--fs-h6);
		margin: 32px 0 0;
		opacity: 0.45;
	}

	/* ── Logo wordmark — full-bleed, bottom-anchored ── */
	.wordmark {
		flex: none;
		width: 100%;
		overflow: hidden;
		padding-bottom: 10px;
		line-height: 1;
	}
	/* Scale SVG to fill full container width */
	.wordmark :global(svg) {
		width: 100%;
		height: auto;
		display: block;
	}

	/* ── Placeholder panels ── */
	.panel-inner {
		width: 100%;
		height: 100%;
		padding: 80px calc(var(--padding) * 1.5) calc(var(--padding) * 1.5);
		display: flex;
		flex-direction: column;
	}
	.panel-hd {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.pn {
		font-size: var(--fs-h5);
		opacity: 0.4;
	}
	.pt {
		font-size: var(--fs-h1);
		font-weight: var(--fw-lead);
		font-variation-settings: 'wght' var(--fw-lead);
		line-height: 1.15;
	}

	/* ── Mobile: vertical stack (SP) ── */
	@media (max-width: 1023px) {
		.OfficePage {
			height: auto;
			overflow: visible;
		}
		.h-track {
			overflow: visible;
			height: auto;
		}
		.h-inner {
			flex-direction: column;
			height: auto;
		}
		.panel {
			width: 100%;
			height: auto;
			min-height: 100dvh;
		}
		.intro-grid {
			grid-template-columns: 1fr;
			gap: 32px;
		}
		.panel-inner {
			padding: 80px var(--padding) var(--padding);
		}
	}

	/* ── Wide desktop ── */
	@media (min-width: 1440px) {
		.intro-grid {
			gap: 64px;
		}
	}
</style>
