<script lang="ts">
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
			title: 'Product Design',
			subtitle: 'プロダクトデザインと工業意匠',
			body: '身体に直接触れる物質性に立ち返り、素材・構造・佇まいの関係性を再構築することで立ち上がる「必然のかたち」を追い求めながら、日々の所作に静かに寄り添うプロダクトの企画・開発を行っています。デザイナーとは形而上のものを形而下へと具象化することが許された数少ない職能であると捉え、私たちのオリジンである身体へと立ち返ることを大切に、日々学びながらその実践を続けてまいります。',
			image: '',
			imageAlt: 'Industrial Design',
			projects: []
		},
		{
			title: 'V.I. & Typography',
			subtitle: 'ビジュアルアイデンティティと書体の開発',
			body: '弊社主宰のタイプファウンダリ——August Type Foundryでは、歴史を紐解き、現代の思想を交えながら再解釈することで生まれるニューフォームを追い求め、グラフィックデザインの大きな構成要素である書体の開発を行っています。また書体開発で培ったディテールへの眼差しをビジュアルアイデンティティ・ブランドアイデンティティの設計まで拡げ、ブランドの根幹を貫く一貫した造形言語を追求します。',
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
			body: '弊社主宰のイメージクリエイションスタジオ——Studio Ristoranteでは、食と空間に焦点をあて、その企画・立ち上げ・B.I.設計を実施し、現在はイメージクリエイションのディレクションと制作を一貫して手がけています。また実写撮影で培った光と質感への眼差しを3DCGI・ビジュアライゼーションの領域まで拡げ、被写体に潜む空気と質量を画として定着させる、確かな実体性をまとうビジュアル表現を追求します。',
			image: '/images/services_visualisation.png',
			imageAlt: 'Image Visualisation',
			projects: []
		},
		{
			title: 'Digital Infrastructure',
			subtitle: 'UXとデジタルコミュニケーションの設計',
			body: '弊社主宰のエンジニアリングスタジオ——TEKNEでは、ブランドサイトやEコマース、予約システムの開発、Webアプリの開発などのデジタルプロダクトの設計と実装と、AI/DXインテグレーションなどの、デジタルインフラストラクチャ構築を行なっています。モダンな技術スタックを用い最適なアーキテクチャを設計することで、UXと利便性を向上させ高度なデジタルコミュニケーションと体験を整え、ブランドのデジタル体験を形にします。',
			image: '/images/services_production.png',
			imageAlt: 'Digital Infrastructure',
			projects: [],
			link: 'www.tekne.jp'
		}
	];
</script>

<svelte:head>
	<title>Office — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Office">
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
					<p class="section-lead" lang="en">Unwavering pursuit<br />of the Radix</p>
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

	<section class="Ethos">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<span class="num" lang="en">03</span>
					<h3 class="label" lang="en">Ethos</h3>
				</div>
				<div class="content">
					<div class="body" lang="en">
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
						<p>
							今日の社会システムは、その脆弱性と自己中心的な世界観によって随所に綻びが露見しはじめているように思えます。情報が氾濫し、価値秩序が絶えず移ろいゆくなかで、簡便な幸福はインスタントに摂取できるようになりました。その結果、実体として身体に残るものは、相対的に痩せてきているようにも見えます。私たちはこの変化のなかで、より根源的で確かな相互作用——「身体性」と「情緒」へと焦点を移しつつあります。
						</p>
						<p>
							デザイナーは、形而上のものを形而下へと具象化することのできる職能であり、言い換えれば、生活様式・物的価値・消費の様態など、人間の営みの広い範囲に介入し得る職能でもあります。20世紀後半、ヴィクター・パパネックをはじめ多くの知識人が、その重大さに警鐘を鳴らしてきました。デザインが目的論性を取り戻し、人間の本当の必要に応答するためには、私たちのオリジンである身体や、自然との繋がりへと立ち返ることが、いま改めて重要であると捉えています。私たちデザイナーは、日々、消費を加速させ、環境への負荷を積み重ねている当事者です。インパルスデザインや商業デザインといかに付き合うかを問いつづけながら、日々学びを重ね、わずかでも次代に手渡せるものを残していきたい。いつか自分たちの仕事を閉じる日に、総じて社会の側へわずかでもプラスを残せたと振り返れる仕事を、ひとつずつ積み重ねていきたいと考えています。
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
					<span class="num" lang="en">04</span>
					<h3 class="label" lang="en">Founder</h3>
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
						英国University of Westminster(ウェストミンスター大学)在学時、多様な文化と芸術に触れる中で、視覚表現に強く興味を抱きクリエイティブインダストリーへ。COVID19の中で帰国し東京都内のデザインオフィス数社を経て、独立。現在はディレクターとして、デザインオフィスを基軸にタイプファウンダリやイメージメークスタジオ、ワインコミュニティの運営を行っている。
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
	}

	/* base.css sets color: var(--color-text) directly on div, p, span, headings,
	   anchors, etc., which beats inheritance from .Office — so override every
	   descendant here. */
	.Office :global(*) {
		color: var(--color-text);
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
		font-size: 18px;
		line-height: 1.3;
		margin-top: 40px;
		margin-bottom: 0;
		text-align: left;
	}

	.Office .body {
		margin-top: 10px;
	}

	.Office .body + .body {
		margin-top: 8px;
	}

	/* Body copy follows base.css p (lang-aware). Only paragraph spacing here. */
	.Office .body p + p {
		margin-top: 14px;
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
			width: 50%;
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

		/* PC type scale: sp→pc ratio ≈ 1.2x (matches general website convention) */
		.Office .label {
			font-size: 14px;
		}

		.Office .service-title {
			font-size: 20px;
		}
	}

	/* Wide */
	@media (min-width: 1440px) {
		.Office .wrapper {
			padding-inline: 0;
		}
	}
</style>
