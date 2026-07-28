<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import {
		location,
		lookup,
		species_scenario_A,
		exportDialogOpen,
		helpTracker,
		recommendedProvenance,
		lineChartData,
		isMobileDevice,
		isLoadingSpecies,
		hasSpeciesComposition,
		isLoadingProvenance,
		currentProvenance,
		speciesDialogOpen
	} from '$lib/stores/map-store';
	import { TreeReport } from '$lib/utils/report/TreeReport';
	import { toast } from 'svelte-sonner';
	import Button from './Button.svelte';
	import { FileText, LoaderCircle, Pencil } from 'lucide-svelte';
	import { ClimateScenarios, type ReportSelection, type SpeciesData } from '$lib/utils/types';
	import { Line } from 'svelte-chartjs';
	import { thresholdsColor } from '$lib/utils/map/color-styling';
	import { customGroup } from '$lib/stores/mixture-store';
	import { loadProvenanceLayer } from '$lib/utils/map/cluster-layer';
	import type mapboxgl from 'mapbox-gl';
	import { superb_labels } from './special_species';
	import { helpActive } from '$lib/stores/starter-guide';
	import 'chart.js/auto';
	import type { ChartData as ChartJsData, ChartOptions, ScriptableContext } from 'chart.js';

	export let map: mapboxgl.Map;

	let speciesList: SpeciesData[];

	let suitabilityData: ChartJsData<'line', number[], string> | undefined;
	let productivityData: ChartJsData<'line', number[], string> | undefined;
	let suitabilityChartOptions: ChartOptions<'line'> | undefined;
	let productivityChartOptions: ChartOptions<'line'> | undefined;

	let dataId: number;

	function pointColor(
		context: ScriptableContext<'line'>,
		dataBasis: 'Suitability' | 'Productivity',
		fileName: string
	): string {
		const value = typeof context.raw === 'number' ? context.raw : Number.NaN;
		return thresholdsColor(value, dataBasis, fileName);
	}

	function chartValues(
		dataBasis: 'Suitability' | 'Productivity',
		scenario: 'rcp45' | 'rcp85'
	): number[] {
		return ($lineChartData[dataBasis][scenario][`species-id-${dataId}`] ?? []).map(
			(value) => value ?? Number.NaN
		);
	}

	exportDialogOpen.subscribe(async (value) => {
		if (value && $species_scenario_A) {
			const selectedSpecies = $species_scenario_A;
			const newProvenance = {
				cluster_rcp45: selectedSpecies.cluster_rcp45,
				cluster_rcp85: selectedSpecies.cluster_rcp85,
				species: selectedSpecies.file_name
			};

			if (
				newProvenance.cluster_rcp45 !== $currentProvenance?.cluster_rcp45 ||
				newProvenance.cluster_rcp85 !== $currentProvenance?.cluster_rcp85 ||
				newProvenance.species !== $currentProvenance?.species
			) {
				$currentProvenance = await loadProvenanceLayer(map, true);
			}

			// linechart data is referenced by layerID of 'ref'
			dataId = selectedSpecies.id - selectedSpecies.band_number + 1;
			speciesList = Object.values($lookup).filter(
				(element) => element.file_name == selectedSpecies.file_name
			);

			const referenceSuitability = speciesList.find((element) => element.climate_scenario == 'ref');
			if (!referenceSuitability) {
				toast.error('Reference suitability not found.');
				return;
			}

			suitabilityData = {
				labels: superb_labels(selectedSpecies.species_name),
				datasets: [
					{
						label: 'Suitability: ' + ClimateScenarios.rcp45,
						fill: true,
						cubicInterpolationMode: 'monotone',
						tension: 0.3,
						borderWidth: 4,
						borderColor: 'rgba(0,109,91,.8)',
						backgroundColor: 'rgba(0,109,91,.1)',
						pointBorderColor: 'rgba(0, 0, 0,.5)',
						pointBackgroundColor: (context) =>
							pointColor(context, 'Suitability', selectedSpecies.file_name),
						pointBorderWidth: 0.5,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: (context) =>
							pointColor(context, 'Suitability', selectedSpecies.file_name),
						pointHoverBorderColor: 'rgba(220, 220, 220,9)',
						pointHoverBorderWidth: 2,
						pointRadius: 5,
						pointHitRadius: 20,
						spanGaps: true,
						data: chartValues('Suitability', 'rcp45')
					},
					{
						label: 'Suitability: ' + ClimateScenarios.rcp85,
						fill: true,
						cubicInterpolationMode: 'monotone',
						tension: 0.3,
						borderColor: 'rgba(190,18,87,.8)',
						backgroundColor: 'rgba(190,18,87,.1)',
						pointBorderColor: 'rgba(0, 0, 0,.5)',
						pointBackgroundColor: (context) =>
							pointColor(context, 'Suitability', selectedSpecies.file_name),
						pointBorderWidth: 0.5,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: (context) =>
							pointColor(context, 'Suitability', selectedSpecies.file_name),
						pointHoverBorderColor: 'rgba(220, 220, 220, 1)',
						pointHoverBorderWidth: 2,
						pointRadius: 5,
						pointHitRadius: 20,
						spanGaps: true,
						data: chartValues('Suitability', 'rcp85')
					}
				]
			};

			productivityData = {
				labels: superb_labels(selectedSpecies.species_name),
				datasets: [
					{
						label: 'Productivity: ' + ClimateScenarios.rcp45,
						fill: true,
						cubicInterpolationMode: 'monotone',
						tension: 0.3,
						borderWidth: 4,
						borderColor: 'rgba(0,109,91,.8)',
						pointBorderColor: 'rgba(0, 0, 0,.5)',
						pointBackgroundColor: (context) =>
							pointColor(context, 'Productivity', selectedSpecies.file_name),
						pointBorderWidth: 0.5,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: (context) =>
							pointColor(context, 'Productivity', selectedSpecies.file_name),
						pointHoverBorderColor: 'rgba(220, 220, 220,1)',
						pointHoverBorderWidth: 2,
						pointRadius: 5,
						pointHitRadius: 20,
						spanGaps: true,
						data: chartValues('Productivity', 'rcp45')
					},
					{
						label: 'Productivity: ' + ClimateScenarios.rcp85,
						fill: true,
						cubicInterpolationMode: 'monotone',
						tension: 0.3,
						borderWidth: 4,
						borderColor: 'rgba(190,18,87,.8)',
						backgroundColor: 'rgba(190,18,87,.1)',
						pointBorderColor: 'rgba(0, 0, 0,.5)',
						pointBackgroundColor: (context) =>
							pointColor(context, 'Productivity', selectedSpecies.file_name),
						pointBorderWidth: 0.5,
						pointHoverRadius: 5,
						pointHoverBackgroundColor: (context) =>
							pointColor(context, 'Productivity', selectedSpecies.file_name),
						pointHoverBorderColor: 'rgba(220, 220, 220, 1)',
						pointHoverBorderWidth: 2,
						pointRadius: 5,
						pointHitRadius: 20,
						spanGaps: true,
						data: chartValues('Productivity', 'rcp85')
					}
				]
			};
			suitabilityChartOptions = {
				scales: {
					x: {
						grid: {
							drawOnChartArea: false,
							color: 'gray'
						},
						border: { color: 'gray' },
						title: {
							display: true,
							text: 'Year',
							padding: 0,
							color: 'gray',
							font: { size: 14 }
						},
						ticks: {
							color: 'gray',
							font: { size: 12 }
						}
					},
					y: {
						type: 'linear',
						display: true,
						position: 'left',
						grid: {
							drawOnChartArea: true,
							color: 'lightgray'
						},
						border: { color: 'gray' },
						min: 0,
						max: 100,
						title: {
							display: true,
							text: '%',
							padding: 0,
							color: 'gray',
							font: { size: 14 }
						},
						ticks: {
							color: 'gray',
							font: { size: 12 }
						}
					}
				},
				responsive: true,
				maintainAspectRatio: false
			};

			productivityChartOptions = structuredClone(suitabilityChartOptions);
			const productivityYAxis = productivityChartOptions.scales?.y;
			if (productivityYAxis && 'max' in productivityYAxis) {
				productivityYAxis.max = 50;
				if (productivityYAxis.title) {
					productivityYAxis.title.text = 'Height [m] at 100 yrs';
				}
			}
		} else if ($species_scenario_A && !value) {
			helpTracker.set(2);
			speciesDialogOpen.set(true);
		}
	});

	let reportSelection: ReportSelection = {
		includeSuitability: true,
		includeSuitabilityChart: true,
		includeSuitabilityTable: true,
		includeProductivity: $species_scenario_A?.has_productivity == 'true' ? true : false,
		includeProductivityChart: $species_scenario_A?.has_productivity == 'true' ? true : false,
		includeProductivityTable: $species_scenario_A?.has_productivity == 'true' ? true : false,
		includeMixtures: false,
		includeCustomGroup: false,
		mixtureTimeframe: $species_scenario_A?.timeframe != 'ref' ? 'future' : 'ref',
		mixtureClimateScenario:
			$species_scenario_A?.climate_scenario == 'ref' || !$species_scenario_A?.climate_scenario
				? 'rcp45'
				: $species_scenario_A?.climate_scenario,
		includeProvenance: false
	};

	species_scenario_A.subscribe(() => {
		reportSelection = {
			includeSuitability: true,
			includeSuitabilityChart: true,
			includeSuitabilityTable: true,
			includeProductivity: $species_scenario_A?.has_productivity == 'true' ? true : false,
			includeProductivityChart: $species_scenario_A?.has_productivity == 'true' ? true : false,
			includeProductivityTable: $species_scenario_A?.has_productivity == 'true' ? true : false,
			includeMixtures: false,
			includeCustomGroup: false,
			mixtureTimeframe: $species_scenario_A?.timeframe != 'ref' ? 'future' : 'ref',
			mixtureClimateScenario:
				$species_scenario_A?.climate_scenario == 'ref' || !$species_scenario_A?.climate_scenario
					? 'rcp45'
					: $species_scenario_A?.climate_scenario,
			includeProvenance: false
		};
	});

	const createAndExportReport = async () => {
		if (!$species_scenario_A || !$location) {
			toast.error('Please select a location and species.');
			return;
		}
		toast.loading('Generating report...');

		const report = new TreeReport(reportSelection, $species_scenario_A.species_name);
		await report.generatePDF($location, $species_scenario_A);
		toast.success('Report generated successfully.');
	};
