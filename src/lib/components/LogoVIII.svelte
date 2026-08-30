<!-- "VIII Inc." wordmark set in the site typeface (Steiner), as a trial
     alternative to the drawn Logo.svelte wordmark. Kept as a separate
     component so the Footer keeps the original mark and this can be
     dropped by reverting one import in Header.svelte.

     The viewBox is the text's own measured box at font-size 100 — advance
     width 348.2, cap height 76.6 (measured in-browser with the live font).
     Box height therefore equals cap height exactly, so setting a height on
     the <svg> sets the cap height directly, the way the drawn mark's
     tight viewBox does. -->
<svg
	viewBox="0 0 348.2 76.6"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	role="img"
	aria-label="VIII Inc."
>
	<text x="0" y="76.6" font-size="100" fill="currentColor">VIII Inc.</text>
</svg>

<style>
	text {
		font-family: var(--font-en);
		font-weight: var(--fw-base);
		font-variation-settings: 'wght' var(--fw-base);
		letter-spacing: 0;
	}
</style>
