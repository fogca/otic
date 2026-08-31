<!-- Text wordmark set in the site typeface (Steiner), used in the Header as
     an alternative to the drawn Logo.svelte mark. Kept as a separate
     component so the Footer keeps the original mark and this can be dropped
     by reverting one import in Header.svelte.

     viewBox, all at font-size 100 with 'wght' 500 applied: advance width
     867.79 (measured with getComputedTextLength on this very element, which
     accounts for the variable weight — canvas measureText cannot), cap
     height 76.6, baseline at y=82. That leaves 5.4 units of clearance above
     the caps and 6 below the baseline, both well past the round letters'
     overshoot. The clearance is not optional: an earlier box that ended
     exactly on the baseline sheared the bottoms off every O/S/C.

     Header.svelte sizes this by cap height, scaling its target by 88/76.6
     (box height over cap height), so the cap height stays put regardless of
     what string or weight is set here. Its aspect ratio, 867.79/88 = 9.861,
     is the divisor in the overflow guard there. Re-measure all four numbers
     if the text or the weight changes. -->
<svg
	viewBox="0 0 867.79 88"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	role="img"
	aria-label="Studio Volcano"
>
	<text x="0" y="82" font-size="100" fill="currentColor">STUDIO VOLCANO</text>
</svg>

<style>
	text {
		font-family: var(--font-en);
		font-weight: 500;
		font-variation-settings: 'wght' 500;
		letter-spacing: 0;
	}
</style>
