<script lang="ts">
	import { onMount } from 'svelte';

	// Office page — static for now, microCMS later

	const padNumber = (n: number) => String(n + 1).padStart(2, '0');

	type Project = { no: string; code: string; name: string; action: string };
	type Service = {
		title: string;
		subtitle: string;
		bodyEn: string;
		body: string;
		image: string;
		imageAlt: string;
		projects: Project[];
		// Split visual: 16:9 area divided into two 8:9 panels (gap 0).
		// Left is a video slot (mp4, TBD), right is `image`.
		split?: boolean;
		leftVideo?: string;
		// External link (domain only, e.g. 'www.august.tf'); opens in a new tab.
		link?: string;
	};

	const services: Service[] = [
		{
			title: 'Product & Furniture Design',
			subtitle: '工業デザインと家具デザイン',
			bodyEn:
				'We develop products that bring use and quiet joy to daily life, returning to the materiality that meets the body and pursuing the forms that must inevitably arise from material, structure, and presence. Amid this transformation of the age, a more fundamental interaction — embodiment and emotion — has become our central concern. We continue this practice day by day, returning to the body and heart that are our origin.',
			body: '身体に直接触れる物質性に立ち返り、素材・構造・佇まいの関係性を再構築することで立ち上がる、必然のかたちを追い求めながら、日々の所作に添う用と喜びのあるプロダクトの企画・開発を行っています。わたしたちが直面しているこの大きな時代の変革において、より根源的で確かな相互作用——「身体性」と「情緒」が、私たちの大きな関心へとなりつつあります。私たちのオリジンである身体と心へと立ち返ることを大切に、日々学びながらその実践を続けてまいります。',
			image: '',
			imageAlt: 'Industrial Design',
			projects: []
		},
		{
			title: 'V.I. & Typography',
			subtitle: 'ビジュアルアイデンティティと書体の開発',
			bodyEn:
				'From brand strategy and direction through to logo, graphic, and package design, we work across the full arc of creation. Our in-house type foundry, August Type Foundry, develops typefaces in pursuit of new forms that reinterpret history within a contemporary context. The precision honed in type design runs through all our branding, shaping a coherent formal language at the core of each brand.',
			body: '私たちは、ブランディングを始めとするクリエイティブ戦略の策定・ディレクションから、ロゴ・グラフィックデザイン・パッケージデザインといったクリエイションまで手掛けています。また弊社主宰のタイプファウンダリ——August Type Foundryは、歴史を紐解き、現代の文脈で再解釈することで生まれるニューフォームを追い求め、タイプフェイス——書体の開発を行っています。書体開発で培ったディテールの追求をブランディング領域まで徹底し、ブランドの根幹を表現する一貫した造形言語を創造します。',
			image: '/images/services_typefoundry_02.png',
			imageAlt: 'V.I. & Typography',
			projects: [],
			split: true,
			leftVideo: '/images/services_typefoundry_01.mp4',
			link: 'www.august.tf'
		},
		{
			title: 'Image Visualisation',
			subtitle: 'イメージクリエイションとCGビジュアライゼーション',
			bodyEn:
				'We direct and produce image creation as a single, integrated practice. Extending the eye for light and texture honed in live-action photography into 3DCGI and visualisation, we pursue imagery with true substance — fixing into the image the atmosphere and mass latent within each subject.',
			body: '私たちは、イメージクリエイションのディレクションと制作を一貫して手がけています。実写撮影で培った光と質感への眼差しを3DCGI・ビジュアライゼーションの領域まで拡げ、被写体に潜む空気と質量を画として定着させる、確かな実体性をまとうビジュアル表現を追求します。',
			image: '/images/services_visualisation.png',
			imageAlt: 'Image Visualisation',
			projects: []
		},
		{
			title: 'Digital Infrastructure',
			subtitle: 'UXとデジタルコミュニケーションの設計',
			bodyEn:
				'Our in-house engineering studio, Post Script, designs and builds digital products — brand sites, e-commerce, reservation systems, and web apps — and digital infrastructure, including AI / DX integration. With a modern stack and considered architecture, we refine experience and usability to give form to a brand in the digital world.',
			body: '弊社主宰のエンジニアリングスタジオ——Post Scriptでは、ブランドサイトやEコマース、予約システムの開発、Webアプリの開発などのデジタルプロダクトの設計と実装と、AI/DXインテグレーションなどの、デジタルインフラストラクチャ構築を行なっています。モダンな技術スタックを用い最適なアーキテクチャを設計することで、UXと利便性を向上させ高度なデジタルコミュニケーションと体験を整え、ブランドのデジタル体験を形にします。',
			image: '/images/services_production.png',
			imageAlt: 'Digital Infrastructure',
			projects: [],
			link: 'www.joulejoule.com'
		}
	];

	// Per-service copy expansion (Show toggle). Clamped + faded by default.
	let openCopy = $state(services.map(() => false));

	// Scroll-driven background: white through 01 Office, then fade to dark
	// (#181818 / white text) once 02 Services reaches the viewport middle.
	// Once dark, it stays dark for everything below. Reactive class (not
	// classList) so Svelte keeps the scoped .is-dark styles.
	let isDark = $state(false);

	onMount(() => {
		const office = document.querySelector('.Office');
		// 03 Company = the first .Founder block
		const company = office?.querySelector('.Founder');
		if (!office || !company) return;

		let ticking = false;
		const update = () => {
			ticking = false;
			const vh = window.innerHeight;
			// Reverse to dark once 03 Company reaches the upper 30% of the viewport
			const enteredDark = company.getBoundingClientRect().top <= vh * 0.3;
			// Close the dark section back to white just before the black Footer
			// scrolls in (office.bottom accounts for the -120px margin).
			const nearFooter = office.getBoundingClientRect().bottom <= vh + 120;
			isDark = enteredDark && !nearFooter;
		};
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(update);
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		update();
		return () => window.removeEventListener('scroll', onScroll);
	});