</script>

<div id="exportBtn" class="inline-flex rounded-lg">
	<Button
		disabled={!$species_scenario_A || $isLoadingSpecies}
		on:click={() => {
			helpTracker.set(7);
			$exportDialogOpen = true;
		}}
		class="flex flex-col items-start"
	>
		<div class="flex gap-2 w-full">
			<Pencil strokeWidth="1.5" size="16" color={$helpTracker >= 7 ? 'green' : 'black'} />
			Export
		</div>
		<p
			class="ml-1 text-xs font-light italics text-left whitespace-nowrap w-full {$helpTracker > 7
				? 'text-gray-400'
				: 'text-gray-900'}"
		>
			5. Export results
		</p>
	</Button>
	{#if $helpTracker == 6 && $helpActive}
		<span class="relative -ml-2 -mt-1 outline outline-white rounded-full flex h-3 w-3">
			<span
				class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
			></span>
			<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
		</span>
	{/if}
</div>

<Dialog.Root bind:open={$exportDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title class="text-xl font-bold flex gap-4 items-center"
				><Pencil strokeWidth="1.5" size="16" />Export Report</Dialog.Title
			>
			<Dialog.Description class="overflow-hidden">
				<div class="w-full h-full text-left gap-4 flex flex-col">
					{#if !$location}
						<div>Location currently not set.</div>
					{/if}
					{#if $species_scenario_A}
						<div class="my-4 gap-2">
							<div class="mt-3 mb-1 font-medium">
								Set parameters
								<p class="pl-4 italic text-xs text-gray-500">
									To change, exit menu and select different setting via button at the bottom.
								</p>
							</div>
							<table class="lg:w-1/2 w-full ml-4">
								<tr><td class="w-1/2">Species</td><td>{$species_scenario_A.species_name}</td></tr>
								<tr
									><td>Climate scenario</td><td
										>{ClimateScenarios[$species_scenario_A.climate_scenario]}</td
									></tr
								>
								<tr><td>Timeframe</td><td>{$species_scenario_A.timeframe}</td></tr>
							</table>
						</div>
					{/if}
					<div class="my-4 gap-2">
						<div class="mt-3 mb-1 font-medium">Report selection</div>
						<table class="ml-4 lg:w-1/2 w-full *:lg:h-16 *:h-8">
							<tr>
								<td class="w-1/2 flex *:flex *:items-start gap-1">
									<input
										class="ml-1 cursor-pointer"
										type="checkbox"
										name="include-suitability"
										id="include-suitability"
										checked={reportSelection.includeSuitability}
										on:change={() =>
											(reportSelection.includeSuitability = !reportSelection.includeSuitability)}
									/>
									<label for="include-suitability" class="whitespace-nowrap"
										>Include Suitability</label
									>
								</td>
								<td>
									<div class="flex flex-col items-start lg:gap-1 *:gap-1">
										<div class="flex items-center justify-start">
											<input
												class="cursor-pointer"
												type="checkbox"
												name="include-suitability-table"
												id="include-suitability-table"
												checked={reportSelection.includeSuitabilityTable}
												on:change={() =>
													(reportSelection.includeSuitabilityTable =
														!reportSelection.includeSuitabilityTable)}
											/>
											<label for="include-suitability-table">Add Table</label>
										</div>
										<div class="flex">
											<input
												class="cursor-pointer"
												type="checkbox"
												name="include-suitability-chart"
												id="include-suitability-chart"
												checked={reportSelection.includeSuitabilityChart}
												on:change={() =>
													(reportSelection.includeSuitabilityChart =
														!reportSelection.includeSuitabilityChart)}
											/>
											<label for="include-suitability-chart">Add Chart</label>
										</div>
									</div>
								</td>
							</tr>
							<tr
								><td class="flex gap-1">
									<Tooltip.Root openDelay={150}>
										<Tooltip.Trigger class="text-left flex gap-1">
											<input
												class="ml-1 cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed peer"
												disabled={$species_scenario_A?.has_productivity == 'false'}
												type="checkbox"
												name="include-productivity"
												id="include-productivity"
												checked={reportSelection.includeProductivity ||
													$species_scenario_A?.has_productivity == 'true'}
												on:change={() =>
													(reportSelection.includeProductivity =
														!reportSelection.includeProductivity)}
											/>
											<label
												for="include-productivity"
												class=" *:peer-disabled:text-gray-300 peer-disabled:text-gray-300 peer-disabled:cursor-not-allowed"
												>Include Productivity</label
											>
										</Tooltip.Trigger>
										{#if $species_scenario_A?.has_productivity == 'false'}
											<Tooltip.Content>Selected species has no productivity data.</Tooltip.Content>
										{/if}
									</Tooltip.Root>
								</td>
								<td>
									<div class="flex flex-col items-start lg:gap-1 *:gap-1">
										<div class="flex">
											<input
												disabled={$species_scenario_A?.has_productivity == 'false'}
												class="cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed peer"
												type="checkbox"
												name="include-productivity-table"
												id="include-productivity-table"
												checked={reportSelection.includeProductivityTable ||
													$species_scenario_A?.has_productivity == 'true'}
												on:change={() =>
													(reportSelection.includeProductivityTable =
														!reportSelection.includeProductivityTable)}
											/>
											<label
												for="include-productivity-table"
												class=" *:peer-disabled:text-gray-300 peer-disabled:text-gray-300 peer-disabled:cursor-not-allowed"
												>Add Table</label
											>
										</div>
										<div class="flex">
											<input
												disabled={$species_scenario_A?.has_productivity == 'false'}
												class="cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed peer"
												type="checkbox"
												name="include-productivity-chart"
												id="include-productivity-chart"
												checked={reportSelection.includeProductivityChart ||
													$species_scenario_A?.has_productivity == 'true'}
												on:change={() =>
													(reportSelection.includeProductivityChart =
														!reportSelection.includeProductivityChart)}
											/>
											<label
												for="include-productivity-chart"
												class=" *:peer-disabled:text-gray-300 peer-disabled:text-gray-300 peer-disabled:cursor-not-allowed"
												>Add Chart</label
											>
										</div>
									</div>
								</td></tr
							>
							<tr>
								<td class="flex gap-1">
									<Tooltip.Root openDelay={150}>
										<Tooltip.Trigger class="text-left flex gap-1">
											<input
												class="ml-1 cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed peer"
												disabled={!$hasSpeciesComposition}
												type="checkbox"
												name="include-mixtures"
												id="include-mixtures"
												checked={reportSelection.includeMixtures}
												on:change={() =>
													(reportSelection.includeMixtures = !reportSelection.includeMixtures)}
											/>
											<label
												for="include-mixtures"
												class="*:peer-disabled:text-gray-300 peer-disabled:text-gray-300 peer-disabled:cursor-not-allowed"
												>Include Species Composition</label
											>
										</Tooltip.Trigger>
										{#if !$hasSpeciesComposition}
											<Tooltip.Content>
												Selected species has no data for species composition.
											</Tooltip.Content>
										{/if}
									</Tooltip.Root>
								</td>
								<td>
									<Tooltip.Root openDelay={150}>
										<Tooltip.Trigger class="text-left flex gap-1 items-start">
											<input
												disabled={!$customGroup}
												class="cursor-pointer mt-1 disabled:text-gray-300 disabled:cursor-not-allowed peer"
												type="checkbox"
												name="include-custom-group"
												id="include-custom-group"
												checked={reportSelection.includeCustomGroup}
												on:change={() =>
													(reportSelection.includeCustomGroup =
														!reportSelection.includeCustomGroup)}
											/>
											<label
												for="include-custom-group"
												class="*:peer-disabled:text-gray-300 peer-disabled:text-gray-300 peer-disabled:cursor-not-allowed"
												>Include Custom{#if $isMobileDevice}<br />{/if} Group
												<p class="font-light text-gray-500 text-xs italic">
													Only last one saved
												</p></label
											>
										</Tooltip.Trigger>
										{#if !$customGroup}
											<Tooltip.Content>
												No custom group saved in species composition
											</Tooltip.Content>
										{/if}
									</Tooltip.Root>
								</td>
							</tr>
							<tr>
								<td class="flex gap-1">
									<Tooltip.Root openDelay={150}>
										<Tooltip.Trigger class="text-left flex items-start gap-1">
											<input
												disabled={$species_scenario_A?.cluster_band == null}
												class="ml-1 mt-1 cursor-pointer disabled:text-gray-300 disabled:cursor-not-allowed peer"
												type="checkbox"
												name="include-provenance"
												id="include-provenance"
												checked={reportSelection.includeProvenance}
												on:change={() => {
													reportSelection.includeProvenance = !reportSelection.includeProvenance;
												}}
											/>
											<label
												for="include-provenance"
												class="ml-1 peer-disabled:text-gray-300 peer-disabled:cursor-not-allowed"
												>Include Provenance
												{#if $species_scenario_A?.cluster_band != null}
													{#if $isLoadingProvenance}
														<LoaderCircle strokeWidth="1.5" size="16" class="animate-spin"
														></LoaderCircle>
													{:else}
														<p class="font-light text-gray-500 text-xs italic">
															{$recommendedProvenance
																? `${$recommendedProvenance.length} most suitable seed sources selected`
																: `No seed sources found for selected location`}
														</p>
													{/if}
												{/if}
											</label>
										</Tooltip.Trigger>
										{#if $species_scenario_A?.cluster_band == null}
											<Tooltip.Content>Selected species has no provenance data.</Tooltip.Content>
										{/if}
									</Tooltip.Root>
								</td>
							</tr>
						</table>

						<Button class="mt-4" on:click={createAndExportReport}
							>Export as PDF
							<FileText strokeWidth="1.5" size="16" />
						</Button>
					</div>
				</div></Dialog.Description
			>
		</Dialog.Header>
		<div class="py-4"></div>
	</Dialog.Content>
</Dialog.Root>

{#if suitabilityData && productivityData}
	<div id="suitability-export-container" class="fixed w-[600px] h-[300px] -top-96">
		<Line data={suitabilityData} options={suitabilityChartOptions} />-
	</div>

	<div id="productivity-export-container" class="fixed w-[600px] h-[300px] -top-96">
		<Line data={productivityData} options={productivityChartOptions} />
	</div>
{/if}
