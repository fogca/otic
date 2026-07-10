// Shared signal: true once the user has scrolled past the Office page's
// full-bleed intro wordmark. The site-wide corner-logo is normally
// suppressed on /office (the giant wordmark already serves as the page's
// own logo treatment at the top) — this lets it reappear at its normal
// header size once that big wordmark has scrolled out of view, instead of
// staying suppressed for the whole page. Set from office/+page.svelte via
// an IntersectionObserver on .panel--intro; reset on navigating away.
class OfficeIntroState {
	pastHero = $state(false);
}

export const officeIntro = new OfficeIntroState();
