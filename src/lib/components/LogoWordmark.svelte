<!-- Text wordmark set in the site typeface (Steiner), used in the Header as
     an alternative to the drawn Logo.svelte mark. Kept as a separate
     component so the Footer keeps the original mark and this can be dropped
     by reverting one import in Header.svelte.

     viewBox: advance width 744.1, baseline at y=77.9 (the ascender top is
     y=0), and the box runs to 90 so there is 12.1 units of room below the
     baseline. That room is not optional — the round letters overshoot the
     baseline, and a box that stopped at 77.9 sheared the bottoms off every
     o/S/c/a. It also leaves space for a true descender if the string ever
     changes. Canvas measureText reports the overshoot as only 0.7 units
     here, which is wrong for this font — do not tighten the box to it.

     Cap height is 76.6 units, so the rendered heights in Header.svelte are
     cap-height targets scaled by 90/76.6; the cap height stays constant no
     matter what text is set here. -->
<svg
	viewBox="0 0 744.1 90"
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
