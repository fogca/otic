<script lang="ts">
	import { page } from '$app/state';

	const status = $derived(page.status);
	const message = $derived(page.error?.message ?? '');

	const isNotFound = $derived(status === 404);
</script>

<svelte:head>
	<title>{status} — TAKUMIISOBE.com</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="ErrorPage">
	<div class="wrapper">
		<div class="meta">
			<span class="status" lang="en">Error</span>
			<span class="code" lang="en">{status}</span>
		</div>

		<h1 class="num" lang="en">{status}</h1>

		<div class="copy">
			<p class="message" lang="en">
				{#if isNotFound}
					The page you are looking for has wandered off, or never existed.
				{:else}
					An unexpected error occurred. Please try again later.
				{/if}
			</p>
			<p class="message" lang="ja">
				{#if isNotFound}
					お探しのページは見つかりませんでした。
				{:else}
					予期せぬエラーが発生しました。時間をおいて再度お試しください。
				{/if}
			</p>
		</div>
	</div>
</main>

<style>
	.ErrorPage {
		min-height: 100vh;
		padding: 100px var(--padding) 80px;
		display: flex;
		align-items: center;
	}

	.ErrorPage .wrapper {
		width: 100%;
		max-width: 720px;
		margin-inline: auto;
		display: flex;
		flex-direction: column;
	}

	.ErrorPage .meta {
		display: flex;
		justify-content: space-between;
		font-size: 11px;
		opacity: 0.5;
		margin-bottom: 24px;
		font-weight: var(--fw-base);
	}

	.ErrorPage .num {
		font-size: clamp(96px, 22vw, 220px);
		font-weight: var(--fw-medium);
		line-height: 1;
		letter-spacing: -0.02em;
		margin-bottom: 40px;
	}

	.ErrorPage .copy {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.ErrorPage .copy .message {
		font-size: 11px;
		line-height: 1.6;
		opacity: 0.7;
	}

	.ErrorPage .copy .message[lang='ja'] {
		font-family: var(--font-ja);
		font-size: 10.5px;
		line-height: 1.7;
	}

	@media (min-width: 1024px) {
		.ErrorPage {
			padding-top: 15vh;
			padding-bottom: 160px;
		}

		.ErrorPage .meta {
			font-size: 12px;
		}

		.ErrorPage .num {
			font-size: clamp(140px, 18vw, 280px);
			margin-bottom: 56px;
		}

		.ErrorPage .copy .message {
			font-size: 12px;
		}

		.ErrorPage .copy .message[lang='ja'] {
			font-size: 11.5px;
		}
	}
</style>
