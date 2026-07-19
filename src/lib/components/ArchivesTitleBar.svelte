<script lang="ts">
	// Shared by archives/+page.svelte (Image = grid) and archives/list/+page.svelte
	// (Text = list) so the title/switch row is identical on both — previously
	// the list page had no title at all, and the two pages' switch markup had
	// already started to drift apart.
	type Props = { active: 'image' | 'text' };
	let { active }: Props = $props();
	const isText = $derived(active === 'text');
</script>

<section class="TitleBar">
	<h1 class="title" lang="en">Work Archives</h1>
	<a
		href={isText ? '/archives' : '/archives/list'}
		class="view-switch"
		aria-label={isText ? 'Switch to Image view' : 'Switch to Text view'}
	>
		<span class="switch-option" class:is-active={!isText} lang="en">Image</span>
		<span class="switch-option" class:is-active={isText} lang="en">Text</span>
	</a>
</section>

<style>
	.TitleBar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 16px;
		padding-inline: var(--padding);
		/* Bottom 20px is a floor, not just a top-padding echo — the page's
		   own content (Gallery/List) starts immediately after with no
		   padding of its own, so this is the only thing keeping title and
		   content apart. */
		padding-block: 24px 20px;
	}

	.TitleBar .title {
		font-size: var(--fs-h0);
		font-weight: var(--fw-base);
		margin: 0;
	}

	/* Segmented-pill switch: a light pill container with each option as its
	   own pill inside — the active one filled solid, matching how iOS's
	   segmented control reads (not the previous small ON/OFF track+thumb).
	   Whole row is one link — clicking anywhere toggles to the other view. */
	.view-switch {
		display: flex;
		align-items: center;
		flex: none;
		padding: 4px;
		border-radius: 999px;
		background: var(--color-bg-gray);
		text-decoration: none;
	}

	.switch-option {
		padding: 8px 16px;
		border-radius: 999px;
		font-size: var(--fs-h6);
		font-weight: var(--fw-base);
		color: var(--color-text);
		opacity: 0.5;
		transition:
			background var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default),
			opacity var(--duration-fast) var(--ease-default);
	}

	.switch-option.is-active {
		background: var(--color-text);
		color: #fff;
		opacity: 1;
	}

	.view-switch:hover .switch-option:not(.is-active) {
		opacity: 0.8;
	}

	@media (min-width: 1024px) {
		.TitleBar {
			padding-inline: 0;
			padding-block: 32px 20px;
		}

		.switch-option {
			font-size: var(--fs-h5);
		}
	}
</style>
