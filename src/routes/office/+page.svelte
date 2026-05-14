<script lang="ts">
	// Office page — static for now, microCMS later

	type Project = { no: string; code: string; name: string; action: string };
	type Service = {
		title: string;
		subtitle: string;
		body: string;
		image: string;
		imageAlt: string;
		projects: Project[];
	};

	const services: Service[] = [
		{
			title: 'Industrial Design',
			subtitle: 'プロダクトデザインと工業意匠',
			body: '身体に直接触れる物質性に立ち返り、素材・構造・佇まいの関係性を再構築することで立ち上がる「必然のかたち」を追い求めながら、日々の所作に静かに寄り添うプロダクトの企画・開発を行っています。デザイナーとは形而上のものを形而下へと具象化することが許された数少ない職能であると捉え、私たちのオリジンである身体へと立ち返ることを大切に、日々学びながらその実践を続けてまいります。',
			image: '',
			imageAlt: 'Industrial Design',
			projects: []
		},
		{
			title: 'V.I. & Typography',
			subtitle: 'ビジュアルアイデンティティと書体の開発',
			body: '弊社主宰のタイプファウンダリーーMischenでは、歴史を紐解き、現代の思想を交えながら再解釈することで生まれるニューフォームを追い求め、グラフィックデザインの大きな構成要素である書体の開発を行っています。また書体開発で培ったディテールへの眼差しをビジュアルアイデンティティ・ブランドアイデンティティの設計まで拡げ、ブランドの根幹を貫く一貫した造形言語を追求します。',
			image: '',
			imageAlt: 'V.I. & Typography',
			projects: []
		},
		{
			title: 'CG Visualisation',
			subtitle: 'イメージクリエイションとCGビジュアライゼーション',
			body: '弊社主宰のイメージクリエイションスタジオーーStudio Ristoranteでは、食と空間に焦点をあて、その企画・立ち上げ・B.I.設計を実施し、現在はイメージクリエイションのディレクションと制作を一貫して手がけています。また実写撮影で培った光と質感への眼差しを3DCGI・ビジュアライゼーションの領域まで拡げ、被写体に潜む空気と質量を画として定着させる、確かな実体性をまとうビジュアル表現を追求します。',
			image: '',
			imageAlt: 'CG Visualisation',
			projects: []
		},
		{
			title: 'UX & Web & App Development',
			subtitle: 'UXとデジタルコミュニケーションの設計',
			body: 'Office / TAKUMIISOBEでは、UXデザインを始め、ブランドサイトやEコマース、アプリなどの開発など、デジタルプロダクトの設計と実装を行っています。モダンな技術スタックを軸に、UXとデジタルコミュニケーションの両面から体験の輪郭を整え、ブランドのデジタル体験を形にします。',
			image: '',
			imageAlt: 'UX & Web & App Development',
			projects: []
		}
	];
</script>

<svelte:head>
	<title>Office — TAKUMIISOBE.com</title>
</svelte:head>

