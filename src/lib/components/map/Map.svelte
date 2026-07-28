<script lang="ts">
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { onMount, onDestroy, setContext } from 'svelte';
	import { mapbox, key, secondaryKey } from '../../utils/map/mapbox.js';
	import addDrawTool from '../../utils/map/mapbox-draw.js';
	import { toast } from 'svelte-sonner';
	import CustomToast from '$lib/components/ui/sonner/CustomToast.svelte';
	import {
		location,
		species_scenario_A,
		species_scenario_B,
		mixtureDialogOpen,
		helpTracker,
		isMobileDevice,
		isLoadingSpecies,
		toastIds
	} from '$lib/stores/map-store';
	import SpeciesDialog from './SpeciesDialog.svelte';
	import Mixtures from '../Mixtures.svelte';
	import loadSecondaryMap from '$lib/utils/map/load-secondary-map.js';
	import SelectorPill from './SelectorPill.svelte';
	import setLayer from '../../utils/map/layer.js';
	import type Compare from 'mapbox-gl-compare';
	import Export from '../Export.svelte';
	import LocationSetter from './LocationSetter.svelte';
	import Provenance from './Provenance.svelte';
	import { delay } from '$lib/utils.js';
	import handleActiveButtons from '$lib/utils/map/active-button-handler.js';
	import getMobileDevice from '$lib/utils/map/is-mobile-device';
	import { starterGuideState } from '$lib/stores/starter-guide';
	import type mapboxgl from 'mapbox-gl';
	import type MapboxDraw from '@mapbox/mapbox-gl-draw';
	import type { Coordinates } from '$lib/utils/types';

	let map: mapboxgl.Map;
	let secondaryMap: mapboxgl.Map | undefined = undefined;
	let draw: MapboxDraw | undefined;
	let secondaryDraw: MapboxDraw | undefined;
	let mapContainer: HTMLDivElement;
	let secondaryMapContainer: HTMLDivElement;
	let slider: Compare;

	setContext(key, {
		getMap: () => map
	});

	setContext(secondaryKey, {
		getSecondaryMap: () => secondaryMap
	});

	onMount(async () => {
		isMobileDevice.set(getMobileDevice());
		loadMap();
		handleActiveButtons();
		mixtureDialogOpen.set(false);
		helpTracker.set(0);

		if ($starterGuideState != 'open') {
			let id = toast.message(CustomToast, {
				componentProps: {
					title: 'Welcome',
					description: 'For instructions, click the question mark in the right menu below.'
				},
				duration: 10000
			});
			toastIds.update((ids) => [...ids, id]);
		}
	});

	isLoadingSpecies.subscribe((value) => {
		if (!value && $toastIds.length > 0) {
			$toastIds.forEach((id) => {
				toast.dismiss(id);
			});
			toastIds.set([]);
		}
	});

	starterGuideState.subscribe((value) => {
		if ($helpTracker == 0 && value == 'closed') {
			toast.message(CustomToast, {
				componentProps: {
					title: 'Welcome',
					description: 'For instructions, click the question mark in the right menu below.'
				},
				duration: 10000
			});
		}
	});

	onDestroy(() => {
		if (map) map.remove();
	});

	species_scenario_A.subscribe(async (value) => {
		if (map && value) {
			await setLayer(value, map);
		}
	});

	species_scenario_B.subscribe(async (value) => {
		if (value && Object.hasOwn(value, 'species_name')) {
			if (!secondaryMap && secondaryMapContainer) {
				[secondaryMap, secondaryDraw, slider] = await loadSecondaryMap(
					map,
					secondaryMapContainer,
					secondaryDraw
				);
				if (secondaryMap) {
					secondaryDraw = addDrawTool('simple_select', secondaryDraw, secondaryMap, $location);

					secondaryMap.on('draw.create', getSecondaryLocation);
					secondaryMap.on('draw.update', getSecondaryLocation);
					const loadedSecondaryMap = secondaryMap;
					loadedSecondaryMap.once('idle', () => {
						void setLayer(value, loadedSecondaryMap);
					});
				}
			} else {
				await delay(100);
				if (secondaryMap && secondaryMapContainer) setLayer(value, secondaryMap);
			}
		}

		if (value == undefined && secondaryMap) {
			secondaryMap.remove();
			secondaryMap = undefined;
			secondaryDraw = undefined;
			slider.remove();
		}
	});

	async function loadMap() {
		map = new mapbox.Map({
			container: mapContainer,
			style: `mapbox://styles/juliasiemens/clxyggkdq001501qvcm225qov`,
			center: $isMobileDevice ? [10, 40] : [0, 57], // center of europe
			zoom: $isMobileDevice ? 2 : 3,
			pitch: 0,
			attributionControl: false
		});

		if (!$isMobileDevice) map.addControl(new mapbox.ScaleControl(), 'bottom-right');

		let navigation = new mapbox.NavigationControl({
			showCompass: false
		});

		let dom = document.getElementById('navigation');
		dom?.appendChild(navigation.onAdd(map));

		map.dragRotate.disable();
		map.touchZoomRotate.disableRotation();

		map.on('draw.create', getLocation);
		map.on('draw.update', getLocation);

		map.on('load', function () {
			map.addSource('mapbox-dem', {
				type: 'raster-dem',
				url: 'mapbox://mapbox.terrain-rgb',
				tileSize: 512,
				maxzoom: 14
			});
			map.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 });
		});

		map.on('error', function (event) {
			console.error('Mapbox error:', event.error);
		});
	}

	function getLocation() {
		if ($location) {
			let id = toast.loading('Updating location ...');
			toastIds.update((ids) => [...ids, id]);
		}
		const feature = draw?.getAll().features[0];
		if (feature?.geometry.type === 'Point') {
			location.set(feature.geometry.coordinates as Coordinates);
		}
		if (secondaryMap != undefined)
			secondaryDraw = addDrawTool('simple_select', secondaryDraw, secondaryMap, $location);
	}

	function getSecondaryLocation() {
		const feature = secondaryDraw?.getAll().features[0];
		if (feature?.geometry.type === 'Point') {
			location.set(feature.geometry.coordinates as Coordinates);
		}
		if (map != undefined) draw = addDrawTool('simple_select', draw, map, $location);
	}
</script>

<SelectorPill />

<div id="comparison-container">
	<div class="map" bind:this={secondaryMapContainer} id="secondaryMap" />
	<div class="map" bind:this={mapContainer} id="map" />
</div>

<div class="z-20 left-2 py-2 absolute flex flex-col items-start gap-2 max-w-full w-full">
	<div class="flex justify-between w-full no-scrollbar overflow-auto">
		<div class="flex justify-start items-center p-2">
			<LocationSetter {map} {secondaryMap} bind:draw bind:secondaryDraw />

			<SpeciesDialog {map} />

			<Mixtures />

			<Provenance {map} {secondaryMap} />

			<Export {map} />
		</div>
	</div>
</div>

<style>
	.map {
		height: 100%;
		position: absolute;
		width: 100%;
		overflow: hidden;
	}
</style>
