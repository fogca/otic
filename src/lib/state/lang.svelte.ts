// Global display language for bilingual content. A [data-lang] attribute on
// <html> (set in +layout.svelte, and pre-set by an inline script in app.html
// to avoid a flash) drives the show/hide CSS in pages that hold both EN and
// JA copy. An explicit toggle is persisted per browsing session
// (sessionStorage) — carries across navigation, resets when the tab/browser
// is closed and reopened. Absent that, restore() falls back to the
// browser's own language (navigator.language) — same detection app.html's
// pre-paint script uses, so the two agree and hydration doesn't flip it back.
type Lang = 'en' | 'ja';

const STORAGE_KEY = 'ti-lang';

class LangState {
	current = $state<Lang>('en');
	// Bumped only by a genuine user toggle (never by restore()) — the
	// LangSwitchOverlay watches this to fire its popup, so a silent
	// session-restore on load never triggers the overlay.
	switchToken = $state(0);

	/** Read the session's saved language, falling back to the browser's own
	 *  language when there's no explicit choice yet this session. Call once,
	 *  client-only. */
	restore() {
		if (typeof sessionStorage === 'undefined') return;
		const saved = sessionStorage.getItem(STORAGE_KEY);
		if (saved === 'en' || saved === 'ja') {
			this.current = saved;
			return;
		}
		// Not sticky (never written to sessionStorage) — a passive detection,
		// not a user choice, so it shouldn't be "remembered" over a later
		// change in the browser's own language, and via direct assignment
		// (not set()) it doesn't bump switchToken or trigger the switch overlay.
		if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ja')) {
			this.current = 'ja';
		}
	}

	set(next: Lang) {
		if (next === this.current) return;
		this.current = next;
		if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(STORAGE_KEY, next);
		this.switchToken++;
	}

	toggle() {
		this.set(this.current === 'en' ? 'ja' : 'en');
	}
}

export const lang = new LangState();
