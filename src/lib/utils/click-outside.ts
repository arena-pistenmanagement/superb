/** Dispatch event on click outside of node */

import { mixtureDialogOpen, speciesDialogOpen } from '$lib/stores/map-store';

export function clickOutside(node: HTMLDivElement) {
	const handleClick = (event: MouseEvent) => {
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			node.dispatchEvent(new CustomEvent('click_outside', { detail: node }));
		}
	};
	document.addEventListener('click', handleClick, true);
	mixtureDialogOpen.set(false);
	speciesDialogOpen.set(false);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
}
