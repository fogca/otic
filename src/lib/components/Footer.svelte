<script lang="ts">
	// Wordmark = current (2026) lock-up; previous one is in Logo.svelte.
	import Wordmark from './Wordmark.svelte';

	type LinkItem = { label: string; href: string };

	const SITE_NAV: LinkItem[] = [
		{ label: 'Archives', href: '/archives' },
		{ label: 'Office', href: '/office' },
		{ label: 'Contact', href: '/contact' }
	];

	const SOCIAL: LinkItem[] = [
		{ label: 'Instagram', href: 'https://www.instagram.com/takumiisobe_/' },
		{ label: 'Behance', href: 'https://www.behance.net/' }
	];

	const LEGAL: LinkItem[] = [
		{ label: 'Privacy', href: '/legal/privacy' },
		{ label: 'Imprint', href: '/legal/imprint' },
		{ label: 'Company', href: '/legal/company' }
	];

	const YEAR = new Date().getFullYear();
</script>

<footer class="Footer" aria-labelledby="footer-heading">
	<h2 id="footer-heading" class="Footer__sr">TAKUMIISOBE.COM</h2>

	<div class="Footer__grid">
		<!-- Column 1: brand + tagline -->
		<div class="Footer__col Footer__col--brand">
			<a href="/" class="Footer__logo" aria-label="Home">
				<Wordmark />
			</a>
			<p class="Footer__tagline">
				A multi-disciplinary design office.<br />
				Tokyo, Japan.
			</p>
		</div>

		<!-- Column 2: site nav -->
		<nav class="Footer__col" aria-label="Footer navigation">
			<ul class="Footer__list">
				{#each SITE_NAV as item (item.href)}
					<li><a href={item.href} lang="en">{item.label}</a></li>
				{/each}
			</ul>
		</nav>

		<!-- Column 3: social -->
		<div class="Footer__col">
			<h3 class="Footer__heading" lang="en">Find us</h3>
			<ul class="Footer__list">
				{#each SOCIAL as item (item.href)}
					<li>
						<a href={item.href} target="_blank" rel="noopener noreferrer" lang="en">
							{item.label} ↗
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<!-- Column 4: For new projects (CTA) -->
		<div class="Footer__col Footer__col--cta">
			<h3 class="Footer__heading" lang="en">For new projects</h3>
			<p class="Footer__note" lang="en">
				Currently we are accepting select collaborations across<br />
				product, furniture, typeface, web and branding &amp; V.I. projects.<br />
				Please feel free to reach out.
			</p>
			<a href="/contact" class="Footer__cta" lang="en">Get in touch →</a>
		</div>
	</div>

	<div class="Footer__bottom">
		<ul class="Footer__legal">
			{#each LEGAL as item (item.href)}
				<li><a href={item.href} lang="en">{item.label}</a></li>
			{/each}
		</ul>
		<p class="Footer__copy" lang="en">© {YEAR} TAKUMIISOBE.COM · Tokyo, Japan</p>
	</div>
</footer>

<style>
	.Footer {
		background: var(--color-text);
		color: #fff;
		padding: 64px 0 24px;
		margin-top: 120px;
	}

	.Footer :global(*) {
		color: #fff;
	}

	.Footer :global(a) {
		color: #fff;
	}

	.Footer__sr {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.Footer__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 48px;
		padding-inline: var(--padding);
	}

	@media (min-width: 768px) {
		.Footer__grid {
			grid-template-columns: 2fr 1fr 1fr 2fr;
			gap: 32px;
		}

		.Footer__col--brand {
			padding-right: 12.5vw;
		}
	}

	.Footer__col {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.Footer__logo {
		display: block;
		width: 100%;
		color: inherit;
		text-decoration: none;
	}

	@media (min-width: 768px) {
		.Footer__logo {
			width: 400px;
			max-width: 100%;
		}
	}

	.Footer__logo :global(svg) {
		display: block;
		width: 100%;
		height: auto;
	}

	.Footer__tagline {
		font-size: 13px;
		line-height: 1.5;
		opacity: 0.7;
		max-width: 28ch;
	}

	.Footer__heading {
		font-size: 12px;
		font-weight: var(--fw-medium);
		letter-spacing: 0;
		opacity: 0.6;
		margin: 0;
	}

	.Footer__list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.Footer__list a,
	.Footer__legal a {
		color: inherit;
		text-decoration: none;
		font-size: 14px;
		opacity: 0.85;
		transition: opacity 0.15s ease;
	}

	.Footer__list a:hover,
	.Footer__legal a:hover {
		opacity: 1;
	}

	.Footer__note {
		font-size: 12px;
		line-height: 1.5;
		opacity: 0.7;
		margin: 0;
	}

	.Footer__cta {
		font-size: 14px;
		font-weight: var(--fw-medium);
		color: inherit;
		text-decoration: none;
		border-bottom: 1px solid rgba(255, 255, 255, 0.4);
		padding-bottom: 4px;
		align-self: flex-start;
		transition: border-color 0.2s ease, opacity 0.15s ease;
	}

	.Footer__cta:hover {
		border-bottom-color: #fff;
		opacity: 1;
	}

	.Footer__bottom {
		margin-top: 56px;
		padding: 24px var(--padding) 0;
		border-top: 1px solid rgba(255, 255, 255, 0.15);
		display: flex;
		flex-direction: column;
		gap: 16px;
		font-size: 12px;
		opacity: 0.6;
	}

	@media (min-width: 768px) {
		.Footer__bottom {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}

	.Footer__legal {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		gap: 16px;
	}

	.Footer__legal a {
		font-size: 12px;
	}

	.Footer__copy {
		margin: 0;
		font-size: 12px;
	}
</style>
