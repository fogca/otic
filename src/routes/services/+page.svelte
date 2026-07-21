<script lang="ts">
	import { browser } from '$app/environment';
	import { footerNear } from '$lib/state/footerNear.svelte';

	// ── DRAFT content below (What we do / order steps / plans) — not yet
	// approved, see chat. Numbers and process steps are placeholders per
	// explicit request ("数字は一旦仮で作ってみて") — pending real figures
	// and confirmation of the actual ordering process.

	// Condensed from office/+page.svelte's own `services` array (same 4
	// disciplines, short summary line instead of the full body copy).
	type WhatWeDoItem = { title: string; subtitle: string; summaryEn: string; summaryJa: string };
	const WHAT_WE_DO: WhatWeDoItem[] = [
		{
			title: 'Product & Furniture Design',
			subtitle: '工業デザインと家具デザイン',
			summaryEn: 'Products and furniture built around use and quiet joy.',
			summaryJa: '用と喜びに寄り添うプロダクト・家具の企画開発。'
		},
		{
			title: 'V.I. & Typography',
			subtitle: 'ビジュアルアイデンティティと書体の開発',
			summaryEn: 'Brand strategy and identity, backed by an in-house type foundry.',
			summaryJa: 'ブランド戦略・アイデンティティと、自社タイプファウンダリ。'
		},
		{
			title: 'Image Visualisation',
			subtitle: 'イメージクリエイションとCGビジュアライゼーション',
			summaryEn: 'Photography and 3DCGI, directed as one continuous practice.',
			summaryJa: '実写撮影と3DCGIを一貫して手がけるイメージ制作。'
		},
		{
			title: 'Digital Infrastructure',
			subtitle: 'UXとデジタルコミュニケーションの設計',
			summaryEn: 'Sites, commerce, and digital products built to last.',
			summaryJa: 'サイト・ECサイト・デジタルプロダクトの設計と実装。'
		}
	];

	type OrderStep = { en: string; ja: string; descEn: string; descJa: string };
	const ORDER_STEPS: OrderStep[] = [
		{
			en: 'Inquiry',
			ja: 'お問い合わせ',
			descEn: 'Reach out with what you have in mind.',
			descJa: '想定している内容をお聞かせください。'
		},
		{
			en: 'Consultation',
			ja: 'ヒアリング',
			descEn: 'A call to understand the project in more detail.',
			descJa: 'プロジェクトについて詳しくお伺いします。'
		},
		{
			en: 'Proposal',
			ja: 'ご提案・お見積り',
			descEn: 'We share scope, schedule, and cost.',
			descJa: 'スコープ・スケジュール・費用をご提示します。'
		},
		{
			en: 'Kickoff',
			ja: '制作開始',
			descEn: 'Contract signed, work begins.',
			descJa: 'ご契約後、制作を開始します。'
		},
		{
			en: 'Delivery',
			ja: '納品',
			descEn: 'Final delivery and handoff.',
			descJa: '成果物の納品とお引き渡し。'
		}
	];

	type ScheduleItem = { en: string; ja: string; rangeEn: string; rangeJa: string };
	const SCHEDULES: ScheduleItem[] = [
		{
			en: 'One-off',
			ja: '単発',
			rangeEn: 'Roughly 1–3 months, depending on scope.',
			rangeJa: 'スコープにより、目安1〜3ヶ月。'
		},
		{
			en: 'Retainer',
			ja: '継続',
			rangeEn: 'Ongoing — a minimum 3-month commitment.',
			rangeJa: '継続的にご契約(最低契約期間3ヶ月〜)。'
		}
	];

	type PlanItem = { name: string; nameJa: string; price: string; descEn: string; descJa: string };
	const PLANS: PlanItem[] = [
		{
			name: 'One-off',
			nameJa: '単発',
			price: 'From ¥500,000',
			descEn: 'A defined project with a clear scope and deliverable.',
			descJa: '明確なスコープと成果物を伴う、単発のプロジェクト。'
		},
		{
			name: 'Retainer',
			nameJa: '継続',
			price: 'From ¥300,000 / month',
			descEn: 'Ongoing collaboration spanning multiple disciplines.',
			descJa: '複数領域にまたがる継続的な伴走。'
		}
	];

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
	// archives/+page.server.ts for its shuffle) — drives which cube
	// arrangement/orientation each tile gets, so one shared drawing system
	// produces visually distinct isometric marks per item with no
	// hand-authored asset per item (see reference: CMS/pjs/@ref/
	// obj_motion_graphics.mp4 — small isometric block clusters, line art,
	// staggered build-in).
	function hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			hash = (hash << 5) - hash + str.charCodeAt(i);
			hash = hash & hash;
		}
		return Math.abs(hash);
	}

	// Grid positions ([x, y, z], z = up) for a small library of block
	// clusters — deliberately simple/recognisable shapes rather than
	// procedurally-generated arbitrary ones (real geometry, no asset files).
	const CUBE_TEMPLATES: [number, number, number][][] = [
		[[0, 0, 0]],
		[
			[0, 0, 0],
			[0, 0, 1]
		],
		[
			[0, 0, 0],
			[1, 0, 0]
		],
		[
			[0, 0, 0],
			[1, 0, 0],
			[1, 0, 1]
		],
		[
			[0, 0, 0],
			[1, 0, 0],
			[-1, 0, 0],
			[0, 1, 0],
			[0, -1, 0]
		],
		[
			[0, 0, 0],
			[0, 0, 1],
			[0, 0, 2]
		]
	];

	// 2:1 pixel-isometric projection — the standard lightweight technique
	// for isometric block art (no real 3D/WebGL needed).
	const CUBE_W = 34;
	const CUBE_H = 22;
	function isoPoint(gx: number, gy: number, gz: number): [number, number] {
		return [(gx - gy) * (CUBE_W / 2), (gx + gy) * (CUBE_W / 4) - gz * CUBE_H];
	}
	function polygon(points: [number, number][]): string {
		return points.map(([x, y]) => `${x},${y}`).join(' ');
	}

	type Cube = { top: string; left: string; right: string; delay: number };
	type Mark = { cubes: Cube[]; viewBox: string };

	function markFor(id: string): Mark {
		const h = hashString(id);
		let template = CUBE_TEMPLATES[h % CUBE_TEMPLATES.length];
		// Swap x/y for roughly half of items landing on the same template,
		// so they don't read as identical.
		if ((h >> 4) % 2 === 0) {
			template = template.map(([x, y, z]) => [y, x, z]);
		}

		const allX: number[] = [];
		const allY: number[] = [];
		const cubes: Cube[] = template.map(([gx, gy, gz], i) => {
			const [ox, oy] = isoPoint(gx, gy, gz);
			allX.push(ox - CUBE_W / 2, ox + CUBE_W / 2);
			allY.push(oy, oy + CUBE_W / 2 + CUBE_H);
			return {
				top: polygon([
					[ox, oy],
					[ox + CUBE_W / 2, oy + CUBE_W / 4],
					[ox, oy + CUBE_W / 2],
					[ox - CUBE_W / 2, oy + CUBE_W / 4]
				]),
				left: polygon([
					[ox - CUBE_W / 2, oy + CUBE_W / 4],
					[ox, oy + CUBE_W / 2],
					[ox, oy + CUBE_W / 2 + CUBE_H],
					[ox - CUBE_W / 2, oy + CUBE_W / 4 + CUBE_H]
				]),
				right: polygon([
					[ox + CUBE_W / 2, oy + CUBE_W / 4],
					[ox, oy + CUBE_W / 2],
					[ox, oy + CUBE_W / 2 + CUBE_H],
					[ox + CUBE_W / 2, oy + CUBE_W / 4 + CUBE_H]
				]),
				delay: i * 0.1
			};
		});

		const pad = 6;
		const minX = Math.min(...allX) - pad;
		const minY = Math.min(...allY) - pad;
		const w = Math.max(...allX) - Math.min(...allX) + pad * 2;
		const hgt = Math.max(...allY) - Math.min(...allY) + pad * 2;

		return { cubes, viewBox: `${minX} ${minY} ${w} ${hgt}` };
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
	<section class="hero">
		<!-- DRAFT — not yet approved, see chat. -->
		<h1 lang="en">What we do, and how to start.</h1>
		<p class="hero-en" lang="en">
			Every discipline we work across, how a project comes together, and what it
			costs.
		</p>
		<p class="hero-ja" lang="ja">
			私たちが手がける領域と、プロジェクトが動き出すまでの流れ、そして費用感について。
		</p>
	</section>

	<section class="section-block what-we-do">
		<header class="section-hd">
			<h2 class="section-label" lang="en">What we do</h2>
		</header>
		<div class="wwd-grid">
			{#each WHAT_WE_DO as item (item.title)}
				<div class="wwd-item">
					<h3 class="wwd-title" lang="en">{item.title}</h3>
					<p class="wwd-sub" lang="ja">{item.subtitle}</p>
					<p class="wwd-summary" lang="en">{item.summaryEn}</p>
					<p class="wwd-summary wwd-summary--ja" lang="ja">{item.summaryJa}</p>
				</div>
			{/each}
		</div>
		<a class="wwd-more" href="/office" lang="en">More about Office →</a>
	</section>

	<section class="section-block order-schedule">
		<header class="section-hd">
			<h2 class="section-label" lang="en">How to order &amp; schedule</h2>
		</header>
		<ol class="steps">
			{#each ORDER_STEPS as step, i (step.en)}
				<li class="step">
					<span class="step__num">{i + 1}</span>
					<span class="step__en" lang="en">{step.en}</span>
					<span class="step__ja" lang="ja">{step.ja}</span>
					<span class="step__desc" lang="en">{step.descEn}</span>
					<span class="step__desc step__desc--ja" lang="ja">{step.descJa}</span>
				</li>
			{/each}
		</ol>
		<div class="schedules">
			{#each SCHEDULES as sc (sc.en)}
				<div class="schedule">
					<p class="schedule__name" lang="en">{sc.en}</p>
					<p class="schedule__name schedule__name--ja" lang="ja">{sc.ja}</p>
					<p class="schedule__range" lang="en">{sc.rangeEn}</p>
					<p class="schedule__range schedule__range--ja" lang="ja">{sc.rangeJa}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="section-block plan">
		<header class="section-hd">
			<h2 class="section-label" lang="en">Plan</h2>
			<!-- DRAFT — figures are placeholders, see chat. -->
			<p class="section-note" lang="en">Figures below are provisional.</p>
			<p class="section-note section-note--ja" lang="ja">下記の金額は仮のものです。</p>
		</header>
		<div class="plans">
			{#each PLANS as p (p.name)}
				<div class="plan-item">
					<p class="plan-item__name" lang="en">{p.name}</p>
					<p class="plan-item__name plan-item__name--ja" lang="ja">{p.nameJa}</p>
					<p class="plan-item__price" lang="en">{p.price}</p>
					<p class="plan-item__desc" lang="en">{p.descEn}</p>
					<p class="plan-item__desc plan-item__desc--ja" lang="ja">{p.descJa}</p>
				</div>
			{/each}
		</div>
	</section>

	<section class="section-block scope-intro">
		<header class="section-hd">
			<h2 class="section-label" lang="en">Scope</h2>
		</header>
		<!-- DRAFT — not yet approved, see chat. -->
		<p class="scope-lead" lang="en">
			Select what you need — from naming through development — and send us the
			shape of your project.
		</p>
		<p class="scope-lead scope-lead--ja" lang="ja">
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
					<svg class="tile__mark" viewBox={mark.viewBox} aria-hidden="true">
						{#each mark.cubes as cube, i (i)}
							<g class="tile__cube" style:animation-delay={`${cube.delay}s`}>
								<polygon class="face" points={cube.top} />
								<polygon class="face" points={cube.left} />
								<polygon class="face" points={cube.right} />
							</g>
						{/each}
					</svg>
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
	:global([data-lang='en']) .hero-ja,
	:global([data-lang='en']) .wwd-sub,
	:global([data-lang='en']) .wwd-summary--ja,
	:global([data-lang='en']) .step__ja,
	:global([data-lang='en']) .step__desc--ja,
	:global([data-lang='en']) .schedule__name--ja,
	:global([data-lang='en']) .schedule__range--ja,
	:global([data-lang='en']) .section-note--ja,
	:global([data-lang='en']) .plan-item__name--ja,
	:global([data-lang='en']) .plan-item__desc--ja,
	:global([data-lang='en']) .scope-lead--ja,
	:global([data-lang='en']) .summary__placeholder--ja {
		display: none;
	}
	:global([data-lang='ja']) .hero-en,
	:global([data-lang='ja']) .step__en,
	:global([data-lang='ja']) .wwd-summary:not(.wwd-summary--ja),
	:global([data-lang='ja']) .step__desc:not(.step__desc--ja),
	:global([data-lang='ja']) .schedule__name:not(.schedule__name--ja),
	:global([data-lang='ja']) .schedule__range:not(.schedule__range--ja),
	:global([data-lang='ja']) .section-note:not(.section-note--ja),
	:global([data-lang='ja']) .plan-item__name:not(.plan-item__name--ja),
	:global([data-lang='ja']) .plan-item__desc:not(.plan-item__desc--ja),
	:global([data-lang='ja']) .scope-lead:not(.scope-lead--ja),
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

	.hero {
		padding-inline: var(--padding);
		max-width: 720px;
		margin-bottom: 80px;
	}
	.hero h1 {
		font-size: var(--fs-h0);
		font-weight: var(--fw-base);
		margin: 0 0 16px;
	}
	.hero-en,
	.hero-ja {
		margin: 0;
	}
	.hero-ja {
		margin-top: 8px;
	}

	/* ── Shared section shell (What we do / How to order & schedule / Plan /
	   Scope intro) — a small eyebrow label + heading, matching the
	   panel-hd/pt pattern already used on office/+page.svelte. ── */
	.section-block {
		padding-inline: var(--padding);
		max-width: 720px;
		margin-bottom: 64px;
	}
	.section-hd {
		margin-bottom: 20px;
	}
	.section-label {
		font-size: var(--fs-h5);
		font-weight: var(--fw-medium);
		margin: 0;
	}
	.section-note {
		font-size: var(--fs-h6);
		opacity: 0.5;
		margin: 4px 0 0;
	}

	/* ── What we do ── */
	.wwd-grid {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.wwd-item {
		padding-top: 16px;
		border-top: 1px solid var(--color-line);
	}
	.wwd-title {
		font-size: var(--fs-h4);
		font-weight: var(--fw-medium);
		margin: 0;
	}
	.wwd-sub {
		font-size: var(--fs-h6);
		opacity: 0.5;
		margin: 4px 0 0;
	}
	.wwd-summary {
		margin: 10px 0 0;
	}
	.wwd-more {
		display: inline-block;
		margin-top: 24px;
		font-size: var(--fs-h6);
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	.wwd-more:hover {
		opacity: 0.6;
	}

	/* ── How to order & schedule ── */
	.steps {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.step {
		display: grid;
		grid-template-columns: 24px 1fr;
		column-gap: 12px;
		row-gap: 2px;
	}
	.step__num {
		font-size: var(--fs-h6);
		opacity: 0.4;
	}
	.step__en,
	.step__ja {
		font-size: var(--fs-h5);
		font-weight: var(--fw-medium);
	}
	.step__desc {
		grid-column: 2;
		opacity: 0.6;
	}
	.schedules {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 32px;
		padding-top: 20px;
		border-top: 1px solid var(--color-line);
	}
	.schedule__name {
		font-size: var(--fs-h6);
		font-weight: var(--fw-medium);
		margin: 0;
	}
	.schedule__range {
		margin: 2px 0 0;
		opacity: 0.6;
	}

	/* ── Plan ── */
	.plans {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.plan-item {
		padding: 20px;
		border: 1px solid var(--color-line);
	}
	.plan-item__name {
		font-size: var(--fs-h5);
		font-weight: var(--fw-medium);
		margin: 0;
	}
	.plan-item__price {
		font-size: var(--fs-h3);
		margin: 8px 0 0;
	}
	.plan-item__desc {
		margin: 10px 0 0;
		opacity: 0.6;
	}

	/* ── Scope intro (leads into the tile grid below) ── */
	.scope-lead {
		margin: 0;
	}
	.scope-lead--ja {
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
		width: 60%;
		height: 60%;
		margin: auto;
		overflow: visible;
	}
	.face {
		fill: #fff;
		stroke: var(--color-text);
		stroke-width: 1;
		stroke-linejoin: round;
	}
	.tile.is-on .face {
		fill: var(--color-text);
		stroke: #fff;
	}

	/* Resting state: fully assembled, static (no animation cost until
	   interacted with). Hover/tap replays the build-in, staggered per cube
	   via animation-delay (set inline per cube above) — :hover re-triggers
	   on every entry since re-applying the animation property restarts it;
	   was-tapped (JS-toggled, see toggle()) gives touch the same guaranteed
	   pulse :hover can't reliably provide on tap. Leaving the hover/tap
	   state simply drops the animation rule, reverting instantly to the
	   plain opacity:1 rule below rather than freezing mid-fade. */
	.tile__cube {
		opacity: 1;
		transform-box: fill-box;
		transform-origin: center;
	}
	.tile:hover .tile__cube,
	.tile.was-tapped .tile__cube {
		/* animation-delay itself comes from the inline style set per cube in
		   the template (staggers the build) — inline specificity wins over
		   this shorthand's own implicit animation-delay:0s regardless of
		   rule order. */
		animation: cube-build 0.5s ease-out both;
	}

	@keyframes cube-build {
		0% {
			opacity: 0;
			transform: scale(0.4);
		}
		100% {
			opacity: 1;
			transform: scale(1);
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
		.hero,
		.section-block {
			max-width: none;
			padding-inline: calc(var(--padding) * 1.5);
		}
		.hero h1,
		.hero-en,
		.hero-ja,
		.section-note {
			max-width: 640px;
		}

		.wwd-grid {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 40px 32px;
		}
		.wwd-item {
			flex: 1 1 calc(50% - 16px);
			min-width: 280px;
		}

		.steps {
			flex-direction: row;
			gap: 8px;
		}
		.step {
			flex: 1;
			grid-template-columns: 1fr;
			border-top: 1px solid var(--color-line);
			padding-top: 12px;
		}
		.step__num {
			grid-column: 1;
		}
		.step__desc {
			grid-column: 1;
		}
		.schedules {
			flex-direction: row;
			gap: 40px;
		}

		.plans {
			flex-direction: row;
		}
		.plan-item {
			flex: 1;
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
