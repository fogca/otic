// Shared Lenis instance control — allows any page to pause/resume global smooth scroll.
// setLenis() is called once from +layout.svelte after the instance is created.
// stopLenis() / startLenis() are called by pages that manage their own scroll.

let _instance: any = null;
let _pendingStop = false;

export function setLenis(inst: any): void {
	_instance = inst;
	if (_pendingStop) inst?.stop();
}

export function stopLenis(): void {
	_pendingStop = true;
	_instance?.stop();
}

export function startLenis(): void {
	_pendingStop = false;
	_instance?.start();
}
