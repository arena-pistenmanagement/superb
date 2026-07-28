<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Button from '../Button.svelte';
	import {
		ClimateScenarios,
		type ClimateScenario,
		type SpeciesData,
		type Dataset,
		type DataBasis
	} from '$lib/utils/types';
	import {
		species_scenario_A,
		species_scenario_B,
		lookup,
		selectedDataBasis,
		speciesDialogOpen,
		isMobileDevice,
		provenanceIsOpen,
		helpTracker
	} from '$lib/stores/map-store';
	import {
		CircleParking,
		CircleParkingOff,
		Check,
		SlidersHorizontal,
		Bean,
		BeanOff
	} from 'lucide-svelte';
	import Search from './Search.svelte';
	import { orderBySubKey } from '$lib/utils/map/query-features';
	import DotFilled from 'svelte-radix/DotFilled.svelte';
	import Sidebar from '../Sidebar.svelte';
	import CustomToast from '../ui/sonner/CustomToast.svelte';
	import { toast } from 'svelte-sonner';

	export let scenario: string;
	export let side: string = 'left';
	export let isOpen: boolean = false;

	let year: number | undefined = 1995;
	let rcp: ClimateScenario | null = 'ref';
	let selected: SpeciesData | undefined =
		scenario == 'B' ? $species_scenario_B : $species_scenario_A;
	let speciesList: Dataset = JSON.parse(
		JSON.stringify(Object.values($lookup).filter((element) => element.climate_scenario == 'ref'))
	);
	let tempDataBasis: DataBasis = $selectedDataBasis;
	let innerWidth: number;
	let species: string = $species_scenario_A?.species_name ?? '';

	$: speciesList = orderBySubKey(speciesList, 'species_name', 'ref');

	$: if (isOpen && $helpTracker == 2.1) helpTracker.set(3);

	selectedDataBasis.subscribe((value) => {
		tempDataBasis = value;
	});

	speciesDialogOpen.subscribe((value) => {
		if (value) {
			document.getElementById('sidebar-left')?.classList.remove('hidden');
			isOpen = false;
		}
	});

	species_scenario_A.subscribe((value) => {
		if (value != undefined && scenario == 'A') {
			selected = value;
			year = parseInt(value.timeframe);
			rcp = value.climate_scenario;
			species = value.species_name;
		}
	});

	species_scenario_B.subscribe((value) => {
		if (value != undefined && scenario == 'B') {
			selected = value;
			year = parseInt(value.timeframe);
			rcp = value.climate_scenario;
			species = value.species_name;
		}
	});

	lookup.subscribe((value) => {
		speciesList = JSON.parse(
			JSON.stringify(Object.values(value).filter((element) => element.climate_scenario == 'ref'))
		);
		speciesList = orderBySubKey(speciesList, 'species_name', 'ref');
	});

	function setNewLayer() {
		if (!species) return;
		validateSpecies(species);

		if (!selected) return;

		selectedDataBasis.set(tempDataBasis);

		if (scenario === 'A') {
			species_scenario_A.set(selected);
			$species_scenario_B = $species_scenario_B;
		} else {
			species_scenario_B.set(selected);
			$species_scenario_A = $species_scenario_A;
		}

		if ($isMobileDevice) isOpen = false;
	}

	function validateSpecies(name: string) {
		species = name;
		validateYear(year ?? 1995);

		let real_year = String(year);

		let raster: SpeciesData | undefined = Object.values($lookup).find(
			(element) =>
				element.species_name == species &&
				element.timeframe == real_year &&
				element.climate_scenario == rcp
		);

		if (!raster) return;
		validateDatabasis(raster);
		selected = raster;
		year = parseInt(selected.timeframe);
		rcp = selected.climate_scenario;
	}

	function validateYear(input_year: number) {
		if (input_year == undefined) year = 1995;

		validateClimateScenario(input_year);
	}

	function validateClimateScenario(input_year: number) {
		// no future scenario if selected year == ref
		if (input_year == 1995) {
			rcp = 'ref';
		} else if (rcp == 'ref' && input_year != 1995) {
			rcp = 'rcp45';
		}
	}

	function validateDatabasis(raster: SpeciesData) {
		if (tempDataBasis == 'Productivity' && raster.has_productivity == 'false') {
			tempDataBasis = 'Suitability';
			return;
		}
		if (
			tempDataBasis == 'Productivity' &&
			scenario == 'A' &&
			$species_scenario_B?.has_productivity == 'false'
		) {
			tempDataBasis = 'Suitability';
			toast.message(CustomToast, {
				componentProps: {
					title: 'Database switched back to suitability',
					description: `${$species_scenario_B.species_name} has no data for productivity`
				},
				duration: 5000
			});
		}
		if (
			tempDataBasis == 'Productivity' &&
			scenario == 'B' &&
			$species_scenario_A?.has_productivity == 'false'
		) {
			tempDataBasis = 'Suitability';
			toast.message(CustomToast, {
				componentProps: {
					title: 'Database switched back to suitability',
					description: `${$species_scenario_A.species_name} has no data for productivity`
				},
				duration: 5000
			});
		}
	}
