<script lang="ts">
	const UPDATED = '2026.05.18';
</script>

<svelte:head>
	<title>Imprint — TAKUMIISOBE.com</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Legal">
	<div class="wrapper">
		<header class="head">
			<h1 class="title" lang="en">Imprint</h1>
			<!-- JA-only subheading, directly under the (always-English) title -->
			<p class="subtitle-ja" lang="ja">運営者情報</p>
			<p class="meta" lang="en">Updated / {UPDATED}</p>
		</header>

		<section class="body" lang="en">
			<div class="block">
				<h3>Operator</h3>
				<p>
					This website (TAKUMIISOBE.COM) is operated by Takumi Isobe, an
					independent design office based in Tokyo, Japan.
				</p>
			</div>

			<div class="block">
				<h3>Contact</h3>
				<p>
					All inquiries are handled through the contact form on this site. We
					do not publish a direct email address in order to limit unsolicited
					mail.
				</p>
			</div>

			<div class="block">
				<h3>Hosting</h3>
				<p>
					This website is hosted on third-party infrastructure. Server logs
					may be retained temporarily for security and performance purposes.
				</p>
			</div>

			<div class="block">
				<h3>Content &amp; Copyright</h3>
				<p>
					Unless otherwise indicated, all visual works, texts, project
					documentation, and identifiers appearing on this website are the
					property of TAKUMIISOBE.COM. Reproduction, redistribution, or
					commercial use without prior written consent is not permitted.
				</p>
			</div>

			<div class="block">
				<h3>Trademarks</h3>
				<p>
					Brand names, product names, and trademarks referenced on this site
					remain the property of their respective owners and are used here for
					descriptive purposes only.
				</p>
			</div>

			<div class="block">
				<h3>Disclaimer</h3>
				<p>
					While reasonable care is taken to ensure the accuracy of the
					information presented on this site, no warranty is made regarding
					completeness, currency, or fitness for any particular purpose. Use
					of the information is at the visitor's own discretion.
				</p>
			</div>

			<div class="block">
				<h3>External Links</h3>
				<p>
					This website may contain links to external sites operated by third
					parties. We are not responsible for the content, accuracy, or
					privacy practices of any linked site.
				</p>
			</div>

			<div class="block">
				<h3>Governing Law</h3>
				<p>
					Matters relating to this website are governed by the laws of Japan.
				</p>
			</div>
		</section>

		<section class="body body-ja" lang="ja">
			<div class="block">
				<p>
					本ウェブサイト（TAKUMIISOBE.COM）は、東京都を拠点とする磯部タクミによって個人事業として運営されています。
				</p>
			</div>

			<div class="block">
				<h3>お問い合わせ</h3>
				<p>
					各種お問い合わせは、本サイト内のお問い合わせフォームよりご連絡ください。迷惑メール対策のため、ダイレクトのメールアドレスは公開しておりません。
				</p>
			</div>

			<div class="block">
				<h3>ホスティング</h3>
				<p>
					当サイトは第三者インフラ上で運営されています。安全性および性能向上の目的で、サーバーログを一時的に保持する場合があります。
				</p>
			</div>

			<div class="block">
				<h3>コンテンツおよび著作権</h3>
				<p>
					特段の表記がない限り、当サイトに掲載されているビジュアル、テキスト、プロジェクト資料、各種識別子は
					TAKUMIISOBE.COM
					に帰属します。事前の書面による同意なく、複製・再配布・商業利用することはできません。
				</p>
			</div>

			<div class="block">
				<h3>商標</h3>
				<p>
					本サイトに記載のブランド名、製品名、商標等は、各権利者に帰属し、本サイト内では参照のためにのみ使用されています。
				</p>
			</div>

			<div class="block">
				<h3>免責事項</h3>
				<p>
					本サイトに掲載された情報の正確性については最善を尽くしておりますが、完全性・最新性・特定目的への適合性を保証するものではありません。情報の利用は訪問者の判断と責任のもとに行ってください。
				</p>
			</div>

			<div class="block">
				<h3>外部リンク</h3>
				<p>
					当サイトには第三者が運営する外部サイトへのリンクが含まれる場合があります。リンク先のコンテンツ、正確性、プライバシー慣行について、当方は責任を負いません。
				</p>
			</div>

			<div class="block">
				<h3>準拠法</h3>
				<p>
					本ウェブサイトに関する事項は、日本国の法令に準拠するものとします。
				</p>
			</div>
		</section>
	</div>
</main>

<style>
	/* Language toggle: show only the active language's body + subheading.
	   The EN title (h1) and "Updated" meta stay visible in both languages. */
	:global([data-lang='en']) .Legal .subtitle-ja,
	:global([data-lang='en']) .Legal .body.body-ja {
		display: none;
	}
	:global([data-lang='ja']) .Legal .body:not(.body-ja) {
		display: none;
	}

	/* Full-bleed background — width constraint moved to .wrapper below so the
	   charcoal fill spans the whole viewport, not just the reading column. */
	.Legal {
		background: var(--color-bg-charcoal);
		color: #fff;
		padding-block: 100px 80px;
		min-height: 100vh;
		min-height: 100dvh;
	}

	/* base.css sets color directly on h1/h3/p/etc (a bare-element rule, not
	   inherited) — beats a plain .Legal{color:#fff} ancestor value regardless
	   of source order, so force it the same way Contact does. */
	.Legal :global(*) {
		color: #fff;
	}

	.Legal .wrapper {
		max-width: 720px;
		margin-inline: auto;
		padding-inline: calc(var(--padding) * 2);
	}

	.Legal .body {
		padding-inline: 0;
	}

	.Legal .head {
		margin-bottom: 20px;
	}

	.Legal .title {
		font-size: var(--fs-h1);
		font-weight: var(--fw-base);
		line-height: var(--lh-h1);
		margin: 0 0 4px;
	}

	.Legal .subtitle-ja {
		font-family: var(--font-ja);
		font-size: var(--fs-h5);
		font-weight: var(--fw-medium);
		line-height: var(--lh-h-ja);
		margin: 6px 0 0;
	}

	.Legal .meta {
		font-size: 11px;
		opacity: 0.5;
		margin-top: 8px;
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

	.Legal .body h3 {
		font-size: var(--fs-h4);
		font-weight: var(--fw-medium);
		line-height: var(--lh-h4);
		margin: 0;
	}

	.Legal .body.body-ja h3 {
		font-size: var(--fs-h5);
		line-height: var(--lh-h-ja);
	}

	.Legal .body p {
		font-size: 11px;
		line-height: 1.3;
		font-weight: var(--fw-medium);
		margin: 0;
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
