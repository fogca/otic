// Minimal scroll-in reveal: element rises into place once, the first time it
// crosses into view — whether that's on initial page load (above-the-fold
// content, giving a "view-in" transition right after route navigation) or
// later while scrolling. ScrollTrigger's own initial-position check covers
// both cases with one mechanism, no separate "on mount" branch needed.
//
// Y-only (no opacity tween): +layout.svelte's route-transition already fades
// the whole .page-wrapper in on navigation; adding a second opacity tween
// here would double-fade anything still inside that window (which includes
// above-the-fold content, since ScrollTrigger fires for it immediately).
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { browser } from '$app/environment';

let pluginRegistered = false;

export type ScrollRevealOptions = {
	/** px risen from. */
	y?: number;
	/** extra delay (s) — for hand-tuned stagger across a group. */
	delay?: number;
};

export function scrollReveal(node: HTMLElement, opts: ScrollRevealOptions = {}) {
	if (!browser) return {};
	if (!pluginRegistered) {
		gsap.registerPlugin(ScrollTrigger);
		pluginRegistered = true;
	}

	const { y = 28, delay = 0 } = opts;
	gsap.set(node, { y });

	const tween = gsap.to(node, {
		y: 0,
		duration: 0.9,
		delay,
		ease: 'contentFade',
		scrollTrigger: { trigger: node, start: 'top 90%', once: true }
	});

	return {
		destroy() {
			tween.scrollTrigger?.kill();
			tween.kill();
		}
	};
}