</script>

<svelte:window bind:innerWidth />

<Sidebar bind:sidebarIsOpen={isOpen} classes="lg:w-1/5" {side}>
	<div slot="header">
		<SlidersHorizontal strokeWidth="1.5" size="16" />
		Specifications
		<p class="font-light" id="header-paragraph" />
	</div>
	<div slot="description">Set the options for the layer. Some datasets may not available.</div>

	<div slot="content">
		<div class="flex flex-col gap-4 pt-4">
			<div class="flex flex-col w-full justify-between items-fit">
				<p class="w-full mb-2 border-b border-zinc-300 font-light">Species</p>
				<DropdownMenu.Root closeOnItemClick={true} typeahead={false}>
					<DropdownMenu.Trigger>
						<Button color="secondary" class="w-full flex justify-center">{species}</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="border border-zinc-700 w-fit shadow-lg ">
						<Search bind:speciesList sortKey="english_name" />
						<DropdownMenu.RadioGroup
							bind:value={species}
							onValueChange={($event) => {
								if ($event) validateSpecies($event);
							}}
							class="h-36 overflow-y-scroll hover:bg-transparent"
						>
							{#each Object.values(speciesList) as band}
								{#if band.climate_scenario == 'ref'}
									<DropdownMenu.RadioItem
										disabled={$provenanceIsOpen && band.cluster_band == null}
										value={band.species_name}
										data-value={band.species_name}
										class="flex items-center justify-between gap-2 w-full"
									>
										<span class="flex w-3.5 h-full items-center my-auto">
											{#if band.id == selected?.id}
												<DotFilled class="h-4 w-4 fill-current" />
											{/if}
										</span>
										<p class="w-1/2">{band.species_name}</p>
										<div
											class="w-1/2 text-xs italic text-gray-500 flex justify-between items-center h-full gap-2"
										>
											{band.english_name}
											<div class="flex gap-1">
												{#if band.has_productivity == 'true'}
													<CircleParking strokeWidth="1.5" size="16" />
												{:else}
													<CircleParkingOff strokeWidth="1.5" size="16" />
												{/if}

												{#if band.cluster_band != null}
													<Bean strokeWidth="1" size="16" />
												{:else}
													<BeanOff strokeWidth="1" size="16" />
												{/if}
											</div>
										</div>
									</DropdownMenu.RadioItem>
								{/if}
							{/each}
						</DropdownMenu.RadioGroup>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
			<div class="flex flex-col w-full justify-between items-start space-y-2">
				<h3 class="w-full mb-2 border-b border-zinc-300 font-light">Year</h3>
				<div class="w-full px-2 cursor-pointer">
					<div class="relative mb-6 *:text-xs">
						<input
							disabled={$provenanceIsOpen}
							type="range"
							bind:value={year}
							on:change={() => {
								validateYear(year ?? 1995);
							}}
							min={1995}
							max={2085}
							step="30"
							class="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#5DB570] mb-8"
						/>

						<span class="text-xs text-gray-500 absolute -start-2 -bottom-2">Ref. 1995</span>

						<span
							class="text-xs text-gray-500 absolute start-1/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-2"
							>2025</span
						>

						<span
							class="text-xs text-gray-500 absolute start-2/3 -translate-x-1/2 rtl:translate-x-1/2 -bottom-2"
							>2055</span
						>
						<span class="text-xs text-gray-500 absolute -end-2 -bottom-2">2085</span>
					</div>
				</div>
			</div>

			<div class="flex flex-col w-full justify-between items-start space-y-2">
				<h3 class="w-full mb-2 border-b border-zinc-300 font-light">Climate scenario</h3>
				<div>
					<Tooltip.Root openDelay={150}>
						<Tooltip.Trigger>
							<div class="flex justify-between gap-1">
								<button
									disabled={year == 1995}
									class="rounded-lg px-4 py-1 transition-all flex gap-1 items-center text-sm {year !=
										1995 && rcp != 'rcp85'
										? 'bg-[#5DB570] hover:bg-[#3e9d53] text-white'
										: 'border border-zinc-500'} disabled:cursor-not-allowed disabled:opacity-50"
									on:click={() => (rcp = 'rcp45')}
								>
									{ClimateScenarios.rcp45}
								</button>
								<button
									disabled={year == 1995}
									class="rounded-lg px-4 py-1 transition-all flex gap-1 items-center text-sm {year !=
										1995 && rcp == 'rcp85'
										? 'bg-[#5DB570] hover:bg-[#3e9d53] text-white'
										: 'border border-zinc-500'} disabled:cursor-not-allowed disabled:opacity-50"
									on:click={() => (rcp = 'rcp85')}
								>
									{ClimateScenarios.rcp85}
								</button>
							</div>
						</Tooltip.Trigger>
						{#if rcp == 'ref'}
							<Tooltip.Content>
								No future climate scenario when reference year is selected.
							</Tooltip.Content>
						{/if}
					</Tooltip.Root>
				</div>
			</div>

			<div class="flex flex-col w-full justify-between items-start space-y-2">
				<h3 class="w-full mb-2 border-b border-zinc-300 font-light">Databasis</h3>
				<div>
					<Tooltip.Root openDelay={150}>
						<Tooltip.Trigger>
							<div class="flex lg:flex-wrap justify-between gap-1">
								<button
									disabled={$provenanceIsOpen}
									class="rounded-lg px-4 py-1 w-1/2 lg:w-auto text-sm {tempDataBasis ==
									'Suitability'
										? 'bg-[#5DB570] hover:bg-[#3e9d53] text-white'
										: 'border border-zinc-500'}  disabled:cursor-not-allowed disabled:opacity-50"
									on:click={() => (tempDataBasis = 'Suitability')}
								>
									Suitability
								</button>
								<button
									disabled={selected?.has_productivity == 'false' || $provenanceIsOpen}
									class="rounded-lg px-4 py-1 w-1/2 lg:w-auto text-sm {tempDataBasis ==
									'Productivity'
										? 'bg-[#5DB570] hover:bg-[#3e9d53] text-white'
										: 'border border-zinc-500'} disabled:cursor-not-allowed disabled:opacity-50"
									on:click={() => (tempDataBasis = 'Productivity')}
								>
									Productivity
								</button>
							</div>
						</Tooltip.Trigger>
						<Tooltip.Content>
							{#if selected?.has_productivity == 'false'}
								Selected species has no data for productivity distribution
							{:else if $provenanceIsOpen}
								Provenance is only available for suitability
							{:else}
								Databasis is synchronized between both maps. Only species with the same databasis
								can be compared.
							{/if}
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
			</div>
		</div>
		<div class="flex justify-center pr-4 pt-2 pb-4 border-t">
			{#if $isMobileDevice}
				<Button color="secondary" class="px-8" on:click={() => setNewLayer()}>
					Apply
					<Check strokeWidth="1.5" size="20" />
				</Button>
			{/if}
		</div>
	</div>
	<div
		slot="footer"
		class="flex justify-center pr-4 pt-2 pb-4 border-t {$isMobileDevice ? 'hidden' : ''}"
	>
		{#if !$isMobileDevice}
			<Button color="secondary" class="px-8" on:click={() => setNewLayer()}>
				Apply
				<Check strokeWidth="1.5" size="20" />
			</Button>
		{/if}
	</div>
</Sidebar>

<div
	class="border border-zinc-600 cursor-pointer bg-gray-100 hover:bg-[#c3e3c9] rounded-full lg:w-fit pointer-events-auto lg:z-40 z-20 shadow-lg"
>
	<Tooltip.Root>
		<Tooltip.Trigger>
			<Button
				color="ghost"
				class="border-0 rounded-full hover:rounded-full shadow-lg lg:!px-6 !px-3 text-xs lg:text-sm"
				on:click={() => {
					speciesDialogOpen.set(false);
					isOpen = !isOpen;
					if ($isMobileDevice) {
						setTimeout(() => {
							const headerParagraph = document.getElementById('header-paragraph');
							if (headerParagraph) {
								headerParagraph.innerText = scenario == 'B' ? '(top)' : '(bottom)';
							}
						}, 100);
					}
				}}
			>
				<div class="*:lg:flex *:items-center *:gap-2">
					<slot name="button-text"></slot>
				</div>
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<slot name="tooltip-content"></slot>
		</Tooltip.Content>
	</Tooltip.Root>
</div>
