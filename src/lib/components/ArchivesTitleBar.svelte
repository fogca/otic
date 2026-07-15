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
		class:is-on={isText}
		aria-label={isText ? 'Switch to Image view' : 'Switch to Text view'}
	>
		<span class="switch-label" class:is-active={!isText} lang="en">Image</span>
		<span class="switch-track">
			<span class="switch-thumb"></span>
		</span>
		<span class="switch-label" class:is-active={isText} lang="en">Text</span>
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
		font-size: var(--fs-h2);
		font-weight: var(--fw-base);
		margin: 0;
	}

	/* Whole label+switch+label row is one link — clicking anywhere toggles
	   to the other view, matching how a real iOS switch's whole row is
	   usually tappable, not just the thumb itself. */
	.view-switch {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: none;
		text-decoration: none;
	}

	.switch-label {
		font-size: var(--fs-h6);
		font-weight: var(--fw-base);
		color: var(--color-text);
		opacity: 0.55;
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	.switch-label.is-active {
		opacity: 1;
	}

	.view-switch:hover .switch-label {
		opacity: 0.8;
	}

	.view-switch:hover .switch-label.is-active {
		opacity: 1;
	}

	/* iOS-style ON/OFF track + thumb. Monochrome (this page's palette has no
	   accent colour) — dark track for on, light line-colour track for off,
	   matching the site's existing is-mute/opacity convention rather than
	   introducing iOS's own green. */
	.switch-track {
		position: relative;
		width: 36px;
		height: 20px;
		border-radius: 10px;
		background: var(--color-line);
		flex: none;
		transition: background var(--duration-fast) var(--ease-default);
	}

	.switch-thumb {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: transform var(--duration-fast) var(--ease-default);
	}

	.view-switch.is-on .switch-track {
		background: var(--color-text);
	}

	.view-switch.is-on .switch-thumb {
		transform: translateX(16px);
	}

	@media (min-width: 1024px) {
		.TitleBar {
			padding-inline: 0;
			padding-block: 32px 20px;
		}

		.switch-label {
			font-size: var(--fs-h5);
		}
	}
</style>
