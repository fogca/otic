<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const archive = $derived(data.archive);
</script>

<svelte:head>
	<title>{archive.title} — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Archive">
	<section class="Title">
		<div class="wrapper">
			<h1 class="title" lang="en">{archive.title}</h1>
			<p class="brand-tag" lang="en">/ {archive.brand}</p>
		</div>
	</section>

	<section class="Hero">
		<div class="image-wrap">
			<img src={archive.heroImage} alt={archive.title} />
		</div>
	</section>

	<section class="Body">
		<div class="wrapper">
			{#if archive.descriptionEn || archive.descriptionJa}
				<div class="captions">
					{#if archive.descriptionEn}
						<div class="caption" lang="en">
							<p>{archive.descriptionEn}</p>
						</div>
					{/if}
					{#if archive.descriptionJa}
						<div class="caption caption-ja">
							<p>{archive.descriptionJa}</p>
						</div>
					{/if}
				</div>
			{/if}

			<!-- Gallery: every uploaded image / video, in original aspect ratio.
			     Each item gets one of 9 width patterns cycled by index, taken
			     from the home Archives stream (90% / 100vw / 62.5vw / 100vw /
			     85% / 70% / 80% / 100vw / 62.5vw). When the microCMS row has
			     a pj_videos URL it renders as an autoplaying, muted, looping
			     video so the visual rhythm survives. -->
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
</main>

<style>
	.Archive {
		padding-top: 0;
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
	}

	.Archive .Title .brand-tag {
		font-size: var(--fs-h6);
		opacity: 0.6;
		text-align: right;
	}

	.Archive .Title .title {
		font-size: var(--fs-h1);
		line-height: 1.5;
		font-weight: 400;
		text-align: right;
	}

	/* ----- Body images ----- */
	.Archive .Body {
		margin-top: 40px;
	}

	.Archive .Body .wrapper {
		display: flex;
		flex-direction: column;
		gap: 60px;
	}

	.Archive .Body .image img,
	.Archive .Body .image video {
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
	.Archive .Body .gp-1 { width: 90%; margin-inline: auto; }
	.Archive .Body .gp-2,
	.Archive .Body .gp-4,
	.Archive .Body .gp-8 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Archive .Body .gp-3,
	.Archive .Body .gp-9 {
		width: 62.5vw;
		margin-inline: auto;
	}
	.Archive .Body .gp-5 { width: 85%; margin-inline: auto; }
	.Archive .Body .gp-6 { width: 70%; margin-inline: auto; }
	.Archive .Body .gp-7 { width: 80%; margin-inline: auto; }

	.Archive .Body .captions {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.Archive .Body .caption {
		padding-inline: 30px;
		max-width: 100%;
	}

	.Archive .Body .caption p {
		font-size: 10px;
		line-height: 1.7;
		white-space: pre-line;
	}

	.Archive .Body .caption[lang='en'] p {
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

		.Archive .Body .wrapper {
			gap: 80px;
		}

		.Archive .Colophon .wrapper {
			padding-inline: 40px;
		}
	}

	/* ----- Desktop ----- */
	@media (min-width: 1024px) {

		.Archive .Title {
			padding-top: 40px;
			padding-bottom: 80px;
		}

		.Archive .Title .title {
			font-size: var(--fs-h1);
		}

		.Archive .Title .brand-tag {
			font-size: var(--fs-h5);
		}

		.Archive .Body .wrapper {
			gap: 80px;
			max-width: var(--max-width);
			margin-inline: auto;
		}

		.Archive .Colophon {
			padding-top: 120px;
		}

		.Archive .Colophon .wrapper {
			max-width: 640px;
			margin-inline: auto;
			padding-inline: 40px;
		}

		.Archive .Colophon .row {
			grid-template-columns: 140px 1fr;
		}
	}
</style>
