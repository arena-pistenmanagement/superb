<script lang="ts">
	import Button from '../Button.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Tabs from '$lib/components/ui/tabs';
	import {
		isLoadingSpecies,
		speciesDialogOpen,
		location,
		helpTracker,
		locationIsOpen,
		isMobileDevice,
		locationDefinition,
		species_scenario_A,
		species_scenario_B,
		locationConfirmed
	} from '$lib/stores/map-store';
	import type MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
	import type MapboxDraw from '@mapbox/mapbox-gl-draw';
	import type mapboxgl from 'mapbox-gl';
	import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
	import 'mapbox-gl/dist/mapbox-gl.css';
	import { MapPin, Check } from 'lucide-svelte';
	import addDrawTool from '$lib/utils/map/mapbox-draw';
	import { queryLocationFromInput, queryPointFeature } from '$lib/utils/map/query-features';
	import { onMount } from 'svelte';
	import Sidebar from '../Sidebar.svelte';
	import PointFinder from './PointFinder.svelte';
	import { helpActive } from '$lib/stores/starter-guide';
	import { Trash } from 'svelte-radix';

	export let map: mapboxgl.Map;
	export let secondaryMap: mapboxgl.Map | undefined;
	export let draw: MapboxDraw | undefined;
	export let secondaryDraw: MapboxDraw | undefined;

	let geocoder: MapboxGeocoder | undefined;
	let wrapper: HTMLDivElement;
	let selectedGeometry: string;

	onMount(() => {
		setAddress();
		locationIsOpen.set(true);
		helpTracker.set(0);
		isLoadingSpecies.set(true);
	});

	location.subscribe(async (value) => {
		if (value) {
			isLoadingSpecies.set(true);
			if (selectedGeometry == 'address') {
				draw = addDrawTool('simple_select', draw, map, value);
				await queryPointFeature(value[0], value[1]);
			} else {
				await queryPointFeature(value[0], value[1]);
				locationDefinition.set(`Lat: ${value[1]}, Lon: ${value[0]}`);
			}
		} else {
			isLoadingSpecies.set(true);
		}
	});

	$: if (wrapper && geocoder) {
		if (!wrapper?.hasChildNodes()) {
			wrapper?.appendChild(geocoder.onAdd(map));
		} else {
			wrapper.textContent = '';
		}
	}

	locationIsOpen.subscribe((value) => {
		if (value) helpTracker.set(0);
	});

	async function setAddress() {
		$locationIsOpen = !$locationIsOpen;
		speciesDialogOpen.set(false);
		if (!geocoder) geocoder = queryLocationFromInput();

		geocoder.on('result', function (e: { result: MapboxGeocoder.Result }) {
			if (draw != undefined) draw.deleteAll();
			if (secondaryDraw != undefined) secondaryDraw.deleteAll();
			selectedGeometry = 'address';
			const localizedName = (e.result as MapboxGeocoder.Result & Record<string, unknown>)[
				'place_name_en-EN'
			];
			locationDefinition.set(
				typeof localizedName === 'string' ? localizedName : e.result.place_name
			);
			location.set([e.result.center[0], e.result.center[1]]);
		});
	}

	function confirmLocation() {
		locationConfirmed.set(true);
		helpTracker.set(1);
		locationIsOpen.set(false);
		speciesDialogOpen.set(true);
	}

	locationDefinition.subscribe((value) => {
		if (value && geocoder) {
			geocoder.clear();
			geocoder.setPlaceholder(value);
		}
	});

	function trash() {
		isLoadingSpecies.set(true);
		if (draw) draw.deleteAll();
		if (secondaryDraw) secondaryDraw.deleteAll();
		geocoder?.clear();
		location.set(undefined);
		locationConfirmed.set(false);
		selectedGeometry = '';
		helpTracker.set(0);
		species_scenario_B.set(undefined);
		species_scenario_A.set(undefined);
		locationDefinition.set(undefined);
		geocoder?.setPlaceholder('Search location');
	}
</script>

