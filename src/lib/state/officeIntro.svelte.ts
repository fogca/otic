// Shared signal: true once the user has scrolled at all on the Office page.
// The site-wide corner-logo starts oversized at the same bottom-left anchor
// on /office (see +layout.svelte's .is-hero state) — this flips the instant
// scrolling starts, so the logo can shrink down to its normal size right
// away, and flips back on returning to the very top. Set from
// office/+page.svelte via a scroll listener; reset on navigating away.
class OfficeIntroState {
	pastHero = $state(false);
}

export const officeIntro = new OfficeIntroState();
