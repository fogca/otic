<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const padNumber = (n: number) => String(n + 1).padStart(2, '0');
</script>

<svelte:head>
	<title>Archives — List — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Archives">
	<section class="ViewSwitch">
		<div class="wrapper">
			<a href="/archives" class="link is-mute" lang="en">Index</a>
			<span class="link is-active" lang="en">List</span>
		</div>
	</section>

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

	.Archives .ViewSwitch .wrapper,
	.Archives .List .wrapper {
		padding-inline: var(--gutter);
	}

	.Archives .ViewSwitch {
		padding-block: 24px 0;
	}

	.Archives .ViewSwitch .wrapper {
		display: flex;
		gap: 16px;
	}

	.Archives .ViewSwitch .link {
		font-size: var(--fs-h6);
		font-weight: 400;
	}

	.Archives .ViewSwitch .link.is-mute {
		opacity: 0.3;
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	.Archives .ViewSwitch .link.is-mute:hover {
		opacity: 1;
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
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	.Archives .List .archive-row:hover {
		opacity: 0.5;
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

		.Archives .ViewSwitch {
			padding-block: 32px 0;
		}

		.Archives .ViewSwitch .link {
			font-size: var(--fs-h5);
		}

		.Archives .List .archive-row {
			font-size: var(--fs-h5);
			grid-template-columns: 48px 1fr auto;
			padding-block: 28px;
		}
	}
</style>
