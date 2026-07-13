import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		SvelteKitPWA({
			registerType: 'autoUpdate',
			injectRegister: 'auto',
			devOptions: {
				enabled: true,
				type: 'module'
			},
			manifest: {
				name: 'TAKUMIISOBE.COM',
				short_name: 'TAKUMIISOBE',
				description: 'A multi-disciplinary design office.',
				theme_color: '#000000',
				background_color: '#ffffff',
				display: 'standalone',
				start_url: '/',
				scope: '/',
				icons: [
					{
						src: '/icon-192.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any'
					},
					{
						src: '/icon-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['client/**/*.{js,css,ico,png,svg,webp,woff,woff2}'],
				navigateFallback: '/',
				navigateFallbackDenylist: [/^\/api\//],
				cleanupOutdatedCaches: true,
				runtimeCaching: [
					/* Page HTML — cache after first visit so offline navigation works.
					   NetworkFirst falls back to cache when the network call fails. */
					{
						urlPattern: ({ request }) => request.mode === 'navigate',
						handler: 'NetworkFirst',
						options: {
							cacheName: 'pages',
							networkTimeoutSeconds: 3,
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 7
							}
						}
					},
					/* microCMS API responses (works data) */
					{
						urlPattern: /^https:\/\/.*\.microcms\.io\/api\/.*/i,
						handler: 'NetworkFirst',
						options: {
							cacheName: 'microcms-api',
							networkTimeoutSeconds: 4,
							expiration: {
								maxEntries: 100,
								maxAgeSeconds: 60 * 60 * 24
							}
						}
					},
					{
						urlPattern: /^https:\/\/images\.microcms-assets\.io\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'microcms-images',
							expiration: {
								maxEntries: 200,
								maxAgeSeconds: 60 * 60 * 24 * 30
							}
						}
					}
					/* NO rule for cdn.takumiisobe.com (videos) — deliberately.
					   A CacheFirst rule here used to route every <video> fetch
					   through the service worker, which buffers the whole MP4 in
					   the SW process and clones it into Cache Storage: a huge
					   per-video memory spike on iOS (a major cause of the mobile
					   tab crashes) plus up to 100 videos hoarded on the visitor's
					   disk for 30 days. Workbox also doesn't honor Range requests
					   without a dedicated plugin, so SW-mediated video breaks
					   AVFoundation's ranged streaming anyway. Unmatched requests
					   bypass the SW and stream natively. +layout.svelte deletes
					   the legacy 'cdn-media' cache left on existing devices. */
				]
			}
		})
	],
	server: {
		host: '0.0.0.0',
		port: 3000,
		strictPort: false
	},
	preview: {
		host: '0.0.0.0',
		port: 3000
	}
});
