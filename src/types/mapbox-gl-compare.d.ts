declare module 'mapbox-gl-compare' {
	import { Map } from 'mapbox-gl';

	interface CompareOptions {
		orientation?: 'vertical' | 'horizontal';
	}

	class Compare {
		constructor(
			map: Map,
			compareMap: Map,
			container: string | HTMLElement,
			options?: CompareOptions
		);
		setSlider(position: number): void;
		remove(): void;
	}

	export = Compare;
}
