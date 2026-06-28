<script lang="ts">
	import { onMount } from 'svelte';
	import { stopLenis, startLenis } from '$lib/state/lenis';

	let track: HTMLElement | undefined = $state();
	let wordmarkSpan: HTMLElement | undefined = $state();

	// Fit the wordmark span to its container's content width (excluding padding).
	// Must use inline-block to measure true text width (block fills container width
	// making scrollWidth useless as a text-width measure).
	function fitWordmark() {
		if (!wordmarkSpan) return;
		const parent = wordmarkSpan.parentElement;
		if (!parent) return;
		const cs = getComputedStyle(parent);
		const target =
			parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
		if (target <= 0) return;

		wordmarkSpan.style.display = 'inline-block';
		let size = 10;
		wordmarkSpan.style.fontSize = size + 'px';
		while (wordmarkSpan.getBoundingClientRect().width < target * 0.99 && size < 600) {
			size += 2;
			wordmarkSpan.style.fontSize = size + 'px';
		}
		wordmarkSpan.style.display = 'block';
	}

	onMount(() => {
		if (!track) return;

		// Pause global smooth scroll + lock body vertical scroll
		stopLenis();
		document.documentElement.style.overflowY = 'hidden';

		// Convert vertical wheel → horizontal scroll (desktop)
		const onWheel = (e: WheelEvent) => {
			if (!track) return;
			if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
				e.preventDefault();
				track.scrollLeft += e.deltaY;
			}
		};
		track.addEventListener('wheel', onWheel, { passive: false });

		// Defer fitWordmark one frame so layout is fully computed before measuring
		requestAnimationFrame(fitWordmark);
		const ro = new ResizeObserver(fitWordmark);
		if (wordmarkSpan?.parentElement) ro.observe(wordmarkSpan.parentElement);

		return () => {
			track?.removeEventListener('wheel', onWheel);
			ro.disconnect();
			document.documentElement.style.overflowY = '';
			startLenis();
		};
	});
</script>

<svelte:head>
	<title>Office — TAKUMIISOBE.com</title>
</svelte:head>

<main class="OfficePage">
	<div class="h-track" bind:this={track}>

		<!-- ─── Panel 1: First view ─── -->
		<section class="panel panel--intro">
			<div class="intro-inner">
				<div class="intro-grid">

					<!-- Col 1: Studio description -->
					<div class="col col--studio">
						<p class="col-label" lang="en">Studio</p>
						<p class="col-body" lang="en">
							Office / TAKUMI ISOBE is a creative office based in Tokyo working
							across visual identity and design engineering — experience, brand,
							product, type, furniture, and digital communication. By blending
							culture, philosophy, and design, we create strategies that speak to
							what makes us human — our physicality, our emotion. Day by day,
							learning further, we strive toward better creation.
						</p>
					</div>

					<!-- Col 2: Services -->
					<div class="col col--services">
						<p class="col-label" lang="en">Services</p>
						<ul class="col-list" lang="en">
							<li>Product & Furniture Design</li>
							<li>V.I. & Typography</li>
							<li>Image Visualisation</li>
							<li>Digital Infrastructure</li>
						</ul>
					</div>

					<!-- Col 3: Connect -->
					<div class="col col--connect">
						<p class="col-label" lang="en">Connect</p>
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

				<!-- Large display wordmark anchored to the bottom -->
				<div class="wordmark">
					<span bind:this={wordmarkSpan} lang="en">TAKUMI ISOBE</span>
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

	</div>
</main>

<style>
	/* ── Page host: fills viewport, no extra spacing ── */
	.OfficePage {
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
		padding: 0;
		margin: 0;
		background: var(--color-bg);
	}

	/* ── Horizontal scroll track ── */
	.h-track {
		display: flex;
		flex-direction: row;
		width: 100%;
		height: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.h-track::-webkit-scrollbar {
		display: none;
	}

	/* ── Each full-viewport panel ── */
	.panel {
		flex: none;
		width: 100vw;
		height: 100dvh;
		scroll-snap-align: start;
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
		padding: 80px calc(var(--padding) * 1.5) 0;
	}

	.intro-grid {
		display: grid;
		grid-template-columns: 45% 22% 1fr;
		gap: 48px;
		align-items: start;
	}

	/* Column label — hairline below, muted */
	.col-label {
		font-size: var(--fs-h5);
		font-weight: var(--fw-base);
		margin: 0 0 14px;
		padding-bottom: 10px;
		border-bottom: 1px solid currentColor;
		opacity: 0.4;
		line-height: 1.4;
	}

	/* Studio body copy */
	.col-body {
		font-size: var(--fs-p-en);
		line-height: 1.55;
		text-align: left;
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

	/* Location meta — bottom of connect col */
	.col-meta {
		font-size: var(--fs-h6);
		margin: 32px 0 0;
		opacity: 0.45;
	}

	/* ── Wordmark: large display text, bottom-anchored ── */
	.wordmark {
		flex: none;
		overflow: hidden;
		padding: 0 calc(var(--padding) * 1.5);
		/* optical push: align descenders to page bottom edge */
		padding-bottom: 0;
		margin-bottom: -0.08em;
		line-height: 1;
	}
	.wordmark span {
		display: block;
		/* font-size set dynamically by fitWordmark() */
		font-size: 10vw;
		font-weight: var(--fw-medium);
		font-variation-settings: 'wght' 450;
		line-height: 0.88;
		letter-spacing: -0.015em;
		white-space: nowrap;
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
			flex-direction: column;
			overflow-x: visible;
			overflow-y: visible;
			height: auto;
			scroll-snap-type: none;
		}
		.panel {
			width: 100%;
			height: auto;
			min-height: 100dvh;
			scroll-snap-align: none;
		}
		.panel--intro .intro-inner {
			padding: 80px var(--padding) 0;
		}
		.intro-grid {
			grid-template-columns: 1fr;
			gap: 32px;
		}
		.wordmark {
			padding: 0 var(--padding);
		}
		.wordmark span {
			font-size: 14vw;
		}
		.panel-inner {
			padding: 80px var(--padding) var(--padding);
		}
	}

	/* ── PC fine-tuning ── */
	@media (min-width: 1440px) {
		.intro-grid {
			gap: 64px;
		}
	}
</style>