<div id="locationBtn" class="inline-flex rounded-lg active-menu-btn mr-2">
	<Button on:click={setAddress} class="flex flex-col items-start">
		<div class="flex gap-2 w-full">
			<MapPin strokeWidth="1.5" size="16" color={$location ? 'green' : 'black'} />
			Location
		</div>
		<p
			class="ml-1 text-xs font-light italics text-left whitespace-nowrap w-full {$helpTracker > 1
				? 'text-gray-400'
				: 'text-gray-900'}"
		>
			1. Set location
		</p>
	</Button>
</div>

<Sidebar bind:sidebarIsOpen={$locationIsOpen}>
	<div slot="header">
		<MapPin strokeWidth="1.5" size="16" />
		<p>Location</p>
	</div>
	<div slot="content">
		{#if !$isMobileDevice}
			<PointFinder
				bind:geocoder
				bind:secondaryMap
				bind:draw
				bind:secondaryDraw
				bind:selectedGeometry
				bind:map
			/>
			<div class="flex flex-row justify-between items-center w-full py-6">
				<div class="w-5/12">
					<div class="border-b border-gray-400"></div>
					<div></div>
				</div>
				<p class="text-sm font-light row-span-2">or</p>
				<div class="w-5/12">
					<div class="border-b border-gray-400"></div>
					<div></div>
				</div>
			</div>

			<div>
				<label for="geocoder" class="my-3 lg:text-sm text-xs font-light text-zinc-600 pl-1">
					Enter location or coordinates
				</label>
				<div
					id="geocoder"
					bind:this={wrapper}
					class="*:!w-full *:!max-w-[600px] *:border *:border-zinc-700 *:!rounded-lg *:bg-white *:ring-none *:!focus:ring-none"
				/>
			</div>
			<div class="border-b border-gray-400 py-6"></div>
		{:else}
			<Tabs.Root value="point" class="p-0 m-0">
				<Tabs.List class="grid w-full grid-cols-2 border p-0 m-0 ">
					<Tabs.Trigger value="point">Point</Tabs.Trigger>
					<Tabs.Trigger value="address">Address</Tabs.Trigger>
				</Tabs.List>
				<div class="lg:h-36">
					<Tabs.Content value="point">
						<PointFinder
							bind:geocoder
							bind:secondaryMap
							bind:draw
							bind:secondaryDraw
							bind:selectedGeometry
							bind:map
						/>
					</Tabs.Content>
					<Tabs.Content value="address">
						<div>
							<label for="geocoder" class="my-3 lg:text-sm text-xs font-light text-zinc-600 pl-1">
								Enter location or coordinates
							</label>
							<div
								id="geocoder"
								bind:this={wrapper}
								class="w-full *:!w-full *:border *:border-zinc-700 *:!rounded-lg *:bg-white *:ring-none *:!focus:ring-none"
							/>
						</div>
					</Tabs.Content>
				</div>
			</Tabs.Root>
		{/if}
		<div class="flex justify-start py-6">
			<div class="text-zinc-700 inline-flex w-full items-stretch justify-between gap-2">
				<Button
					size="sm"
					color="danger"
					on:click={trash}
					class="w-1/2 px-6 flex items-center justify-center"
				>
					Reset
					<Trash strokeWidth="1.5" size="16" />
				</Button>
				<Tooltip.Root openDelay={150}>
					<Tooltip.Trigger class="inline-flex w-1/2">
						<Button
							size="sm"
							color="secondary"
							disabled={!$location}
							on:click={confirmLocation}
							class="w-full py-1 px-6 flex items-center justify-center"
						>
							Confirm Location
							<Check strokeWidth="1.5" size="16" />
						</Button>
						{#if $helpTracker == 0 && $helpActive}
							<span
								class="relative -ml-2 -mt-1 mr-2 outline outline-white rounded-full flex h-3 w-3"
							>
								<span
									class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
								></span>
								<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
							</span>
						{/if}
					</Tooltip.Trigger>
					<Tooltip.Content side="bottom">
						<p>Select a location to proceed by setting<br /> a point or searching for an address</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</div>
		</div>
	</div>
</Sidebar>
