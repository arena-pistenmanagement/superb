<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import * as Popover from '$lib/components/ui/popover';
	import * as Tabs from '$lib/components/ui/tabs';
	import {
		lookup,
		species_scenario_A,
		isLoadingSpecies,
		speciesDialogOpen,
		selectedDataBasis,
		location,
		helpTracker,
		isMobileDevice,
		locationConfirmed
	} from '$lib/stores/map-store';
	import Button from '../Button.svelte';
	import {
		Bean,
		BeanOff,
		CircleParking,
		CircleParkingOff,
		Maximize,
		Minimize,
		Sprout
	} from 'lucide-svelte';
	import type mapboxgl from 'mapbox-gl';
	import { Map } from 'lucide-svelte';
	import LineChart from './LineChart.svelte';
	import { type SpeciesData, type Dataset, type DataBasis } from '$lib/utils/types';
	import Search from './Search.svelte';
	import LineChartPreview from './LineChartPreview.svelte';
	import Loader from './Loader.svelte';
	import Threshold from '../Threshold.svelte';
	import { orderBySubKey } from '$lib/utils/map/query-features';
	import { onMount } from 'svelte';
	import Sidebar from '../Sidebar.svelte';
	import { helpActive } from '$lib/stores/starter-guide';
	import { slide } from 'svelte/transition';
	import { toast } from 'svelte-sonner';
	import CustomToast from '../ui/sonner/CustomToast.svelte';

	export let map: mapboxgl.Map;

	let innerHeight: number;
	let headerHeight: number;
	let extendedBand: SpeciesData | undefined;
	let dom: HTMLElement | null = null;
	let speciesList: Dataset = JSON.parse(
		JSON.stringify(Object.values($lookup).filter((element) => element.climate_scenario == 'ref'))
	);
	let tempSelectedDataBasis: DataBasis = $selectedDataBasis;
	let headerHidden: boolean = false;

	onMount(async () => {
		selectedDataBasis.set('Suitability');
	});

	lookup.subscribe((value) => {
		if (value) {
			speciesList = JSON.parse(
				JSON.stringify(Object.values(value).filter((element) => element.climate_scenario == 'ref'))
			);
		}
	});

	function handleBandSelection(band: SpeciesData) {
		extendedBand = band;
		selectedDataBasis.set(tempSelectedDataBasis);
		species_scenario_A.set(band);
		helpTracker.set(2);
		if ($isMobileDevice) {
			map.flyTo({ center: $location });
			speciesDialogOpen.set(false);
		}
	}

	function clickSpeciesButton(band: SpeciesData) {
		extendedBand == band ? (extendedBand = undefined) : (extendedBand = band);
		dom = document.getElementById(`dom-${band.id}`);

		setTimeout(() => {
			dom?.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		}, 200);
	}

	speciesDialogOpen.subscribe((value) => {
		if ($helpTracker == 6 && value) {
			helpTracker.set(2);
			let raster: SpeciesData | undefined = Object.values($lookup).find(
				(element) =>
					element.species_name == $species_scenario_A?.species_name &&
					element.climate_scenario == 'ref'
			);
			setTimeout(() => {
				species_scenario_A.set(raster);
			}, 500);
		}
	});

	species_scenario_A.subscribe(async (value) => {
		if (value == undefined) {
			extendedBand = undefined;
			isLoadingSpecies.set(true);
			selectedDataBasis.set(tempSelectedDataBasis);
		}
	});

	function changeTempSelectedDatabasis(value: DataBasis) {
		if (!value) return;
		tempSelectedDataBasis = value;
		const sortKey = value === 'Suitability' ? 'suitability' : 'productivity';
		speciesList = orderBySubKey(speciesList, sortKey, 'ref');

		if (
			(value == 'Productivity' && extendedBand?.has_productivity == 'true') ||
			value == 'Suitability'
		) {
			setTimeout(() => {
				if (extendedBand) {
					dom = document.getElementById(`dom-${extendedBand?.id}`);
					dom?.scrollIntoView({
						behavior: 'smooth',
						block: 'center'
					});
				}
			}, 200);
		} else if (value == 'Productivity' && extendedBand?.has_productivity == 'false') {
			toast.message(CustomToast, {
				componentProps: {
					title: 'Attention',
					description: `${extendedBand?.species_name} has no data for productivity`
				},
				duration: 5000
			});
		}
	}

	$: if (tempSelectedDataBasis) changeTempSelectedDatabasis(tempSelectedDataBasis);
