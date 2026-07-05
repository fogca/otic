<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import gsap from 'gsap';
	import { getLenis } from '$lib/state/lenis';
	import Logo from '$lib/components/Logo.svelte';

	let introInnerEl: HTMLElement | undefined = $state();
	let wordmarkEl: HTMLElement | undefined = $state();
	let introTextEl: HTMLElement | undefined = $state();
	let revealEl: HTMLElement | undefined = $state();

	type Service = {
		title: string;
		subtitle: string;
		bodyEn: string;
		body: string;
		link?: string;
		image?: string;
		imageAlt?: string;
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
			link: 'www.august.tf',
			image: '/images/services_typefoundry_02.png',
			imageAlt: 'V.I. & Typography'
		},
		{
			title: 'Image Visualisation',
			subtitle: 'イメージクリエイションとCGビジュアライゼーション',
			bodyEn:
				'We direct and produce image creation as a single, integrated practice. Extending the eye for light and texture honed in live-action photography into 3DCGI and visualisation, we pursue imagery with true substance — fixing into the image the atmosphere and mass latent within each subject.',
			body: '私たちは、イメージクリエイションのディレクションと制作を一貫して手がけています。実写撮影で培った光と質感への眼差しを3DCGI・ビジュアライゼーションの領域まで拡げ、被写体に潜む空気と質量を画として定着させる、確かな実体性をまとうビジュアル表現を追求します。',
			image: '/images/services_visualisation.png',
			imageAlt: 'Image Visualisation'
		},
		{
			title: 'Digital Infrastructure',
			subtitle: 'UXとデジタルコミュニケーションの設計',
			bodyEn:
				'Our in-house engineering studio, Post Script, designs and builds digital products — brand sites, e-commerce, reservation systems, and web apps — and digital infrastructure, including AI / DX integration. With a modern stack and considered architecture, we refine experience and usability to give form to a brand in the digital world.',
			body: '弊社主宰のエンジニアリングスタジオ——Post Scriptでは、ブランドサイトやEコマース、予約システムの開発、Webアプリの開発などのデジタルプロダクトの設計と実装と、AI/DXインテグレーションなどの、デジタルインフラストラクチャ構築を行なっています。モダンな技術スタックを用い最適なアーキテクチャを設計することで、UXと利便性を向上させ高度なデジタルコミュニケーションと体験を整え、ブランドのデジタル体験を形にします。',
			link: 'www.joulejoule.com',
			image: '/images/services_production.png',
			imageAlt: 'Digital Infrastructure'
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

	// Scroll-linked intro sequence: as the user scrolls past the first view,
	// the wordmark shrinks from full-bleed down to the width of the studio
	// text above it, then the reveal image scales up from underneath it.
	// Pinned + scrubbed (tied directly to scroll position, not a one-shot
	// trigger) via GSAP ScrollTrigger.
	onMount(() => {
		if (!browser) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (!introInnerEl || !wordmarkEl || !introTextEl || !revealEl) return;
		// Capture as locals: TS can't carry the narrowing from the guard above
		// across the async `.then()` boundary, and these are $state fields
		// that could theoretically be reassigned (they won't be, but the
		// non-null guarantee needs to live on something stable).
		const introInner = introInnerEl;
		const wordmark = wordmarkEl;
		const introText = introTextEl;
		const reveal = revealEl;

		let cancelled = false;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let tl: any;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let lenis: any;
		let onLenisScroll: (() => void) | undefined;

		import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
			if (cancelled) return;
			gsap.registerPlugin(ScrollTrigger);

			// The global Lenis (site-wide smooth scroll, set up in +layout.svelte)
			// virtualises scroll — ScrollTrigger needs to be nudged on every
			// Lenis tick or its progress calculations lag behind what's on screen.
			lenis = getLenis();
			if (lenis) {
				onLenisScroll = () => ScrollTrigger.update();
				lenis.on('scroll', onLenisScroll);
			}

			const targetWidth = () => introText.getBoundingClientRect().width;

			gsap.set(reveal, { scale: 0.4, opacity: 0, transformOrigin: '50% 0%' });

			tl = gsap.timeline({
				scrollTrigger: {
					trigger: introInner,
					start: 'top top',
					end: '+=1200',
					pin: true,
					scrub: 1,
					invalidateOnRefresh: true
				}
			});

			// Phase 1: wordmark shrinks to match the text's rendered width.
			tl.to(wordmark, {
				width: targetWidth,
				duration: 1,
				ease: 'none'
			});
			// Phase 2: reveal image scales up from beneath the (now-shrunk) wordmark.
			tl.fromTo(
				reveal,
				{ scale: 0.4, opacity: 0 },
				{ scale: 1, opacity: 1, duration: 1, ease: 'none' }
			);
		});

		return () => {
			cancelled = true;
			if (onLenisScroll) lenis?.off('scroll', onLenisScroll);
			tl?.scrollTrigger?.kill();
			tl?.kill();
		};
	});
</script>

<svelte:head>
	<title>Office — TAKUMIISOBE.com</title>
</svelte:head>

