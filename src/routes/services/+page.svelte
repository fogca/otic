<script lang="ts">
	import { browser } from '$app/environment';
	import { footerNear } from '$lib/state/footerNear.svelte';

	type ServiceItem = { id: string; en: string };

	// ~18 items, one layer flatter than the granular list first proposed in
	// chat — merges what overlapped (vi/branding/logo/art direction, web/dev/
	// digital development, visualisation/3d) into single entries.
	const SERVICE_ITEMS: ServiceItem[] = [
		{ id: 'naming', en: 'Naming' },
		{ id: 'concept', en: 'Concept' },
		{ id: 'planning', en: 'Planning' },
		{ id: 'branding-vi', en: 'Branding & VI' },
		{ id: 'art-direction', en: 'Art direction' },
		{ id: 'typeface', en: 'Typeface' },
		{ id: 'product', en: 'Product' },
		{ id: 'packaging', en: 'Packaging' },
		{ id: 'editorial', en: 'Editorial' },
		{ id: 'web', en: 'Web design' },
		{ id: 'development', en: 'Development' },
		{ id: 'app', en: 'App' },
		{ id: 'ux-ia', en: 'UX & IA' },
		{ id: 'motion', en: 'Motion' },
		{ id: 'visualisation', en: 'Visualisation' },
		{ id: 'social', en: 'Social' },
		{ id: 'copywriting', en: 'Copywriting' },
		{ id: 'campaign', en: 'Campaign' }
	];

	// Deterministic string hash → number (same technique already used in
	// archives/+page.server.ts for its shuffle) — drives each tile's own
	// line count/angle/speed from its id, so one shared animation system
	// produces visually distinct marks per item with no hand-authored asset.
	function hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i);
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	type Line = { angle: number; duration: number };
	function markFor(id: string): Line[] {
		const h = hashString(id);
		const lineCount = 2 + (h % 3);
		return Array.from({ length: lineCount }, (_, i) => ({
			angle: (h * (i + 7)) % 360,
			duration: 0.9 + (((h >> (i + 2)) % 6) / 10)
		}));
	}

	let selected = $state<Set<string>>(new Set());
	// Brief per-tile "just tapped" flag — CSS :hover alone is unreliable on
	// touch, so a tap also gets a guaranteed pulse of the mark via this class,
	// cleared after roughly one animation cycle.
	let justTapped = $state<Set<string>>(new Set());

	function toggle(id: string) {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selected = next;

		const tapped = new Set(justTapped);
		tapped.add(id);
		justTapped = tapped;
		setTimeout(() => {
			const cleared = new Set(justTapped);
			cleared.delete(id);
			justTapped = cleared;
		}, 1200);
	}

	const selectedItems = $derived(SERVICE_ITEMS.filter((s) => selected.has(s.id)));

	const CONTACT_EMAIL = 'hi@takumiisobe.com';
	const mailtoHref = $derived.by(() => {
		const list = selectedItems.map((s) => s.en).join(', ');
		const subject = encodeURIComponent('Project inquiry');
		const body = encodeURIComponent(
			`Hi,\n\nI'm interested in a project covering:\n${list}\n\nLooking forward to hearing from you.`
		);
		return `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
	});

	let summaryNode: HTMLElement | null = $state(null);

	// Fade the fixed bar out once the Footer is about to scroll into view —
	// otherwise it sits on top of the Footer's own bottom row (copyright,
	// legal links) permanently once the user scrolls all the way down. Same
	// signal archives/[slug]'s old leadPortal used for its own fixed lead.
	// pointer-events follows the fade so the invisible bar can't swallow
	// clicks on the Footer content underneath it.
	$effect(() => {
		if (!summaryNode) return;
		summaryNode.style.opacity = footerNear.near ? '0' : '1';
		summaryNode.style.pointerEvents = footerNear.near ? 'none' : 'auto';
	});

	// .page-wrapper has will-change:transform, which acts as a containing
	// block for position:fixed descendants, so a naive fixed bar here would
	// resolve against .page-wrapper's own box (and jump during the
	// page-shrink nav transition) instead of the true viewport — same root
	// cause archives/[slug]'s old leadPortal existed for. Portal this bar out
	// to the document body so it stays genuinely pinned to the screen's
	// bottom edge while scrolling through the grid above it, cart-style. The
	// Svelte-scoped class on the node survives the move (only inline
	// position styles are added here), so the component's own scoped styles
	// still apply after portaling.
	function summaryPortal(node: HTMLElement) {
		if (!browser) return;
		summaryNode = node;
		document.body.appendChild(node);
		Object.assign(node.style, {
			position: 'fixed',
			left: '0',
			right: '0',
			bottom: '0',
			zIndex: 'var(--z-header)',
			transition: 'opacity 0.3s ease'
		});
		return {
			destroy() {
				summaryNode = null;
				node.remove();
			}
		};
	}
</script>

<svelte:head>
	<title>Services — TAKUMIISOBE.com</title>
</svelte:head>

<main class="ServicesPage">
	<section class="intro">
		<!-- DRAFT — not yet approved, see chat. -->
		<h1 lang="en">Build your own scope.</h1>
		<p lang="en">
			Select what you need — from naming through development — and send us the
			shape of your project.
		</p>
		<p class="intro-ja" lang="ja">
			必要なものを選んで、プロジェクトの輪郭をそのまま私たちに送ってください。
		</p>
	</section>

	<section class="grid-section">
		<div class="tiles">
			{#each SERVICE_ITEMS as item (item.id)}
				{@const mark = markFor(item.id)}
				<button
					type="button"
					class="tile"
					class:is-on={selected.has(item.id)}
					class:was-tapped={justTapped.has(item.id)}
					onclick={() => toggle(item.id)}
					aria-pressed={selected.has(item.id)}
				>
					<span class="tile__mark" aria-hidden="true">
						{#each mark as line, i (i)}
							<span
								class="tile__line"
								style:--line-angle={`${line.angle}deg`}
								style:animation-duration={`${line.duration}s`}
							></span>
						{/each}
					</span>
					<span class="tile__label" lang="en">{item.en}</span>
				</button>
			{/each}
		</div>
	</section>

	<section class="summary" use:summaryPortal>
		<div class="summary__inner">
			{#if selectedItems.length > 0}
				<p class="summary__count" lang="en">{selectedItems.length} selected</p>
				<div class="summary__chips">
					{#each selectedItems as item (item.id)}
						<span class="chip">{item.en}</span>
					{/each}
				</div>
				<a class="summary__cta" href={mailtoHref} lang="en">Send this scope →</a>
			{:else}
				<p class="summary__placeholder" lang="en">Tap a tile to start building your scope.</p>
				<p class="summary__placeholder summary__placeholder--ja" lang="ja">
					タイルをタップして、スコープを組み立てましょう。
				</p>
			{/if}
		</div>
	</section>
</main>

<style>
	:global([data-lang='en']) .intro-ja,
	:global([data-lang='en']) .summary__placeholder--ja {
		display: none;
	}
	:global([data-lang='ja']) .summary__placeholder:not(.summary__placeholder--ja) {
		display: none;
	}

	.ServicesPage {
		padding-top: 120px;
		/* .summary is portaled out to a fixed bar (see summaryPortal) — this
		   reserves room in normal flow so the fixed bar doesn't sit on top of
		   the grid's last row. */
		padding-bottom: 96px;
		color: var(--color-text);
	}
	.ServicesPage :global(*) {
		color: var(--color-text);
	}

	.intro {
		padding-inline: var(--padding);
		max-width: 720px;
		margin-bottom: 48px;
	}
	.intro h1 {
		font-size: var(--fs-h0);
		font-weight: var(--fw-base);
		margin: 0 0 16px;
	}
	.intro p {
		margin: 0;
	}
	.intro-ja {
		margin-top: 8px;
	}

	.grid-section {
		padding-inline: var(--padding);
	}
	.tiles {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
	}

	.tile {
		all: unset;
		box-sizing: border-box;
		aspect-ratio: 1;
		border: 1px solid var(--color-line);
		cursor: pointer;
		position: relative;
		display: flex;
		align-items: flex-end;
		padding: 10px;
		overflow: hidden;
		transition:
			background var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default);
	}
	.tile:hover {
		border-color: var(--color-text);
	}
	.tile.is-on {
		background: var(--color-text);
		border-color: var(--color-text);
	}

	.tile__label {
		position: relative;
		z-index: 1;
		font-size: var(--fs-h6);
		font-weight: var(--fw-base);
	}
	.tile.is-on .tile__label {
		color: #fff;
	}

	.tile__mark {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.tile__line {
		position: absolute;
		width: 42%;
		height: 1px;
		background: var(--color-text);
		transform: rotate(var(--line-angle, 0deg));
		opacity: 0.2;
		animation-name: tile-pulse;
		animation-timing-function: ease-in-out;
		animation-iteration-count: infinite;
		animation-play-state: paused;
	}
	.tile.is-on .tile__line {
		background: #fff;
	}
	.tile:hover .tile__line,
	.tile.was-tapped .tile__line {
		animation-play-state: running;
	}

	@keyframes tile-pulse {
		0%,
		100% {
			transform: rotate(var(--line-angle, 0deg)) scaleX(1);
			opacity: 0.2;
		}
		50% {
			transform: rotate(calc(var(--line-angle, 0deg) + 15deg)) scaleX(1.4);
			opacity: 0.5;
		}
	}

	.summary {
		/* Positioned via summaryPortal (portaled to the document body, then
		   inline position:fixed) — see the script. Not styled fixed here directly
		   since scoped CSS specificity would otherwise need !important to
		   beat the inline styles either way; the inline styles ARE the
		   positioning, this block is purely cosmetic. */
		width: 100%;
		box-sizing: border-box;
		padding: 14px var(--padding);
		background: var(--color-bg-gray);
		border-top: 1px solid var(--color-line);
	}
	.summary__inner {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
		min-height: 24px;
	}
	.summary__count {
		font-size: var(--fs-h6);
		opacity: 0.6;
		margin: 0;
		flex: none;
	}
	.summary__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		flex: 1;
	}
	.chip {
		font-size: var(--fs-h6);
		padding: 4px 10px;
		border: 1px solid var(--color-line);
		border-radius: 999px;
	}
	.summary__cta {
		flex: none;
		font-size: var(--fs-h6);
		font-weight: var(--fw-medium);
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	.summary__cta:hover {
		opacity: 0.6;
	}
	.summary__placeholder {
		font-size: var(--fs-h6);
		opacity: 0.5;
		margin: 0;
	}

	@media (min-width: 1024px) {
		.ServicesPage {
			padding-top: 160px;
		}
		.intro h1 {
			font-size: var(--fs-h0);
		}
		.tiles {
			grid-template-columns: repeat(6, 1fr);
			gap: 12px;
		}
		.summary {
			padding: 16px calc(var(--padding) * 1.5);
		}
	}
</style>
