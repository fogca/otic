// Shared signal: true once the user has scrolled past the Office page's
// intro panel. The site-wide corner-logo starts oversized on /office (same
// bottom-left position as everywhere else — see +layout.svelte's .is-hero
// state) — this flips once that intro panel has scrolled out of view, so
// the logo can smoothly shrink down to its normal size, same as every
// other page. Set from office/+page.svelte via an IntersectionObserver on
// .panel--intro; reset on navigating away.
class OfficeIntroState {
	pastHero = $state(false);
}

export const officeIntro = new OfficeIntroState();
