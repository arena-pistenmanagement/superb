import mapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import type mapboxgl from 'mapbox-gl';
import type { Coordinates } from '$lib/utils/types';

export default function addDrawTool(
	mode: string,
	draw: mapboxDraw | undefined,
	map: mapboxgl.Map,
	location: Coordinates | undefined
): mapboxDraw {
	if (draw == undefined) {
		draw = new mapboxDraw({
			displayControlsDefault: false,
			controls: {},
			modes: {
				...mapboxDraw.modes
			},
			defaultMode: mode
		});
		map.addControl(draw);
	} else {
		draw.deleteAll();
		draw.changeMode(mode);
	}

	if (location && Object.keys(location).length > 0) {
		draw.add({
			type: 'FeatureCollection',
			features: [
				{
					id: 'location',
					type: 'Feature',
					properties: {},
					geometry: {
						coordinates: location,
						type: 'Point'
					}
				}
			]
		});
		draw.changeMode('simple_select', { featureIds: ['location'] });
	}

	return draw;
}
