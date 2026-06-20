<script lang="ts">
	// Contact page — black background, accepts inquiries for new projects.
	const INQUIRY_TYPES = ['Project', 'Hiring', 'Press', 'Other'] as const;

	let formData = $state({
		name: '',
		email: '',
		type: 'Project' as (typeof INQUIRY_TYPES)[number],
		message: ''
	});

	let submitted = $state(false);

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		// TODO: wire up Resend or similar email service
		console.log('Contact form submission:', formData);
		submitted = true;
	}
</script>

<svelte:head>
	<title>Contact — TAKUMIISOBE.com</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="Contact">
	<section class="Section">
		<div class="wrapper">
			<div class="container">
				<div class="header">
					<h3 class="title" lang="en">Contact</h3>
				</div>

				<div class="content">
					<div class="body" lang="en">
						<p>
							We are currently accepting a limited number of projects across
							brand design, product design, typeface, digital communication, and
							CG image creation — work that crosses the visual domain. Email
							replies are typically returned within five business days. Whether
							your project is at the conceptual stage, in need of an estimate,
							or simply an open conversation, please feel free to reach out. We
							look forward to the collaborations ahead.
						</p>
					</div>

					<div class="body body-ja" lang="ja">
						<p>
							ブランドデザインやプロダクトデザイン、タイプフェイスやデジタルコミュニケーション、CGイメージクリエイションなど、視覚領域を横断する制作を現在少数受け付けております。メールのお返事には原則5営業日以内に返信いたします。構想段階のプロジェクトやお見積り、その他ご相談などお気軽にご連絡ください。新たなコラボレーションを楽しみにお待ちしております。
						</p>
					</div>

					{#if submitted}
						<p class="thanks" lang="en">Thank you. We'll be in touch shortly.</p>
					{:else}
						<form onsubmit={handleSubmit} class="form">
							<label class="field">
								<span class="label" lang="en">Name</span>
								<input
									type="text"
									name="name"
									placeholder="Yamada Taro"
									bind:value={formData.name}
									required
								/>
							</label>
							<label class="field">
								<span class="label" lang="en">Email</span>
								<input
									type="email"
									name="email"
									placeholder="hi@example.com"
									bind:value={formData.email}
									required
								/>
							</label>
							<label class="field">
								<span class="label" lang="en">Type</span>
								<select name="type" bind:value={formData.type} required>
									{#each INQUIRY_TYPES as t (t)}
										<option value={t}>{t}</option>
									{/each}
								</select>
							</label>
							<label class="field field--textarea">
								<span class="label" lang="en">Message</span>
								<textarea
									name="message"
									rows="8"
									placeholder="Tell us about the project — background, scope, timeline, references..."
									bind:value={formData.message}
									required
								></textarea>
							</label>

							<button type="submit" class="submit" lang="en">Send →</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	.Contact {
		background: #000;
		color: #fff;
		padding-top: 100px;
		padding-bottom: 120px;
		min-height: 100vh;
		/* Absorb Footer's margin-top so Contact (black) flows seamlessly into Footer (black) */
		margin-bottom: -120px;
		/* Hairline divider between Contact and Footer (matches Footer__bottom top border) */
		border-bottom: 1px solid rgba(255, 255, 255, 0.15);
	}

	.Contact :global(*) {
		color: #fff;
	}

	.Contact :global(a) {
		color: inherit;
		text-decoration: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.4);
		transition: border-color 0.15s ease;
	}

	.Contact :global(a:hover) {
		border-bottom-color: #fff;
	}

	.Contact .wrapper {
		padding-inline: var(--padding);
	}

	.Contact .container {
		max-width: none;
	}

	.Contact .title {
		font-size: var(--fs-h2);
		font-weight: var(--fw-medium);
		margin: 0 0 40px;
	}

	.Contact .body {
		margin-top: 0;
	}

	.Contact .body[lang='en'] p {
		font-size: 12px;
		line-height: 1.5;
	}

	.Contact .body p {
		font-size: 12px;
		line-height: 1.7;
	}

	.Contact .body p + p {
		margin-top: 16px;
	}

	.Contact .body.body-ja {
		margin-top: 28px;
	}

	.Contact .form {
		margin-top: 56px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	.Contact .field {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		gap: 10px;
	}

	.Contact .field .label {
		flex: 0 0 100px;
		font-size: 13px;
		opacity: 0.6;
		padding: 10px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.4);
	}

	.Contact .field input,
	.Contact .field textarea,
	.Contact .field select {
		flex: 1;
		font-size: 16px;
		background: transparent;
		color: inherit;
		padding: 10px 0;
		border: 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.4);
		font-family: var(--font-en);
		resize: vertical;
		outline: none;
		transition: border-color 0.2s ease;
	}

	.Contact .field input::placeholder,
	.Contact .field textarea::placeholder {
		color: rgba(255, 255, 255, 0.5);
		font-size: 12.5px;
	}

	.Contact .field select {
		appearance: none;
		-webkit-appearance: none;
		background-image: linear-gradient(45deg, transparent 50%, #fff 50%),
			linear-gradient(135deg, #fff 50%, transparent 50%);
		background-position:
			calc(100% - 12px) 50%,
			calc(100% - 7px) 50%;
		background-size:
			5px 5px,
			5px 5px;
		background-repeat: no-repeat;
		padding-right: 24px;
		cursor: pointer;
	}

	.Contact .field select option {
		background: #000;
		color: #fff;
	}

	/* Message field: stack label above full-width textarea */
	.Contact .field--textarea {
		flex-direction: column;
		gap: 8px;
		align-items: stretch;
	}

	.Contact .field--textarea .label {
		flex: 0 0 auto;
		border-bottom: 0;
		padding: 0;
	}

	.Contact .field--textarea textarea {
		flex: none;
		width: 100%;
		min-height: 160px;
	}

	.Contact .field input:focus-visible,
	.Contact .field textarea:focus-visible,
	.Contact .field select:focus-visible {
		border-bottom-color: #fff;
	}

	.Contact .submit {
		align-self: flex-start;
		padding: 14px 32px;
		margin-top: 16px;
		font-size: 16px;
		font-family: var(--font-en);
		background: transparent;
		color: inherit;
		border: 1px solid rgba(255, 255, 255, 0.6);
		cursor: pointer;
		transition:
			background var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default);
	}

	.Contact .submit:hover {
		background: #fff;
		color: #000;
		border-color: #fff;
	}

	.Contact .thanks {
		font-size: 16px;
		padding-block: 80px;
	}

	@media (min-width: 1024px) {
		.Contact {
			padding-top: 42.5vh;
		}

		.Contact .container {
			display: grid;
			grid-template-columns: 47.5% 52.5%;
			align-items: start;
		}

		.Contact .header {
			grid-column: 1;
		}

		.Contact .content {
			grid-column: 2;
		}

		.Contact .title {
			margin-bottom: 0;
		}

		.Contact .body[lang='en'] p {
			font-size: 15px;
		}

		.Contact .body p {
			font-size: 14px;
		}

		.Contact .field input,
		.Contact .field textarea,
		.Contact .field select {
			font-size: 17px;
		}

		.Contact .submit {
			font-size: 17px;
		}
	}
</style>
