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

	.Archives .List .archive-row .num {
		opacity: 0.6;
	}

	.Archives .List .archive-row .scope {
		text-align: right;
		opacity: 0.6;
	}

	.Archives .List .empty {
		padding-block: 32px;
		opacity: 0.5;
	}

	@media (min-width: 1024px) {
		.Archives {
			padding-top: 80px;
			padding-bottom: 160px;
		}

		.Archives .List .archive-row {
			font-size: var(--fs-h5);
			grid-template-columns: 48px 1fr auto;
			padding-block: 28px;
		}
	}
</style>
