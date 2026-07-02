<script lang="ts">
	const UPDATED = '2026.05.18';
</script>

<svelte:head>
	<title>Privacy Policy — TAKUMIISOBE.com</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Legal">
	<div class="wrapper">
		<header class="head">
			<h1 class="title" lang="en">Privacy Policy</h1>
			<!-- JA-only subheading, directly under the (always-English) title -->
			<p class="subtitle-ja" lang="ja">プライバシーポリシー</p>
			<p class="meta" lang="en">Updated / {UPDATED}</p>
		</header>

		<section class="body" lang="en">
			<div class="block">
				<p>
					TAKUMIISOBE.COM ("we", "our", "us") respects the privacy of visitors
					to this website. This Privacy Policy describes the kinds of
					information we may collect, how we use it, and the choices available
					to you.
				</p>
			</div>

			<div class="block">
				<h3>1. Information We Collect</h3>
				<p>
					We may collect non-personally identifiable information automatically,
					including browser type, device information, and pages visited, in
					order to understand how visitors use this site. When you contact us
					through the contact form, we collect the information you voluntarily
					provide, such as your name, email address, and the content of your
					message.
				</p>
			</div>

			<div class="block">
				<h3>2. Use of Information</h3>
				<p>
					We use the information collected to respond to your inquiries, to
					maintain and improve the website, and to ensure its security. We do
					not sell, rent, or trade your personal information to third parties.
				</p>
			</div>

			<div class="block">
				<h3>3. Cookies and Analytics</h3>
				<p>
					This website may use cookies and similar technologies for analytics
					and performance purposes. You can disable cookies through your
					browser settings; doing so will not affect the core functionality of
					the site.
				</p>
			</div>

			<div class="block">
				<h3>4. Third-Party Services</h3>
				<p>
					We may use third-party services for hosting, analytics, content
					delivery, and email handling. These providers process information in
					accordance with their respective privacy policies.
				</p>
			</div>

			<div class="block">
				<h3>5. Your Rights</h3>
				<p>
					You may request access to, correction of, or deletion of the personal
					information we hold about you by reaching out through the contact
					form on this site. We will respond to such requests within a
					reasonable period.
				</p>
			</div>

			<div class="block">
				<h3>6. Changes to This Policy</h3>
				<p>
					We may update this Privacy Policy from time to time. The latest
					version will be posted on this page together with the revision date.
				</p>
			</div>

			<div class="block">
				<h3>7. Contact</h3>
				<p>
					For any questions regarding this Privacy Policy, please use the
					contact form on this site.
				</p>
			</div>
		</section>

		<section class="body body-ja" lang="ja">
			<div class="block">
				<p>
					TAKUMIISOBE.COM（以下「当サイト」）は、訪問者のプライバシーを尊重します。本プライバシーポリシーは、当サイトが収集する情報の種類、その使用方法、ならびに利用者の権利について説明するものです。
				</p>
			</div>

			<div class="block">
				<h3>1. 収集する情報</h3>
				<p>
					当サイトは、ブラウザの種類、端末情報、閲覧ページなど、個人を特定しない情報を自動的に収集する場合があります。お問い合わせフォームを通じてご連絡いただく際には、お名前、メールアドレス、メッセージ内容など、ご自身で入力された情報を収集いたします。
				</p>
			</div>

			<div class="block">
				<h3>2. 情報の利用目的</h3>
				<p>
					収集した情報は、お問い合わせへの返信、当サイトの保守・改善、および安全性確保のために使用します。第三者への売却、貸与、提供は行いません。
				</p>
			</div>

			<div class="block">
				<h3>3. Cookie とアクセス解析</h3>
				<p>
					当サイトでは、アクセス解析および性能向上のために
					Cookie等の技術を使用する場合があります。Cookie はブラウザの設定により無効化が可能で、無効化された場合でも当サイトの基本機能はご利用いただけます。
				</p>
			</div>

			<div class="block">
				<h3>4. 第三者サービス</h3>
				<p>
					ホスティング、アクセス解析、コンテンツ配信、メール対応等のために第三者サービスを利用する場合があります。これらの提供者は、各自のプライバシーポリシーに基づき情報を取り扱います。
				</p>
			</div>

			<div class="block">
				<h3>5. 利用者の権利</h3>
				<p>
					サイト内のお問い合わせフォームを通じて、ご自身に関する個人情報の確認、訂正、または削除を請求いただけます。当サイトは合理的な期間内に対応いたします。
				</p>
			</div>

			<div class="block">
				<h3>6. ポリシーの変更</h3>
				<p>
					本ポリシーは随時更新される場合があります。最新版は本ページにて改訂日とともに掲示します。
				</p>
			</div>

			<div class="block">
				<h3>7. お問い合わせ</h3>
				<p>
					本プライバシーポリシーに関するご質問は、サイト内のお問い合わせフォームをご利用ください。
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
		font-weight: var(--fw-medium);
		line-height: 1.2;
		margin: 0 0 4px;
	}

	.Legal .subtitle-ja {
		font-family: var(--font-ja);
		font-size: var(--fs-h5);
		font-weight: var(--fw-medium);
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

	.Legal .body h2,
	.Legal .body h3 {
		font-size: var(--fs-h4);
		font-weight: var(--fw-medium);
		line-height: 1.3;
		margin: 0;
	}

	.Legal .body.body-ja h2,
	.Legal .body.body-ja h3 {
		font-size: var(--fs-h5);
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
