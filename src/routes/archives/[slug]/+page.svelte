<script lang="ts">
	import type { PageData } from './$types';
	import { imgOpt, imgSrcset, videoFrame } from '$lib/js/img';
	import { lazyVideo } from '$lib/actions/lazyVideo';

	let { data }: { data: PageData } = $props();
	const archive = $derived(data.archive);
	const nextWorks = $derived(data.nextWorks);

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
	<!-- title + descriptions — same linear flow on every viewport (see the
	     display:contents + order block in <style> below for how this
	     interleaves with .media's hero/gallery). -->
	<div class="lead">
		<h1 class="lead__title" lang="en">{archive.title}</h1>
		{#if archive.headlineEn}
			<p class="lead__tag" lang="en">{archive.headlineEn}</p>
		{/if}
		{#if archive.headlineJa}
			<p class="lead__tag lead__tag--ja" lang="ja">{archive.headlineJa}</p>
		{/if}
		{#if archive.scope.length > 0}
			<p class="lead__scope" lang="en">{archive.scope.join(' / ')}</p>
		{/if}
		{#if archive.year}
			<p class="lead__year" lang="en">{archive.year}</p>
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

	<!-- media — hero + gallery, editorial vertical flow -->
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
					{#if archive.heroImagePc}
						<!-- Optional horizontal PC-specific crop — for works whose
						     main_visual is portrait, which reads too narrow now that
						     PC runs the same full-width flow as SP. Falls back to the
						     regular hero below when unset. -->
						<source
							media="(min-width: 1024px)"
							srcset={imgSrcset(archive.heroImagePc, [900, 1400, 2000])}
							sizes="100vw"
						/>
					{/if}
					<img
						src={imgOpt(archive.hero.src, 1600)}
						srcset={imgSrcset(archive.hero.src, [900, 1400, 2000])}
						sizes="100vw"
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
						aria-label={item.caption || `${archive.title} ${i + 1}`}
					></video>
				{:else}
					<img
						src={imgOpt(item.src, 1600)}
						srcset={imgSrcset(item.src, [800, 1200, 1600, 2000])}
						sizes="100vw"
						alt={item.caption || `${archive.title} ${i + 1}`}
						loading="lazy"
						decoding="async"
					/>
				{/if}
				{#if item.caption}
					<p class="media__caption">{item.caption}</p>
				{/if}
			</div>
		{/each}
	</div>

	{#if hasColophon}
		<hr class="divider divider--colophon" />
		<section class="Colophon">
			<div class="wrapper">
				<h2 class="title" lang="en">Colophon</h2>
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

	{#if nextWorks.length > 0}
		<!-- is-first: no Colophon above it, so this divider takes over the
		     "gap from the gallery" role Colophon's own divider normally has
		     (see .divider--next.is-first below). -->
		<hr class="divider divider--next" class:is-first={!hasColophon} />
		<section class="Next">
			<div class="wrapper">
				<h2 class="title" lang="en">Next</h2>
				<div class="next-grid">
					{#each nextWorks as item (item.slug)}
						<a class="next-item" href="/archives/{item.slug}">
							{#if item.visual?.isVideo}
								<video
									src={item.visual.src}
									autoplay
									loop
									muted
									playsinline
									aria-label={item.title}
								></video>
							{:else if item.visual}
								<img
									src={imgOpt(item.visual.src, 800)}
									srcset={imgSrcset(item.visual.src, [400, 600, 800, 1200])}
									sizes="(min-width: 1024px) 20vw, 90vw"
									alt={item.title}
									loading="lazy"
									decoding="async"
								/>
							{/if}
							<span class="next-item__title" lang="en">{item.title}</span>
						</a>
					{/each}
				</div>
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

	/* Plain horizontal rule marking a section break (before Colophon, and
	   before Next) — literal px height rather than a border, so it renders
	   at exactly 0.5px instead of snapping to the nearest 1px some browsers
	   apply to hairline borders. No margin here — both breakpoints set their
	   own margin-top explicitly below (this rule must stay ahead of those in
	   the cascade, or an equal-specificity margin:0 here would win instead). */
	.divider {
		width: 100%;
		height: 0.5px;
		background: #ccc;
		border: none;
		margin: 0;
	}

	/* ── Lead (title + descriptions) ── */
	.lead__title {
		font-size: var(--fs-h0);
		line-height: 1.25;
		font-weight: var(--fw-base);
		margin: 0;
	}
	.lead__tag {
		font-size: var(--fs-h4);
		margin: 8px 0 0;
		opacity: 1;
	}
	/* Selected `scope` values (V.I. / Product / ...) — same small, muted
	   treatment as .lead__stack below, not the tag's own opacity:1. */
	.lead__scope {
		font-size: var(--fs-h6);
		margin: 8px 0 0;
		opacity: 0.5;
	}
	/* Free-form year/status (e.g. "2026", "on-going") — same small, muted
	   treatment as .lead__scope directly above it. */
	.lead__year {
		font-size: var(--fs-h6);
		margin: 8px 0 0;
		opacity: 0.5;
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

	/* Hero sits between the title/tag intro and the body copy, same order on
	   every viewport (was SP-only; PC used to portal .lead out to a fixed
	   sidebar instead — see git history). Hero (inside .media) has to
	   interleave between two of .lead's OWN children, which is only
	   reachable once BOTH .lead and .media drop their own boxes via
	   display:contents — then everything (title, tag, hero, body, stack,
	   gallery items) becomes a flat set of siblings in .Archive's flex flow
	   that `order` can freely resequence. Losing .lead's box also loses the
	   padding-inline/max-width it gave its children for free — restored
	   directly on each of them below. .media's own gap/margin-top go inert
	   the same way; margin-top values here rebuild that rhythm on the
	   flattened items: 120 is the fixed-Header clearance (on the title,
	   first again), 48 covers both text-to-hero transitions (tag -> hero,
	   and stack -> first gallery item), 80 is the item-to-item gallery gap.
	   PC-specific sizing (wider max-widths, taller image cap) lives in the
	   min-width:1024px block further down — this block only owns order. */
	.lead {
		display: contents;
	}

	.lead__title,
	.lead__tag,
	.lead__scope,
	.lead__year,
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
		width: 85%;
		margin-left: auto;
		margin-right: auto;
		text-align: justify;
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

	/* Colophon/Next are separate top-level sections (not flattened into
	   .Archive like .lead/.media above), but they're still direct flex
	   children of the same .Archive flex column — without an explicit
	   order they default to 0, same as title/tag, and render up near
	   the TOP of the page instead of after the gallery. */
	.divider--colophon {
		order: 5;
		margin-top: 80px;
	}
	.Colophon {
		order: 6;
	}
	.divider--next {
		order: 7;
		margin-top: 48px;
	}
	/* No Colophon above it — this divider is the first thing after the
	   gallery instead, so it takes over Colophon's own gap value rather
	   than the (different) gap it'd normally have between two sections. */
	.divider--next.is-first {
		margin-top: 80px;
	}
	.Next {
		order: 8;
	}
	/* Server fetches up to 4 (PC's range); SP only wants 2 — hide rather
	   than fetch a separate shorter list for the same page. PC still shows
	   everything fetched (see next-grid flex-direction in the PC block). */
	@media (max-width: 1023px) {
		.next-item:nth-child(n + 3) {
			display: none;
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

	/* Hero full-width; gallery thumbnails keep their centred-narrow /
	   full-bleed rhythm (mp-1..mp-6, cycling per item — see the template's
	   class="media__item mp-{(i % 6) + 1}"), same on every viewport now —
	   this used to be SP-only, PC forced everything to a uniform 100% (see
	   git history). mp-4/mp-6 have no override here, so they fall through
	   to the 90% base. */
	.media__hero {
		width: 100%;
		margin-inline: 0;
	}
	.media__item {
		width: 90%;
		margin-inline: auto;
	}
	/* Per-image caption (pj_images_title) — only when the CMS row actually
	   has one set, small and unobtrusive rather than a full credit line. */
	.media__caption {
		margin: 8px 0 0;
		font-size: var(--fs-h6);
		opacity: 0.5;
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
		padding-top: 60px;
		padding-bottom: 40px;
	}
	.Colophon .title,
	.Next .title {
		font-size: var(--fs-h1);
		font-weight: var(--fw-medium);
		margin-bottom: 28px;
	}
	.Colophon .title,
	.Next .title {
		text-transform: uppercase;
	}
	.Colophon .rows {
		display: flex;
		flex-direction: column;
	}
	/* Label above value, not side-by-side — every row (and the free-form
	   .text above, its own " / " separators swapped for <br> server-side)
	   now reads as one item per line. */
	.Colophon .row {
		display: flex;
		flex-direction: column;
		gap: 2px;
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

	/* ── Next (a few related works, ranked by shared `scope` — see
	   +page.server.ts) — same padding-top/bottom + no wrapper padding as
	   Colophon above (only its own divider's margin-top differs). ── */
	.Next {
		padding-top: 40px;
		padding-bottom: 80px;
	}
	.next-grid {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.next-item {
		display: block;
		text-decoration: none;
	}
	/* Natural aspect ratio, not force-cropped to a fixed box — each card's
	   height varies with its own image/video. */
	.next-item img,
	.next-item video {
		width: 100%;
		height: auto;
		display: block;
	}

	/* SP: capped height instead of natural-everything (PC still gets that) —
	   an unusually tall/portrait pick could otherwise run the section on
	   forever. Placed after the base rule above so this width:auto wins over
	   its width:100% at equal specificity (source-order cascade) — without
	   that ordering, width stays forced to 100% while max-height clips it,
	   squishing the image instead of narrowing it. width/height:auto (not
	   object-fit) is what actually does the work: bounded only by
	   max-height, the image's own box narrows to whatever its intrinsic
	   ratio needs, so there's no crop and no letterboxing to ask object-fit
	   to resolve — it'd be inert with no fixed box to fit against.
	   margin-inline:auto centers the now-narrower-than-100% image within
	   the card. */
	@media (max-width: 1023px) {
		.next-item img,
		.next-item video {
			width: auto;
			max-width: 100%;
			height: auto;
			max-height: 50vh;
			margin-inline: auto;
		}
	}
	.next-item__title {
		display: block;
		margin-top: 8px;
		font-size: var(--fs-h5);
		font-weight: var(--fw-base);
	}

	/* ──────────────────────────────────────────────────────────────
	   Desktop: same linear flow as SP (see the order block above) — this
	   block only widens the text columns and raises the gallery's height
	   cap for the larger canvas. No grid, no fixed sidebar (see git history
	   for the old portaled-left-rail layout).
	   ────────────────────────────────────────────────────────────── */
	@media (min-width: 1024px) {
		.lead__title,
		.lead__tag,
		.lead__scope,
		.lead__year,
		.lead__stack {
			max-width: 720px;
		}

		.lead__body,
		.lead__body--ja {
			max-width: 640px;
		}

		.media__hero img,
		.media__hero video {
			max-height: 88vh;
			object-fit: contain;
			object-position: left top;
		}
		/* Gallery gets a taller cap than the hero — an unusually tall/portrait
		   pick can run closer to the viewport height before it starts looking
		   cropped-feeling against its neighbours. */
		.media__item img,
		.media__item video {
			max-height: 110vh;
			object-fit: contain;
			object-position: left top;
		}

		/* Every media box shares one centre axis on PC — only its WIDTH
		   varies (70/80/90/100%, cycling via mp-1..mp-6). mp-2/mp-5 are
		   100vw + margin-inline:0 in the base/SP rules (a deliberate
		   edge-to-edge break on mobile) — on PC that reads as the gallery
		   swaying left/right between flush-left and centred items instead of
		   a consistent rhythm, so both are re-centred here to 100% width
		   (same as the hero) with auto margins. hero itself already centres
		   trivially at width:100% (no leftover space for auto margins to
		   distribute either way) but margin-inline:auto is set explicitly
		   anyway so it stays correct if that width ever changes. */
		.media__hero {
			margin-inline: auto;
		}
		.media__item.mp-2,
		.media__item.mp-5 {
			width: 100%;
			margin-inline: auto;
		}

		/* Colophon/Next — same left-aligned width, no wrapper padding. */
		.Colophon .wrapper,
		.Next .wrapper {
			max-width: 720px;
			margin-inline: 0;
		}

		/* Next — cards run in a row instead of SP's stack. */
		.next-grid {
			flex-direction: row;
		}
	}
</style>
