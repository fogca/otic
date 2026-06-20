<script lang="ts">
	import { onMount } from 'svelte';

	// Office page — static for now, microCMS later

	const padNumber = (n: number) => String(n + 1).padStart(2, '0');

	type Project = { no: string; code: string; name: string; action: string };
	type Service = {
		title: string;
		subtitle: string;
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
			body: '身体に直接触れる物質性に立ち返り、素材・構造・佇まいの関係性を再構築することで立ち上がる、必然のかたちを追い求めながら、日々の所作に添う用と喜びのあるプロダクトの企画・開発を行っています。わたしたちが直面しているこの大きな時代の変革において、より根源的で確かな相互作用——「身体性」と「情緒」が、私たちの大きな関心へとなりつつあります。私たちのオリジンである身体と心へと立ち返ることを大切に、日々学びながらその実践を続けてまいります。',
			image: '',
			imageAlt: 'Industrial Design',
			projects: []
		},
		{
			title: 'V.I. & Typography',
			subtitle: 'ビジュアルアイデンティティと書体の開発',
			body: '私たちは、ブランディングを始めとする視覚領域におけるビジネスクリエイティブの策定と設計から、ロゴ・グラフィックデザイン・パッケージデザインといった具体的な制作までを一貫して手がけています。また弊社主宰のタイプファウンダリ——August Type Foundryは、歴史を紐解き、現代の文脈で再解釈することで生まれるニューフォームを追い求め、タイプフェイス——書体の開発を行っています。書体開発で培ったディテールの追求をブランディング領域まで徹底し、ブランドの根幹を表現する一貫した造形言語を創造します。',
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
			body: '私たちは、イメージクリエイションのディレクションと制作を一貫して手がけています。実写撮影で培った光と質感への眼差しを3DCGI・ビジュアライゼーションの領域まで拡げ、被写体に潜む空気と質量を画として定着させる、確かな実体性をまとうビジュアル表現を追求します。',
			image: '/images/services_visualisation.png',
			imageAlt: 'Image Visualisation',
			projects: []
		},
		{
			title: 'Digital Infrastructure',
			subtitle: 'UXとデジタルコミュニケーションの設計',
			body: '弊社主宰のエンジニアリングスタジオ——Joule Jouleでは、ブランドサイトやEコマース、予約システムの開発、Webアプリの開発などのデジタルプロダクトの設計と実装と、AI/DXインテグレーションなどの、デジタルインフラストラクチャ構築を行なっています。モダンな技術スタックを用い最適なアーキテクチャを設計することで、UXと利便性を向上させ高度なデジタルコミュニケーションと体験を整え、ブランドのデジタル体験を形にします。',
			image: '/images/services_production.png',
			imageAlt: 'Digital Infrastructure',
			projects: [],
			link: 'www.joulejoule.com'
		}
	];

	// Scroll-driven background: white through 01 Office, then fade to dark
	// (#181818 / white text) once 02 Services reaches the viewport middle.
	// Once dark, it stays dark for everything below. Reactive class (not
	// classList) so Svelte keeps the scoped .is-dark styles.
	let isDark = $state(false);

	onMount(() => {
		const office = document.querySelector('.Office');
		const svc = office?.querySelector('.Service');
		if (!office || !svc) return;

		let ticking = false;
		const update = () => {
			ticking = false;
			const vh = window.innerHeight;
			const enteredDark = svc.getBoundingClientRect().top <= vh / 2;
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
	<section class="OfficeHero" aria-label="PV">
		<!-- Replace with: <video class="OfficeHero__media" src="…" autoplay muted loop playsinline poster="…"></video> -->
		<div class="OfficeHero__media" aria-hidden="true"></div>
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
						We are a design office dedicated to the development of visual
						identity and design engineering. From brand design, product design,
						and furniture design to type development, CG visualisation, and
						digital communication, we have built work that crosses the visual
						domain, in collaboration with partners across many fields. The Radix
						— our unwavering pursuit of the root — is a posture of converging
						toward the form that must inevitably exist in a given time and place.
						Day by day, learning further, we strive toward better creation.
					</p>
				</div>
				<div class="body body-ja" lang="ja">
					<p>
						私たちは、ビジュアルアイデンティティの開発とデザインエンジニアリングを担うデザイン事務所です。ブランドデザインから、プロダクトデザイン、ファニチャーデザイン、書体開発、CGビジュアライゼーション、デジタルコミュニケーションまで、視覚領域を横断するクリエイションを、多様な分野のパートナーとともに重ねてきました。私たちが貫徹する「Radix——根源——の探求」は、その時その場所に必然として在るべきかたちへと収斂させていく姿勢です。日々学びを重ねながら、よりよいクリエイションを行うために努めてまいります。
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
					{#each services as service}
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
							{#if service.body}
								<p class="service-body" lang="ja">{service.body}</p>
							{/if}
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
					<!-- EN copy hidden for now (re-enable by removing style="display:none") -->
					<div class="body" lang="en" style="display: none">
						<p>
							Today's social system is beginning to show its seams — through its
							fragility and through the widening gap between need and want. Amid
							an overflow of information and a value order in constant flux, easy
							forms of happiness have become available for instant consumption.
							As a result, what lasts in the body as embodied experience has
							grown relatively thin. Within this shift, we are moving our
							creative focus toward more fundamental and resilient interactions:
							corporeality and emotion. To be a designer is to occupy one of the
							few professions permitted to give physical form to what was once
							metaphysical — which is to say, a profession capable of intervening
							in lifestyles, in material values, and in the patterns of
							consumption that shape much of human life. From the latter half of
							the twentieth century, Victor Papanek and many other thinkers have
							sounded warnings about the weight of this fact. For design to
							recover its telesis and respond to genuine human need, returning to
							our origin — the body, and our connection with the natural world —
							has, we believe, become ever more essential. As designers, we are
							also among those who accelerate consumption and add daily to the
							burden placed on the environment. While we continue to ask how to
							live alongside impulse design and commercial design, we want to
							keep learning, and to leave — even in small measure — something to
							hand on to the generation that follows. When one day we close our
							work, we hope to look back and say that on balance we left
							something positive for society, building such a record one project
							at a time.
						</p>
					</div>
					<div class="body body-ja" lang="ja">
						<h4 class="ethos-part" lang="en">I. Acceleration and Attention Economy</h4>
						<p>
							技術が加速し、社会の変化が加速し、生活のペースそのものが加速していく。立ち止まるための余白は失われ、私たちは絶えず何かに追い立てられています (Rosa, 2005)。その速度を、私はどこかおかしいと感じています。
						</p>
						<p>
							加速の上では、人の注意や行動そのものが資源として採掘されていきます。ドーパミンを刺激するよう設計された仕組みが習慣を支配し、内面は商品へと変わっていく (Zuboff, 2019)。簡便な幸福が、インスタントに摂取できるものになった。けれどそれは、私たちが選び取ったものではなく、構造がもたらした帰結にすぎないのだと思います。
						</p>
						<p>
							そして同じ加速のなかで、私たちは地球環境を不可逆に変え続けています。消費のひとつひとつが、見えないところで未来に負荷を積み重ねている (Crutzen, 2000)。
						</p>
						<p>
							加速、注意の搾取、環境への負荷。私にはこれらが別々の問題には見えません。ひとつの事態が見せる、異なる表情のように思えます。ではその結果、私たちは何を失ったのか。その中心にあるのは、身体なのではないかと考えています。
						</p>

						<h4 class="ethos-part" lang="en">II. Le corps vécu and Resonance</h4>
						<p>
							人間は、まず頭で世界を理解するのではないと言います。身体を通して、世界のなかに住み込んでいる。「生きられた身体（le corps vécu）」こそが、世界と私を繋ぐ最初の場である (Merleau-Ponty, 1945)。この考えに、私は強く惹かれます。
						</p>
						<p>
							スクリーンに媒介され、液状化し、加速していく世界のなかで痩せていくのは、まさにこの「身体を通した経験」なのだと思います (Bauman, 2000)。触れること、待つこと、その場に居合わせること。実体として身体に残るものが、相対的に薄くなっている——その感覚が、私の出発点にあります。
						</p>
						<p>
							加速の対極にあるものは、「共鳴（Resonance）」と呼ばれています。世界を所有し支配するのではなく、世界に呼びかけ、世界から応答される関係。加速する社会は、この共鳴を体系的に不可能にしてしまった (Rosa, 2016)。
						</p>
						<p>
							私が「より根源的で確かな相互作用」と呼びたいものは、おそらくこの共鳴に近いものです。身体性へ、そして情緒へと焦点を移すこと。それは懐古ではなく、世界ともう一度共鳴するための回帰なのだと、私は捉えています。
						</p>

						<h4 class="ethos-part" lang="en">III. Defuturing</h4>
						<p>
							持続不可能なものを作り続けるという行為は、未来を作っているのではありません。それは、次の世代から選択肢を静かに奪っている——「脱未来化（defuturing）」と呼ばれる事態です (Fry, 1999)。
						</p>
						<p>
							デザイナーは、形而上のものを形而下へと具象化できる職能です。生活様式や物的価値、消費の様態といった、人間の営みの広い範囲に介入し得る。その責任の重さは、すでに半世紀前から指摘されてきました (Papanek, 1971)。そして私たち自身が、日々、消費を加速させ、負荷を積み重ねている当事者でもあります。
						</p>
						<p>
							何がどのように世界に作用しているのか。そして、何が世界を形作っているのか。その全体を、私たちはまだほとんど知りません。だからこそ、答えを持っているふりをするのではなく、学び続けなければならないのだと思います。わずかでも次代に手渡せるものを残すために。
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
	}

	.Office.is-dark :global(*) {
		color: #fff;
	}

	/* Roomier horizontal margins for all content sections (hero stays full-bleed) */
	.Office section:not(.OfficeHero) {
		padding-left: calc(var(--padding) * 2);
		padding-right: calc(var(--padding) * 2);
	}

	/* First view — full-screen PV video (100vw × 100vh) */
	.Office .OfficeHero {
		width: 100%;
		height: 100vh;
		height: 100dvh;
		padding: 0;
		overflow: hidden;
	}

	.Office .OfficeHero__media {
		width: 100%;
		height: 100%;
		object-fit: cover;
		background: #eaeaea; /* placeholder until the video is in */
	}

	.Office .Section1 {
		padding-top: 60px;
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

	.Office .service-body {
		font-size: var(--fs-h6);
		line-height: 1.7;
		margin: 12px 0 0;
	}

	.Office .service-link {
		display: inline-block;
		margin-top: 20px;
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

	/* Small 5px gap at the EN/JA body seam */
	.Office .body + .body {
		margin-top: 5px;
	}

	/* Body copy follows base.css p (lang-aware). Only paragraph spacing here. */
	.Office .body p + p {
		margin-top: 14px;
	}

	/* Ethos — numbered part headings (I / II / III) */
	.Office .ethos-part {
		font-size: var(--fs-h5);
		font-weight: var(--fw-medium);
		line-height: 1.4;
		margin: 36px 0 12px;
		opacity: 0.6;
	}

	.Office .ethos-part:first-child {
		margin-top: 0;
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
			width: 58%;
			margin-left: auto;
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
			font-size: var(--fs-h1);
			line-height: 1.1;
		}

		.Office .service-title {
			font-size: 20px;
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
