// Global intro state — pages that have an intro animation set this to false
// during onMount, and back to true when the intro completes.
// Pages without an intro leave the default (true) so the Header is shown immediately.

class IntroState {
	completed = $state(true);
}

export const intro = new IntroState();
