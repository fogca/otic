<!-- Text wordmark set in the site typeface (Steiner), used in the Header as
     an alternative to the drawn Logo.svelte mark. Kept as a separate
     component so the Footer keeps the original mark and this can be dropped
     by reverting one import in Header.svelte.

     The viewBox is the text's own measured ink box at font-size 100 —
     advance width 744.1, ascender top 77.9 (measured in-browser with the
     live font). Cap height is 76.6 at the same size, so the rendered
     heights in Header.svelte are cap-height targets scaled by 77.9/76.6;
     that keeps the cap height constant no matter which string is set here. -->
<svg
	viewBox="0 0 744.1 77.9"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	role="img"
	aria-label="Studio Volcano"
>
	<text x="0" y="77.9" font-size="100" fill="currentColor">Studio Volcano</text>
</svg>

<style>
	text {
		font-family: var(--font-en);
		font-weight: var(--fw-base);
		font-variation-settings: 'wght' var(--fw-base);
		letter-spacing: 0;
	}
</style>
