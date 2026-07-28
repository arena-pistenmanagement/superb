import { mapbox } from '../../utils/map/mapbox.js';
import 'mapbox-gl-compare/dist/mapbox-gl-compare.css';
import addDrawTool from '../../utils/map/mapbox-draw.js';
import { get } from 'svelte/store';
import { isMobileDevice, location } from '$lib/stores/map-store';
import type MapboxDraw from '@mapbox/mapbox-gl-draw';
import type mapboxgl from 'mapbox-gl';
import type CompareType from 'mapbox-gl-compare';

export default async function loadSecondaryMap(
	map: mapboxgl.Map,
	secondaryMapContainer: HTMLDivElement,
	secondaryDraw: MapboxDraw | undefined
): Promise<[mapboxgl.Map, MapboxDraw, CompareType]> {
	const secondaryMap = new mapbox.Map({
		container: secondaryMapContainer,
		style: `mapbox://styles/juliasiemens/clxyggkdq001501qvcm225qov`,
		center: map.getCenter(),
		zoom: map.getZoom(),
		pitch: 0,
		attributionControl: false
	});

	const container = '#comparison-container';
	const Compare = (await import('mapbox-gl-compare')).default;

	const slider = new Compare(secondaryMap, map, container, {
		orientation: get(isMobileDevice) ? 'horizontal' : 'vertical'
	});
	slider.setSlider(get(isMobileDevice) ? innerHeight * 0.3 : innerWidth * 0.5);

	secondaryMap.dragRotate.disable();
	secondaryMap.touchZoomRotate.disableRotation();
	secondaryDraw = addDrawTool('simple_select', secondaryDraw, secondaryMap, get(location));

	return [secondaryMap, secondaryDraw, slider];
}
