<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Lenis from 'lenis';
	import { stopLenis, startLenis } from '$lib/state/lenis';
	import Logo from '$lib/components/Logo.svelte';

	let track: HTMLElement | undefined = $state();
	let inner: HTMLElement | undefined = $state();

	type Service = {
		title: string;
		subtitle: string;
		bodyEn: string;
		body: string;
		link?: string;
	};

	const services: Service[] = [
		{
			title: 'Product & Furniture Design',
			subtitle: '工業デザインと家具デザイン',
			bodyEn:
				'We develop products that bring use and quiet joy to daily life, returning to the materiality that meets the body and pursuing the forms that must inevitably arise from material, structure, and presence. Amid this transformation of the age, a more fundamental interaction — embodiment and emotion — has become our central concern. We continue this practice day by day, returning to the body and heart that are our origin.',
			body: '身体に直接触れる物質性に立ち返り、素材・構造・佇まいの関係性を再構築することで立ち上がる、必然のかたちを追い求めながら、日々の所作に添う用と喜びのあるプロダクトの企画・開発を行っています。わたしたちが直面しているこの大きな時代の変革において、より根源的で確かな相互作用——「身体性」と「情緒」が、私たちの大きな関心へとなりつつあります。私たちのオリジンである身体と心へと立ち返ることを大切に、日々学びながらその実践を続けてまいります。'
		},
		{
			title: 'V.I. & Typography',
			subtitle: 'ビジュアルアイデンティティと書体の開発',
			bodyEn:
				'From brand strategy and direction through to logo, graphic, and package design, we work across the full arc of creation. Our in-house type foundry, August Type Foundry, develops typefaces in pursuit of new forms that reinterpret history within a contemporary context. The precision honed in type design runs through all our branding, shaping a coherent formal language at the core of each brand.',
			body: '私たちは、ブランディングを始めとするクリエイティブ戦略の策定・ディレクションから、ロゴ・グラフィックデザイン・パッケージデザインといったクリエイションまで手掛けています。また弊社主宰のタイプファウンダリ——August Type Foundryは、歴史を紐解き、現代の文脈で再解釈することで生まれるニューフォームを追い求め、タイプフェイス——書体の開発を行っています。書体開発で培ったディテールの追求をブランディング領域まで徹底し、ブランドの根幹を表現する一貫した造形言語を創造します。',
			link: 'www.august.tf'
		},
		{
			title: 'Image Visualisation',
			subtitle: 'イメージクリエイションとCGビジュアライゼーション',
			bodyEn:
				'We direct and produce image creation as a single, integrated practice. Extending the eye for light and texture honed in live-action photography into 3DCGI and visualisation, we pursue imagery with true substance — fixing into the image the atmosphere and mass latent within each subject.',
			body: '私たちは、イメージクリエイションのディレクションと制作を一貫して手がけています。実写撮影で培った光と質感への眼差しを3DCGI・ビジュアライゼーションの領域まで拡げ、被写体に潜む空気と質量を画として定着させる、確かな実体性をまとうビジュアル表現を追求します。'
		},
		{
			title: 'Digital Infrastructure',
			subtitle: 'UXとデジタルコミュニケーションの設計',
			bodyEn:
				'Our in-house engineering studio, Post Script, designs and builds digital products — brand sites, e-commerce, reservation systems, and web apps — and digital infrastructure, including AI / DX integration. With a modern stack and considered architecture, we refine experience and usability to give form to a brand in the digital world.',
			body: '弊社主宰のエンジニアリングスタジオ——Post Scriptでは、ブランドサイトやEコマース、予約システムの開発、Webアプリの開発などのデジタルプロダクトの設計と実装と、AI/DXインテグレーションなどの、デジタルインフラストラクチャ構築を行なっています。モダンな技術スタックを用い最適なアーキテクチャを設計することで、UXと利便性を向上させ高度なデジタルコミュニケーションと体験を整え、ブランドのデジタル体験を形にします。',
			link: 'www.joulejoule.com'
		}
	];

	type Part = { en: string; ja: string; enBody: string; jaBody: string };
	const ethosIntro = {
		en: 'The 21st century we inhabit is driven by capitalism — the ceaseless cycle of production and consumption. Designers, too, are one of its gears: we give contour to the formless, spur consumption, and send things out into the world. As those who help accelerate that consumption, we feel we must look closely at this age and keep learning from it.',
		ja: 'わたしたちが生きる21世紀は、生産と消費の絶え間ない循環——資本主義によって駆動されています。デザイナーもまた、その歯車のひとつとして、形のないものに輪郭を与え、消費を促し、世に送り出すことを生業としています。その消費を促進させる身として、わたしたちはこの時代をよく捉え、学んでいく必要があると感じています。'
	};
	const ethosParts: Part[] = [
		{
			en: 'I. Acceleration and Attention Economy',
			ja: '/ 加速主義とアテンション経済',
			enBody:
				'The present we live in sits amid a confusion faster and deeper than at the dawn of the Industrial Revolution, or even the Digital one. Technology accelerates, social change accelerates, and the very pace of life accelerates; the margin to pause is lost, and we are ceaselessly driven by something (Rosa, 2005). Upon this acceleration, human attention and behaviour themselves are treated as capital and mined; built on that data, mechanisms engineered to trigger dopamine come to govern our habits, and the inner life turns into a commodity (Zuboff, 2019). Easy happiness has become something taken instantly — and at the same time we are made to feel that it is not what we chose, but a consequence the structure has produced. Within that same acceleration, we keep transforming the planet irreversibly; each act of consumption stacks an unseen burden upon the future (Crutzen, 2000). What this acceleration, attention economy, and environmental burden have cost us is, we believe, corporeality itself.',
			jaBody:
				'わたしたちの生きる今は、産業革命が起きた時よりも、デジタル革命が起きた時よりも、なお速く、深い混乱のただ中にあります。技術が加速し、社会の変化が加速し、生活のペースそのものが加速していく。立ち止まるための余白は失われ、わたしたちは絶えず追い立てられています (Rosa, 2005)。加速の上では、人の注意や行動そのものが資本的価値とみなされ搾取され、それらを基にドーパミンを刺激するよう設計された仕組みがわたしたちの行動を支配していきます (Zuboff, 2019)。簡便な幸福がインスタントに摂取できるものになったと同時に、それはわたしたちが選び取ったものではなく、構造がもたらした結果にすぎないのだと思わされます。またその加速のなかで、わたしたちは地球環境を不可逆に変容させ続けています。消費のひとつひとつが、見えないところで未来に負荷を積み重ねています (Crutzen, 2000)。この加速と行動の搾取、そして環境への負荷によってわたしたちが真に失ったのは、身体性なのではないかと考えています。'
		},
		{
			en: 'II. Le corps vécu and Resonance',
			ja: '/ 生きられた身体と共鳴',
			enBody:
				'“The human being does not first understand the world with the head, but dwells within it through the body; the lived body — le corps vécu — is the first site that binds the world and us.” So Merleau-Ponty wrote in his Phenomenology of Perception (Merleau-Ponty, 1945). What grows thin within the accelerating world is precisely this experience through the body (Bauman, 2000). To see, to touch, to feel with the skin — what remains in the body as substance has grown relatively faint, and that sensation is our point of departure. At the opposite pole of acceleration lies resonance: a relationship in which we do not own or dominate the world, but call out to it and are answered in turn (Rosa, 2016). What we would call “a more fundamental and certain interaction” feels close to this resonance. To move our focus toward corporeality, and toward emotion — this is not nostalgia, but a return for resonating with the world once more.',
			jaBody:
				'「人間は、まず頭で世界を理解するのではなく、身体を通して世界のなかに住み込んでいる。『生きられた身体（le corps vécu）』こそが、世界とわたしたちを繋ぐ最初の場である」と、メルロー＝ポンティはその著書『知覚の現象学』で説いています (Merleau-Ponty, 1945)。加速していく世界のなかで痩せていくのは、まさにこの「身体を通した経験」なのだと思います (Bauman, 2000)。見て、触れて、その肌で感じること、実体として身体に残るものが、相対的に薄くなっている——その感覚が、わたしたちの出発点にあります。その加速の対極に位置するのが、「共鳴（Resonance）」と呼ばれる、世界を所有し支配するのではなく、世界に呼びかけ、世界から応答される関係です (Rosa, 2016)。わたしたちが「より根源的で確かな相互作用」と呼びたいものは、おそらくこの共鳴に近いものだと感じています。身体性、そして情緒へと焦点を移すこと。それは懐古ではなく、世界と共鳴するための回帰なのだと、わたしたちは捉えています。'
		},
		{
			en: 'III. Defuturing',
			ja: '/ 脱未来化',
			enBody:
				'To keep making the unsustainable is not to make a future; it is to quietly rob the next generation of its choices — a condition called defuturing (Fry, 1999). A designer can give physical form to the metaphysical, intervening across a wide span of human life: lifestyles, material values, modes of consumption. The weight of that responsibility was already pointed out half a century ago (Papanek, 1971), and we ourselves are among those who, day by day, accelerate consumption and add to its burden. How things act upon the world, and what in turn shapes it — we know astonishingly little. That is exactly why we must keep learning, day after day. So that when each of us reaches the end of our path we might leave even a little to hand on to the next generation, we will not stop thinking, and will keep on learning.',
			jaBody:
				'持続不可能なものを作り続けるという行為は、未来を作っているのではありません。それは、次の世代から選択肢を静かに奪っている——「脱未来化（defuturing）」と呼ばれる事態です (Fry, 1999)。デザイナーは、形而上のものを形而下へと具象化できる職能です。生活様式や物的価値、消費の様態といった、人間の営みの広い範囲に介入し得る。その責任の重さは、すでに半世紀前から指摘されてきました (Papanek, 1971)。そしてわたしたち自身が、日々、消費を加速させ、負荷を積み重ねている当事者でもあります。何がどのように世界に作用しているのか、そして何が世界を形作っているのか、驚くほどわたしたちは知りません。だからこそ、日々学びを重ね続けなければならないのだと思います。わたしたちがそれぞれのキャリアを終えるその時に、わずかでも次代に手渡せるものを残すために、日々思考を止めず、学びを続けてまいります。'
		}
	];

	onMount(() => {
		if (!browser) return;

		// Horizontal Lenis is desktop-only. On SP the panels stack vertically,
		// so the page keeps native vertical scroll (global Lenis stays active).
		const mq = window.matchMedia('(min-width: 1024px)');
		let lenis: Lenis | null = null;
		let rafId = 0;

		const enable = () => {
			if (lenis || !track || !inner) return;
			// Hand off from global vertical Lenis; lock page vertical scroll.
			stopLenis();
			document.documentElement.style.overflowY = 'hidden';
			// gestureOrientation:'both' maps trackpad/wheel vertical → horizontal.
			lenis = new Lenis({
				wrapper: track,
				content: inner,
				orientation: 'horizontal',
				gestureOrientation: 'both',
				smoothWheel: true,
				duration: 1.2
			});
			const raf = (time: number) => {
				lenis?.raf(time);
				rafId = requestAnimationFrame(raf);
			};
			rafId = requestAnimationFrame(raf);
		};

		const disable = () => {
			if (!lenis) return;
			cancelAnimationFrame(rafId);
			lenis.destroy();
			lenis = null;
			document.documentElement.style.overflowY = '';
			startLenis();
		};

		const onChange = (e: MediaQueryListEvent) => (e.matches ? enable() : disable());
		if (mq.matches) enable();
		mq.addEventListener('change', onChange);

		return () => {
			mq.removeEventListener('change', onChange);
			disable();
		};
	});
