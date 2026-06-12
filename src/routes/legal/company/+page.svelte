<script lang="ts">
	const UPDATED = '2026.06.13';
</script>

<svelte:head>
	<title>Company — TAKUMIISOBE.com</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Legal">
	<div class="wrapper">
		<header class="head">
			<h1 class="title" lang="en">Company</h1>
			<p class="meta" lang="en">Updated / {UPDATED}</p>
		</header>

		<section class="body" lang="en">
			<div class="block">
				<h3>Name</h3>
				<p>TAKUMIISOBE.COM — operated by Takumi Isobe.</p>
			</div>

			<div class="block">
				<h3>Practice</h3>
				<p>
					A multi-disciplinary design office working across branding and visual
					identity, graphic design, web design and build, type design, and
					product design.
				</p>
			</div>

			<div class="block">
				<h3>Location</h3>
				<p>Tokyo, Japan.</p>
			</div>

			<div class="block">
				<h3>Contact</h3>
				<p>
					All inquiries — new projects, press, and general questions — are
					handled through the contact form on this site.
				</p>
			</div>
		</section>

		<section class="body body-ja" lang="ja">
			<div class="block">
				<h2 class="subtitle">名称</h2>
				<p>TAKUMIISOBE.COM（運営：磯部タクミ）</p>
			</div>

			<div class="block">
				<h3>事業内容</h3>
				<p>
					ブランディング／ビジュアルアイデンティティ、グラフィックデザイン、Webデザイン・構築、書体デザイン、プロダクトデザインを横断するデザインオフィスです。
				</p>
			</div>

			<div class="block">
				<h3>所在地</h3>
				<p>東京都</p>
			</div>

			<div class="block">
				<h3>お問い合わせ</h3>
				<p>
					新規プロジェクトのご相談・取材・その他のお問い合わせは、本サイト内のお問い合わせフォームよりご連絡ください。
				</p>
			</div>
		</section>
	</div>
</main>

<style>
	.Legal {
		padding: 100px calc(var(--padding) * 2) 80px;
		max-width: 720px;
		margin-inline: auto;
	}

	.Legal .body {
		padding-inline: 0;
	}

	.Legal .head {
		margin-bottom: 20px;
	}

	.Legal .title {
		font-size: var(--fs-h1);
		font-weight: 450;
		line-height: 1.2;
		margin: 0 0 4px;
	}

	.Legal .meta {
		font-size: 11px;
		opacity: 0.5;
	}

	.Legal .body {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.Legal .block {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.Legal .body h2,
	.Legal .body h3 {
		font-size: var(--fs-h4);
		font-weight: 450;
		line-height: 1.3;
		margin: 0;
	}

	.Legal .body.body-ja h2,
	.Legal .body.body-ja h3 {
		font-size: var(--fs-h5);
	}

	.Legal .body .subtitle {
		font-size: var(--fs-h4);
		font-weight: 450;
		line-height: 1.3;
	}

	.Legal .body p {
		font-size: 11px;
		line-height: 1.3;
		font-weight: 450;
		margin: 0;
	}

	.Legal .body.body-ja {
		margin-top: 24px;
		padding-top: 20px;
		border-top: 1px solid var(--color-line);
	}

	.Legal .body.body-ja p {
		font-family: var(--font-ja);
		font-size: 10.5px;
	}

	@media (min-width: 1024px) {
		.Legal {
			padding-top: 15vh;
			padding-bottom: 120px;
		}

		.Legal .body p {
			font-size: 12px;
		}

		.Legal .body.body-ja p {
			font-size: 11.5px;
		}
	}
</style>
