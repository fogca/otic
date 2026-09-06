import { redirect, type Handle } from '@sveltejs/kit';

// Pre-launch gate: the site isn't ready for visitors yet, so every route
// funnels to /teaser regardless of how it was reached — direct links,
// bookmarks, search results, anything. Runs in `handle`, not a root
// +layout.server.ts load, specifically so it also catches paths that don't
// match any defined route at all (a typo'd URL, an old bookmarked slug),
// not just this app's own known pages.
//
// Static assets are explicitly let through — the teaser page itself needs
// its own JS bundle, fonts, and images to load, and redirecting those would
// break the one page this gate is supposed to keep working. Listed by
// prefix/exact-name rather than relying on adapter-cloudflare's own
// _routes.json to exclude them, so this behaves the same in local dev (no
// Cloudflare edge routing there) and in production.
const STATIC_PREFIXES = ['/_app/', '/fonts/', '/images/', '/css/'];
const STATIC_FILES = new Set([
	'/favicon.png',
	'/robots.txt',
	'/OGP.png',
	'/icon-192.png',
	'/icon-512.png'
]);

// Preview bypass: visit once with ?preview=<PREVIEW_TOKEN> and the gate stays
// open for that browser from then on (a 1-year cookie), while every other
// visitor still gets funneled to /teaser as before. Not meant to withstand a
// determined attacker — just to keep the redirect from catching the one
// person who needs to see the real pages before launch.
const PREVIEW_TOKEN = 'c912bbb38a26c7c9';
const PREVIEW_COOKIE = 'otif_preview';

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname, searchParams } = event.url;

	if (searchParams.get('preview') === PREVIEW_TOKEN) {
		event.cookies.set(PREVIEW_COOKIE, PREVIEW_TOKEN, {
			path: '/',
			maxAge: 60 * 60 * 24 * 365,
			httpOnly: true,
			sameSite: 'lax'
		});
	}
	const hasPreviewBypass =
		event.cookies.get(PREVIEW_COOKIE) === PREVIEW_TOKEN || searchParams.get('preview') === PREVIEW_TOKEN;

	const isTeaser = pathname === '/teaser';
	const isStaticAsset =
		STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)) || STATIC_FILES.has(pathname);

	if (!isTeaser && !isStaticAsset && !hasPreviewBypass) {
		// 307, not 301/302: this is a temporary state (until launch), not a
		// permanent move, and 307 preserves the request method — matters if
		// anything ever POSTs somewhere on this domain while the gate is up.
		redirect(307, '/teaser');
	}

	return resolve(event);
};
