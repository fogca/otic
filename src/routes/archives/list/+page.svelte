<script lang="ts">
	import { padNumber } from '$lib/js/format';
	import ArchivesTitleBar from '$lib/components/ArchivesTitleBar.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Archives — List — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Archives">
	<ArchivesTitleBar active="text" />

	<section class="List">
		<div class="wrapper">
			{#each data.works as work, i (work.id)}
				<a class="archive-row" href="/archives/{work.id}">
					<span class="num" lang="en">{padNumber(i)}</span>
					<span class="title" lang="en">{work.title}</span>
					<span class="scope" lang="en">
						{(work.scope ?? []).slice(0, 2).join(' / ')}
					</span>
					<span class="count" lang="en">
						{work.mediaCount} {work.mediaCount === 1 ? 'image' : 'images'}
					</span>
				</a>
			{:else}
				<p class="empty" lang="en">No archives yet.</p>
			{/each}
		</div>
	</section>
</main>

<style>
	.Archives {
		padding-top: 73px;
		padding-bottom: 120px;
	}

	.Archives .List .wrapper {
		padding-inline: var(--gutter);
	}

	.Archives .List {
		padding-top: 32px;
	}

	.Archives .List .archive-row {
		display: grid;
		grid-template-columns: 32px 1fr auto;
		gap: 8px;
		padding-block: 24px;
		border-bottom: 1px solid var(--color-line);
		font-size: var(--fs-h6);
	}

	/* Matches every row's own border-bottom, so the list reads as fully
	   enclosed above the first item too, not just between/after rows. */
	.Archives .List .archive-row:first-child {
		border-top: 1px solid var(--color-line);
	}

	.Archives .List .archive-row .num {
		opacity: 0.6;
	}

	.Archives .List .archive-row .scope {
		text-align: right;
		opacity: 0.6;
	}

	/* Media count — PC-only (see the media query below); hidden at SP to
	   keep the row from getting cramped on narrow screens. */
	.Archives .List .archive-row .count {
		display: none;
	}

	.Archives .List .empty {
		padding-block: 32px;
		opacity: 0.5;
	}

	@media (min-width: 1024px) {
		.Archives {
			padding-top: 80px;
			padding-bottom: 160px;
			/* Matches Header's own inset — .List .wrapper zeroes its previous
			   --gutter padding below so this is the one source of it, same
			   pattern as archives/+page.svelte's .Archives/.Gallery pair. */
			padding-inline: var(--padding);
		}

		/* Both need zeroing: .List is a <section>, picking up base.css's
		   global `section { padding-inline: var(--padding) }` on its own, and
		   .wrapper had its own separate --gutter — .Archives above is now the
		   single source of the inset (same pattern as archives/+page.svelte's
		   .Archives section / .Gallery pair). */
		.Archives .List,
		.Archives .List .wrapper {
			padding-inline: 0;
		}

		/* Narrower column, pinned to the right edge (flush with the
		   TitleBar's switch above) instead of spanning the full inset. */
		.Archives .List .wrapper {
			width: 65%;
			margin-left: auto;
		}

		.Archives .List .archive-row {
			/* One step down from the previous var(--fs-h5) — read a bit large
			   at PC. */
			font-size: var(--fs-h6);
			/* fr, not %, 10/40/40/10 by ratio (1:4:4:1) — fr divides the space
			   left over AFTER the row's 3 gaps are subtracted, while raw %
			   tracks ignore gap and overflow the row by the gap total. */
			grid-template-columns: 1fr 4fr 4fr 1fr;
			padding-block: 28px;
		}

		/* One step further down than the row — de-emphasizes the index
		   relative to title/scope/count. */
		.Archives .List .archive-row .num {
			font-size: var(--fs-h7);
		}

		.Archives .List .archive-row .count {
			display: block;
			text-align: right;
			opacity: 0.6;
		}
	}
</style>
