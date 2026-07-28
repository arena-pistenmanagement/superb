<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Search from './map/Search.svelte';
	import { findPrecalculatedGroups } from '$lib/utils/mixtures';
	import {
		species_scenario_A,
		location,
		lookup,
		mixtureDialogOpen,
		helpTracker,
		isMobileDevice,
		faqDialogOpen,
		isLoadingSpecies,
		hasSpeciesComposition
	} from '$lib/stores/map-store';
	import { mixtureHashMap } from '$lib/stores/mixture-store';
	import { orderBySubKey, queryGeographicalRegion } from '$lib/utils/map/query-features';
	import type { Group, SpeciesData, GroupItem, Dataset, CustomGroup } from '$lib/utils/types';
	import { onDestroy, onMount } from 'svelte';
	import Button from './Button.svelte';
	import Threshold from './Threshold.svelte';
	import {
		Bean,
		BeanOff,
		CircleParking,
		CircleParkingOff,
		LoaderCircle,
		Maximize,
		Minimize,
		Sprout,
		Waypoints
	} from 'lucide-svelte';
	import MixtureCard from './MixtureCard.svelte';
	import MixtureTimeframeSelector from './MixtureTimeframeSelector.svelte';
	import MixtureScenarioSelector from './MixtureScenarioSelector.svelte';
	import OtherSpeciesCard from './OtherSpeciesCard.svelte';
	import { DotFilled } from 'svelte-radix';
	import Label from './ui/label/label.svelte';
	import { toast } from 'svelte-sonner';
	import CustomToast from './ui/sonner/CustomToast.svelte';
	import { helpActive } from '$lib/stores/starter-guide';
	import { fly } from 'svelte/transition';

	let geographicalRegion = '';
	let speciesList: Dataset = JSON.parse(JSON.stringify($lookup));
	let species: string | undefined = $species_scenario_A?.species_name;
	let groups: Group[] = [];
	let otherGroup = [] as GroupItem[];
	let selectedSpecies: SpeciesData | undefined = $species_scenario_A;
	let isOpen: boolean | undefined = $mixtureDialogOpen;
	let year = $species_scenario_A?.timeframe;
	let providedClimateScenario = $species_scenario_A?.climate_scenario;
	let isUpdatingSpecies = false;
	let activeGroup: CustomGroup | Group | undefined;
	let headerHidden: boolean = false;
	let contentContainer: HTMLDivElement;
	let scrollParent: HTMLElement | null = null;
	const maxSuitability = 100;

	onMount(async () => {
		if (!geographicalRegion && $location) {
			const coordinate = { lat: $location[0], lon: $location[1] };
			geographicalRegion = (await queryGeographicalRegion(coordinate)) ?? '';
		}
		if (!selectedSpecies || !geographicalRegion || !selectedSpecies.timeframe) return;
		const result = await findPrecalculatedGroups(selectedSpecies, geographicalRegion);
		groups = result.groups;
		otherGroup = result.otherGroup;
		species = $species_scenario_A?.species_name;
	});

	$: speciesList = orderBySubKey(speciesList, 'species_name', 'ref');

	$: if (species && isOpen) {
		if (
			species !== $species_scenario_A?.species_name ||
			year !== undefined ||
			providedClimateScenario !== undefined
		) {
			const referenceYear = '1995';

			const dataEntriesForSpecie = Object.values($lookup).filter(
				(entry) => entry.species_name === species
			);

			const availableYears = [...new Set(dataEntriesForSpecie.map((entry) => entry.timeframe))];

			if (!year || !availableYears.includes(year)) {
				toast.error('No dataset found. Auto-correcting to the closest valid year.');
				year = availableYears.includes(referenceYear) ? referenceYear : availableYears[0];
			}

			const availableScenarios = [
				...new Set(
					dataEntriesForSpecie
						.filter((entry) => entry.timeframe === year)
						.map((entry) => entry.climate_scenario)
				)
			];

			if (!providedClimateScenario || !availableScenarios.includes(providedClimateScenario)) {
				providedClimateScenario = availableScenarios.includes('ref')
					? 'ref'
					: availableScenarios[0];
			}

			const result = dataEntriesForSpecie.find(
				(entry) => entry.timeframe === year && entry.climate_scenario === providedClimateScenario
			);

			if (result) {
				species_scenario_A.set(result);
			} else {
				console.error('No valid dataset entry found after correction.');
			}
		}
	}

	$: if (isOpen) mixtureDialogOpen.set(isOpen);
	$: if (activeGroup && $isMobileDevice) headerHidden = true;
	$: groups.length > 0 ? hasSpeciesComposition.set(true) : hasSpeciesComposition.set(false);
	$: if (groups.length > 0) groups[0].group == undefined ? updateMixtures() : '';
	$: if (activeGroup) scrollToActiveDom();

	mixtureDialogOpen.subscribe((value) => {
		isOpen = value;
		if (value) helpTracker.set(4);
	});

	const createCustomGroupFromSelection = (group: Group) => {
		let originalName = group.name?.split('_')[0];
		let index = groups.findIndex((element) => element.name == originalName);
		groups.splice(index + 1, 0, group);
		groups = JSON.parse(JSON.stringify(groups));
	};

	const deleteCustomGroup = (group: CustomGroup) => {
		const filteredGroups = groups.filter((element) => element != group);
		groups = filteredGroups;
	};

	const isCustomGroup = (group: Group): group is CustomGroup => group.isCustomGroup === true;

	const changeSelection = async (event: CustomEvent) => {
		const foundCustomGroup = groups.find((group) => group.name == event.detail.customGroup.name);
		await recalculateAverages(foundCustomGroup as CustomGroup);
		sortGroupsBySuitability();
	};

	const sortGroupsBySuitability = () => {
		if (!activeGroup) return;
		const activeGroupName = activeGroup.name;
		const oldIndex = groups.findIndex((group) => group.name == activeGroupName);
		const sorted = groups.sort((a, b) => b.groupSuitability - a.groupSuitability);
		if (oldIndex != groups.findIndex((group) => group.name == activeGroupName)) {
			toast.message(CustomToast, {
				componentProps: {
					title: 'Rank updated',
					description: ''
				},
				duration: 5000
			});
			scrollToActiveDom();
		}
		groups = JSON.parse(JSON.stringify(sorted));
	};

	function scrollToActiveDom() {
		setTimeout(() => {
			let dom = document.getElementById(`mixtures-dom-${activeGroup?.name}`);
			dom?.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}, 200);
	}

	const recalculateAverages = async (customGroup: CustomGroup) => {
		const filteredCustomGroup = customGroup.items.filter(
			(item) => item.checked && item.suitability != null
		);
		const suitabilitySum = filteredCustomGroup.reduce((acc, item) => acc + item.suitability, 0);
		const productivitySum = filteredCustomGroup.reduce((acc, item) => acc + item.productivity, 0);
		customGroup.groupSuitability = Math.round(suitabilitySum / filteredCustomGroup.length);
		customGroup.groupProductivity = Math.round(productivitySum / filteredCustomGroup.length);
	};

	species_scenario_A.subscribe(async (value) => {
		if (value?.species_name === undefined) return;
		if (!$location) return;

		if (value.species_name != selectedSpecies?.species_name) {
			// delete custom groups
			const customGroups = groups.filter(isCustomGroup);
			customGroups.forEach((group) => {
				deleteCustomGroup(group);
			});
		}

		selectedSpecies = value;
		species = value.species_name;
		isUpdatingSpecies = true;
		mixtureHashMap.set({});
		await updateMixtures();
		isUpdatingSpecies = false;
	});

	location.subscribe(async () => {
		if (!$location) return;
		await updateMixtures();
	});

	async function updateMixtures() {
		if ($location && $species_scenario_A && selectedSpecies) {
			const coordinate = { lat: $location[0], lon: $location[1] };
			geographicalRegion = (await queryGeographicalRegion(coordinate)) ?? '';
			const result = await findPrecalculatedGroups(selectedSpecies, geographicalRegion);

			if (result) {
				otherGroup = result.otherGroup;
				const temporaryHashMap: Record<string, string> = {};
				if (Object.keys($mixtureHashMap).length === 0) {
					result.groups.forEach((group) => {
						if (group.name) {
							temporaryHashMap[group.name] = group.group;
						}
					});
					mixtureHashMap.set(temporaryHashMap);
				}
				// update Custom Groups
				const customGroups = groups.filter(isCustomGroup);

				customGroups.forEach((group, idx) => {
					const baseGroup = result.groups.find(
						(element) => element.name == group.name?.split('_')[0]
					);
					if (!baseGroup) return;
					group.items.forEach((item, i) => {
						const baseGroupItem = baseGroup.items.find((element) => element.value == item.value);
						customGroups[idx].items[i].productivity = JSON.parse(
							JSON.stringify(baseGroupItem?.productivity)
						);
						customGroups[idx].items[i].suitability = JSON.parse(
							JSON.stringify(baseGroupItem?.suitability)
						);
					});
					group.selectedItems = group.items;
					recalculateAverages(group);
				});

				let groupsIncludingCustom = result.groups.concat(JSON.parse(JSON.stringify(customGroups)));
				const tempgroups = groupsIncludingCustom.sort(
					(a, b) => b.groupSuitability - a.groupSuitability
				);
				groups = JSON.parse(JSON.stringify(tempgroups));
				species = $species_scenario_A?.species_name;
				scrollToActiveDom();
			}
		}
	}

	function handleContentScroll() {
		headerHidden = true;
	}

	$: if (contentContainer?.parentElement && contentContainer.parentElement !== scrollParent) {
		scrollParent?.removeEventListener('scroll', handleContentScroll);
		scrollParent = contentContainer.parentElement;
		scrollParent.addEventListener('scroll', handleContentScroll);
	}

	onDestroy(() => scrollParent?.removeEventListener('scroll', handleContentScroll));
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger>
		<div id="mixturesBtn" class="inline-flex rounded-lg mr-2">
			<Button
				disabled={!$species_scenario_A || $isLoadingSpecies}
				on:click={() => mixtureDialogOpen.set(!$mixtureDialogOpen)}
				class="flex flex-col items-start"
			>
				<div class="flex gap-2 w-full">
					<Waypoints strokeWidth="1.5" size="16" color={$helpTracker > 5 ? 'green' : 'black'} />
					Composition
				</div>
				<p
					class="ml-1 text-xs font-light {$helpTracker > 5
						? 'text-gray-400'
						: 'text-gray-900'} italics text-left whitespace-nowrap w-full"
				>
					3. View potential compositions
				</p>
			</Button>
			{#if $helpTracker == 3 && $helpActive}
				<span class="relative -ml-2 -mt-1 outline outline-white rounded-full flex h-3 w-3">
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
					></span>
					<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
				</span>
			{/if}
		</div>
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Content class="max-h-vdh h-[95%] bg-gray-100 !px-2 lg:px-5">
			<Dialog.Title>
				<div class="flex justify-between items-start w-full pr-6">
					<p class="font-semibold text-lg">Species Composition</p>
					<Button
						color="ghost"
						class="-mt-2.5"
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
				{#if !headerHidden}
					<div
						class="flex flex-col lg:flex-row w-full justify-between lg:gap-4 gap-1 py-3"
						transition:fly={{ y: -200, duration: 500 }}
					>
						<div class="font-light text-xs px-2">
							Explore potential species compositions based on the main selected species. The panel
							below displays up to 20 species composition groups that include the main species
							chosen in the Species Selection tab. Compare their mean suitability across different
							climate scenarios and timeframes, and customize your group by removing maladapted
							species. By default, groups are sorted by their mean suitability. For more details,
							refer to the
							<Button
								color="ghost"
								size="xs"
								extraStyle="!inline-block underline"
								on:click={() => {
									$faqDialogOpen = true;
									isOpen = false;
								}}
								on:keydown={() => {
									$faqDialogOpen = true;
									isOpen = false;
								}}
							>
								FAQ ->
							</Button>
						</div>
						<div class="flex flex-col lg:max-w-1/3 lg:w-fit w-full *:text-xs justify-end px-4">
							<div class="flex items-end justify-between gap-4">
								Suitability
								<Threshold switchScale={false} tempSelectedDataBasis="Suitability" />
							</div>
							<div class="flex items-end justify-between gap-4">
								Productivity
								<Threshold switchScale={false} tempSelectedDataBasis="Productivity" />
							</div>
						</div>
					</div>
				{/if}
				<div
					class="flex flex-row flex-wrap justify-start items-center lg:items-end py-2 lg:gap-4 gap-1 {$isMobileDevice
						? '*:text-xs'
						: ''}"
				>
					<div class="flex flex-col">
						{#if !$isMobileDevice}<Label>Selected species</Label>{/if}
						<DropdownMenu.Root closeOnItemClick={true} typeahead={false}>
							<DropdownMenu.Trigger>
								<Button color="secondary" class="w-full min-w-[180px] lg:px-4"
									><div class="w-full flex justify-center">{$species_scenario_A?.species_name}</div>
									<Sprout strokeWidth="1.5" size="16" />
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								align="start"
								class="border border-zinc-700 w-fit shadow-lg lg:min-w-96 !mt-0"
							>
								<DropdownMenu.RadioGroup bind:value={species} class="h-56 overflow-y-scroll">
									<Search bind:speciesList sortKey="english_name" />
									{#each Object.values(speciesList) as band}
										{#if band.climate_scenario == 'ref'}
											<DropdownMenu.RadioItem
												value={band.species_name}
												class="flex items-center justify-between gap-2"
											>
												<span class="flex w-3.5 h-full items-center my-auto">
													{#if band.id == selectedSpecies?.id}
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

					<MixtureTimeframeSelector
						bind:year
						yearSelectedItem={{
							value: $species_scenario_A?.timeframe,
							label:
								$species_scenario_A?.climate_scenario == 'ref'
									? `Reference (${$species_scenario_A.timeframe})`
									: $species_scenario_A?.timeframe
						}}
					/>
					<MixtureScenarioSelector
						scenarioSelectedItem={{
							value: providedClimateScenario,
							label:
								providedClimateScenario == 'rcp45'
									? 'RCP4.5'
									: providedClimateScenario == 'rcp85'
										? 'RCP8.5'
										: 'Reference'
						}}
						bind:scenario={providedClimateScenario}
					/>
				</div>
			</Dialog.Title>
			{#if !isUpdatingSpecies}
				<Dialog.Description class="overflow-y-auto overflow-x-hidden rounded-lg">
					<div bind:this={contentContainer}>
						{#if groups.length == 0}
							<div class="flex justify-center items-center w-full mx-auto my-auto text-center">
								No species composition can be recommended for the selected location and species at
								this time.
							</div>
						{:else}
							{#each groups as group, index}
								<MixtureCard
									rank={index + 1}
									{group}
									{maxSuitability}
									bind:activeGroup
									on:createChangeSelection={changeSelection}
									on:createCustomGroup={(event) => createCustomGroupFromSelection(event.detail)}
									on:deleteCustomGroup={(event) => deleteCustomGroup(event.detail)}
								/>
							{/each}
							{#if otherGroup.length > 0}
								<OtherSpeciesCard rank={groups.length + 1} {otherGroup} />
							{/if}
						{/if}
					</div>
				</Dialog.Description>
			{:else}
				<Dialog.Description class="overflow-y-auto overflow-x-hidden">
					<div class="flex justify-center gap-1 items-center">
						<div>Loading</div>
						<LoaderCircle class="animate-spin" />
					</div>
				</Dialog.Description>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