</script>

<svelte:head>
	<title>Office — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Office" class:is-dark={isDark}>
	<!-- First view: full-screen PV video (placeholder until the file is ready) -->
	<!-- First view: centered lead statement (copy provisional — to finalize) -->
	<section class="OfficeHero">
		<h2 class="OfficeHero__lead" lang="en">
			We pursue the radix — the inevitable form for a given time and place.
		</h2>
		<p class="OfficeHero__meta" lang="en">Office / TAKUMI ISOBE, 2026</p>
	</section>

	<section class="Section1">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<span class="num" lang="en">01</span>
					<h3 class="label" lang="en">Office</h3>
				</div>
				<div class="content">
					<p class="section-lead" lang="en">Radix.<br />For what endures.</p>
					<div class="body" lang="en">
					<p>
						Office / TAKUMI ISOBE is a creative office based in Tokyo working across visual identity and design engineering — experience, brand, product, type, furniture, and digital communication. By blending culture, philosophy, and design, we create strategies that speak to what makes us human — our physicality, our emotion. Day by day, learning further, we strive toward better creation.
					</p>
				</div>
				<div class="body body-ja" lang="ja">
					<p>
						Office / TAKUMI ISOBEは、ビジュアルアイデンティティとデザインエンジニアリングを横断する、東京を拠点とするクリエイティブオフィスです。体験、ブランド、プロダクト、書体、家具、デジタルコミュニケーション——文化・哲学・意匠を融合させることで、私たちの持つ身体性や情緒といった人間性に刺激を与えるデザイン戦略を創出します。日々学びを重ねながら、よりよいクリエイションへと努めています。
					</p>
				</div>
				</div>
			</div>
		</div>
	</section>

	<section class="Service">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<span class="num" lang="en">02</span>
					<h3 class="label" lang="en">Services</h3>
				</div>
				<div class="content">
				<ul class="service-list">
					{#each services as service, i}
						<li class="service-item">
							{#if service.split}
								<div class="service-visual service-visual--split">
									<div class="split-left" aria-hidden="true">
										{#if service.leftVideo}
											<video src={service.leftVideo} autoplay muted loop playsinline></video>
										{/if}
									</div>
									<div
										class="split-right"
										style={service.image ? `background-image:url(${service.image})` : ''}
										role="img"
										aria-label={service.imageAlt}
									></div>
								</div>
							{:else}
								<div
									class="service-visual"
									style={service.image ? `background-image:url(${service.image})` : ''}
									role="img"
									aria-label={service.imageAlt}
								></div>
							{/if}
							<h4 class="service-title" lang="en">{service.title}</h4>
							{#if service.subtitle}
								<p class="service-subtitle" lang="ja">{service.subtitle}</p>
							{/if}
							{#if service.bodyEn || service.body}
								<div class="service-copy" class:is-open={openCopy[i]}>
									{#if service.bodyEn}
										<p class="service-body service-body-en" lang="en">{service.bodyEn}</p>
									{/if}
									{#if service.body}
										<p class="service-body service-body-ja" lang="ja">{service.body}</p>
									{/if}
									<span class="service-copy__fade" aria-hidden="true"></span>
								</div>
							{/if}
							{#if service.link || service.bodyEn || service.body}
								<div class="service-actions">
									{#if service.link}
										<a
											class="service-link"
											href={`https://${service.link}`}
											target="_blank"
											rel="noopener noreferrer"
											lang="en"
										>
											{service.link} ↗
										</a>
									{/if}
									{#if service.bodyEn || service.body}
										<button
											type="button"
											class="service-copy__toggle"
											aria-expanded={openCopy[i]}
											onclick={() => (openCopy[i] = !openCopy[i])}
											lang="en"
										>
											{openCopy[i] ? 'Close −' : 'Show +'}
										</button>
									{/if}
								</div>
							{/if}
							{#if service.projects.length}
								<ul class="project-list" lang="en">
									{#each service.projects as p}
										<li class="project-row">
											<span class="col-no">{p.no}</span>
											<span class="col-code">{p.code}</span>
											<span class="col-name">{p.name}</span>
											<span class="col-action">{p.action}</span>
										</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- Recognition — awards / press / selected features. Not live yet, so the
	     live sections run sequentially: 01 Office · 02 Services · 03 Company ·
	     04 Ethos · 05 Director. When Recognition is ready, uncomment it as 03
	     and bump Company / Ethos / Director to 04 / 05 / 06.
	<section class="Recognition">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<span class="num" lang="en">03</span>
					<h3 class="label" lang="en">Recognition</h3>
				</div>
				<div class="content">
					<div class="body" lang="en">
						<p>Awards, press, and selected features.</p>
					</div>
					<div class="body body-ja" lang="ja">
						<p>受賞歴・掲載・取り上げられた実績。</p>
					</div>
				</div>
			</div>
		</div>
	</section>
	-->

	<section class="Founder">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<span class="num" lang="en">03</span>
					<h3 class="label" lang="en">Company</h3>
				</div>
				<div class="content">
					<div class="body" lang="en">
						<dl class="cfacts">
							<div class="cfact"><dt>Company</dt><dd>Mirai Service Co., Ltd.</dd></div>
							<div class="cfact"><dt>Address</dt><dd>1-16 Hinokuchi-cho, Nishi-ku, Nagoya, Aichi<br />451-0034 Japan</dd></div>
							<div class="cfact"><dt>Capital</dt><dd>JPY 10,000,000</dd></div>
							<div class="cfact"><dt>Established</dt><dd>2005.07.20</dd></div>
						</dl>
					</div>
					<div class="body body-ja" lang="ja">
						<dl class="cfacts">
							<div class="cfact"><dt>屋号</dt><dd>株式会社みらいサービス</dd></div>
							<div class="cfact"><dt>所在地</dt><dd>〒451-0034 愛知県名古屋市西区樋の口町1-16</dd></div>
							<div class="cfact"><dt>資本金</dt><dd>1,000万円</dd></div>
							<div class="cfact"><dt>設立</dt><dd>2005.07.20</dd></div>
						</dl>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="Ethos">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<span class="num" lang="en">04</span>
					<h3 class="label" lang="en">Ethos</h3>
				</div>
				<div class="content">
					<div class="body" lang="en">
						<p>
							The 21st century we inhabit is driven by capitalism — the ceaseless cycle of production and consumption. Designers, too, are one of its gears: we give contour to the formless, spur consumption, and send things out into the world. As those who help accelerate that consumption, we feel we must look closely at this age and keep learning from it.
						</p>
						<h4 class="ethos-part" lang="en">I. Acceleration and Attention Economy</h4>
						<p>
							The present we live in sits amid a confusion faster and deeper than at the dawn of the Industrial Revolution, or even the Digital one. Technology accelerates, social change accelerates, and the very pace of life accelerates; the margin to pause is lost, and we are ceaselessly driven by something (Rosa, 2005). Upon this acceleration, human attention and behaviour themselves are treated as capital and mined; built on that data, mechanisms engineered to trigger dopamine come to govern our habits, and the inner life turns into a commodity (Zuboff, 2019). Easy happiness has become something taken instantly — and at the same time we are made to feel that it is not what we chose, but a consequence the structure has produced. Within that same acceleration, we keep transforming the planet irreversibly; each act of consumption stacks an unseen burden upon the future (Crutzen, 2000). What this acceleration, attention economy, and environmental burden have cost us is, we believe, corporeality itself.
						</p>
						<h4 class="ethos-part" lang="en">II. Le corps vécu and Resonance</h4>
						<p>
							“The human being does not first understand the world with the head, but dwells within it through the body; the lived body — le corps vécu — is the first site that binds the world and us.” So Merleau-Ponty wrote in his Phenomenology of Perception (Merleau-Ponty, 1945). What grows thin within the accelerating world is precisely this experience through the body (Bauman, 2000). To see, to touch, to feel with the skin — what remains in the body as substance has grown relatively faint, and that sensation is our point of departure. At the opposite pole of acceleration lies resonance: a relationship in which we do not own or dominate the world, but call out to it and are answered in turn (Rosa, 2016). What we would call “a more fundamental and certain interaction” feels close to this resonance. To move our focus toward corporeality, and toward emotion — this is not nostalgia, but a return for resonating with the world once more.
						</p>
						<h4 class="ethos-part" lang="en">III. Defuturing</h4>
						<p>
							To keep making the unsustainable is not to make a future; it is to quietly rob the next generation of its choices — a condition called defuturing (Fry, 1999). A designer can give physical form to the metaphysical, intervening across a wide span of human life: lifestyles, material values, modes of consumption. The weight of that responsibility was already pointed out half a century ago (Papanek, 1971), and we ourselves are among those who, day by day, accelerate consumption and add to its burden. How things act upon the world, and what in turn shapes it — we know astonishingly little. That is exactly why we must keep learning, day after day. So that when each of us reaches the end of our path we might leave even a little to hand on to the next generation, we will not stop thinking, and will keep on learning.
						</p>
					</div>
					<div class="body body-ja" lang="ja">
						<p>
							わたしたちが生きる21世紀は、生産と消費の絶え間ない循環——資本主義によって駆動されています。デザイナーもまた、その歯車のひとつとして、形のないものに輪郭を与え、消費を促し、世に送り出すことを生業としています。その消費を促進させる身として、わたしたちはこの時代をよく捉え、学んでいく必要があると感じています。
						</p>
						<h4 class="ethos-part">
							<span class="ethos-part-en" lang="en">I. Acceleration and Attention Economy</span>
							<span class="ethos-part-ja" lang="ja">/ 加速主義とアテンション経済</span>
						</h4>
						<p>
							わたしたちの生きる今は、産業革命が起きた時よりも、デジタル革命が起きた時よりも、なお速く、深い混乱のただ中にあります。技術が加速し、社会の変化が加速し、生活のペースそのものが加速していく。立ち止まるための余白は失われ、わたしたちは絶えず追い立てられています (Rosa, 2005)。加速の上では、人の注意や行動そのものが資本的価値とみなされ搾取され、それらを基にドーパミンを刺激するよう設計された仕組みがわたしたちの行動を支配していきます (Zuboff, 2019)。簡便な幸福がインスタントに摂取できるものになったと同時に、それはわたしたちが選び取ったものではなく、構造がもたらした結果にすぎないのだと思わされます。またその加速のなかで、わたしたちは地球環境を不可逆に変容させ続けています。消費のひとつひとつが、見えないところで未来に負荷を積み重ねています (Crutzen, 2000)。この加速と行動の搾取、そして環境への負荷によってわたしたちが真に失ったのは、身体性なのではないかと考えています。
						</p>
						<h4 class="ethos-part">
							<span class="ethos-part-en" lang="en">II. Le corps vécu and Resonance</span>
							<span class="ethos-part-ja" lang="ja">/ 生きられた身体と共鳴</span>
						</h4>
						<p>
							「人間は、まず頭で世界を理解するのではなく、身体を通して世界のなかに住み込んでいる。『生きられた身体（le corps vécu）』こそが、世界とわたしたちを繋ぐ最初の場である」と、メルロー＝ポンティはその著書『知覚の現象学』で説いています (Merleau-Ponty, 1945)。加速していく世界のなかで痩せていくのは、まさにこの「身体を通した経験」なのだと思います (Bauman, 2000)。見て、触れて、その肌で感じること、実体として身体に残るものが、相対的に薄くなっている——その感覚が、わたしたちの出発点にあります。その加速の対極に位置するのが、「共鳴（Resonance）」と呼ばれる、世界を所有し支配するのではなく、世界に呼びかけ、世界から応答される関係です (Rosa, 2016)。わたしたちが「より根源的で確かな相互作用」と呼びたいものは、おそらくこの共鳴に近いものだと感じています。身体性、そして情緒へと焦点を移すこと。それは懐古ではなく、世界と共鳴するための回帰なのだと、わたしたちは捉えています。
						</p>
						<h4 class="ethos-part">
							<span class="ethos-part-en" lang="en">III. Defuturing</span>
							<span class="ethos-part-ja" lang="ja">/ 脱未来化</span>
						</h4>
						<p>
							持続不可能なものを作り続けるという行為は、未来を作っているのではありません。それは、次の世代から選択肢を静かに奪っている——「脱未来化（defuturing）」と呼ばれる事態です (Fry, 1999)。デザイナーは、形而上のものを形而下へと具象化できる職能です。生活様式や物的価値、消費の様態といった、人間の営みの広い範囲に介入し得る。その責任の重さは、すでに半世紀前から指摘されてきました (Papanek, 1971)。そしてわたしたち自身が、日々、消費を加速させ、負荷を積み重ねている当事者でもあります。何がどのように世界に作用しているのか、そして何が世界を形作っているのか、驚くほどわたしたちは知りません。だからこそ、日々学びを重ね続けなければならないのだと思います。わたしたちがそれぞれのキャリアを終えるその時に、わずかでも次代に手渡せるものを残すために、日々思考を止めず、学びを続けてまいります。
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="Founder">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<span class="num" lang="en">05</span>
					<h3 class="label" lang="en">Director</h3>
				</div>
				<div class="content">
					<div class="body" lang="en">
						<p>
							Born in Japan in 2001.<br />
							While attending the University of Westminster in the UK, exposed to
							a wide range of cultures and arts, I developed a strong interest in
							visual expression and entered the creative industry. After working at
							several design studios in Tokyo, I established my own practice.
							Today, as creative director, I run a design office at the core of my
							work, alongside a type foundry, an image-making studio, and a wine
							community.
						</p>
					</div>
					<div class="body body-ja" lang="ja">
						<p>
							2001年日本生まれ。<br />
							英国University of Westminster(ウェストミンスター大学)在学時、多様な文化と芸術に触れる中で、視覚表現に強く興味を抱きクリエイティブインダストリーへ。COVID19の中で帰国し東京都内のデザインオフィス数社を経て、独立。現在は株式会社みらいサービスの取締役／クリエイティブ事業部のファウンダーとして、デザインオフィスを基軸にタイプファウンダリやイメージメークスタジオ、ワインコミュニティの運営を行っている。
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	.Office {
		padding-top: 0;
		padding-bottom: 100px;
		background: var(--color-bg);
		color: var(--color-text);
		/* Absorb Footer's margin-top so the page flows straight into the black Footer */
		margin-bottom: -120px;
		/* Smooth white→dark shift, driven by .is-dark (toggled on scroll) */
		transition: background-color 0.7s ease, color 0.7s ease;
	}

	/* base.css sets color: var(--color-text) directly on div, p, span, headings,
	   anchors, etc., which beats inheritance from .Office — so override every
	   descendant here. */
	.Office :global(*) {
		color: var(--color-text);
		transition: color 0.7s ease, border-color 0.7s ease;
	}

	/* Dark phase — from 02 Services onward. The scroll handler adds .is-dark
	   once Services crosses the viewport middle; it stays on below that point. */
	.Office.is-dark {
		background: #181818;
		color: #fff;
		--color-line: rgba(255, 255, 255, 0.2);
		--copy-bg: #181818; /* fade tracks the dark background */
	}

	.Office.is-dark :global(*) {
		color: #fff;
	}

	/* Roomier horizontal margins for all content sections (hero stays full-bleed) */
	.Office section:not(.OfficeHero) {
		padding-left: calc(var(--padding) * 1.5);
		padding-right: calc(var(--padding) * 1.5);
	}

	/* First view — centered lead statement (full-screen) */
	.Office .OfficeHero {
		position: relative;
		width: 100%;
		min-height: 100vh;
		min-height: 100dvh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 calc(var(--padding) * 1.5);
		text-align: center;
	}

	.Office .OfficeHero__lead {
		width: 90%;
		margin: 0;
		font-size: 40px;
		line-height: 1.2;
		font-weight: var(--fw-lead);
		font-variation-settings: 'wght' var(--fw-lead);
	}

	/* First-view credit, pinned to the bottom */
	.Office .OfficeHero__meta {
		position: absolute;
		bottom: 24px;
		left: 50%;
		transform: translateX(-50%);
		margin: 0;
		font-size: var(--fs-h6);
		font-weight: var(--fw-lead);
		font-variation-settings: 'wght' var(--fw-lead);
		white-space: nowrap;
	}

	.Office .Section1 {
		padding-top: 100px;
	}

	.Office .Service,
	.Office .Ethos,
	.Office .Founder {
		padding-top: 80px;
	}

	/* 04 Company — label | value, two columns, both left-aligned, hairline rows.
	   EN and JA read as ONE continuous ruled list: every row has a top rule and
	   only the final (JA) row closes with a bottom rule, so the en/ja seam is a
	   single line, not a doubled one. */
	.Office .cfacts {
		display: flex;
		flex-direction: column;
		margin: 0;
	}

	.Office .content:has(.cfacts) {
		display: block;
	}

	.Office .cfact {
		display: flex;
		align-items: center; /* label sits Y-centred even when the value wraps */
		text-align: left;
		padding: 12px 0;
		border-top: 1px solid var(--color-line);
	}

	.Office .body-ja .cfacts .cfact:last-child {
		border-bottom: 1px solid var(--color-line);
	}

	.Office .cfact dt {
		flex: none;
		width: 25%;
		margin-right: 24px;
		opacity: 0.5;
	}

	.Office .cfact dd {
		flex: 1;
		margin: 0;
	}

	.Office .service-list {
		list-style: none;
		padding: 0;
		margin: 20px 0 0;
		display: flex;
		flex-direction: column;
		gap: 40px;
	}

	.Office .service-item {
		display: flex;
		flex-direction: column;
	}

	.Office .service-visual {
		width: 100%;
		aspect-ratio: 16 / 9;
		background-color: #eaeaea;
		background-size: cover;
		background-position: center;
	}

	/* Split visual: 16:9 area = two 8:9 panels, gap 0 (left = video, right = image) */
	.Office .service-visual--split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0;
		background-color: transparent;
	}

	.Office .service-visual--split .split-left,
	.Office .service-visual--split .split-right {
		width: 100%;
		height: 100%;
		overflow: hidden;
		background-color: #eaeaea;
		background-size: cover;
		background-position: center;
	}

	.Office .service-visual--split .split-left video {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.Office .service-title {
		font-size: var(--fs-h3);
		margin: 20px 0 0;
	}

	.Office .service-subtitle {
		font-size: 10px;
		line-height: 1.7;
		margin: 4px 0 0;
		opacity: 0.6;
	}

	/* Size & line-height come from p:lang(en/ja) (en>ja). Only spacing here. */
	.Office .service-body {
		margin: 12px 0 0;
	}

	/* 10px gap at the EN/JA body seam */
	.Office .service-body-en + .service-body-ja {
		margin-top: 10px;
	}

	/* EN body keeps a tighter line-height than JA (don't inherit JA's 1.7) */
	.Office .service-body-en {
		line-height: 1.45;
		text-align: left; /* override base p:lang(en) justify */
	}

	/* Service copy — clamped + faded by default, revealed via the Show toggle.
	   The fade tracks the background through the dark reversal via --copy-bg. */
	.Office .service-copy {
		position: relative;
		max-height: 7.5em;
		overflow: hidden;
		transition: max-height 0.6s var(--ease-default);
	}
	.Office .service-copy.is-open {
		max-height: 80em; /* large enough for the full copy */
	}
	.Office .service-copy__fade {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 4.5em;
		background: linear-gradient(to bottom, transparent, var(--copy-bg, #fff));
		pointer-events: none;
		transition: opacity 0.3s var(--ease-default);
	}
	.Office .service-copy.is-open .service-copy__fade {
		opacity: 0;
	}
	/* Actions row: external link (left) + Show toggle (right), baseline-aligned */
	.Office .service-actions {
		display: flex;
		align-items: baseline;
		gap: 16px;
		margin-top: 20px;
	}
	.Office .service-copy__toggle {
		margin-left: auto; /* push to the right edge, aligned with the link */
		font-size: var(--fs-h5);
		font-family: var(--font-en);
		background: none;
		border: 0;
		padding: 0;
		color: inherit;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}
	.Office .service-copy__toggle:hover {
		opacity: 0.6;
	}

	.Office .service-link {
		font-size: var(--fs-h5);
		text-decoration: underline;
		text-underline-offset: 3px;
		transition: opacity var(--duration-fast) var(--ease-default);
	}

	.Office .service-link:hover {
		opacity: 0.6;
	}

	.Office .project-list {
		list-style: none;
		padding: 0;
		margin: 20px 0 0;
		border-top: 1px solid currentColor;
	}

	.Office .project-row {
		display: grid;
		grid-template-columns: 40px 106px 1fr auto;
		align-items: center;
		min-height: 40px;
		font-size: 10px;
		border-bottom: 1px solid currentColor;
	}

	.Office .wrapper {
		padding-inline: 0;
	}

	.Office .container {
		width: 100%;
	}

	/* Section header — meta row: num + label (left) / sub (right), all 12px */
	.Office .header {
		display: grid;
		grid-template-columns: 5% 1fr;
		align-items: baseline;
		gap: 8px;
	}

	.Office .num,
	.Office .label {
		font-size: 12px;
		line-height: 1.4;
	}

	/* 01 Office — lead line above the body copy (slightly larger) */
	.Office .section-lead {
		font-size: 32px;
		line-height: 1.1;
		font-weight: var(--fw-lead); /* exception — large display lead */
		margin-top: 40px;
		margin-bottom: 0;
		text-align: left;
	}

	.Office .body {
		margin-top: 10px;
	}

	/* 10px gap at the EN/JA body seam */
	.Office .body + .body {
		margin-top: 10px;
	}

	/* Body copy follows base.css p (lang-aware). Only paragraph spacing here. */
	.Office .body p + p {
		margin-top: 14px;
	}

	/* Ethos — numbered part headings (I / II / III).
	   SP: same size as body copy; PC bumps to fs-h3 (see @1024 below). */
	.Office .ethos-part {
		font-size: var(--fs-p);
		font-weight: var(--fw-medium);
		line-height: 1.4;
		margin: 20px 0 10px;
		opacity: 0.6;
	}

	.Office .ethos-part:first-child {
		margin-top: 0;
	}

	/* Ethos heading: EN line + JA subtitle on its own line (Tazugane, smaller) */
	.Office .ethos-part-en {
		display: block;
	}

	.Office .ethos-part-ja {
		display: block;
		font-family: var(--font-ja);
		font-size: var(--fs-p-ja);
		font-weight: var(--fw-base);
		margin-top: 2px;
		opacity: 0.85;
	}

	/* Ethos EN body: left-aligned (override p:lang justify), slightly wider */
	.Office .Ethos .body[lang='en'] p {
		text-align: left;
		width: 103%;
	}

	/* Hairline between the EN and JA Ethos bodies (my 20px); currentColor so it
	   follows the dark/light reversal. */
	.Office .Ethos .body[lang='ja'] {
		margin-top: 40px;
		padding-top: 40px;
		border-top: 1px solid color-mix(in srgb, currentColor 18%, transparent);
	}

	.Office .Ethos .body[lang='ja'] p {
		text-align: justify;
	}

	/* Tablet */
	@media (min-width: 768px) {
		.Office {
			padding-top: 0;
		}

		.Office .wrapper {
			padding-inline: 0;
		}

		.Office .container {
			max-width: 590px;
		}
	}

	/* Desktop — matches PC Figma (4:220) */
	@media (min-width: 1024px) {
		.Office {
			padding-top: 0;
			padding-bottom: 100px;
		}

		.Office section {
			padding-top: 0;
		}

		/* Body content sits in the right half on desktop; meta header stays full width */
		.Office .content {
			width: auto;
			margin-left: 0;
		}

		.Office .Service,
		.Office .Ethos,
		.Office .Founder {
			padding-top: 160px;
		}

		.Office .wrapper {
			padding-inline: 0;
		}

		.Office .container {
			max-width: none;
			/* PC: header (num over label) on the left, content on the right,
			   tops aligned so content starts level with the "01" number. */
			display: grid;
			grid-template-columns: 1fr 58%;
			align-items: start;
			column-gap: 4%;
		}

		/* PC: stack num / label vertically (break instead of running wide) */
		.Office .header {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}

		.Office .service-list {
			margin-top: 0;
			gap: 100px;
		}

		.Office .body p + p {
			margin-top: 16px;
		}

		/* PC: section labels (Office / Services / Ethos …) read large */
		.Office .label {
			font-size: var(--fs-h2);
			line-height: 1.1;
		}

		.Office .service-title {
			font-size: 20px;
		}

		/* PC: Ethos part headings step up to fs-h3 (SP stays body-size) */
		.Office .ethos-part {
			font-size: var(--fs-h3);
		}

		.Office .OfficeHero__lead {
			font-size: 64px;
			line-height: 1.15;
		}

		.Office .section-lead {
			font-size: 56px;
			line-height: 1.05;
		}

		/* Company facts read a touch larger on PC */
		.Office .cfact dt,
		.Office .cfact dd {
			font-size: 15px;
		}
	}

	/* Wide */
	@media (min-width: 1440px) {
		.Office .wrapper {
			padding-inline: 0;
		}
	}
</style>
