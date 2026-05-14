// Dummy data — will be replaced by microCMS later
// Image URLs use picsum.photos with seeded slugs for stable previews

export type LayoutTemplate = 'A' | 'B' | 'C' | 'D' | 'E';

export type Archive = {
	number: string; // "01"
	slug: string;
	rcCode: string;
	title: string;
	brand: string;
	category: 'Branding' | 'Web' | 'Product' | 'Brand' | 'Direction';
	year: number;
	heroImage: string;
	gallery: string[];
	descriptionEn: string;
	descriptionJa: string;
	colophonBase: {
		brand: string;
		direction: string;
		design: string;
		webSpec: string;
		links: string;
	};
	colophonExtra?: { key: string; value: string }[];
	layoutTemplate: LayoutTemplate;
	featured: boolean;
};

const placeholder = (seed: string, w: number, h: number) =>
	`https://picsum.photos/seed/${seed}/${w}/${h}`;

export const archives: Archive[] = [
	{
		number: '01',
		slug: 'camera-ysove',
		rcCode: 'Camera YSOVE',
		title: 'Camera YSOVE',
		brand: 'YSOVE 2001',
		category: 'Product',
		year: 2026,
		heroImage: placeholder('takumi-camera-ysove', 800, 1200),
		gallery: [
			placeholder('takumi-camera-ysove-a', 600, 800),
			placeholder('takumi-camera-ysove-b', 800, 600),
			placeholder('takumi-camera-ysove-c', 1200, 800)
		],
		descriptionEn:
			'A film camera rehousing project — distilling vintage form into a contemporary instrument.',
		descriptionJa:
			'フィルムカメラのリハウジング — ヴィンテージの形を、現代の道具へと蒸留する。',
		colophonBase: {
			brand: 'YSOVE 2001',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'JAMStack + Headless CMS by OTIC',
			links: 'www.ysove2001.com'
		},
		layoutTemplate: 'A',
		featured: true
	},
	{
		number: '02',
		slug: 'aether',
		rcCode: 'Aether',
		title: 'Aether',
		brand: 'Mischen Typefoundry',
		category: 'Branding',
		year: 2026,
		heroImage: placeholder('takumi-aether', 800, 1200),
		gallery: [
			placeholder('takumi-aether-a', 1200, 600),
			placeholder('takumi-aether-b', 800, 800),
			placeholder('takumi-aether-c', 1200, 800)
		],
		descriptionEn:
			'Aether — the first typeface from Mischen Typefoundry. A medium for meaning, distilled.',
		descriptionJa:
			'Aether — Mischen Typefoundry の第1書体。意味を運ぶ媒質として、文字を蒸留する。',
		colophonBase: {
			brand: 'Mischen Typefoundry',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'JAMStack + Headless CMS by OTIC',
			links: 'www.mischen.jp'
		},
		layoutTemplate: 'B',
		featured: true
	},
	{
		number: '03',
		slug: 'pru',
		rcCode: 'PRU',
		title: 'Prieure Rock Unofficial',
		brand: 'Studio Ristorante',
		category: 'Brand',
		year: 2026,
		heroImage: placeholder('takumi-pru', 800, 1200),
		gallery: [
			placeholder('takumi-pru-a', 800, 800),
			placeholder('takumi-pru-b', 1200, 600),
			placeholder('takumi-pru-c', 800, 600)
		],
		descriptionEn:
			'Prieure Rock Unofficial — an art project under Studio Ristorante.',
		descriptionJa:
			'Prieure Rock Unofficial — Studio Ristorante 下のアートプロジェクト。',
		colophonBase: {
			brand: 'Studio Ristorante',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'JAMStack + Headless CMS by OTIC',
			links: 'www.ristorante.studio'
		},
		layoutTemplate: 'C',
		featured: false
	},
	{
		number: '04',
		slug: 'ms-furniture',
		rcCode: 'MS Furniture',
		title: 'MS Furniture',
		brand: 'MOKUSEKI Hotels',
		category: 'Product',
		year: 2026,
		heroImage: placeholder('takumi-msf', 800, 1200),
		gallery: [
			placeholder('takumi-msf-a', 800, 800),
			placeholder('takumi-msf-b', 800, 600),
			placeholder('takumi-msf-c', 1200, 800)
		],
		descriptionEn:
			'Furniture program for MOKUSEKI Hotels — between hospitality and craft.',
		descriptionJa:
			'MOKUSEKI Hotels のための家具プログラム。ホスピタリティと手仕事の間に。',
		colophonBase: {
			brand: 'MOKUSEKI Hotels',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'JAMStack + Headless CMS by OTIC',
			links: 'www.mokuseki.jp'
		},
		layoutTemplate: 'C',
		featured: true
	},
	{
		number: '05',
		slug: 'jds',
		rcCode: 'JDS',
		title: 'Japanese Dark Spirits Collection',
		brand: 'SHOCHUX',
		category: 'Product',
		year: 2026,
		heroImage: placeholder('takumi-jds', 800, 1200),
		gallery: [
			placeholder('takumi-jds-a', 800, 800),
			placeholder('takumi-jds-b', 800, 800),
			placeholder('takumi-jds-c', 1200, 800)
		],
		descriptionEn:
			'Japanese Dark Spirits Collection — a packaging system for SHOCHUX.',
		descriptionJa:
			'JAPANESE DARK SPIRITS — SHOCHUX のためのパッケージングシステム。',
		colophonBase: {
			brand: 'SHOCHUX',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'JAMStack + Headless CMS by OTIC',
			links: 'www.shochux.jp'
		},
		layoutTemplate: 'A',
		featured: true
	},
	{
		number: '06',
		slug: 'mischen',
		rcCode: 'Mischen',
		title: 'Mischen Typefoundry',
		brand: 'Mischen Typefoundry',
		category: 'Branding',
		year: 2026,
		heroImage: placeholder('takumi-mischen', 800, 1200),
		gallery: [
			placeholder('takumi-mischen-a', 1200, 600),
			placeholder('takumi-mischen-b', 800, 800),
			placeholder('takumi-mischen-c', 1200, 800)
		],
		descriptionEn:
			'Mischen Typefoundry — a foundry that mixes histories, cultures, and centuries into new letterforms.',
		descriptionJa:
			'Mischen Typefoundry — 書体史・文化・時代を混ぜて、新しい文字の形を生む場所。',
		colophonBase: {
			brand: 'Mischen Typefoundry',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'JAMStack + Headless CMS by OTIC',
			links: 'www.mischen.jp'
		},
		layoutTemplate: 'A',
		featured: true
	},
	{
		number: '07',
		slug: 'studio-ristorante',
		rcCode: 'Studio Ristorante',
		title: 'Studio Ristorante',
		brand: 'Studio Ristorante',
		category: 'Brand',
		year: 2026,
		heroImage: placeholder('takumi-studio-ristorante', 800, 1200),
		gallery: [
			placeholder('takumi-sr-a', 600, 800),
			placeholder('takumi-sr-b', 800, 600),
			placeholder('takumi-sr-c', 1200, 800)
		],
		descriptionEn:
			'Studio Ristorante — a CG visual studio focused on food, furniture, and atmosphere.',
		descriptionJa:
			'Studio Ristorante — 食・家具・空気感に焦点を当てた CG ビジュアルスタジオ。',
		colophonBase: {
			brand: 'Studio Ristorante',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'JAMStack + Headless CMS by OTIC',
			links: 'www.ristorante.studio'
		},
		layoutTemplate: 'A',
		featured: true
	},
	{
		number: '08',
		slug: 'ysove',
		rcCode: 'YSOVE',
		title: 'YSOVE 2001',
		brand: 'YSOVE 2001',
		category: 'Product',
		year: 2026,
		heroImage: placeholder('takumi-ysove', 800, 1200),
		gallery: [
			placeholder('takumi-ysove-a', 600, 800),
			placeholder('takumi-ysove-b', 800, 600),
			placeholder('takumi-ysove-c', 1200, 800)
		],
		descriptionEn:
			'YSOVE 2001 — a lifestyle product brand. Lighting, furniture, and accessories for the considered home.',
		descriptionJa:
			'YSOVE 2001 — ライフスタイルプロダクトブランド。照明・家具・アクセサリーを通じた、思想ある暮らし。',
		colophonBase: {
			brand: 'YSOVE 2001',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'JAMStack + Headless CMS by OTIC',
			links: 'www.ysove2001.com'
		},
		layoutTemplate: 'A',
		featured: false
	},
	{
		number: '09',
		slug: 'n2p',
		rcCode: 'N2P',
		title: 'N2P — Negative to Positive',
		brand: 'OTIC',
		category: 'Direction',
		year: 2026,
		heroImage: placeholder('takumi-n2p', 800, 1200),
		gallery: [
			placeholder('takumi-n2p-a', 1200, 600),
			placeholder('takumi-n2p-b', 800, 800),
			placeholder('takumi-n2p-c', 1200, 800)
		],
		descriptionEn:
			'N2P — a film color science research project for Capture One.',
		descriptionJa:
			'N2P — Capture One のためのフィルムカラーサイエンス研究プロジェクト。',
		colophonBase: {
			brand: 'OTIC',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'macOS plugin (Swift / SwiftUI / Capture One SDK)',
			links: '—'
		},
		layoutTemplate: 'A',
		featured: false
	},
	{
		number: '10',
		slug: 'one2026',
		rcCode: 'ONE 2026',
		title: 'ONE 2026',
		brand: 'ONE',
		category: 'Web',
		year: 2026,
		heroImage: placeholder('takumi-one2026', 800, 1200),
		gallery: [
			placeholder('takumi-one2026-a', 1200, 800),
			placeholder('takumi-one2026-b', 800, 600),
			placeholder('takumi-one2026-c', 1200, 800)
		],
		descriptionEn:
			'ONE 2026 — a SvelteKit-based web platform with a refined typographic system.',
		descriptionJa:
			'ONE 2026 — SvelteKit を基盤に、精緻なタイポグラフィシステムを実装した Web プラットフォーム。',
		colophonBase: {
			brand: 'ONE',
			direction: 'TAKUMI ISOBE',
			design: 'OTIC',
			webSpec: 'SvelteKit + microCMS by OTIC',
			links: 'www.one2026.com'
		},
		layoutTemplate: 'A',
		featured: true
	}
];

export const featuredArchives = archives.filter((a) => a.featured);

export function findArchive(slug: string): Archive | undefined {
	return archives.find((a) => a.slug === slug);
}