</script>

<svelte:window bind:innerHeight />

<div id="speciesBtn" class="inline-flex rounded-lg mr-2">
	<Button
		disabled={!$locationConfirmed}
		class="flex flex-col items-start"
		on:click={() => {
			$speciesDialogOpen = !$speciesDialogOpen;
			helpTracker.set(1);
		}}
	>
		<div class="flex gap-2 w-full">
			<Sprout strokeWidth="1.5" size="16" color={$species_scenario_A ? 'green' : 'black'} />
			Species
		</div>
		<p
			class="ml-1 text-xs font-light italics text-left whitespace-nowrap w-full {$helpTracker > 3
				? 'text-gray-400'
				: 'text-gray-900'}"
		>
			2. Select tree species
		</p>
	</Button>
</div>

<Sidebar
	bind:sidebarIsOpen={$speciesDialogOpen}
	classes="top-24"
	onContentScroll={() => (headerHidden = true)}
>
	<div slot="header" class="!w-full justify-between">
		<div class="flex items-center gap-2">
			<Sprout strokeWidth="1.5" size="16" />
			<p>Species</p>
		</div>
		<Button
			size="lg"
			color="ghost"
			on:click={() => {
				headerHidden = !headerHidden;
			}}
		>
			{#if !headerHidden}
				<Minimize strokeWidth="1.5" size="16" />
			{:else}
				<Maximize strokeWidth="1.5" size="16" />
			{/if}
		</Button>
	</div>
	<div slot="description" bind:clientHeight={headerHeight}>
		{#if !headerHidden}
			<div
				class="flex flex-col justify-between items-start py-1 lg:mr-4 lg:pb-2"
				transition:slide={{ duration: 500 }}
			>
				<p class="text-xs font-light pb-2">
					Click on a species to explore detailed trends in suitability or productivity across
					different scenarios. <br />
					<strong>Suitability:</strong> Indicates the likelihood of a species thriving in a selected
					location based on climatic conditions.<br />
					<strong>Productivity:</strong> Estimates the potential height a species can reach at 100
					years under given climatic conditions.<br />
					<strong>Attention:</strong> Suitability and productivity values may not always align and can
					exhibit divergent trends, as they are driven by different biotic and abiotic factors.
				</p>
				<Threshold {tempSelectedDataBasis} />
			</div>
		{/if}
		<div
			class="flex flex-col lg:justify-between justify-between items-end py-1 text-sm gap-2 *:w-full"
		>
			<div class="w-full">
				<Search bind:speciesList bind:tempSelectedDataBasis />
			</div>
			<div class="flex justify-between lg:justify-end w-full gap-1 shadow-lg">
				<Tabs.Root
					value={tempSelectedDataBasis}
					onValueChange={(value) => {
						if (value === 'Suitability' || value === 'Productivity') {
							changeTempSelectedDatabasis(value);
						}
					}}
					class="p-0 m-0 w-full"
				>
					<Tabs.List class="grid w-full grid-cols-2 border p-0 m-0 ">
						<Tabs.Trigger value="Suitability">Suitability</Tabs.Trigger>
						<Tabs.Trigger value="Productivity">Productivity</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
			</div>
		</div>
	</div>

	<div slot="content" style="height:{innerHeight - headerHeight - 220}px;" class="snap-y">
		{#if $isLoadingSpecies || (Object.keys(speciesList).length > 0 && !Object.hasOwn(speciesList[0], 'suitability'))}
			<div class="w-full">
				<Loader />
			</div>
		{:else}
			{#each Object.values(speciesList) as band}
				<div
					id="dom-{band.id}"
					class="bg-white flex flex-col justify-between items-center border border-zinc-700 rounded-lg my-1 overflow-hidden shadow-lg snap-start"
				>
					<div class="flex w-full rounded-lg">
						<Button
							color="ghost"
							size="lg"
							class="lg:py-2 w-full flex flex-col justify-between lg:items-center cursor-pointer"
							on:click={() => clickSpeciesButton(band)}
						>
							<div class="flex justify-between w-full">
								<div class=" text-start">
									<p class="text-sm lg:text-md">{band.species_name}</p>
									<p class="text-xs italic">{band.english_name}</p>
								</div>
								<div class="lg:w-36 w-24 h-14 pointer-events-none">
									<LineChartPreview {band} {tempSelectedDataBasis} />
								</div>
							</div>
							<div class="flex w-full justify-between">
								<div class="flex flex-row justify-between w-full items-center gap-4">
									<p class="text-xs text-start whitespace-nowrap font-light lg:w-1/4">
										{#if tempSelectedDataBasis === 'Suitability'}
											{#if band.suitability !== null && band.suitability > -3276.8 && band.suitability !== 999.9}
												{band.suitability} %<br />Reference
											{:else}
												No data
											{/if}
										{:else if band.productivity !== null && band.productivity > -32768 && band.productivity !== 9999}
											{band.productivity} m at 100 yrs<br />Reference
										{:else}
											No data
										{/if}
									</p>

									<div class="lg:w-1/4 flex *:flex-grow-0 justify-end gap-2 items-center">
										{#if !$isMobileDevice}
											<Tooltip.Root>
												<Tooltip.Trigger>
													{#if band.cluster_band != null}
														<Bean strokeWidth="1.5" size="16" />
													{:else}
														<BeanOff strokeWidth="1.5" size="16" />
													{/if}
												</Tooltip.Trigger>
												<Tooltip.Content>
													<p class="font-light text-xs">
														Species has {band.cluster_band == null ? 'no' : ''} provenance data
													</p>
												</Tooltip.Content>
											</Tooltip.Root>
											<Tooltip.Root>
												<Tooltip.Trigger>
													{#if band.has_productivity == 'true'}
														<CircleParking strokeWidth="1.5" size="16" />
													{:else}
														<CircleParkingOff strokeWidth="1.5" size="16" />
													{/if}
												</Tooltip.Trigger>
												<Tooltip.Content>
													<p class="font-light text-xs">
														Species has {band.has_productivity == 'false' ? 'no' : ''} productivity data
													</p>
												</Tooltip.Content>
											</Tooltip.Root>
										{:else}
											<Popover.Root>
												<Popover.Trigger>
													{#if band.cluster_band != null}
														<Bean strokeWidth="1.5" size="16" />
													{:else}
														<BeanOff strokeWidth="1.5" size="16" />
													{/if}
												</Popover.Trigger>
												<Popover.Content class="w-fit">
													<p class="font-light text-xs text-zinc-700">
														Species has {band.cluster_band == null ? 'no' : ''} provenance data
													</p>
												</Popover.Content>
											</Popover.Root>
											<Popover.Root>
												<Popover.Trigger>
													{#if band.has_productivity == 'true'}
														<CircleParking strokeWidth="1.5" size="16" />
													{:else}
														<CircleParkingOff strokeWidth="1.5" size="16" />
													{/if}
												</Popover.Trigger>
												<Popover.Content class="w-fit">
													<p class="font-light text-xs text-zinc-700">
														Species has {band.has_productivity == 'false' ? 'no' : ''} productivity data
													</p>
												</Popover.Content>
											</Popover.Root>
										{/if}
										<Button
											id="select-btn-{band.id}"
											class="gap-1 text-xs m-0 p-0 whitespace-nowrap {$species_scenario_A?.species_name ==
											band.species_name
												? '!bg-[#5DB570] hover:!bg-[#3e9d53] !text-white !border-0'
												: ''}"
											color="primary"
											size="xs"
											on:click={() => {
												handleBandSelection(band);
											}}
										>
											{#if $species_scenario_A?.species_name == band.species_name}
												<p>Selected</p>
											{:else}
												<p>Select</p>
												<Map strokeWidth="1.5" size="16" />
											{/if}
										</Button>
										{#if !$species_scenario_A && $helpActive}
											<span
												class="relative -ml-3 -mt-5 outline outline-white rounded-full flex size-2"
											>
												<span
													class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
												></span>
												<span class="relative inline-flex rounded-full size-2 bg-green-500"></span>
											</span>
										{/if}
									</div>
								</div>
							</div>
						</Button>
					</div>
					<div
						class="w-full bg-white flex-inline flex-col lg:items-end items-center lg:p-2 rounded-b-lg border-t border-zinc-500"
						style={extendedBand == band ? '' : 'display:none'}
					>
						<div class="w-full flex justify-center items-center px-2">
							<LineChart {band} bind:tempSelectedDataBasis />
						</div>
					</div>
				</div>
			{/each}
			{#if Object.values(speciesList).length == 0}
				<div class="flex items-center justify-center h-36 w-full font-light text-sm">
					No species found for filter specifications
				</div>
			{/if}
		{/if}
	</div>
</Sidebar>
