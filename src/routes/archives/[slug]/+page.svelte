<script lang="ts">
	import type { PageData } from './$types';
	import { imgOpt, imgSrcset, videoFrame, videoOpt } from '$lib/js/img';
	import { lazyVideo } from '$lib/actions/lazyVideo';

	let { data }: { data: PageData } = $props();
	const archive = $derived(data.archive);
	const nextWorks = $derived(data.nextWorks);

	// Show Colophon section if there's at least one row. Brand alone doesn't
	// count (it's auto-populated from work meta, so it's present on nearly
	// every work — showing the section for just that would be noise).
	const hasColophon = $derived(archive.colophonBase.rows.length > 0);

	// Video rows' w/h for the gallery's --ar (see the .media__item width
	// rules): images get it server-side from CMS dims, but videos only
	// reveal theirs from their own metadata. Keyed by gallery index.
	let videoAspects = $state<Record<number, number>>({});

	// Action, not a plain onloadedmetadata prop: markup ships src +
	// preload="metadata", so the browser often has the metadata BEFORE
	// hydration attaches any listener — the event is already gone by then
	// (confirmed live: a bare handler never fired). An action can check the
	// current readyState at mount and only fall back to the event when the
	// metadata genuinely hasn't arrived yet.
	function videoAspect(node: HTMLVideoElement, report: (ar: number) => void) {
		const send = () => {
			if (node.videoWidth && node.videoHeight) report(node.videoWidth / node.videoHeight);
		};
		if (node.readyState >= HTMLMediaElement.HAVE_METADATA) send();
		else node.addEventListener('loadedmetadata', send, { once: true });
		return {
			destroy() {
				node.removeEventListener('loadedmetadata', send);
			}
		};
	}
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
						     regular hero below when unset. Top tier (3840) covers
						     24"+/5K desktops at full-bleed (sizes=100vw); fit=max in
						     imgOpt caps at the source's own resolution, so this is
						     free when the CMS asset itself is smaller. -->
						<source
							media="(min-width: 1024px)"
							srcset={imgSrcset(archive.heroImagePc, [900, 1400, 2000, 2800, 3840])}
							sizes="100vw"
						/>
					{/if}
					<img
						src={imgOpt(archive.hero.src, 1600)}
						srcset={imgSrcset(archive.hero.src, [640, 900, 1400, 2000, 2800, 3840])}
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
				style:--ar={item.aspect ?? videoAspects[i]}
			>
				{#if item.isVideo}
					<!-- .vclip: overscan crop against the iOS media-layer edge line —
					     the caption shares .media__item, so the item box can't be the
					     clipper (a scaled video would leak past its own bottom edge
					     into the caption gap unclipped). This box hugs the video. -->
					<div class="vclip">
						<video
							src={item.src}
							use:lazyVideo
							loop
							muted
							playsinline
							preload="metadata"
							aria-label={item.caption || `${archive.title} ${i + 1}`}
							use:videoAspect={(ar) => (videoAspects[i] = ar)}
						></video>
					</div>
				{:else}
					<img
						src={imgOpt(item.src, 1600)}
						srcset={imgSrcset(item.src, [800, 1200, 1600, 2000, 2800, 3840])}
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
								{:else if row.html}
									<!-- colophon_text rows may carry an editor-authored inline
									     <a> (see +page.server.ts) — trusted CMS content, not
									     user input. -->
									{@html row.value}
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
				<!-- The <br> is SP-only (display:none on PC — see .br-sp below),
				     so PC keeps this on one line. -->
				<h2 class="title" lang="en">Next in<br class="br-sp" /> Archives</h2>
				<div class="next-grid">
					{#each nextWorks as item (item.slug)}
						<a class="next-item" href="/archives/{item.slug}">
							{#if item.visual?.isVideo}
								<!-- lazyVideo (not autoplay): plays only near the viewport and
								     fully releases (src detach) when scrolled away — same as the
								     gallery above. Also inert for SP's display:none 3rd/4th items:
								     a display:none element never intersects, so those never load
								     past the initial metadata fetch (autoplay used to fully load
								     and play them invisibly). -->
								<div class="vclip">
									<video
										src={videoOpt(item.visual.src)}
										use:lazyVideo
										loop
										muted
										playsinline
										preload="metadata"
										aria-label={item.title}
									></video>
								</div>
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
		font-size: var(--fs-h3);
		margin: 8px 0 0;
		opacity: 1;
		/* Lets a literal "?" in the description field (see splitTag in
		   +page.server.ts) act as a manual line break, same technique
		   .lead__body already uses for body_jp/body_en. */
		white-space: pre-line;
	}
	/* base.css's generic p:lang(ja) rule falls back to --lh-ja (1.8, tuned
	   for body copy) — too loose now that .lead__tag sits at heading size
	   (fs-h3). --lh-h-ja (1.6) is the existing "JP heading/lead" token,
	   already used by office/+page.svelte's .panel-lead--ja for the same
	   reason, so this reuses it rather than hardcoding a new value. */
	.lead__tag--ja {
		line-height: var(--lh-h-ja);
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
		/* Half a px over the p:lang(ja) preset (--fs-p-ja, 11.5px) — SP
		   only in effect: the PC block later overrides both bodies to 14px
		   (same scoped specificity, later in source). */
		font-size: 12px;
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
		margin-top: 150px;
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
	}
	/* EN ragged-left, not justified — justify's stretched word-spacing reads
	   worse in Latin text than in JP (where justify just closes up/spreads
	   character gaps, no word-spacing involved). JA keeps justify below;
	   .lead__body--ja is declared after .lead__body so it wins on the JA
	   element, which carries both classes. */
	.lead__body {
		text-align: left;
	}
	.lead__body--ja {
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

	/* Edge sliver guard. A <video> box is sized width x (videoHeight/videoWidth),
	   which is essentially never a whole number of device pixels, while the
	   decoded frame is rasterised to whole pixels — so a ~1px line of whatever
	   is painted BEHIND the element can show along an edge (measured here:
	   414 x 109.4375px boxes). base.css gives every video a light
	   background-color as a floor; these two carry a first-frame LQIP on the
	   wrapper (videoFrame(), see the template), so inherit it onto the element
	   itself. The sliver then matches that video's own artwork instead of just
	   being "light" — which is what makes it work for dark or saturated pieces
	   (e.g. the red Andersen clips) as well as the near-white one/etc ones. */
	.media__hero video,
	.media__item video {
		background-image: inherit;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	/* ...and the same guard on the WRAPPER, because the two engines fill that
	   sliver from different places (measured, same page, same clip):
	     WebKit  — paints the <video> element's own background under the frame,
	               so the rule above is what covers it.
	     Blink   — does NOT; the video layer replaces the element box, so the
	               sliver falls through to whatever ANCESTOR painted last.
	   Relying on a distant ancestor is fragile: on this page that is
	   .page-wrapper (white), but it fades during a route change and exposes
	   .transition-bg, which is black. Painting the immediate wrapper keeps a
	   light surface directly behind the video at all times, in both engines. */
	.media__hero,
	.media__item {
		background-color: var(--color-bg);
	}

	/* On-device iOS hairline (rdar://35158514, see base.css): the media layer
	   draws its own ~1px dark edge — behind-the-element backgrounds (the two
	   guards above) can't cover it. Countermeasure: overscan the video ~2%
	   inside a rectangular overflow-clipped box, so the poisoned edge sits
	   outside the visible rect and the crop lands on artwork-margin pixels
	   (both reference clips measure >=6% background margin — nothing lost).
	   The hero box holds only the video, so it clips itself; gallery/Next
	   videos get a dedicated .vclip (their boxes also hold captions/titles).
	   isolation: rect clips of composited video layers are reliable in
	   WebKit, but a stacking context on the clipper is the documented
	   belt-and-braces for clipping hosted layers. */
	.media__hero {
		overflow: clip;
		isolation: isolate;
	}
	.media__hero video {
		transform: scale(1.02);
	}
	.vclip {
		overflow: clip;
		isolation: isolate;
		/* Keep the LQIP inheritance chain intact: .media__item (inline LQIP)
		   -> .vclip -> video's own background-image: inherit. */
		background-image: inherit;
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}
	.vclip video {
		transform: scale(1.02);
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
	   contain + center top mirrors the PC media rules' object-fit/-position,
	   so the placeholder sits exactly where the video frame will paint
	   (with cover, an 88vh-clamped video would show placeholder bleeding
	   beside the contained frame). On SP the box ratio equals the frame
	   ratio, where contain fills the box edge-to-edge anyway, so the exact
	   position doesn't matter there. */
	.media__hero,
	.media__item {
		background-size: contain;
		background-position: center top;
		background-repeat: no-repeat;
	}
	.media__item.mp-1 {
		width: 80%;
	}
	/* 100% (of .Archive, which itself has no inline padding to subtract),
	   not 100vw — width:100vw is wider than the visible viewport by
	   whatever scrollbar gutter the browser reserves, and margin:auto can't
	   symmetrically centre an element that's already wider than its own
	   container. 100% reaches the same true edge-to-edge look without that
	   overflow, and still centres correctly via .media__item's own base
	   margin-inline:auto. */
	.media__item.mp-2,
	.media__item.mp-5 {
		width: 100%;
	}
	.media__item.mp-3 {
		width: 70%;
	}

	/* ── Colophon ── */
	.Colophon {
		padding-top: 60px;
		padding-bottom: 40px;
	}
	.Colophon .title {
		font-size: var(--fs-h1);
		font-weight: var(--fw-medium);
		margin-bottom: 28px;
	}
	.Next .title {
		font-size: 42px;
		font-weight: var(--fw-base);
		line-height: var(--lh-h0);
		margin-bottom: 28px;
	}
	/* SP-only break — display:none on a <br> suppresses it, so PC keeps
	   "NEXT IN ARCHIVES" on one line. Same technique as
	   ArchivesTitleBar's own title. */
	.Next .title .br-sp {
		display: none;
	}
	@media (max-width: 1023px) {
		.Next .title .br-sp {
			display: inline;
		}
	}
	.Colophon .title,
	.Next .title {
		text-transform: uppercase;
	}
	/* Table-like rows — label left, value right, each row divided by a
	   hairline (border-top) with one closing line under the last row. */
	.Colophon .rows {
		display: flex;
		flex-direction: column;
		border-bottom: 0.5px solid #ccc;
	}
	.Colophon .row {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 24px;
		padding-block: 14px;
		border-top: 0.5px solid #ccc;
	}
	.Colophon .row dt,
	.Colophon .row dd {
		font-size: var(--fs-h5);
		line-height: 24px;
		font-weight: var(--fw-base);
	}
	.Colophon .row dt {
		font-weight: var(--fw-medium);
		flex-shrink: 0;
	}
	.Colophon .row dd {
		text-align: right;
		/* Supports a multi-line value (e.g. several names, one per row) via
		   a literal newline in the CMS field. */
		white-space: pre-line;
	}
	.Colophon .row dd a {
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	.Colophon .row dd a:hover {
		opacity: 0.6;
	}

	/* ── Next (a few related works, ranked by shared `scope` — see
	   +page.server.ts) — same padding-top/bottom + no wrapper padding as
	   Colophon above (only its own divider's margin-top differs). ── */
	.Next {
		padding-top: 80px;
		padding-bottom: 0;
	}
	.next-grid {
		display: flex;
		flex-direction: column;
		gap: 60px;
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

	/* SP Next media used to carry a max-height:50vh cap, plus the
	   width:auto/margin-inline:auto shrink-wrap (and a matching
	   width:fit-content on .vclip) that existed only so a capped image
	   narrowed instead of squishing. Cap dropped, so all of that machinery
	   went with it — the base rule above (width:100%, height:auto) now
	   applies at every breakpoint: full card width, natural height. */
	@media (max-width: 1023px) {
		/* Tighter than the base 48px — SP only, PC keeps the wider gap. */
		.media__hero {
			margin-top: 30px;
		}

		/* Two visible cards at different scales (100vw then 75vw) rather than
		   a uniform stack — the first reads as the primary suggestion, the
		   second as a lesser one.

		   Only the MEDIA breaks out to full bleed, not the whole card: the
		   .wrapper carries the page's inline padding, so a negative margin on
		   .next-item would drag its caption to the screen edge too, out of
		   line with every other text on the page. max-width:none is belt-and-
		   braces now that the SP cap above is gone (nothing constrains these
		   to 100% anymore) — kept so a future max-width can't silently
		   cancel the negative margin. */
		.next-item:first-child .vclip,
		.next-item:first-child > img {
			width: 100vw;
			max-width: none;
			margin-inline: calc(var(--padding) * -1);
		}
		.next-item:first-child .vclip video {
			width: 100%;
			max-width: none;
		}
		.next-item:nth-child(2) {
			width: 75vw;
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
		/* Slug-specific wider side margin (var(--padding) is the shared
		   site-wide token — tripling it locally here, not the token itself,
		   keeps every other page's padding untouched). */
		.lead__title,
		.lead__tag,
		.lead__scope,
		.lead__year,
		.lead__stack {
			padding-inline: calc(var(--padding) * 3);
			max-width: 720px;
		}

		.lead__title {
			/* font-size intentionally not overridden here — matches SP's
			   --fs-h0 (32px) again instead of the previous 44px PC bump. */
			/* Viewport-relative (not the base rule's fixed 120px fixed-header
			   clearance) — scales the hero gap with the taller PC canvas. */
			margin-top: 20vh;
		}
		.lead__tag {
			/* Between h4 (20px, too big) and h5 (16px, too small) — no token
			   lands on the midpoint, so an explicit literal here. */
			font-size: 18px;
		}

		.lead__body,
		.lead__body--ja {
			max-width: 640px;
			margin-top: 100px;
			/* Explicit literal px per request — none of the PC-tier tokens
			   land on exactly 14px (h4:20/h5:16/h6:13.5). */
			font-size: 14px;
		}

		/* object-position:center (not left) — a portrait image capped by
		   max-height shrinks narrower than its box, and center keeps that
		   narrower render on the same centre axis as everything else. left
		   was a leftover from the old lead-rail/right-column layout, where
		   media sat in its own right-hand strip and flush-left made sense
		   there — stale since the whole page unified onto one centre axis. */
		.media__hero img,
		.media__hero video {
			max-height: 125vh;
			object-fit: contain;
			object-position: center top;
		}
		/* Gallery gets a taller cap than the hero — an unusually tall/portrait
		   pick can run closer to the viewport height before it starts looking
		   cropped-feeling against its neighbours. */
		.media__item img,
		.media__item video {
			max-height: 110vh;
			object-fit: contain;
			object-position: center top;
		}

		/* Every media box shares one centre axis, on every viewport — only
		   its WIDTH varies (70/80/90/100%, cycling via mp-1..mp-6; see the
		   base .media__item/.mp-* rules — mp-2/mp-5 use 100%, not 100vw, for
		   exactly this reason). hero centres trivially at width:100% (no
		   leftover space for auto margins to distribute either way) but
		   margin-inline:auto is set explicitly anyway so it stays correct if
		   that width ever changes. */
		.media__hero {
			margin-inline: auto;
		}
		/* PC-only: 10 points narrower across the board than the SP/base cycle
		   above, except the 100% (mp-2/mp-5) ones — the wider PC canvas made
		   the random-width rhythm read a bit too big. .media__item itself is
		   also the mp-4/mp-6 fallback, so this covers those two as well.
		   margin-top is the clearance above the first gallery item (below the
		   hero/body) — separate from the item-to-item rule just below.

		   Each width is min(the cycle's %, the width the image actually
		   renders at under the img rule's max-height:110vh cap below —
		   110vh × the row's own w/h ratio, --ar, set inline from the CMS
		   dims). Without the min(), a capped portrait image renders narrower
		   than its box and in-box content (.media__caption) sits at the BOX
		   edge, visibly left of the image itself. Shrinking the box to the
		   rendered width keeps caption and image on the same left edge.
		   Video rows carry no --ar (no server-side dims) — the 9999
		   fallback makes the vh term huge so min() picks the % as before. */
		.media__item {
			width: min(80%, calc(110vh * var(--ar, 9999)));
			margin-top: 100px;
		}
		.media__item.mp-1 {
			width: min(70%, calc(110vh * var(--ar, 9999)));
		}
		.media__item.mp-3 {
			width: min(60%, calc(110vh * var(--ar, 9999)));
		}
		/* mp-2/mp-5 — PC drops base's true edge-to-edge 100%: the "full
		   bleed" step of the cycle still reads full-width, but inset by the
		   standard page padding on each side (margin-inline:auto centres the
		   narrower box). Same rendered-width cap as the others so their
		   captions align too. SP keeps the real edge-to-edge look. */
		.media__item.mp-2,
		.media__item.mp-5 {
			width: min(calc(100% - var(--padding) * 2), calc(110vh * var(--ar, 9999)));
		}
		/* A bit more breathing room between gallery items than SP's 80px —
		   the larger canvas can take it. */
		.media__item + .media__item {
			margin-top: 120px;
		}

		/* Colophon/Next — same left-aligned width, no wrapper padding. */
		.Colophon .wrapper,
		.Next .wrapper {
			max-width: 720px;
			margin-inline: 0;
		}

		/* Next — cards run in a row instead of SP's stack. Fixed 1/3-width
		   basis (not flex-grow-to-fill) means 3 cards land at ~100% of the
		   wrapper and a 4th (flex-shrink:0) overflows past it rather than
		   all four squeezing down to fit — a peek that hints there's more. */
		.next-grid {
			flex-direction: row;
		}
		.next-item {
			flex: 0 0 calc((100% - 48px) / 3);
		}
	}
</style>
