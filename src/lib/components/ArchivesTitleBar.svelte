<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';

	// Shared by archives/+page.svelte (Image = grid) and archives/list/+page.svelte
	// (Text = list) so the title/switch row is identical on both — previously
	// the list page had no title at all, and the two pages' switch markup had
	// already started to drift apart.
	type Props = { active: 'image' | 'text' };
	let { active }: Props = $props();
	const isText = $derived(active === 'text');

	let imageEl: HTMLElement | null = $state(null);
	let textEl: HTMLElement | null = $state(null);
	let highlightEl: HTMLElement | null = $state(null);

	// Which option the highlight/text-color should show as active RIGHT NOW —
	// starts in sync with the prop (this component remounts fresh on every
	// navigation between /archives and /archives/list, so that's always
	// correct on mount) but a click flips it immediately, ahead of the prop,
	// so the highlight visibly slides to the clicked target before the page
	// actually changes underneath it.
	let activeIsText = $state(untrack(() => isText));
	let highlightReady = $state(false);

	// Position (and, after the first paint, animate) the highlight to match
	// whichever option is current. No transition on that very first
	// positioning — otherwise it'd visibly slide in from (0,0) on every
	// fresh mount instead of just appearing already in place.
	$effect(() => {
		const target = activeIsText ? textEl : imageEl;
		if (!target || !highlightEl) return;
		highlightEl.style.width = `${target.offsetWidth}px`;
		highlightEl.style.transform = `translateX(${target.offsetLeft}px)`;
		if (!highlightReady) {
			requestAnimationFrame(() => {
				highlightReady = true;
			});
		}
	});

	function handleClick(event: MouseEvent) {
		// Modified/non-primary clicks (open in new tab, etc.) keep the
		// browser's normal link behavior — only a plain left click runs the
		// slide-then-navigate sequence.
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
			return;
		}
		event.preventDefault();
		const href = isText ? '/archives' : '/archives/list';
		activeIsText = !isText;
		// Matches --duration-fast (200ms), the highlight's own transition
		// length, plus a small margin so it's visibly settled before the
		// page transition starts covering it.
		setTimeout(() => goto(href), 250);
	}
</script>

<section class="TitleBar">
	<h1 class="title" lang="en">Work Archives</h1>
	<a
		href={isText ? '/archives' : '/archives/list'}
		class="view-switch"
		aria-label={isText ? 'Switch to Image view' : 'Switch to Text view'}
		onclick={handleClick}
	>
		<div class="switch-highlight" class:is-ready={highlightReady} bind:this={highlightEl}></div>
		<span class="switch-option" class:is-active={!activeIsText} lang="en" bind:this={imageEl}
			>Image</span
		>
		<span class="switch-option" class:is-active={activeIsText} lang="en" bind:this={textEl}
			>Text</span
		>
	</a>
</section>

<style>
	.TitleBar {
		display: flex;
		align-items: flex-end;
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
		position: relative;
		display: flex;
		align-items: center;
		flex: none;
		padding: 4px;
		border-radius: 999px;
		background: var(--color-bg-gray);
		text-decoration: none;
	}

	/* Shared sliding pill behind whichever option is active — .switch-option
	   itself no longer carries its own active background (see below), so
	   there's exactly one black pill to animate between positions instead of
	   two independently-toggling ones. Inset 4px top/bottom (SP only — see
	   the PC override below) rather than a flush height:100% — reads as a
	   deliberately offset shape sitting inside the track, not a rigid exact
	   fill. */
	.switch-highlight {
		position: absolute;
		top: 4px;
		left: 0;
		height: calc(100% - 8px);
		border-radius: 999px;
		background: var(--color-text);
	}

	.switch-highlight.is-ready {
		transition:
			transform var(--duration-fast) var(--ease-default),
			width var(--duration-fast) var(--ease-default);
	}

	.switch-option {
		position: relative;
		z-index: 1;
		padding: 5px 15px;
		font-size: calc(var(--fs-h6) * 0.85);
		font-weight: var(--fw-base);
		color: var(--color-text);
		opacity: 0.5;
		transition:
			color var(--duration-fast) var(--ease-default),
			opacity var(--duration-fast) var(--ease-default);
	}

	.switch-option.is-active {
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
			padding: 8px 28px;
			font-size: calc(var(--fs-h5) * 0.85);
		}

		/* PC keeps the flush, exact-fill highlight — the inset is an SP-only
		   request. */
		.switch-highlight {
			top: 0;
			height: 100%;
		}
	}
</style>
