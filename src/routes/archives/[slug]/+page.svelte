<script lang="ts">
	import { browser } from '$app/environment';
	import { onNavigate, afterNavigate } from '$app/navigation';
	import type { PageData } from './$types';
	import { imgOpt, imgSrcset } from '$lib/js/img';
	import { lazyVideo } from '$lib/actions/lazyVideo';

	let { data }: { data: PageData } = $props();
	const archive = $derived(data.archive);

	// Fade the portaled (fixed) lead out while the page-shrink transition runs.
	let leaving = $state(false);
	let leadNode: HTMLElement | null = $state(null);
	onNavigate(() => {
		leaving = true;
	});
	afterNavigate(() => {
		leaving = false;
	});

	// Drive the fade via inline opacity (scoped CSS is unreliable once the node
	// is portaled to <body>). Only applies when actually portaled (PC).
	$effect(() => {
		if (leadNode && leadNode.parentElement === document.body) {
			leadNode.style.opacity = leaving ? '0' : '1';
		}
	});

	// The layout's .page-wrapper has will-change:transform → it's a containing
	// block, which breaks position:fixed/sticky for any descendant. On PC we
	// portal the lead out to <body> so it can be truly viewport-fixed (pinned +
	// vertically centred). SP keeps it in normal flow.
	const FIXED_STYLE: Record<string, string> = {
		position: 'fixed',
		top: '0',
		left: 'var(--padding)',
		width: '34vw',
		height: '100dvh',
		padding: '0',
		margin: '0',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		zIndex: '5',
		// Non-interactive text — let clicks fall through to the header nav it overlaps.
		pointerEvents: 'none',
		// Fade out during the page-shrink transition (it lives outside the scaled
		// .page-wrapper, so it can't shrink with the rest of the page).
		transition: 'opacity 0.5s var(--ease-default)'
	};
	function leadPortal(node: HTMLElement) {
		if (!browser) return;
		leadNode = node;
		const mq = window.matchMedia('(min-width: 1024px)');
		const anchor = document.createComment('lead');
		let out = false;
		const sync = () => {
			if (mq.matches && !out) {
				node.replaceWith(anchor);
				document.body.appendChild(node);
				Object.assign(node.style, FIXED_STYLE);
				out = true;
			} else if (!mq.matches && out) {
				node.removeAttribute('style');
				anchor.replaceWith(node);
				out = false;
			}
		};
		sync();
		mq.addEventListener('change', sync);
		return {
			destroy() {
				leadNode = null;
				mq.removeEventListener('change', sync);
				if (out) node.remove();
			}
		};
	}

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
	<!-- LEFT: project title + descriptions (PC: portaled to a fixed,
	     vertically-centred left rail; SP: normal flow) -->
	<div class="lead" use:leadPortal>
		<h1 class="lead__title" lang="en">{archive.title}</h1>
		{#if archive.headline}
			<p class="lead__tag" lang="ja">{archive.headline}</p>
		{/if}
		{#if archive.descriptionEn}
			<p class="lead__body" lang="en">{archive.descriptionEn}</p>
		{/if}
		{#if archive.descriptionJa}
			<p class="lead__body lead__body--ja" lang="ja">{archive.descriptionJa}</p>
		{/if}
	</div>

	<!-- RIGHT: media — hero + gallery, editorial vertical flow -->
	<div class="media">
		{#if archive.hero?.isVideo}
			<!-- Hero is always above the fold — load eagerly, no intersection gate. -->
			<div class="media__hero">
				<video
					src={archive.hero.src}
					autoplay
					loop
					muted
					playsinline
					preload="auto"
					aria-label={archive.title}
				></video>
			</div>
		{:else if archive.hero}
			<div class="media__hero">
				<picture>
					{#if archive.heroImageSp}
						<source
							media="(max-width: 1023px)"
							srcset={imgSrcset(archive.heroImageSp, [640, 900, 1200])}
							sizes="100vw"
						/>
					{/if}
					<img
						src={imgOpt(archive.hero.src, 1600)}
						srcset={imgSrcset(archive.hero.src, [900, 1400, 2000])}
						sizes="(min-width: 1024px) 60vw, 100vw"
						alt={archive.title}
					/>
				</picture>
			</div>
		{/if}

		{#each archive.gallery as item, i (i)}
			<div class="media__item mp-{(i % 6) + 1}">
				{#if item.isVideo}
					<video
						src={item.src}
						use:lazyVideo
						loop
						muted
						playsinline
						preload="metadata"
						aria-label={`${archive.title} ${i + 1}`}
					></video>
				{:else}
					<img
						src={imgOpt(item.src, 1600)}
						srcset={imgSrcset(item.src, [800, 1200, 1600, 2000])}
						sizes="(min-width: 1024px) 50vw, 100vw"
						alt={`${archive.title} ${i + 1}`}
						loading="lazy"
					/>
				{/if}
			</div>
		{/each}
	</div>

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
	/* Language toggle: show only the active language's description body. The EN
	   project title + tagline stay in both. [data-lang] is on <html> (an
	   ancestor of both the in-flow and portaled lead). */
	:global([data-lang='en']) .lead__body--ja {
		display: none;
	}
	:global([data-lang='ja']) .lead__body:not(.lead__body--ja) {
		display: none;
	}

	.Archive {
		color: #000;
		display: flex;
		flex-direction: column;
	}
	/* base.css sets color directly on text elements — override to black here. */
	.Archive :global(*) {
		color: #000;
	}

	/* ── Lead (title + descriptions) ── */
	.lead {
		padding: 88px var(--padding) 0;
		max-width: 560px;
	}
	.lead__title {
		font-size: var(--fs-h4); /* 20px PC — compact project label */
		line-height: 1.25;
		font-weight: var(--fw-base);
		margin: 0;
	}
	.lead__tag {
		font-size: var(--fs-h6);
		margin: 8px 0 0;
		opacity: 0.6;
	}
	.lead__body {
		/* Typography (size/line-height) comes from the base.css p:lang(en|ja)
		   presets — no per-element overrides. */
		margin: 20px 0 0;
		white-space: pre-line;
	}
	.lead__body--ja {
		margin-top: 14px;
	}

	/* ── Media (hero + gallery) ── */
	.media {
		display: flex;
		flex-direction: column;
		gap: 48px;
		margin-top: 48px;
	}
	.media__hero img,
	.media__hero video,
	.media__item img,
	.media__item video {
		width: 100%;
		height: auto;
		object-fit: initial;
		display: block;
	}

	/* SP: hero full-width; gallery thumbnails keep their centred-narrow /
	   full-bleed rhythm. */
	.media__hero {
		width: 100%;
		margin-inline: 0;
	}
	.media__item {
		width: 90%;
		margin-inline: auto;
	}
	.media__item.mp-2 {
		width: 100vw;
	}
	.media__item.mp-5 {
		width: 100vw;
		margin-inline: calc(-1 * var(--padding));
	}
	.media__item.mp-3 {
		width: 70%;
	}

	/* ── Colophon ── */
	.Colophon {
		padding-top: 80px;
	}
	.Colophon .wrapper {
		padding-inline: 30px;
	}
	.Colophon .title {
		font-size: var(--fs-h4);
		font-weight: var(--fw-medium);
		margin-bottom: 28px;
	}
	.Colophon .line {
		height: 1px;
		background: var(--color-text);
		margin-bottom: 12px;
	}
	.Colophon .rows {
		display: flex;
		flex-direction: column;
	}
	.Colophon .row {
		display: grid;
		grid-template-columns: 90px 1fr;
		gap: 8px;
		padding-block: 4px;
	}
	.Colophon .row dt,
	.Colophon .row dd {
		font-size: var(--fs-h5);
		line-height: 24px;
		font-weight: var(--fw-base);
	}

	/* ──────────────────────────────────────────────────────────────
	   Desktop: left lead rail + right editorial media column
	   ────────────────────────────────────────────────────────────── */
	@media (min-width: 1024px) {
		.Archive {
			display: grid;
			grid-template-columns: 38% 62%;
			grid-template-areas:
				'info media'
				'colophon colophon';
			column-gap: 2vw;
		}

		/* Lead is portaled to <body> and positioned fixed by leadPortal()
		   (see the action — .page-wrapper's transform blocks fixed otherwise).
		   The 38% info column is left empty as its visual slot. */
		.lead__body {
			margin-top: 24px;
		}

		/* Media: editorial vertical flow within the right column */
		.media {
			grid-area: media;
			margin-top: 0;
			padding: 25px var(--padding) 0 0;
			gap: 12vh;
		}
		.media__hero,
		.media__item {
			width: auto;
			margin-inline: 0;
		}
		.media__hero img,
		.media__hero video,
		.media__item img,
		.media__item video {
			max-height: 88vh;
			object-fit: contain;
			object-position: left top;
		}

		/* Varied widths / offsets — editorial scatter inside the column */
		.media__hero {
			width: 82%;
			margin-left: auto; /* hero bleeds toward the right edge */
		}
		.media__item.mp-1 {
			width: 58%;
			margin-left: 0;
		}
		.media__item.mp-2 {
			width: 80%;
			margin-left: auto;
		}
		.media__item.mp-3 {
			width: 48%;
			margin-left: 16%;
		}
		.media__item.mp-4 {
			width: 72%;
			margin-left: auto;
		}
		.media__item.mp-5 {
			width: 54%;
			margin-left: 6%;
		}
		.media__item.mp-6 {
			width: 76%;
			margin-left: auto;
		}

		/* Colophon — tight info block, left-aligned under the lead */
		.Colophon {
			grid-area: colophon;
			padding-top: 160px;
		}
		.Colophon .wrapper {
			max-width: 720px;
			margin-inline: 0;
			padding-inline: var(--padding);
		}
		.Colophon .row {
			grid-template-columns: 140px 1fr;
		}
	}
</style>
