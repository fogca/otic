// Shared signal: true once the Footer is about to scroll into view. Any
// position:fixed content (corner wordmark, slug's fixed lead text, home's
// fixed ethos statement) fades out when this flips, so it doesn't sit on
// top of / crash into the Footer as it scrolls up underneath.
// Set once from +layout.svelte via an IntersectionObserver on the Footer.
class FooterNearState {
	near = $state(false);
}

export const footerNear = new FooterNearState();
