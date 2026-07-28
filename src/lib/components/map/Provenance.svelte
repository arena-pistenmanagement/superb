<script lang="ts">
	import { Bean, LoaderCircle } from 'lucide-svelte';
	import Button from '../Button.svelte';
	import {
		species_scenario_A,
		species_scenario_B,
		provenanceIsOpen,
		lookup,
		helpTracker,
		isMobileDevice,
		isLoadingProvenance,
		isLoadingSpecies,
		currentProvenance
	} from '$lib/stores/map-store';
	import { mapbox } from '../../utils/map/mapbox.js';
	import type mapboxgl from 'mapbox-gl';
	import { loadProvenanceLayer, closeProvananceLayer } from '$lib/utils/map/cluster-layer';
	import { helpActive } from '$lib/stores/starter-guide';

	export let map: mapboxgl.Map;
	export let secondaryMap: mapboxgl.Map | undefined;

	species_scenario_A.subscribe(async (value) => {
		if (value && map && $provenanceIsOpen) {
			helpTracker.set(6);
			$currentProvenance = await loadProvenanceLayer(map);
		}
	});

	lookup.subscribe(async () => {
		if ($species_scenario_A && !$isLoadingProvenance && map && $provenanceIsOpen) {
			$currentProvenance = await loadProvenanceLayer(map, false, true);
		}
	});

	helpTracker.subscribe((value) => {
		if (value && value < 6 && map) closeProvananceLayer(map);
	});

	provenanceIsOpen.subscribe(async (value) => {
		if (value) {
			if (secondaryMap != undefined) {
				species_scenario_B.set(undefined);
			}
			// set scenario
			species_scenario_A.set(
				Object.values($lookup).find(
					(element) =>
						element.english_name == $species_scenario_A?.english_name &&
						element.timeframe == '2085' &&
						element.climate_scenario == 'rcp45'
				)
			);

			map?.on('click', 'provenance', showPopup);
			if ($isMobileDevice) {
				map?.on('touchstart', 'provenance', showPopup);
			} else {
				map?.on('mouseenter', 'provenance', () => {
					map.getCanvas().style.cursor = 'pointer';
				});
			}
		} else {
			if (map) {
				$currentProvenance = await loadProvenanceLayer(map);
				hidePopup();
			}
		}
	});

	// Create a popup, but don't add it to the map yet.
	let popup = new mapbox.Popup({
		closeButton: false,
		closeOnClick: true,
		closeOnMove: true
	});

	// POINTS OF INTEREST
	function showPopup(e: { features?: mapboxgl.MapboxGeoJSONFeature[] }) {
		// Updates the cursor to a hand (interactivity)
		map.getCanvas().style.cursor = 'pointer';

		// Show the popup at the coordinates with some data
		if ($isMobileDevice) popup.setMaxWidth('200px');
		const feature = e.features?.[0];
		if (!feature || feature.geometry.type !== 'Point') return;
		popup
			.setLngLat(feature.geometry.coordinates as [number, number])
			.setHTML(checkEmpty(feature.properties))
			.addTo(map);

		const btn = document.getElementById('close-button');
		btn?.addEventListener('click', () => {
			popup.remove();
		});
	}

	function hidePopup() {
		map.getCanvas().style.cursor = '';
		popup?.remove();
	}

	function escapeHtml(value: unknown): string {
		return String(value ?? '')
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#039;');
	}

	function checkEmpty(info: Record<string, unknown> | null | undefined): string {
		const content = info
			? '<div><div class="pb-3 grid grid-cols-1 w-full">' +
				`<div class="w-full flex justify-between items-end pb-2 gap-2">` +
				`<strong>Seed stand id: ${escapeHtml(info.index)}</strong>` +
				`<button id='close-button' class="border rounded-lg px-3 py-2">X</button></div>` +
				`<div class="text-xs font-semibold pt-2">National Register Info</div>` +
				`<p class="text-xs">${escapeHtml(info.nationalre)}</p>` +
				`<div class="text-xs font-semibold pt-2">Source</div>` +
				`<p class="text-xs">${escapeHtml(info.source)}</p>` +
				`<div class="text-xs font-semibold pt-2">Altitude at seed stand</div>` +
				`<p class="text-xs">${escapeHtml(info.altitude)} m a.s.l.</p>` +
				`<div class="text-xs font-semibold pt-2">Seed Cluster Number</div>` +
				`<p class="text-xs">${escapeHtml(info.cluster)}</p>` +
				`<div class="text-xs font-semibold pt-2">Country</div>` +
				`<p class="text-xs">${escapeHtml(info.ISO3_CODE)}</p>` +
				`</div>`
			: 'No data';
		return content;
	}

	async function clickHandler() {
		provenanceIsOpen.set(true);
		$currentProvenance = await loadProvenanceLayer(map);
		helpTracker.set(6);
	}
</script>

<div id="provenanceBtn" class="inline-flex rounded-lg mr-2 pointer-events-none">
	<Button
		disabled={!$species_scenario_A || $isLoadingSpecies}
		on:click={clickHandler}
		class="flex flex-col items-start pointer-events-auto"
	>
		<div class="flex justify-between gap-2 w-full">
			<div class="flex gap-2 w-full">
				<Bean strokeWidth="1.5" size="16" color={$helpTracker > 6 ? 'green' : 'black'} />
				Provenance
			</div>
			{#if $isLoadingProvenance}
				<LoaderCircle strokeWidth="1.5" size="16" class="animate-spin"></LoaderCircle>
			{/if}
		</div>
		<p
			class="ml-1 text-xs font-light italics text-left whitespace-nowrap w-full {$helpTracker > 6
				? 'text-gray-400'
				: 'text-gray-900'}"
		>
			4. Find recommended seed sources
		</p>
	</Button>
	{#if $helpTracker == 5 && $helpActive}
		<span class="relative -ml-2 -mt-1 outline outline-white rounded-full flex h-3 w-3">
			<span
				class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
			></span>
			<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
		</span>
	{/if}
</div>
