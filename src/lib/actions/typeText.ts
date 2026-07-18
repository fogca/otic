// Typewriter reveal: characters appear one at a time with a blinking cursor
// trailing the reveal, which is removed once the full string has typed out.
export function typeText(
	node: HTMLElement,
	opts: { charInterval?: number; startDelay?: number } = {}
) {
	const { charInterval = 45, startDelay = 200 } = opts;

	const finalText = node.textContent?.trim() ?? '';
	node.textContent = '';

	const cursor = document.createElement('span');
	cursor.className = 'type-cursor';
	cursor.textContent = '|';
	node.appendChild(cursor);

	let cancelled = false;
	let i = 0;
	let timer: ReturnType<typeof setTimeout>;

	const tick = () => {
		if (cancelled) return;
		i++;
		cursor.insertAdjacentText('beforebegin', finalText[i - 1]);
		if (i < finalText.length) {
			timer = setTimeout(tick, charInterval);
		} else {
			cursor.remove();
		}
	};
	timer = setTimeout(tick, startDelay);

	return {
		destroy() {
			cancelled = true;
			clearTimeout(timer);
		}
	};
}