</script>

<svelte:head>
	<title>Office — TAKUMIISOBE.com</title>
</svelte:head>

<main class="OfficePage">
	<div class="h-track" bind:this={track}>
		<div class="h-inner" bind:this={inner}>

			<!-- ─── Panel 1: First view ─── -->
			<section class="panel panel--intro">
				<div class="intro-inner">
					<div class="intro-grid">

						<!-- Col 1: Studio description -->
						<div class="col col--studio">
							<p class="col-body" lang="en">
								Office / TAKUMI ISOBE is a creative office based in Tokyo working across
								visual identity and design engineering — experience, brand, product, type,
								furniture, and digital communication. By blending culture, philosophy, and
								design, we create strategies that speak to what makes us human — our
								physicality, our emotion. Day by day, learning further, we strive toward
								better creation.
							</p>
						</div>

						<!-- Col 2: Connect -->
						<div class="col col--connect">
							<ul class="col-list" lang="en">
								<li><a href="mailto:hi@takumiisobe.com">Email ↗</a></li>
								<li>
									<a
										href="https://www.instagram.com/takumi.isobe"
										target="_blank"
										rel="noopener noreferrer">Instagram ↗</a
									>
								</li>
								<li>
									<a href="https://www.august.tf" target="_blank" rel="noopener noreferrer"
										>August.tf ↗</a
									>
								</li>
								<li>
									<a
										href="https://www.joulejoule.com"
										target="_blank"
										rel="noopener noreferrer">Post Script ↗</a
									>
								</li>
							</ul>
							<p class="col-meta" lang="en">Tokyo, Japan</p>
						</div>

					</div>

					<!-- Office logo full-width at the bottom -->
					<div class="wordmark">
						<Logo />
					</div>
				</div>
			</section>

			<!-- ─── Panel 2: Services ─── -->
			<section class="panel panel--services">
				<div class="panel-inner">
					<header class="panel-hd">
						<span class="pn" lang="en">02</span>
						<h2 class="pt" lang="en">Services</h2>
					</header>
					<div class="panel-content services-row">
						{#each services as s}
							<article class="service-card">
								<h3 class="service-title" lang="en">{s.title}</h3>
								<p class="service-sub" lang="ja">{s.subtitle}</p>
								<p class="service-en" lang="en">{s.bodyEn}</p>
								<p class="service-ja" lang="ja">{s.body}</p>
								{#if s.link}
									<a
										class="service-link"
										href={`https://${s.link}`}
										target="_blank"
										rel="noopener noreferrer"
										lang="en">{s.link} ↗</a
									>
								{/if}
							</article>
						{/each}
					</div>
				</div>
			</section>

			<!-- ─── Panel 3: Company ─── -->
			<section class="panel panel--company">
				<div class="panel-inner">
					<header class="panel-hd">
						<span class="pn" lang="en">03</span>
						<h2 class="pt" lang="en">Company</h2>
					</header>
					<div class="panel-content company-row">
						<dl class="cfacts" lang="en">
							<div class="cfact"><dt>Company</dt><dd>Mirai Service Co., Ltd.</dd></div>
							<div class="cfact">
								<dt>Address</dt>
								<dd>1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi<br />451-0034 Japan</dd>
							</div>
							<div class="cfact"><dt>Capital</dt><dd>JPY 10,000,000</dd></div>
							<div class="cfact"><dt>Established</dt><dd>2005.07.20</dd></div>
						</dl>
						<dl class="cfacts" lang="ja">
							<div class="cfact"><dt>屋号</dt><dd>株式会社みらいサービス</dd></div>
							<div class="cfact">
								<dt>所在地</dt><dd>〒451-0034 愛知県名古屋市西区樋の口町1-16</dd>
							</div>
							<div class="cfact"><dt>資本金</dt><dd>1,000万円</dd></div>
							<div class="cfact"><dt>設立</dt><dd>2005.07.20</dd></div>
						</dl>
					</div>
				</div>
			</section>

			<!-- ─── Panel 4: Ethos ─── -->
			<section class="panel panel--ethos">
				<div class="panel-inner">
					<header class="panel-hd">
						<span class="pn" lang="en">04</span>
						<h2 class="pt" lang="en">Ethos</h2>
					</header>
					<div class="panel-content ethos-row">
						<div class="ethos-block ethos-block--intro">
							<p class="ethos-en" lang="en">{ethosIntro.en}</p>
							<p class="ethos-ja" lang="ja">{ethosIntro.ja}</p>
						</div>
						{#each ethosParts as p}
							<div class="ethos-block">
								<h3 class="ethos-part">
									<span class="ethos-part-en" lang="en">{p.en}</span>
									<span class="ethos-part-ja" lang="ja">{p.ja}</span>
								</h3>
								<p class="ethos-en" lang="en">{p.enBody}</p>
								<p class="ethos-ja" lang="ja">{p.jaBody}</p>
							</div>
						{/each}
					</div>
				</div>
			</section>

			<!-- ─── Panel 5: Director ─── -->
			<section class="panel panel--director">
				<div class="panel-inner">
					<header class="panel-hd">
						<span class="pn" lang="en">05</span>
						<h2 class="pt" lang="en">Director</h2>
					</header>
					<div class="panel-content director-row">
						<div class="director-text">
							<p lang="en">
								Born in Japan in 2001.<br />
								While attending the University of Westminster in the UK, exposed to a wide
								range of cultures and arts, I developed a strong interest in visual
								expression and entered the creative industry. After working at several
								design studios in Tokyo, I established my own practice. Today, as creative
								director, I run a design office at the core of my work, alongside a type
								foundry, an image-making studio, and a wine community.
							</p>
							<p lang="ja">
								2001年日本生まれ。<br />
								英国University of Westminster(ウェストミンスター大学)在学時、多様な文化と芸術に触れる中で、視覚表現に強く興味を抱きクリエイティブインダストリーへ。COVID19の中で帰国し東京都内のデザインオフィス数社を経て、独立。現在は株式会社みらいサービスの取締役／クリエイティブ事業部のファウンダーとして、デザインオフィスを基軸にタイプファウンダリやイメージメークスタジオ、ワインコミュニティの運営を行っている。
							</p>
						</div>
					</div>
				</div>
			</section>

		</div><!-- .h-inner -->
	</div><!-- .h-track -->
</main>

<style>
	/* ── Language toggle: show only the active language's body copy.
	   English headings/labels (service title, section labels, nav) stay;
	   JA glosses (subtitles, etc.) appear only in JA. [data-lang] is on <html>. ── */
	:global([data-lang='en']) .service-sub,
	:global([data-lang='en']) .service-ja,
	:global([data-lang='en']) .ethos-part-ja,
	:global([data-lang='en']) .ethos-ja,
	:global([data-lang='en']) .cfacts[lang='ja'],
	:global([data-lang='en']) .director-text p[lang='ja'] {
		display: none;
	}
	:global([data-lang='ja']) .service-en,
	:global([data-lang='ja']) .ethos-en,
	:global([data-lang='ja']) .cfacts[lang='en'],
	:global([data-lang='ja']) .director-text p[lang='en'] {
		display: none;
	}

	/* ── Page host: fills viewport, no spacing ── */
	.OfficePage {
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
		padding: 0;
		margin: 0;
		background: var(--color-bg);
	}

	/* ── Horizontal scroll track (Lenis drives scrollLeft) ──
	   No scroll-snap: it fights Lenis's per-frame scrollLeft writes. */
	.h-track {
		width: 100%;
		height: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.h-track::-webkit-scrollbar {
		display: none;
	}

	/* ── Inner row: panels laid out horizontally ── */
	.h-inner {
		display: flex;
		flex-direction: row;
		height: 100%;
	}

	/* ── Each panel: full viewport height; width is content-driven
	   (intro stays exactly one screen). ── */
	.panel {
		flex: none;
		height: 100dvh;
		overflow: hidden;
		position: relative;
	}
	.panel--intro {
		width: 100vw;
	}

	/* ── Panel 1: First view ── */
	.panel--intro .intro-inner {
		width: 100%;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		padding-top: 80px;
		padding-bottom: 0;
	}

	/* 2-column info grid — full-bleed (no side padding).
	   3fr/1fr = 75:25 ratio, but gap-aware. */
	.intro-grid {
		display: grid;
		grid-template-columns: 3fr 1fr;
		column-gap: 48px;
		align-items: start;
	}

	/* Studio body copy — size/line-height/align come from base.css p:lang(en).
	   Only bump one type step above the list items. */
	.col-body {
		font-size: var(--fs-h2);
		margin: 0;
	}

	.col-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.col-list li {
		font-size: var(--fs-h6);
		line-height: 1.4;
	}
	:global(.OfficePage) .col-list a {
		text-decoration: none;
		transition: opacity 0.2s var(--ease-default);
	}
	:global(.OfficePage) .col-list a:hover {
		opacity: 0.45;
	}

	.col-meta {
		font-size: var(--fs-h6);
		margin: 32px 0 0;
		opacity: 0.45;
	}

	/* ── Logo wordmark — full-bleed, bottom-anchored ── */
	.wordmark {
		flex: none;
		width: 100%;
		overflow: hidden;
		padding-bottom: 10px;
		line-height: 1;
	}
	.wordmark :global(svg) {
		width: 100%;
		height: auto;
		display: block;
	}

	/* ── Content panels (Services / Company / Ethos / Director) ── */
	.panel:not(.panel--intro) .panel-inner {
		height: 100%;
		padding: 100px calc(var(--padding) * 1.5) 56px;
		display: flex;
		flex-direction: column;
		gap: 44px;
	}

	/* Section header — number over title */
	.panel-hd {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	.pn {
		font-size: var(--fs-h5);
		opacity: 0.4;
	}
	.pt {
		font-size: var(--fs-h2);
		font-weight: var(--fw-lead);
		font-variation-settings: 'wght' var(--fw-lead);
		line-height: 1.15;
	}

	/* Content area: horizontal row of columns, fills remaining height */
	.panel-content {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: row;
		gap: 48px;
	}

	/* ── Services ── */
	.service-card {
		flex: none;
		width: 30vw;
		max-width: 440px;
		display: flex;
		flex-direction: column;
	}
	.service-title {
		font-size: var(--fs-h3);
		margin: 0;
		/* Reserve 2 lines so subtitle + body start at the same Y across cards */
		min-height: 2.66em;
	}
	.service-sub {
		font-size: 10px;
		line-height: 1.7;
		margin: 4px 0 0;
		opacity: 0.6;
	}
	.service-en {
		margin: 16px 0 0;
		line-height: 1.45;
	}
	.service-ja {
		margin: 10px 0 0;
	}
	.service-link {
		font-size: var(--fs-h5);
		margin-top: auto;
		padding-top: 16px;
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	.service-link:hover {
		opacity: 0.6;
	}

	/* ── Company ── */
	.company-row {
		gap: 80px;
		align-items: flex-start;
	}
	.cfacts {
		flex: none;
		width: 30vw;
		max-width: 440px;
		margin: 0;
	}
	.cfact {
		display: flex;
		align-items: baseline;
		padding: 12px 0;
		border-top: 1px solid var(--color-line);
	}
	.cfact:last-child {
		border-bottom: 1px solid var(--color-line);
	}
	.cfact dt {
		flex: none;
		width: 30%;
		margin-right: 24px;
		opacity: 0.5;
	}
	.cfact dd {
		flex: 1;
		margin: 0;
	}

	/* ── Ethos ── */
	/* Wider columns keep each part within one screen height (no v-scroll). */
	.ethos-block {
		flex: none;
		width: 44vw;
		max-width: 640px;
		display: flex;
		flex-direction: column;
	}
	.ethos-block--intro {
		width: 30vw;
		max-width: 420px;
	}
	.ethos-part {
		margin: 0 0 14px;
	}
	.ethos-part-en {
		display: block;
		font-size: var(--fs-h4);
		font-weight: var(--fw-medium);
		line-height: 1.3;
	}
	.ethos-part-ja {
		display: block;
		font-family: var(--font-ja);
		font-size: var(--fs-p-ja);
		font-weight: var(--fw-base);
		margin-top: 2px;
		opacity: 0.7;
	}
	.ethos-en {
		margin: 0;
		line-height: 1.45;
	}
	.ethos-ja {
		margin: 12px 0 0;
	}

	/* ── Director ── */
	.director-text {
		flex: none;
		width: 44vw;
		max-width: 640px;
	}
	.director-text p + p {
		margin-top: 24px;
	}

	/* ── Mobile: vertical stack (SP) ── */
	@media (max-width: 1023px) {
		.OfficePage {
			height: auto;
			overflow: visible;
		}
		.h-track {
			overflow: visible;
			height: auto;
		}
		.h-inner {
			flex-direction: column;
			height: auto;
		}
		.panel,
		.panel--intro {
			width: 100%;
			height: auto;
			min-height: 100dvh;
		}
		.intro-grid {
			grid-template-columns: 1fr;
			gap: 32px;
		}
		/* Stacked content: columns become rows, fluid width */
		.panel:not(.panel--intro) .panel-inner {
			padding: 90px var(--padding) var(--padding);
			gap: 32px;
		}
		.panel-content {
			flex-direction: column;
			gap: 48px;
		}
		.service-card,
		.ethos-block,
		.ethos-block--intro,
		.cfacts,
		.director-text {
			width: 100%;
			max-width: none;
		}
		.company-row {
			gap: 40px;
		}
		.service-link {
			margin-top: 16px;
		}
		/* Stacked cards don't need the 2-line reserve */
		.service-title {
			min-height: 0;
		}
	}

	/* ── Wide desktop ── */
	@media (min-width: 1440px) {
		.intro-grid {
			gap: 64px;
		}
	}
</style>
