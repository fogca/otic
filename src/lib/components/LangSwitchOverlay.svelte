<script lang="ts">
	import { lang } from '$lib/state/lang.svelte';

	let visible = $state(false);
	let hideTimer: ReturnType<typeof setTimeout>;

	// Fires on every genuine user toggle (switchToken only increments from
	// lang.set()/toggle() — never from the silent session restore), so this
	// never flashes on page load.
	$effect(() => {
		const token = lang.switchToken;
		if (token === 0) return;
		visible = true;
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			visible = false;
		}, 900);
	});
</script>

<div class="lang-switch" class:is-visible={visible} aria-hidden="true">
	<div class="lang-switch__badge">
		<span lang={lang.current}>{lang.current === 'en' ? 'EN' : 'JP'}</span>
	</div>
</div>

<style>
	/* macOS input-source-switcher style: full-screen darken + centred pill,
	   confirming the language just changed. Non-interactive (aria-hidden,
	   pointer-events:none) — it's a transient confirmation, not a control. */
	.lang-switch {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0);
		opacity: 0;
		pointer-events: none;
		transition:
			opacity 0.25s var(--ease-default),
			background-color 0.25s var(--ease-default);
	}

	.lang-switch.is-visible {
		opacity: 1;
		background: rgba(0, 0, 0, 0.55);
	}

	.lang-switch__badge {
		background: rgba(24, 24, 24, 0.92);
		color: #fff;
		border-radius: 18px;
		padding: 30px 44px;
		font-size: 30px;
		font-weight: var(--fw-medium);
		font-family: var(--font-en);
		letter-spacing: 0.02em;
		transform: scale(0.9);
		transition: transform 0.35s var(--ease-out);
	}

	.lang-switch.is-visible .lang-switch__badge {
		transform: scale(1);
	}
</style>
