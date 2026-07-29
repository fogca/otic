import { getVisibleWorks } from '$lib/js/microcms';
import { SITE_URL } from '$lib/js/seo';
import type { RequestHandler } from './$types';

// Routes that are deliberately excluded — every one of these already carries
// its own <meta name="robots" content="noindex">, so listing them here would
// contradict the page itself:
//   /contact, /teaser, /log, /legal/privacy, /legal/imprint, /legal/company
// /debug-viewport is a development aid and is likewise left out.
const STATIC_ROUTES: { path: string; priority: string; changefreq: string }[] = [
	{ path: '/', priority: '1.0', changefreq: 'weekly' },
	{ path: '/archives', priority: '0.9', changefreq: 'weekly' },
	{ path: '/archives/list', priority: '0.6', changefreq: 'weekly' },
	{ path: '/office', priority: '0.8', changefreq: 'monthly' },
	{ path: '/services', priority: '0.8', changefreq: 'monthly' }
];

function xmlEscape(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export const GET: RequestHandler = async ({ setHeaders }) => {
	// Same source as the archives listings, so a `hidden`-flagged work can
	// never leak into the sitemap while being absent from the site itself.
	// Falls back to static routes only if the CMS is unreachable — a sitemap
	// missing its work pages beats a 500 that tells crawlers nothing.
	let works: { id: string; revisedAt?: string; updatedAt?: string }[] = [];
	try {
		const data = await getVisibleWorks({
			limit: 100,
			orders: 'order',
			fields: ['id', 'revisedAt', 'updatedAt', 'hidden']
		});
		works = data.contents;
	} catch {
		works = [];
	}

	const urls = [
		...STATIC_ROUTES.map(
			(r) =>
				`\t<url>\n\t\t<loc>${SITE_URL}${r.path === '/' ? '' : r.path}</loc>\n` +
				`\t\t<changefreq>${r.changefreq}</changefreq>\n` +
				`\t\t<priority>${r.priority}</priority>\n\t</url>`
		),
		...works.map((w) => {
			// revisedAt is microCMS's "content last actually edited" stamp;
			// updatedAt moves on any save. Prefer the former, fall back.
			const stamp = w.revisedAt ?? w.updatedAt;
			const lastmod = stamp ? `\t\t<lastmod>${stamp.slice(0, 10)}</lastmod>\n` : '';
			return (
				`\t<url>\n\t\t<loc>${SITE_URL}/archives/${xmlEscape(w.id)}</loc>\n` +
				lastmod +
				`\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.7</priority>\n\t</url>`
			);
		})
	];

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		urls.join('\n') +
		`\n</urlset>\n`;

	setHeaders({
		'Content-Type': 'application/xml; charset=utf-8',
		'Cache-Control': 'public, max-age=3600'
	});
	return new Response(body);
};
