<script lang="ts">
	// Contact page — accepts inquiries for new projects. Submits to the form
	// action in +page.server.ts (validation + Resend email).
	// Progressive enhancement: works as a native POST with JS off; use:enhance
	// upgrades it to an in-place submit with loading/error/success states.
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

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
					<!-- Reused verbatim from the body copy below (not new copy) —
					     same "We look forward to the collaborations ahead."
					     sentence, promoted to a large tagline (sized to match
					     Office's .intro-headline). -->
					<p class="intro-headline" lang="en">
						We look forward to the collaborations ahead.
					</p>
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

							<!-- Honeypot: hidden from users, catches naive bots. Named
							     `website`, NOT `company` — there's a real Company field
							     below now, and sharing the name would make every genuine
							     submission that fills it look like a bot. -->
							<div class="hp" aria-hidden="true">
								<label>
									Website
									<input type="text" name="website" tabindex="-1" autocomplete="off" />
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
									<span class="label" lang="en">Company</span>
									<input
										id="company"
										type="text"
										name="company"
										placeholder="Optional"
										value={form?.values?.company ?? ''}
										aria-invalid={form?.errors?.company ? 'true' : undefined}
										aria-describedby={form?.errors?.company ? 'company-error' : undefined}
									/>
								</label>
								{#if form?.errors?.company}
									<span class="field-error" id="company-error">{form.errors.company}</span>
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
									<span class="label" lang="en">Phone</span>
									<input
										id="phone"
										type="tel"
										name="phone"
										placeholder="Optional"
										value={form?.values?.phone ?? ''}
										aria-invalid={form?.errors?.phone ? 'true' : undefined}
										aria-describedby={form?.errors?.phone ? 'phone-error' : undefined}
									/>
								</label>
								{#if form?.errors?.phone}
									<span class="field-error" id="phone-error">{form.errors.phone}</span>
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
								{submitting ? 'Sending…' : 'Confirm'}
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
		background: var(--color-bg);
		color: var(--color-text);
		padding-top: 120px;
		padding-bottom: 0;
		min-height: 100vh;
		min-height: 100dvh;
		/* White now (was black, seamlessly merged into the black Footer via a
		   negative margin-bottom + hairline divider) — with a real color
		   change at the boundary, that trick is no longer needed; Footer's
		   own 120px margin-top applies normally, same as every other page. */
	}

	.Contact :global(*) {
		color: var(--color-text);
	}

	.Contact :global(a) {
		color: inherit;
		text-decoration: none;
		border-bottom: 1px solid rgba(0, 0, 0, 0.4);
		transition: border-color 0.15s ease;
	}

	.Contact :global(a:hover) {
		border-bottom-color: var(--color-text);
	}

	/* base.css sets a bare `section { padding-left/right: var(--padding) }`
	   rule — .Section (a <section>) matched it, stacking a second var(--padding)
	   on top of .wrapper's own, doubling the side inset versus every other
	   page (e.g. Office's .panel explicitly zeroes this same clash). Cancel
	   it here so .wrapper is the single source of truth, same width as
	   Office now. */
	.Contact .Section {
		padding-inline: 0;
	}

	.Contact .wrapper {
		padding-inline: var(--padding);
	}

	.Contact .container {
		max-width: none;
	}

	/* SP drops to --fs-h4; PC keeps --fs-h2 (restored in the
	   min-width:1024px block below). */
	.Contact .title {
		font-size: var(--fs-h4);
		font-weight: var(--fw-medium);
		line-height: var(--lh-h2);
		margin: 0;
	}

	/* Hidden for now (kept in the DOM, not deleted; may come back) — same
	   treatment as Office's "About Office" label. */
	.Contact .subtitle-ja {
		display: none;
	}

	/* Large tagline — sized to match Office's .intro-headline (same
	   font-size/weight/uppercase treatment), left-aligned to fit Contact's
	   left-aligned form layout. */
	.Contact .intro-headline {
		font-size: var(--fs-h0);
		font-weight: 325;
		font-variation-settings: 'wght' 325;
		text-transform: uppercase;
		text-align: left;
		line-height: var(--lh-h0);
		max-width: 100%;
		margin: 16px 0 0;
	}

	/* Tightened from 40px — gap to .content (body copy) below. */
	.Contact .header {
		margin-bottom: 15px;
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
		color: #b3261e;
	}

	/* Stacked (label above input) on SP — a fixed-width inline label left
	   too little room for the input on a narrow viewport. PC switches back
	   to the inline row (see the min-width:1024px block), where there's
	   width to spare. */
	.Contact .field {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 6px;
	}

	.Contact .field .label {
		font-size: 13px;
		opacity: 0.6;
	}

	/* Groups a field row with its inline error below it — keeps the label +
	   control underline on one continuous baseline (the error sits under the
	   whole row, so it never shifts the label's own underline). */
	.Contact .field-group {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	/* select rules removed along with the Type field — this form is inputs
	   and a textarea only now. */
	.Contact .field input,
	.Contact .field textarea {
		flex: 1;
		font-size: 16px;
		background: transparent;
		color: inherit;
		padding: 10px 0;
		border: 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.4);
		font-family: var(--font-en);
		resize: vertical;
		outline: none;
		transition: border-color 0.2s ease;
	}

	.Contact .field input::placeholder,
	.Contact .field textarea::placeholder {
		color: rgba(0, 0, 0, 0.4);
		font-size: 12.5px;
	}

	.Contact .field-error {
		font-size: 12px;
		color: #b3261e;
	}

	.Contact .field input[aria-invalid='true'],
	.Contact .field textarea[aria-invalid='true'] {
		border-bottom-color: #b3261e;
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
	.Contact .field textarea:focus-visible {
		border-bottom-color: #000;
	}

	/* Solid black pill (was an outlined button that inverted on hover) —
	   hover now just softens it, since the resting state is already the
	   filled one. */
	.Contact .submit {
		align-self: flex-start;
		padding: 10px 30px;
		margin-top: 16px;
		font-size: 16px;
		font-family: var(--font-en);
		background: #000;
		color: #fff;
		border: 1px solid #000;
		border-radius: 30px;
		cursor: pointer;
		transition:
			opacity var(--duration-fast) var(--ease-default),
			background var(--duration-fast) var(--ease-default),
			color var(--duration-fast) var(--ease-default),
			border-color var(--duration-fast) var(--ease-default);
	}

	.Contact .submit:hover {
		opacity: 0.75;
	}

	.Contact .submit:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.Contact .submit:disabled:hover {
		opacity: 0.5;
	}

	.Contact .thanks {
		font-size: 16px;
		padding-block: 80px;
		outline: none;
	}

	@media (min-width: 1024px) {
		/* Was 42.5vh, which pushed the form far down a tall desktop viewport. */
		.Contact {
			padding-top: 150px;
		}

		/* The header sits in the left grid column; nudging the right column
		   down keeps the body copy from starting flush with the title. */
		.Contact .content {
			padding-top: 50px;
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
			/* Back to the h2 tier — the base rule drops to h3 for SP only. */
			font-size: var(--fs-h2);
			margin-bottom: 0;
		}

		.Contact .body[lang='en'] p {
			font-size: 15px;
		}

		.Contact .body p {
			font-size: 14px;
		}

		/* Back to an inline row (label left, input right) — width to spare
		   at this breakpoint. .field--textarea keeps its own stacked layout
		   regardless (message field is always full-width). */
		.Contact .field:not(.field--textarea) {
			flex-direction: row;
			align-items: stretch;
			gap: 10px;
		}

		.Contact .field:not(.field--textarea) .label {
			flex: 0 0 100px;
			padding: 10px 0;
			border-bottom: 1px solid rgba(0, 0, 0, 0.4);
		}

		.Contact .field input,
		.Contact .field textarea {
			font-size: 17px;
		}

		.Contact .submit {
			font-size: 17px;
		}
	}
</style>
