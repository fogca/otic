// Global display language for bilingual content. The toggle (in the Header)
// flips this; a [data-lang] attribute on <html> (set in +layout.svelte) drives
// the show/hide CSS in pages that hold both EN and JA copy.
type Lang = 'en' | 'ja';

class LangState {
	current = $state<Lang>('en');

	toggle() {
		this.current = this.current === 'en' ? 'ja' : 'en';
	}
}

export const lang = new LangState();
