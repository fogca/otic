<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const padNumber = (n: number) => String(n + 1).padStart(2, '0');

	const works = $derived(data.works);
	const firstWork = $derived(works[0]);
	const restWorks = $derived(works.slice(1, 10));
</script>

<svelte:head>
	<title>Archives — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Archives">
	<section class="ViewSwitch">
		<div class="wrapper">
			<span class="link is-active" lang="en">Index</span>
			<a href="/archives/list" class="link is-mute" lang="en">List</a>
		</div>
	</section>

	<section class="Stream">
		<div class="wrapper">
			{#if firstWork}
				<a class="card card-01" href="/archives/{firstWork.id}">
					<div class="image">
						{#if firstWork.thumbnail}
							<img
								src={firstWork.thumbnail.url}
								alt={firstWork.title}
								loading="eager"
							/>
						{/if}
					</div>
					<div class="meta">
						<span class="num" lang="en">{padNumber(0)}</span>
						<span class="code" lang="en">{firstWork.title}</span>
						<span class="brand" lang="en">{firstWork.brand ?? ''}</span>
					</div>
				</a>
			{/if}

			{#each restWorks as work, i (work.id)}
				<a class="card card-{padNumber(i + 1)}" href="/archives/{work.id}">
					<div class="image">
						{#if work.thumbnail}
							<img
								src={work.thumbnail.url}
								alt={work.title}
								loading="lazy"
							/>
						{/if}
					</div>
					<div class="meta">
						<span class="num" lang="en">{padNumber(i + 1)}</span>
						<span class="code" lang="en">{work.title}</span>
						<span class="brand" lang="en">{work.brand ?? ''}</span>
					</div>
				</a>
			{/each}
		</div>
	</section>
</main>

<style>
	.Archives {
		padding-top: 24px;
		padding-bottom: 120px;
	}

	/* ----- View switch (Index | List) ----- */
	.Archives .ViewSwitch .wrapper {
		padding-inline: var(--gutter);
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

	/* ----- Stream (mirrors home Archives section) ----- */
	.Archives .Stream {
		padding-top: 40px;
	}

	.Archives .Stream .wrapper {
		display: flex;
		flex-direction: column;
		gap: 80px;
	}

	.Archives .Stream .card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	.Archives .Stream .card:hover {
		opacity: 0.8;
	}

	.Archives .Stream .card .image {
		position: relative;
		width: 100%;
		overflow: hidden;
		background: var(--color-bg-gray);
	}

	.Archives .Stream .card .image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* Cards 02–10: natural height (aspect-ratio temporarily disabled) */
	.Archives .Stream .card:not(.card-01) .image img {
		height: auto;
		object-fit: initial;
	}

	.Archives .Stream .card .meta {
		display: grid;
		grid-template-columns: 12.5% 1fr auto;
		align-items: baseline;
		gap: 8px;
		font-size: var(--fs-h6);
		font-weight: 400;
	}

	.Archives .Stream .card .meta .num {
		opacity: 0.6;
	}

	.Archives .Stream .card .meta .brand {
		text-align: right;
		opacity: 0.6;
		font-weight: 400;
	}

	/* 01 — keep aspect-ratio (OP-handoff geometry) */
	.Archives .Stream .card-01 {
		width: 257px;
		max-width: 100%;
		margin-inline: auto;
	}
	.Archives .Stream .card-01 .image {
		aspect-ratio: 257 / 385;
	}

	/* 02 — 90% centered */
	.Archives .Stream .card-02 {
		width: 90%;
		margin-inline: auto;
	}

	/* 03 — full bleed image, meta inside padding */
	.Archives .Stream .card-03 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Archives .Stream .card-03 .meta {
		padding-inline: var(--padding);
	}

	/* 04 — narrow, centered */
	.Archives .Stream .card-04 {
		width: 62.5vw;
		margin-inline: auto;
	}

	/* 05 — full bleed */
	.Archives .Stream .card-05 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Archives .Stream .card-05 .meta {
		padding-inline: var(--padding);
	}

	/* 06 — 85% centered */
	.Archives .Stream .card-06 {
		width: 85%;
		margin-inline: auto;
	}

	/* 07 — 70% centered */
	.Archives .Stream .card-07 {
		width: 70%;
		margin-inline: auto;
	}

	/* 08 — 80% centered */
	.Archives .Stream .card-08 {
		width: 80%;
		margin-inline: auto;
	}

	/* 09 — full bleed */
	.Archives .Stream .card-09 {
		width: 100vw;
		margin-left: calc(-1 * var(--padding));
	}
	.Archives .Stream .card-09 .meta {
		padding-inline: var(--padding);
	}

	/* 10 — narrow, centered */
	.Archives .Stream .card-10 {
		width: 62.5vw;
		margin-inline: auto;
	}

	@media (min-width: 768px) {
		.Archives .Stream .card-01 {
			width: 320px;
		}
	}

	@media (min-width: 1024px) {
		.Archives {
			padding-top: 32px;
			padding-bottom: 160px;
		}

		.Archives .ViewSwitch .link {
			font-size: var(--fs-h5);
		}

		.Archives .Stream .card .meta {
			font-size: var(--fs-h5);
		}

		.Archives .Stream .card-01 {
			width: 380px;
		}
	}
</style>
