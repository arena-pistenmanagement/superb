<script lang="ts">
	import { MapPin } from 'lucide-svelte';
	import Button from '../Button.svelte';
	import addDrawTool from '$lib/utils/map/mapbox-draw';
	import type MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
	import type MapboxDraw from '@mapbox/mapbox-gl-draw';
	import type mapboxgl from 'mapbox-gl';

	export let geocoder: MapboxGeocoder | undefined;
	export let secondaryMap: mapboxgl.Map | undefined;
	export let draw: MapboxDraw | undefined;
	export let secondaryDraw: MapboxDraw | undefined;
	export let selectedGeometry: string;
	export let map: mapboxgl.Map | undefined;

	function setPoint() {
		if (!map) return;
		geocoder?.clear();
		draw = addDrawTool('draw_point', draw, map, undefined);
		if (secondaryMap)
			secondaryDraw = addDrawTool('draw_point', secondaryDraw, secondaryMap, undefined);
		selectedGeometry = 'point';
	}
</script>

<div>
	<div class="my-3 lg:text-sm text-xs font-light text-zinc-600 pl-1">
		Refine search by setting or moving point on map
	</div>
	<div class="flex w-full flex-col gap-3 mt-1">
		<Button
			color="secondary"
			on:click={setPoint}
			class="px-6 lg:w-full flex items-center justify-center"
		>
			Set point
			<MapPin strokeWidth="1.5" size="16" />
		</Button>
	</div>
</div>
