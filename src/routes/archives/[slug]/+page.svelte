<script lang="ts">
	import { browser } from '$app/environment';
	import { onNavigate, afterNavigate } from '$app/navigation';
	import type { PageData } from './$types';
	import { imgOpt, imgSrcset, videoFrame } from '$lib/js/img';
	import { lazyVideo } from '$lib/actions/lazyVideo';
	import { footerNear } from '$lib/state/footerNear.svelte';

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
	// is portaled to <body>). Only applies when actually portaled (PC). Also
	// fades once the Footer is about to scroll into view — the fixed lead
	// would otherwise sit on top of it as it scrolls up underneath.
	$effect(() => {
		if (leadNode && leadNode.parentElement === document.body) {
			leadNode.style.opacity = leaving || footerNear.near ? '0' : '1';
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
		// PC keeps padding at 0: the block is vertically centred on the true
		// screen centre (an explicit earlier requirement) via justify-content:
		// center over the full 100dvh box — adding top padding here would
		// pull that centre down off-screen-centre. The 120px padding-top in
		// the .lead CSS rule below is therefore SP-only in practice (PC is
		// portaled out to <body> with this inline style, which wins).
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

	// Show Colophon section if there's at least one structured row or any
	// rich-text content. Brand alone doesn't count (it's auto-populated from
	// work meta, so it's present on nearly every work — showing the section
	// for just that would be noise).
	const hasColophon = $derived(
		archive.colophonBase.rows.length > 0 || !!archive.colophonBase.text
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
		{#if archive.headlineEn}
			<p class="lead__tag" lang="en">{archive.headlineEn}</p>
		{/if}
		{#if archive.headlineJa}
			<p class="lead__tag lead__tag--ja" lang="ja">{archive.headlineJa}</p>
		{/if}
		{#if archive.descriptionEn}
			<p class="lead__body" lang="en">{archive.descriptionEn}</p>
		{/if}
		{#if archive.descriptionJa}
			<p class="lead__body lead__body--ja" lang="ja">{archive.descriptionJa}</p>
		{/if}
		{#if archive.stack}
			<p class="lead__stack" lang="en">{archive.stack}</p>
		{/if}
	</div>

	<!-- RIGHT: media — hero + gallery, editorial vertical flow -->
	<div class="media">
		{#if archive.hero?.isVideo}
			<!-- Hero starts above the fold, so it loads/plays immediately —
			     lazyVideo is here for the way BACK OUT: it releases the
			     decoder + buffer once the hero scrolls far off-screen (long
			     gallery below), instead of holding them for the whole page. -->
			<div
				class="media__hero"
				style:background-image={`url(${videoFrame(archive.hero.src, 128)})`}
			>
				<video
					src={archive.hero.src}
					use:lazyVideo
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
						fetchpriority="high"
						decoding="async"
					/>
				</picture>
			</div>
		{/if}

		{#each archive.gallery as item, i (i)}
			<div
				class="media__item mp-{(i % 6) + 1}"
				style:background-image={item.isVideo ? `url(${videoFrame(item.src, 128)})` : undefined}
			>
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
						decoding="async"
					/>
				{/if}
			</div>
		{/each}
	</div>

	{#if hasColophon}
		<section class="Colophon">
			<div class="wrapper">
				<h2 class="title" lang="en">Colophon</h2>
				<div class="line" aria-hidden="true"></div>
				{#if archive.colophonBase.text}
					<div class="text" lang="en">{@html archive.colophonBase.text}</div>
				{/if}
				<dl class="rows">
					{#if archive.colophonBase.brand}
						<div class="row">
							<dt lang="en">Brand</dt>
							<dd lang="en">{archive.colophonBase.brand}</dd>
						</div>
					{/if}
					{#each archive.colophonBase.rows as row, i (i)}
						<div class="row">
							<dt lang="en">{row.label}</dt>
							<dd lang="en">
								{#if row.url}
									<a href={row.url} target="_blank" rel="noopener noreferrer"
										>{row.value || row.url}</a
									>
								{:else}
									{row.value}
								{/if}
							</dd>
						</div>
					{/each}
				</dl>
			</div>
		</section>
	{/if}
</main>

<style>
	/* Language toggle: show only the active language's tag + description body
	   (the EN project title always stays as-is). [data-lang] is on <html>
	   (an ancestor of both the in-flow and portaled lead). */
	:global([data-lang='en']) .lead__tag--ja,
	:global([data-lang='en']) .lead__body--ja {
		display: none;
	}
	:global([data-lang='ja']) .lead__tag:not(.lead__tag--ja),
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
		padding: 120px var(--padding) 0;
		max-width: 560px;
	}
	.lead__title {
		font-size: var(--fs-h0);
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
	/* "Built with" line — a small technical footnote under the body copy,
	   not a credits/colophon entry (that stays further down the page). */
	.lead__stack {
		font-size: var(--fs-h6);
		margin: 20px 0 0;
		opacity: 0.5;
	}

	/* ── Media (hero + gallery) ── */
	.media {
		display: flex;
		flex-direction: column;
		gap: 80px;
		margin-top: 48px;
	}

	/* SP: hero sits between the title/tag intro and the body copy (was:
	   hero ahead of all of .lead; before that, no reorder at all). Hero
	   (inside .media) has to interleave between two of .lead's OWN
	   children, which is only reachable once BOTH .lead and .media drop
	   their own boxes via display:contents — then everything (title, tag,
	   hero, body, stack, gallery items) becomes a flat set of siblings in
	   .Archive's flex flow that `order` can freely resequence. PC is
	   untouched: this whole block is SP-only, and .lead there is portaled
	   to <body> with its own inline layout regardless of source order.
	   Losing .lead's box also loses the padding-inline/max-width it gave
	   its children for free — restored directly on each of them below.
	   .media's own gap/margin-top go inert the same way; margin-top values
	   here rebuild that rhythm on the flattened items, reusing the same
	   three values (120/48/80) from the previous version in their new
	   roles rather than inventing new ones: 120 is the fixed-Header
	   clearance (back on the title, first again), 48 covers both
	   text-to-hero transitions (tag -> hero, and stack -> first gallery
	   item), 80 is the unchanged item-to-item gallery gap. */
	@media (max-width: 1023px) {
		.lead {
			display: contents;
		}

		.lead__title,
		.lead__tag,
		.lead__stack {
			padding-inline: var(--padding);
			max-width: 560px;
		}

		.lead__title {
			margin-top: 120px;
		}

		.media {
			display: contents;
		}

		.media__hero {
			order: 1;
			margin-top: 48px;
		}

		/* Own width/centering instead of the padding-inline/max-width the
		   other lead children get above — a narrower, auto-centered column
		   rather than an edge-padded full-width one. */
		.lead__body,
		.lead__body--ja {
			order: 2;
			margin-top: 50px;
			width: 95%;
			margin-left: auto;
			margin-right: auto;
		}

		.lead__stack {
			order: 3;
		}

		.media__item {
			order: 4;
			margin-top: 48px;
		}

		.media__item + .media__item {
			margin-top: 80px;
		}
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
	   full-bleed rhythm (mp-1..mp-6, cycling per item — see the template's
	   class="media__item mp-{(i % 6) + 1}"). mp-4/mp-6 have no override
	   here, so they fall through to the 90% base. */
	.media__hero {
		width: 100%;
		margin-inline: 0;
	}
	.media__item {
		width: 90%;
		margin-inline: auto;
	}
	/* Video items carry an inline LQIP background (a ~1KB first-frame
	   capture, set in the template) — visible whenever the <video> above it
	   has no frame to paint: before first buffer, and after lazyVideo
	   releases a scrolled-away video's src. A 128px source upscaled to the
	   box is naturally soft — reads as a blurred preview, not a gray box.
	   contain + left top mirrors the PC media rules' object-fit/-position,
	   so the placeholder sits exactly where the video frame will paint
	   (with cover, an 88vh-clamped video would show placeholder bleeding
	   beside the contained frame). On SP the box ratio equals the frame
	   ratio, where contain fills the box edge-to-edge anyway. */
	.media__hero,
	.media__item {
		background-size: contain;
		background-position: left top;
		background-repeat: no-repeat;
	}
	.media__item.mp-1 {
		width: 80%;
	}
	.media__item.mp-2 {
		width: 100vw;
	}
	.media__item.mp-5 {
		width: 100vw;
		margin-inline: 0;
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
	.Colophon .row dd a {
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	.Colophon .row dd a:hover {
		opacity: 0.6;
	}

	/* Alternative free-form rich text (richEditor HTML) — basic prose
	   rhythm; only styles what a rich editor can actually produce. */
	.Colophon .text {
		font-size: var(--fs-h5);
		line-height: 1.6;
		font-weight: var(--fw-base);
		margin-bottom: 20px;
	}
	.Colophon .text :global(p) {
		margin: 0.6em 0;
	}
	.Colophon .text :global(p:first-child) {
		margin-top: 0;
	}
	.Colophon .text :global(a) {
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	.Colophon .text :global(a:hover) {
		opacity: 0.6;
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
		   The 38% info column is left empty as its visual slot. Smaller +
		   narrower than the base/SP rule (per request — PC only). */
		.lead {
			max-width: 440px;
		}
		.lead__title {
			font-size: var(--fs-h2);
		}
		.lead__body {
			margin-top: 24px;
		}

		/* Media: uniform-width column, tight gap (was editorial-scatter
		   varied widths/offsets + a large 12vh gap). Top padding matches the
		   12px item gap for a consistent vertical rhythm; right padding
		   stays the page's standard var(--padding) edge. */
		.media {
			grid-area: media;
			margin-top: 0;
			padding: 12px var(--padding) 0 0;
			gap: 12px;
		}
		.media__hero,
		.media__item {
			width: 100%;
			margin-left: 0;
			margin-right: 0;
		}
		/* Re-assert the uniform width against the SP mp-1/2/3/5 rules above —
		   those use two classes (higher specificity) so they'd otherwise still
		   win here even though this block comes later in the cascade. */
		.media__item.mp-1,
		.media__item.mp-2,
		.media__item.mp-3,
		.media__item.mp-4,
		.media__item.mp-5,
		.media__item.mp-6 {
			width: 100%;
			margin-left: 0;
			margin-right: 0;
		}
		.media__hero img,
		.media__hero video,
		.media__item img,
		.media__item video {
			max-height: 88vh;
			object-fit: contain;
			object-position: left top;
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
