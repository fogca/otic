import { fail } from '@sveltejs/kit';
// Dynamic (not static) so a not-yet-configured deploy still BUILDS — the vars
// are read at request time from the Cloudflare Worker env. Missing keys surface
// as a clean 500 below rather than a build failure.
import { env } from '$env/dynamic/private';
import type { Actions } from './$types';

const INQUIRY_TYPES = ['Project', 'Hiring', 'Press', 'Other'] as const;

const NAME_MAX = 200;
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

		// Honeypot: `company` is visually hidden and off the tab order — a real
		// visitor never fills it, bots that autofill every field do. Pretend
		// success so we don't teach the bot which field tripped the filter.
		if (str(data.get('company'))) {
			return { success: true };
		}

		const values = {
			name: str(data.get('name')),
			email: str(data.get('email')),
			type: str(data.get('type')),
			message: str(data.get('message'))
		};

		// Server-side validation — the native required/type=email on the client
		// is a convenience, not a guarantee (trivially bypassed).
		const errors: Record<string, string> = {};
		if (values.name.length < 1 || values.name.length > NAME_MAX) {
			errors.name = 'お名前をご入力ください。';
		}
		if (!isEmail(values.email)) {
			errors.email = '有効なメールアドレスをご入力ください。';
		}
		if (!(INQUIRY_TYPES as readonly string[]).includes(values.type)) {
			errors.type = '種別をお選びください。';
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

		const text =
			`Name: ${values.name}\n` +
			`Email: ${values.email}\n` +
			`Type: ${values.type}\n\n` +
			values.message;
		const html =
			`<p><strong>Name:</strong> ${escapeHtml(values.name)}</p>` +
			`<p><strong>Email:</strong> ${escapeHtml(values.email)}</p>` +
			`<p><strong>Type:</strong> ${escapeHtml(values.type)}</p>` +
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
					subject: `[Contact / ${values.type}] ${values.name}`,
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

		return { success: true };
	}
};
