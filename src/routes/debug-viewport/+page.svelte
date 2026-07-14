<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Temporary diagnostic page for the iOS floating-tab transition issue —
	// visualizes where every viewport metric actually lands on the physical
	// screen so the transition panel's start/coverage can be fixed from
	// measured reality instead of assumptions. Unlinked; safe to delete.

	let readout = $state('measuring…');
	let lines = $state<Array<{ y: number; color: string; label: string }>>([]);

	function measure() {
		if (!browser) return;
		const probe = (h: string) => {
			const el = document.createElement('div');
			el.style.cssText = `position:fixed;top:0;left:0;width:1px;height:${h};visibility:hidden;pointer-events:none;`;
			document.body.appendChild(el);
			const v = el.getBoundingClientRect().height;
			el.remove();
			return Math.round(v);
		};
		const svh = probe('100svh');
		const dvh = probe('100dvh');
		const lvh = probe('100lvh');
		const env = probe('env(safe-area-inset-bottom, 0px)');
		const vv = window.visualViewport;
		const data = {
			innerHeight: window.innerHeight,
			'screen.height': window.screen.height,
			'screen.availHeight': window.screen.availHeight,
			'100svh': svh,
			'100dvh': dvh,
			'100lvh': lvh,
			'env(safe-area-inset-bottom)': env,
			'visualViewport.height': vv ? Math.round(vv.height) : null,
			'visualViewport.offsetTop': vv ? Math.round(vv.offsetTop) : null,
			'visualViewport.scale': vv ? vv.scale : null,
			devicePixelRatio: window.devicePixelRatio,
			'clientHeight(html)': document.documentElement.clientHeight
		};
		readout = JSON.stringify(data, null, 1);
		lines = [
			{ y: svh, color: '#ff9500', label: `100svh = ${svh}` },
			{ y: dvh, color: '#34c759', label: `100dvh = ${dvh}` },
			{ y: lvh, color: '#007aff', label: `100lvh = ${lvh}` },
			{ y: window.innerHeight, color: '#ff2d55', label: `innerHeight = ${window.innerHeight}` },
			{ y: window.screen.height, color: '#af52de', label: `screen.height = ${window.screen.height}` },
			{ y: lvh + env, color: '#5ac8fa', label: `lvh+env = ${lvh + env}` }
		];
	}

	onMount(() => {
		measure();
		const t = setInterval(measure, 1000);
		window.visualViewport?.addEventListener('resize', measure);
		return () => {
			clearInterval(t);
			window.visualViewport?.removeEventListener('resize', measure);
		};
	});
</script>

<svelte:head>
	<title>viewport debug</title>
</svelte:head>

<main class="vp-debug">
	<pre class="readout">{readout}</pre>

	<!-- Horizontal marker line at each metric's distance from the FIXED
	     canvas top — where each line lands relative to the floating tab /
	     physical screen bottom is the ground truth we need. -->
	{#each lines as l (l.label)}
		<div class="line" style:top={`${l.y - 1}px`} style:background={l.color}>
			<span style:color={l.color}>{l.label}</span>
		</div>
	{/each}

	<!-- Bottom-anchored strip: shows where position:fixed bottom:0 sits. -->
	<div class="bottom-strip">fixed bottom:0</div>
</main>

<style>
	.vp-debug {
		min-height: 300vh; /* scrollable so the bar can minimize */
		background:
			repeating-linear-gradient(
				to bottom,
				#eee 0,
				#eee 49px,
				#bbb 49px,
				#bbb 50px
			);
	}
	.readout {
		position: fixed;
		top: 60px;
		left: 12px;
		right: 12px;
		z-index: 10;
		margin: 0;
		padding: 10px;
		font-size: 11px;
		line-height: 1.5;
		background: rgba(255, 255, 255, 0.92);
		color: #111;
		border: 1px solid #999;
		white-space: pre-wrap;
	}
	.line {
		position: fixed;
		left: 0;
		right: 0;
		height: 2px;
		z-index: 20;
		pointer-events: none;
	}
	.line span {
		position: absolute;
		right: 4px;
		bottom: 3px;
		font-size: 10px;
		font-weight: 700;
		background: rgba(255, 255, 255, 0.85);
		padding: 1px 4px;
	}
	.bottom-strip {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: #000;
		z-index: 20;
		font-size: 9px;
		color: #000;
		text-align: left;
		line-height: 1;
		pointer-events: none;
	}
	.bottom-strip::after {
		content: '';
	}
</style>