<main class="OfficePage">

	<!-- ─── Panel 1: First view ─── -->
	<section class="panel panel--intro">
		<div class="intro-inner" bind:this={introInnerEl}>
			<!-- Studio description — centred (X/Y) in the space above the logo -->
			<div class="intro-content">
				<p class="intro-text" bind:this={introTextEl} lang="en">
					Office / TAKUMI ISOBE is a creative office based in Tokyo working across
					visual identity and design engineering — experience, brand, product, type,
					furniture, and digital communication. By blending culture, philosophy, and
					design, we create strategies that speak to what makes us human — our
					physicality, our emotion. Day by day, learning further, we strive toward
					better creation.
				</p>
			</div>

			<!-- Office logo — full-bleed at rest; scroll-scrubbed to shrink down
			     to the studio text's width (see the onMount ScrollTrigger above). -->
			<div class="wordmark" bind:this={wordmarkEl}>
				<Logo />
			</div>

			<!-- Reveal image — scales up from beneath the shrunk wordmark as the
			     scroll sequence continues. Placeholder asset: swap {src} for the
			     real image. -->
			<div class="intro-reveal" bind:this={revealEl}>
				<img src="/images/services_visualisation.png" alt="" />
			</div>
		</div>
	</section>

			<!-- ─── Panel 2: Services ─── -->
			<section class="panel panel--services">
				<div class="panel-inner">
					<header class="panel-hd">
						<span class="pn" lang="en">02</span>
						<h2 class="pt" lang="en">Services &amp; Partners</h2>
					</header>
					<div class="panel-content services-row">
						{#each services as s}
							<article class="service-card">
								{#if s.image}
									<div class="service-image">
										<img src={s.image} alt={s.imageAlt ?? s.title} loading="lazy" />
									</div>
								{/if}
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

	/* ── Page host: normal vertical document flow (no scroll-jacking) ── */
	.OfficePage {
		width: 100%;
		padding: 0;
		margin: 0;
		background: var(--color-bg);
	}

	/* Panels stack vertically and size to their own content. */
	.panel {
		position: relative;
	}
	.panel--intro {
		min-height: 100dvh;
	}

	/* ── Panel 1: First view ── */
	.panel--intro .intro-inner {
		width: 100%;
		min-height: 100dvh;
		display: flex;
		flex-direction: column;
		padding-top: 80px;
		padding-bottom: 0;
	}

	/* Studio description — centred (X/Y) in the space above the logo.
	   flex:1 claims all height not used by the wordmark/reveal below. */
	.intro-content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-inline: var(--padding);
	}

	/* Line-height/weight come from base.css p:lang(en). Width-capped so
	   lines stay readable instead of stretching full-bleed; narrowed further
	   on SP below. PC gets a smaller font-size override further down. */
	.intro-text {
		font-size: var(--fs-h3);
		text-align: center;
		max-width: 720px;
		margin: 0;
	}

	/* ── Logo wordmark — full-bleed at rest; scroll-scrubbed to shrink down
	   to the studio text's width (see the onMount ScrollTrigger). ── */
	.wordmark {
		flex: none;
		width: 100%;
		margin-inline: auto;
		overflow: hidden;
		padding-bottom: 10px;
		line-height: 1;
	}
	.wordmark :global(svg) {
		width: 100%;
		height: auto;
		display: block;
	}

	/* ── Reveal image — scales up from beneath the shrunk wordmark.
	   opacity:0 at rest as a no-JS-yet-applied baseline; the ScrollTrigger
	   timeline drives scale/opacity from there once it loads. ── */
	.intro-reveal {
		flex: none;
		width: 100%;
		max-width: 720px;
		margin-inline: auto;
		margin-top: 24px;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: var(--color-bg-gray);
		opacity: 0;
	}
	.intro-reveal img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* ── Content panels (Services / Company / Ethos / Director) ──
	   Mobile-first: stacked, content-sized. PC gets side-by-side columns
	   via the min-width:1024px block further down. */
	.panel:not(.panel--intro) .panel-inner {
		height: auto;
		padding: 90px var(--padding) var(--padding);
		display: flex;
		flex-direction: column;
		gap: 32px;
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

	/* Content area — mobile-first: stacked column. PC becomes a horizontal
	   row of columns via the min-width:1024px block further down. */
	.panel-content {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: 48px;
	}

	/* ── Services ── */
	.service-card {
		width: 100%;
		display: flex;
		flex-direction: column;
	}
	.service-image {
		width: 100%;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background: var(--color-bg-gray);
		margin-bottom: 20px;
	}
	.service-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.service-title {
		font-size: var(--fs-h3);
		margin: 0;
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
		margin-top: 16px;
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
		gap: 40px;
		align-items: flex-start;
	}
	.cfacts {
		width: 100%;
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
	.ethos-block {
		width: 100%;
		display: flex;
		flex-direction: column;
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
		width: 100%;
	}
	.director-text p + p {
		margin-top: 24px;
	}

	/* SP: narrow the studio text a bit further than the page's standard
	   side padding already does. */
	@media (max-width: 1023px) {
		.intro-text {
			max-width: 78%;
		}
	}

	/* ── Desktop: side-by-side columns within each panel (the panels
	   themselves still stack vertically — this only affects layout inside
	   a panel, e.g. Services' 4 cards in a row). ── */
	@media (min-width: 1024px) {
		/* "A bit smaller" than the shared fs-h3 (PC-only; SP keeps fs-h3). */
		.intro-text {
			font-size: var(--fs-h4);
		}

		.panel:not(.panel--intro) .panel-inner {
			padding: 100px calc(var(--padding) * 1.5) 56px;
			gap: 44px;
		}
		.panel-content {
			flex-direction: row;
		}

		.service-card {
			flex: none;
			width: 30vw;
			max-width: 440px;
		}
		/* Reserve 2 lines so subtitle + body start at the same Y across cards */
		.service-title {
			min-height: 2.66em;
		}
		.service-link {
			margin-top: auto;
		}

		.company-row {
			gap: 80px;
		}
		.cfacts {
			flex: none;
			width: 30vw;
			max-width: 440px;
		}

		.ethos-block {
			flex: none;
			width: 44vw;
			max-width: 640px;
		}
		.ethos-block--intro {
			width: 30vw;
			max-width: 420px;
		}

		.director-text {
			flex: none;
			width: 44vw;
			max-width: 640px;
		}
	}
</style>
