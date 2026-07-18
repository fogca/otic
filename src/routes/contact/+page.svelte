<script lang="ts">
	// Contact page — black background, accepts inquiries for new projects.
	// Submits to the form action in +page.server.ts (validation + Resend email).
	// Progressive enhancement: works as a native POST with JS off; use:enhance
	// upgrades it to an in-place submit with loading/error/success states.
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	const INQUIRY_TYPES = ['Project', 'Hiring', 'Press', 'Other'] as const;

	let { form }: { form: ActionData } = $props();

	let submitting = $state(false);
	let thanksEl: HTMLElement | undefined = $state();

	// Move focus to the confirmation once a submit succeeds, so screen-reader
	// and keyboard users aren't left on a now-removed submit button.
	$effect(() => {
		if (form?.success && thanksEl) thanksEl.focus();
	});

	const submit = () => {
		submitting = true;
		return async ({ update }: { update: () => Promise<void> }) => {
			await update();
			submitting = false;
		};
	};
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
					<!-- JA-only subheading, directly under the (always-English) title -->
					<p class="subtitle-ja" lang="ja">お問い合わせ</p>
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

					{#if form?.success}
						<p class="thanks" lang="en" role="status" tabindex="-1" bind:this={thanksEl}>
							Thank you. We'll be in touch shortly.
						</p>
					{:else}
						<form method="POST" use:enhance={submit} class="form" novalidate>
							{#if form?.formError}
								<p class="form-error" role="alert">{form.formError}</p>
							{/if}

							<!-- Honeypot: hidden from users, catches naive bots. -->
							<div class="hp" aria-hidden="true">
								<label>
									Company
									<input type="text" name="company" tabindex="-1" autocomplete="off" />
								</label>
							</div>

							<div class="field-group">
								<label class="field">
									<span class="label" lang="en">Name</span>
									<input
										id="name"
										type="text"
										name="name"
										placeholder="Yamada Taro"
										value={form?.values?.name ?? ''}
										required
										aria-invalid={form?.errors?.name ? 'true' : undefined}
										aria-describedby={form?.errors?.name ? 'name-error' : undefined}
									/>
								</label>
								{#if form?.errors?.name}
									<span class="field-error" id="name-error">{form.errors.name}</span>
								{/if}
							</div>
							<div class="field-group">
								<label class="field">
									<span class="label" lang="en">Email</span>
									<input
										id="email"
										type="email"
										name="email"
										placeholder="hi@example.com"
										value={form?.values?.email ?? ''}
										required
										aria-invalid={form?.errors?.email ? 'true' : undefined}
										aria-describedby={form?.errors?.email ? 'email-error' : undefined}
									/>
								</label>
								{#if form?.errors?.email}
									<span class="field-error" id="email-error">{form.errors.email}</span>
								{/if}
							</div>
							<div class="field-group">
								<label class="field">
									<span class="label" lang="en">Type</span>
									<select
										name="type"
										required
										aria-invalid={form?.errors?.type ? 'true' : undefined}
										aria-describedby={form?.errors?.type ? 'type-error' : undefined}
									>
										{#each INQUIRY_TYPES as t (t)}
											<option value={t} selected={(form?.values?.type ?? 'Project') === t}>{t}</option>
										{/each}
									</select>
								</label>
								{#if form?.errors?.type}
									<span class="field-error" id="type-error">{form.errors.type}</span>
								{/if}
							</div>
							<label class="field field--textarea">
								<span class="label" lang="en">Message</span>
								<textarea
									id="message"
									name="message"
									rows="8"
									placeholder="Tell us about the project — background, scope, timeline, references..."
									required
									aria-invalid={form?.errors?.message ? 'true' : undefined}
									aria-describedby={form?.errors?.message ? 'message-error' : undefined}
									>{form?.values?.message ?? ''}</textarea
								>
								{#if form?.errors?.message}
									<span class="field-error" id="message-error">{form.errors.message}</span>
								{/if}
							</label>

							<button type="submit" class="submit" lang="en" disabled={submitting}>
								{submitting ? 'Sending…' : 'Send →'}
							</button>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</section>
</main>

<style>
	/* Language toggle: show only the active language's body copy. The EN
	   title stays visible in both languages; form labels stay English (UI
	   chrome, not translated content). */
	:global([data-lang='en']) .Contact .subtitle-ja,
	:global([data-lang='en']) .Contact .body.body-ja {
		display: none;
	}
	:global([data-lang='ja']) .Contact .body:not(.body-ja) {
		display: none;
	}

	.Contact {
		background: #000;
		color: #fff;
		padding-top: 100px;
		padding-bottom: 120px;
		min-height: 100vh;
		min-height: 100dvh;
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
		line-height: var(--lh-h2);
		margin: 0;
	}

	.Contact .subtitle-ja {
		font-family: var(--font-ja);
		font-size: var(--fs-h5);
		font-weight: var(--fw-medium);
		line-height: var(--lh-h-ja);
		margin: 8px 0 0;
		opacity: 0.85;
	}

	.Contact .header {
		margin-bottom: 40px;
	}

	.Contact .body {
		margin-top: 0;
	}

	.Contact .body[lang='en'] p {
		font-size: 12px;
		line-height: var(--lh-en);
	}

	.Contact .body p {
		font-size: 12px;
		line-height: var(--lh-ja);
	}

	.Contact .form {
		margin-top: 56px;
		display: flex;
		flex-direction: column;
		gap: 28px;
	}

	/* Visually-hidden honeypot — off-screen (not display:none, which some bots
	   skip) and out of the tab order. */
	.Contact .hp {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}

	.Contact .form-error {
		margin: 0;
		font-size: 13px;
		color: #ff9a9a;
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

	/* Groups a field row with its inline error below it — keeps the label +
	   control underline on one continuous baseline (the error sits under the
	   whole row, so it never shifts the label's own underline). */
	.Contact .field-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
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

	.Contact .field-error {
		font-size: 12px;
		color: #ff9a9a;
	}

	.Contact .field input[aria-invalid='true'],
	.Contact .field textarea[aria-invalid='true'],
	.Contact .field select[aria-invalid='true'] {
		border-bottom-color: #ff9a9a;
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

	.Contact .submit:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.Contact .submit:disabled:hover {
		background: transparent;
		color: inherit;
		border-color: rgba(255, 255, 255, 0.6);
	}

	.Contact .thanks {
		font-size: 16px;
		padding-block: 80px;
		outline: none;
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
