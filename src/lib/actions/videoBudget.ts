// Global cap on how many <video> elements may hold a decoder at once.
//
// Why this exists: release-on-exit (lazyVideo / lazyGridVideo detaching src
// when an item scrolls away) only bounds ACCUMULATION — it never bounded
// CONCURRENCY. Measured on production /archives before this cap: up to 8
// simultaneously-playing videos on SP (15 on PC), and 10 of the 18 grid
// videos are 4K sources — each active 4K stream holds roughly 40-100MB of
// decode surfaces regardless of how small its tile renders. 8 × 4K on an
// iPhone is jetsam territory: iOS kills background audio first (the user's
// music stops), then the Safari tab itself (the crash). Two real incidents.
//
// Mechanism: actions ask for a slot before attaching src/playing. If the
// budget is full the video stays in its designed placeholder state (LQIP
// background) and joins a wait list; whenever a slot frees (scroll-away,
// unmount), the WAITING video nearest the viewport gets it. The queue also
// self-heals across SvelteKit navigations (new page's requests may briefly
// find the budget full before the old page's actions destroy and release).
const holders = new Set<HTMLElement>();
type Waiter = { node: HTMLElement; start: () => void };
const waiters: Waiter[] = [];

// 3 on touch devices (phones/tablets — small decoder pools, tight jetsam
// limits), 6 on desktop (no crash history, but 15 concurrent decoders is
// waste on any machine). Evaluated per call so a resize/mode change is
// picked up on the next grant.
function limit(): number {
	return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches ? 3 : 6;
}

// Distance from the viewport's edges (0 while intersecting) — used to pick
// which waiter deserves a freed slot first.
function distanceToViewport(node: HTMLElement): number {
	const r = node.getBoundingClientRect();
	const vh = window.innerHeight;
	if (r.bottom < 0) return -r.bottom;
	if (r.top > vh) return r.top - vh;
	return 0;
}

function grantFreedSlots(): void {
	while (holders.size < limit() && waiters.length > 0) {
		waiters.sort((a, b) => distanceToViewport(a.node) - distanceToViewport(b.node));
		const next = waiters.shift()!;
		holders.add(next.node);
		next.start();
	}
}

/** Ask for a decoder slot. `start` runs immediately if one is free (or the
    node already holds one), otherwise when a slot frees up — possibly much
    later, or never if the node releases first. */
export function acquireVideoSlot(node: HTMLElement, start: () => void): void {
	if (holders.has(node)) {
		start();
		return;
	}
	if (holders.size < limit()) {
		holders.add(node);
		start();
		return;
	}
	const existing = waiters.find((w) => w.node === node);
	if (existing) {
		existing.start = start;
	} else {
		waiters.push({ node, start });
	}
}

/** Give the slot back (or leave the wait list). Callers do their own media
    teardown; this only manages the budget and hands freed slots on. */
export function releaseVideoSlot(node: HTMLElement): void {
	const waiting = waiters.findIndex((w) => w.node === node);
	if (waiting !== -1) waiters.splice(waiting, 1);
	if (holders.delete(node)) grantFreedSlots();
}
