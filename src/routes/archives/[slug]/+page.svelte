<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const archive = $derived(data.archive);

	// Show Colophon section only if at least one curated field is filled.
	// Brand is excluded (auto-populated from work meta).
	const hasColophon = $derived(
		!!archive.colophonBase.direction ||
			!!archive.colophonBase.design ||
			!!archive.colophonBase.webSpec ||
			(Array.isArray(archive.colophonBase.links) &&
				archive.colophonBase.links.length > 0) ||
			(Array.isArray(archive.colophonExtra) && archive.colophonExtra.length > 0)
	);
</script>

<svelte:head>
	<title>{archive.title} — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Archive">
	<div class="text-group">
		<section class="Title">
			<div class="wrapper">
				<h1 class="title" lang="en">{archive.title}</h1>
				<p class="brand-tag" lang="en">/ {archive.brand}</p>
			</div>
		</section>

		{#if archive.descriptionEn || archive.descriptionJa}
			<section class="Captions">
				<div class="wrapper">
					<div class="captions">
						{#if archive.descriptionEn}
							<div class="caption" lang="en">
								<p>{archive.descriptionEn}</p>
							</div>
						{/if}
						{#if archive.descriptionJa}
							<div class="caption caption-ja" lang="ja">
								<p>{archive.descriptionJa}</p>
							</div>
						{/if}
					</div>
				</div>
			</section>
		{/if}
	</div>

	<section class="Hero">
		<div class="image-wrap">
			<img src={archive.heroImage} alt={archive.title} />
		</div>
	</section>

	<section class="Gallery">
		<div class="wrapper">
			<!-- Gallery: every uploaded image / video, in original aspect ratio.
			     Each item gets one of 9 width patterns cycled by index. -->
			{#each archive.gallery as item, i (i)}
				<div class="image gp-{(i % 9) + 1}">
					{#if item.isVideo}
						<video
							src={item.src}
							autoplay
							loop
							muted
							playsinline
							preload="metadata"
							aria-label={`${archive.title} ${i + 1}`}
						></video>
					{:else}
						<img src={item.src} alt={`${archive.title} ${i + 1}`} loading="lazy" />
					{/if}
				</div>
			{/each}
		</div>
	</section>

	{#if hasColophon}
		<section class="Colophon">
			<div class="wrapper">
				<h4 class="title" lang="en">Colophon</h4>
				<div class="line" aria-hidden="true"></div>
				<dl class="rows">
					<div class="row">
						<dt lang="en">Brand</dt>
						<dd lang="en">{archive.colophonBase.brand}</dd>
					</div>
					<div class="row">
						<dt lang="en">Direction</dt>
						<dd lang="en">{archive.colophonBase.direction}</dd>
					</div>
					<div class="row">
						<dt lang="en">Design</dt>
						<dd lang="en">{archive.colophonBase.design}</dd>
					</div>
					<div class="row">
						<dt lang="en">Web spec</dt>
						<dd lang="en">{archive.colophonBase.webSpec}</dd>
					</div>
					<div class="row">
						<dt lang="en">Links</dt>
						<dd lang="en">{archive.colophonBase.links}</dd>
					</div>
					{#if archive.colophonExtra}
						{#each archive.colophonExtra as { key, value } (key)}
							<div class="row">
								<dt lang="en">{key}</dt>
								<dd lang="en">{value}</dd>
							</div>
						{/each}
					{/if}
				</dl>
			</div>
		</section>
	{/if}
</main>

<style>
	.Archive {
		padding-top: 0;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-areas:
			'title'
			'hero'
			'captions'
			'gallery'
			'colophon';
	}

	/* SP: flatten text-group so Title and Captions become direct grid items.
	   This lets us interleave them with Hero/Gallery per grid-template-areas. */
	.Archive .text-group {
		display: contents;
	}

	.Archive .Title {
		grid-area: title;
	}

	.Archive .Hero {
		grid-area: hero;
	}

	.Archive .Captions {
		grid-area: captions;
	}

	.Archive .Gallery {
		grid-area: gallery;
	}

	.Archive .Colophon {
		grid-area: colophon;
	}

	/* ----- Hero (full-bleed, top half of first viewport) ----- */
	.Archive .Hero {
		width: 100vw;
		padding-inline: 0;
		margin-left: 0;
		height: auto;
		overflow: hidden;
	}

	.Archive .Hero .image-wrap {
		width: 100%;
		height: auto;
	}

	.Archive .Hero .image-wrap img {
		width: 100%;
		height: auto;
		object-fit: initial;
	}

	/* ----- Title block — pushed down so it lands roughly at the centre of
	   the next viewport after the hero, then sits flush at the floor. ----- */
	.Archive .Title {
		display: flex;
		align-items: flex-end;
		padding-top: 20vh;
		padding-bottom: 24px;
	}

	.Archive .Title .wrapper {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 5px;
		padding-inline: var(--padding);
	}

	.Archive .Title .brand-tag {
		font-size: var(--fs-h6);
		opacity: 0.6;
		text-align: right;
	}

	.Archive .Title .title {
		font-size: var(--fs-h1);
		line-height: 1.25;
		font-weight: 400;
		text-align: right;
	}

	/* ----- Gallery (image stream) ----- */
	.Archive .Gallery {
		margin-top: 40px;
	}

	.Archive .Gallery .wrapper {
		display: flex;
		flex-direction: column;
		gap: 60px;
	}

	.Archive .Gallery .image img,
	.Archive .Gallery .image video {
		width: 100%;
		height: auto;
		/* Honour the source's native aspect ratio — no cropping. */
		object-fit: initial;
		display: block;
	}

	/* ── Mobile width patterns (cycled by index) ──
	   Mirrors the home page Archives stream: alternating centred-narrow /
	   full-bleed slots so the gallery has visual rhythm without per-image
	   manual layout. */
	.Archive .Gallery .gp-1 { width: 90%; margin-inline: auto; }
	.Archive .Gallery .gp-2,
	.Archive .Gallery .gp-4,
	.Archive .Gallery .gp-8 {
		width: 100vw;
		margin-inline: calc(-1 * var(--padding));
	}
	.Archive .Gallery .gp-3,
	.Archive .Gallery .gp-9 {
		width: 62.5vw;
		margin-inline: auto;
	}
	.Archive .Gallery .gp-5 { width: 85%; margin-inline: auto; }
	.Archive .Gallery .gp-6 { width: 70%; margin-inline: auto; }
	.Archive .Gallery .gp-7 { width: 80%; margin-inline: auto; }

	/* ----- Captions (body text, en + jp) ----- */
	.Archive .Captions {
		margin-top: 40px;
	}

	.Archive .Captions .captions {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.Archive .Captions .caption {
		padding-inline: 30px;
		max-width: 100%;
	}

	.Archive .Captions .caption p {
		font-size: 10px;
		line-height: 1.7;
		white-space: pre-line;
	}

	.Archive .Captions .caption[lang='en'] p {
		font-size: 11px;
		line-height: 1.5;
	}

	/* ----- Colophon ----- */
	.Archive .Colophon {
		padding-top: 80px;
	}

	.Archive .Colophon .wrapper {
		padding-inline: 30px;
	}

	.Archive .Colophon .title {
		font-size: var(--fs-h4);
		font-weight: 500;
		margin-bottom: 28px;
	}

	.Archive .Colophon .line {
		height: 1px;
		background: var(--color-text);
		margin-bottom: 12px;
	}

	.Archive .Colophon .rows {
		display: flex;
		flex-direction: column;
	}

	.Archive .Colophon .row {
		display: grid;
		grid-template-columns: 90px 1fr;
		gap: 8px;
		padding-block: 4px;
	}

	.Archive .Colophon .row dt,
	.Archive .Colophon .row dd {
		font-size: var(--fs-h5);
		line-height: 24px;
		font-weight: 400;
	}

	/* ----- Tablet+ ----- */
	@media (min-width: 768px) {
		.Archive .Title .wrapper {
			padding-inline: 40px;
		}

		.Archive .Gallery .wrapper {
			gap: 80px;
		}

		.Archive .Colophon .wrapper {
			padding-inline: 40px;
		}
	}

	/* ----- Desktop: editorial single-column flow -----
	   Row 1: Hero (100vh, image centered W/H).
	   Row 2: Title (full bleed-aligned).
	   Row 3: Captions (centered readable column).
	   Row 4: Gallery (varied widths for editorial rhythm).
	   Row 5: Colophon (when present). */
	@media (min-width: 1024px) {
		.Archive {
			grid-template-columns: 1fr;
			grid-template-areas:
				'hero'
				'title'
				'captions'
				'gallery'
				'colophon';
			padding-inline: 0;
		}

		/* Hero centered in 100vh, image cap by 80vh / 720px-or-50vw */
		.Archive .Hero {
			width: 100%;
			height: 100vh;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-left: 0;
		}

		.Archive .Hero .image-wrap {
			width: auto;
			max-width: min(720px, 50vw);
			height: auto;
		}

		.Archive .Hero .image-wrap img {
			width: 100%;
			height: auto;
			max-height: 80vh;
			object-fit: contain;
		}

		/* Title — below Hero, max-width contained, baseline-aligned with brand */
		.Archive .Title {
			padding-top: 80px;
			padding-bottom: 0;
			align-items: flex-start;
			max-width: 1080px;
			margin-inline: auto;
			padding-inline: calc(var(--padding) * 2);
		}

		.Archive .Title .wrapper {
			padding-inline: 0;
			flex-direction: row;
			justify-content: space-between;
			align-items: baseline;
			gap: 32px;
		}

		.Archive .Title .title {
			font-size: var(--fs-h1);
			text-align: left;
		}

		.Archive .Title .brand-tag {
			font-size: var(--fs-h5);
			text-align: right;
			white-space: nowrap;
		}

		/* Captions — readable centered text column */
		.Archive .Captions {
			margin-top: 56px;
			max-width: 720px;
			margin-inline: auto;
			padding-inline: var(--padding);
		}

		.Archive .Captions .wrapper {
			padding-inline: 0;
		}

		.Archive .Captions .captions {
			gap: 28px;
		}

		.Archive .Captions .caption {
			padding-inline: 0;
		}

		.Archive .Captions .caption p {
			font-size: 14px;
			line-height: 1.7;
		}

		.Archive .Captions .caption[lang='en'] p {
			font-size: 15px;
			line-height: 1.5;
		}

		/* Gallery — editorial rhythm with varied widths */
		.Archive .Gallery {
			margin-top: 120px;
		}

		.Archive .Gallery .wrapper {
			gap: 120px;
		}

		.Archive .Gallery .image {
			display: block;
		}

		.Archive .Gallery .image img,
		.Archive .Gallery .image video {
			width: 100%;
			height: auto;
			max-height: 90vh;
			object-fit: contain;
		}

		/* Per-image PC width patterns (override SP) */
		.Archive .Gallery .gp-1 {
			width: 60vw;
			max-width: 900px;
			margin-inline: auto;
			margin-left: auto;
		}
		.Archive .Gallery .gp-2 {
			width: 90vw;
			max-width: 1400px;
			margin-inline: auto;
			margin-left: auto;
		}
		.Archive .Gallery .gp-3 {
			width: 40vw;
			max-width: 600px;
			margin-left: 8vw;
			margin-right: auto;
		}
		.Archive .Gallery .gp-4 {
			width: 90vw;
			max-width: 1400px;
			margin-inline: auto;
			margin-left: auto;
		}
		.Archive .Gallery .gp-5 {
			width: 50vw;
			max-width: 800px;
			margin-left: auto;
			margin-right: 8vw;
		}
		.Archive .Gallery .gp-6 {
			width: 70vw;
			max-width: 1100px;
			margin-inline: auto;
			margin-left: auto;
		}
		.Archive .Gallery .gp-7 {
			width: 45vw;
			max-width: 700px;
			margin-inline: auto;
			margin-left: auto;
		}
		.Archive .Gallery .gp-8 {
			width: 90vw;
			max-width: 1400px;
			margin-inline: auto;
			margin-left: auto;
		}
		.Archive .Gallery .gp-9 {
			width: 38vw;
			max-width: 580px;
			margin-left: 8vw;
			margin-right: auto;
		}

		/* Colophon — tight info block */
		.Archive .Colophon {
			padding-top: 160px;
		}

		.Archive .Colophon .wrapper {
			max-width: 720px;
			margin-inline: auto;
			padding-inline: var(--padding);
		}

		.Archive .Colophon .row {
			grid-template-columns: 140px 1fr;
		}
	}
</style>
