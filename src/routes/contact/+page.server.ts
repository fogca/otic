import { fail } from '@sveltejs/kit';
// Dynamic (not static) so a not-yet-configured deploy still BUILDS — the vars
// are read at request time from the Cloudflare Worker env. Missing keys surface
// as a clean 500 below rather than a build failure.
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

const NAME_MAX = 200;
const COMPANY_MAX = 200;
const PHONE_MAX = 40;
const MSG_MIN = 10;
const MSG_MAX = 5000;

function str(v: FormDataEntryValue | null): string {
	return typeof v === 'string' ? v.trim() : '';
}

// Also rejects CR/LF — the classic email-header-injection vector, since this
// value is reflected into the outgoing mail's reply_to.
function isEmail(v: string): boolean {
	return v.length <= 254 && !/[\r\n]/.test(v) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();

		// Honeypot: `website` is visually hidden and off the tab order — a real
		// visitor never fills it, bots that autofill every field do. Pretend
		// success so we don't teach the bot which field tripped the filter.
		// NOTE: this used to be `company`, which is now a REAL field — keep the
		// two names distinct or genuine submissions get silently swallowed.
		if (str(data.get('website'))) {
			return { success: true };
		}

		const values = {
			name: str(data.get('name')),
			company: str(data.get('company')),
			email: str(data.get('email')),
			phone: str(data.get('phone')),
			message: str(data.get('message'))
		};

		// Server-side validation — the native required/type=email on the client
		// is a convenience, not a guarantee (trivially bypassed). Company and
		// phone are optional (an individual may have neither), so they're only
		// length-checked when actually filled in.
		const errors: Record<string, string> = {};
		if (values.name.length < 1 || values.name.length > NAME_MAX) {
			errors.name = 'お名前をご入力ください。';
		}
		if (values.company.length > COMPANY_MAX) {
			errors.company = `会社名は${COMPANY_MAX}文字以内でご入力ください。`;
		}
		if (!isEmail(values.email)) {
			errors.email = '有効なメールアドレスをご入力ください。';
		}
		if (values.phone.length > PHONE_MAX) {
			errors.phone = `電話番号は${PHONE_MAX}文字以内でご入力ください。`;
		}
		if (values.message.length < MSG_MIN || values.message.length > MSG_MAX) {
			errors.message = `メッセージは${MSG_MIN}〜${MSG_MAX}文字でご入力ください。`;
		}
		if (Object.keys(errors).length > 0) {
			return fail(400, { values, errors });
		}

		const apiKey = env.RESEND_API_KEY;
		const to = env.CONTACT_TO_EMAIL;
		// `from` MUST be an address on a domain verified in Resend (DKIM/SPF) —
		// never the visitor's address, or the mail fails auth / looks spoofed.
		const from = env.CONTACT_FROM_EMAIL;
		if (!apiKey || !to || !from) {
			console.error(
				'[contact] missing env: RESEND_API_KEY / CONTACT_TO_EMAIL / CONTACT_FROM_EMAIL'
			);
			return fail(500, {
				values,
				formError: '送信設定が未完了です。恐れ入りますが hi@takumiisobe.com まで直接ご連絡ください。'
			});
		}

		// Optional fields are omitted entirely when blank rather than shown as
		// an empty row.
		const optionalLine = (label: string, v: string) => (v ? `${label}: ${v}\n` : '');
		const optionalRow = (label: string, v: string) =>
			v ? `<p><strong>${label}:</strong> ${escapeHtml(v)}</p>` : '';

		const text =
			`Name: ${values.name}\n` +
			optionalLine('Company', values.company) +
			`Email: ${values.email}\n` +
			optionalLine('Phone', values.phone) +
			`\n` +
			values.message;
		const html =
			`<p><strong>Name:</strong> ${escapeHtml(values.name)}</p>` +
			optionalRow('Company', values.company) +
			`<p><strong>Email:</strong> ${escapeHtml(values.email)}</p>` +
			optionalRow('Phone', values.phone) +
			`<p style="white-space:pre-wrap">${escapeHtml(values.message)}</p>`;

		try {
			// Resend REST API — HTTP-only, so it works in the Cloudflare Workers
			// runtime (SMTP/nodemailer do not). reply_to routes replies to the
			// visitor while from stays our verified sending domain.
			const res = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from,
					to: [to],
					reply_to: values.email,
					subject: `[Contact] ${values.name}${values.company ? ` — ${values.company}` : ''}`,
					text,
					html
				})
			});
			if (!res.ok) {
				const detail = await res.text().catch(() => '');
				console.error('[contact] Resend responded', res.status, detail);
				return fail(502, {
					values,
					formError: '送信に失敗しました。恐れ入りますが、時間をおいて再度お試しください。'
				});
			}
		} catch (err) {
			console.error('[contact] Resend request threw', err);
			return fail(502, {
				values,
				formError: '送信に失敗しました。ネットワーク環境をご確認のうえ、再度お試しください。'
			});
		}

		// ── Acknowledgement to the visitor ──
		// Deliberately fire-and-forget, and deliberately AFTER the inquiry has
		// already been delivered: by this point we genuinely have the message,
		// so a failure here must not turn a received inquiry into an error the
		// visitor sees and then re-submits. Logged, never surfaced.
		//
		// Bilingual because the form itself is (the page's body copy toggles
		// EN/JA) but the submission carries no language signal — there is
		// nothing to branch on, so both are sent, JA first.
		//
		// reply_to is the studio inbox, not the no-reply sending address: if
		// someone answers this mail it should reach a human.
		try {
			const ackText =
				`${values.name} 様\n\n` +
				`このたびはお問い合わせいただき、ありがとうございます。\n` +
				`以下の内容で承りました。5営業日以内にご返信いたします。\n\n` +
				`----------------------------------------\n` +
				`お名前: ${values.name}\n` +
				optionalLine('会社名', values.company) +
				`メールアドレス: ${values.email}\n` +
				optionalLine('電話番号', values.phone) +
				`\n` +
				`${values.message}\n` +
				`----------------------------------------\n\n` +
				`本メールは自動送信ですが、このままご返信いただけます。\n\n` +
				`— — —\n\n` +
				`Dear ${values.name},\n\n` +
				`Thank you for reaching out. We have received your message as shown\n` +
				`above, and will reply within five business days.\n\n` +
				`This is an automated confirmation, but you can reply to it directly.\n\n` +
				`Office / TAKUMI ISOBE\n` +
				`https://takumiisobe.com`;

			const ackHtml =
				`<p>${escapeHtml(values.name)} 様</p>` +
				`<p>このたびはお問い合わせいただき、ありがとうございます。<br>` +
				`以下の内容で承りました。5営業日以内にご返信いたします。</p>` +
				`<hr>` +
				`<p><strong>お名前:</strong> ${escapeHtml(values.name)}<br>` +
				(values.company ? `<strong>会社名:</strong> ${escapeHtml(values.company)}<br>` : '') +
				`<strong>メールアドレス:</strong> ${escapeHtml(values.email)}` +
				(values.phone ? `<br><strong>電話番号:</strong> ${escapeHtml(values.phone)}` : '') +
				`</p>` +
				`<p style="white-space:pre-wrap">${escapeHtml(values.message)}</p>` +
				`<hr>` +
				`<p>本メールは自動送信ですが、このままご返信いただけます。</p>` +
				`<p>— — —</p>` +
				`<p>Dear ${escapeHtml(values.name)},</p>` +
				`<p>Thank you for reaching out. We have received your message as shown ` +
				`above, and will reply within five business days.</p>` +
				`<p>This is an automated confirmation, but you can reply to it directly.</p>` +
				`<p>Office / TAKUMI ISOBE<br>` +
				`<a href="https://takumiisobe.com">takumiisobe.com</a></p>`;

			const ack = await fetch('https://api.resend.com/emails', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${apiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					from,
					to: [values.email],
					reply_to: to,
					subject: 'お問い合わせありがとうございます — Office / TAKUMI ISOBE',
					text: ackText,
					html: ackHtml
				})
			});
			if (!ack.ok) {
				const detail = await ack.text().catch(() => '');
				console.error('[contact] ack email failed', ack.status, detail);
			}
		} catch (err) {
			console.error('[contact] ack email threw', err);
		}

		return { success: true };
	}
};