<main class="Office">
	<section class="Section1">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<h5 class="num" lang="en">01</h5>
					<h3 class="label" lang="en">Office</h3>
				</div>
				<div class="content">
					<div class="body" lang="en">
					<p>
						We are a design office working at the intersection of design,
						engineering, and visualisation. From industrial design and typography
						to visual identity and digital communication, we have built work that
						crosses visual and material domains, in collaboration with partners
						across many fields.
					</p>
					<p>
						Today's social system is beginning to show its seams — through its
						fragility and through the widening gap between need and want. Amid an
						overflow of information and a value order in constant flux, easy forms
						of happiness have become available for instant consumption. As a
						result, what lasts in the body as embodied experience has grown
						relatively thin. Within this shift, we are moving our creative focus
						toward more fundamental and resilient interactions: corporeality and
						emotion. To be a designer is to occupy one of the few professions
						permitted to give physical form to what was once metaphysical — which
						is to say, a profession capable of intervening in lifestyles, in
						material values, and in the patterns of consumption that shape much of
						human life. From the latter half of the twentieth century, Victor
						Papanek and many other thinkers have sounded warnings about the weight
						of this fact. For design to recover its telesis and respond to genuine
						human need, returning to our origin — the body, and our connection
						with the natural world — has, we believe, become ever more essential.
						As designers, we are also among those who accelerate consumption and
						add daily to the burden placed on the environment. While we continue
						to ask how to live alongside impulse design and commercial design, we
						want to keep learning, and to leave — even in small measure —
						something to hand on to the generation that follows. When one day we
						close our work, we hope to look back and say that on balance we left
						something positive for society, building such a record one project at
						a time.
					</p>
				</div>
				<div class="body body-ja">
					<p>
						私たちは、デザイン・エンジニアリング・ビジュアライゼーションの設計と構築を手掛ける、デザインオフィスです。インダストリアルからタイポグラフィ、ビジュアルアイデンティティ、デジタルコミュニケーションに至るまで、視覚と物質を横断する制作を、多様な分野のパートナーとともに重ねてきました。
					</p>
					<p>
						今日の社会システムは、その脆弱性と、必要（needs）と欲求（wants）の乖離によって、随所に綻びが露見しはじめています。情報が氾濫し、価値秩序が絶えず移ろうなかで、簡便な幸福はインスタントに摂取できるようになりました。その結果、実体として身体に残るものは、相対的に痩せてきているようにも見えます。私たちはこの変化のなかで、より根源的で確かな相互作用——「身体性（corporeality）」と「情緒（emotion）」へと、創作の焦点を移しつつあります。デザイナーとは、形而上のものを形而下へと具象化することの許される職能であり、言い換えれば、生活様式・物的価値・消費の様態など、人間の営みの広い範囲に介入し得る職能でもあります。20世紀後半、Victor
						Papanek
						をはじめ多くの知識人が、その重さに警鐘を鳴らしてきました。デザインが目的論性（telesis）を取り戻し、人間の本当の必要（real
						needs）に応答するためには、私たちのオリジンである身体や、自然との繋がりへと立ち返ることが、いま改めて重要であると捉えています。私たちデザイナーは、日々、消費を加速させ、環境への負荷を積み重ねている当事者でもあります。インパルスデザインや商業デザインといかに付き合うかを問いつづけながら、日々学びを重ね、わずかでも次代に手渡せるものを残していきたい。いつか自分たちの仕事を閉じる日に、総じて社会の側へわずかでもプラスを残せたと振り返れる仕事を、ひとつずつ積み重ねていきたいと考えています。
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
					<h5 class="num" lang="en">02</h5>
					<h3 class="label" lang="en">Service:</h3>
					<h3 class="label" lang="en">Case Studies</h3>
				</div>
				<div class="content">
				<ul class="service-list">
					{#each services as service}
						<li class="service-item">
							<div
								class="service-visual"
								style={service.image ? `background-image:url(${service.image})` : ''}
								role="img"
								aria-label={service.imageAlt}
							></div>
							<h4 class="service-title" lang="en">{service.title}</h4>
							{#if service.subtitle}
								<p class="service-subtitle">{service.subtitle}</p>
							{/if}
							{#if service.body}
								<p class="service-body">{service.body}</p>
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

	<section class="Founder">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<h5 class="num" lang="en">03</h5>
					<h3 class="label" lang="en">Founder:</h3>
					<h3 class="label" lang="en">TAKUMI ISOBE</h3>
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
				<div class="body body-ja">
					<p>
						2001年日本生まれ。<br />
						英University of
						Westminster在学時、多様な文化と芸術に触れる中で、視覚表現に強く興味を抱きクリエイティブインダストリーへ。東京都内のデザインオフィス数社を経て、独立。現在はディレクターとして、デザインオフィスを基軸にタイプファウンダリやイメージメークスタジオ、ワインコミュニティの運営を行っている。
					</p>
				</div>
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	.Office {
		padding-top: 20vh;
		padding-bottom: 40px;
	}

	.Office .Section1 {
		padding-top: 30px;
	}

	.Office .Service,
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
		aspect-ratio: 344 / 154;
		background-color: #eaeaea;
		background-size: cover;
		background-position: center;
	}

	.Office .service-title {
		font-size: var(--fs-h5);
		font-weight: 500;
		margin: 20px 0 0;
	}

	.Office .service-subtitle {
		font-size: 10px;
		font-weight: 400;
		line-height: 1.7;
		margin: 4px 0 0;
		opacity: 0.6;
	}

	.Office .service-body {
		font-size: 10px;
		line-height: 1.7;
		margin: 12px 0 0;
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

	.Office .num {
		font-size: var(--fs-h3);
		font-weight: 500;
		margin-bottom: 0;
	}

	.Office .label {
		font-size: var(--fs-h3);
		font-weight: 500;
	}

	.Office .body {
		margin-top: 20px;
	}

	/* SP/tablet only: 01 Section1 を 2カラム grid（左 27.5% / 右 72.5%）にして
	   title と本文の Y を揃え、本文を右寄せにする。03 Founder は通常の block flow に戻す。 */
	@media (max-width: 1023px) {
		.Office .Section1 .container {
			display: grid;
			grid-template-columns: 27.5% 72.5%;
			align-items: start;
		}

		.Office .Section1 .header {
			grid-column: 1;
		}

		.Office .Section1 .content {
			grid-column: 2;
		}

		.Office .Section1 .body {
			margin-top: 0;
		}
	}

	.Office .body p {
		font-size: 10px;
		line-height: 1.7;
	}

	.Office .body[lang='en'] p {
		font-size: 11px;
		line-height: 1.5;
	}

	.Office .body p + p {
		margin-top: 14px;
	}

	/* Tablet */
	@media (min-width: 768px) {
		.Office {
			padding-top: 100px;
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
			padding-top: 42.5vh;
			padding-bottom: 160px;
		}

		.Office section {
			padding-top: 0;
		}

		.Office .Service,
		.Office .Founder {
			padding-top: 120px;
		}

		.Office .wrapper {
			padding-inline: 0;
		}

		.Office .container {
			max-width: none;
			display: grid;
			grid-template-columns: 7.5% 40% 52.5%;
			align-items: start;
		}

		.Office .header {
			display: contents;
		}

		.Office .num {
			grid-column: 1;
		}

		.Office .label {
			grid-column: 2;
		}

		.Office .content {
			grid-column: 3;
		}

		.Office .body {
			margin-top: 0;
		}

		.Office .service-list {
			margin-top: 0;
		}

		.Office .body p + p {
			margin-top: 16px;
		}
	}

	/* Wide */
	@media (min-width: 1440px) {
		.Office .wrapper {
			padding-inline: 0;
		}
	}
</style>
