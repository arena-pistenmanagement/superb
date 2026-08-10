<script lang="ts">
	import { onMount } from 'svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Popover from '$lib/components/ui/popover';
	import { Palette, X } from 'lucide-svelte';
	import {
		selectedDataBasis,
		species_scenario_A,
		species_scenario_B,
		thresholds
	} from '$lib/stores/map-store';
	import type { SpeciesData } from '$lib/utils/types';
	import { blackOrWhiteText } from '$lib/utils/map/color-styling';
	import { geoserverUrl } from '$lib/utils/map/geoserver';

	type ColorStep = {
		label: string;
		color: string;
	};
	let colorMap: ColorStep[] | undefined;
	let colorMap_B: ColorStep[] | undefined;
	let popoverIsOpen: boolean = false;
	let type: string = $selectedDataBasis == 'Productivity' ? 'prod' : 'suit';
	let datasetName: string;
	let band: number;

	onMount(async () => {
		colorMap = await updateColorLegend($species_scenario_A);
		colorMap_B = await updateColorLegend($species_scenario_B);
	});

	selectedDataBasis.subscribe(async (value) => {
		if (value) {
			colorMap = await updateColorLegend($species_scenario_A);
			colorMap_B = await updateColorLegend($species_scenario_B);
		}
	});

	species_scenario_A.subscribe(async (value) => {
		if (value) colorMap = await updateColorLegend(value);
		if (!value) colorMap = undefined;
	});

	species_scenario_B.subscribe(async (value) => {
		if (value) colorMap_B = await updateColorLegend(value);
		if (!value) colorMap_B = undefined;
	});

	async function updateColorLegend(
		species: SpeciesData | undefined
	): Promise<ColorStep[] | undefined> {
		if (species == undefined) return;

		type = $selectedDataBasis == 'Productivity' ? 'prod' : 'suit';
		band = species.band_number;
		datasetName = species.file_name;
		let result = await fetch(
			`${geoserverUrl}/wms?REQUEST=GetLegendGraphic&Version=1.0.0&Format=application/json&Layer=bfw:${type}_${datasetName}&style=bfw:style_${type}_${band}`
		);

		if (result.ok) {
			let json = await result.json();
			let legend = json.Legend[0].rules[0].symbolizers[0].Raster.colormap.entries;

			const scale = $selectedDataBasis == 'Suitability' ? 'suitabilities' : 'productivities';
			let species_thresholds = $thresholds[scale][species.file_name];
			legend[1].label = species_thresholds[0];
			legend[2].label = species_thresholds[1];

			return legend;
		} else {
			return undefined;
		}
	}
</script>

<div class="cursor-pointer hover:bg-[#c3e3c9] transition-all rounded-full w-fit">
	<Popover.Root bind:open={popoverIsOpen} closeOnOutsideClick={false}>
		<Tooltip.Root openDelay={150}>
			<div class="z-30 text-zinc-700">
				<Tooltip.Trigger>
					<Popover.Trigger>
						<button
							disabled={!$species_scenario_A}
							class="ring-none focus:ring-none h-10 w-10 flex items-center justify-center bg-[#F0FFF3] rounded-full shadow-lg border border-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:text-dark"
						>
							<Palette size="20" strokeWidth="1.5" />
						</button>
					</Popover.Trigger>
				</Tooltip.Trigger>
				<Tooltip.Content side="left">
					{#if !$species_scenario_A}
						<p>Select species to show legend</p>
					{:else}
						<p>Open color legend</p>
					{/if}
				</Tooltip.Content>
			</div>
		</Tooltip.Root>

		<Popover.Content class="w-fit z-30" side="left" align="end">
			<div>
				<div>
					<div class="flex w-full justify-between items-center">
						<h4 class="font-medium leading-none">Legend</h4>
						<Popover.Close><X strokeWidth="1.5" size="20" /></Popover.Close>
					</div>
					<p class="text-sm text-muted-foreground pb-4">
						{type == 'suit' ? 'Suitability - Score in %' : 'Productivity: Height [m] at 100 yrs'}
					</p>

					{#if $species_scenario_B && $species_scenario_B?.english_name !== $species_scenario_A?.english_name}
						<p class="leading-none text-sm mt-2">{$species_scenario_A?.species_name}</p>
					{/if}
					<div class="grid sm:flex sm:flex-row gap-1 text-sm md:text-sm">
						{#if colorMap}
							{#each colorMap as color, i}
								<div
									class="text-{blackOrWhiteText(
										color.label == 'NoData' ? '#fffff' : color.color
									)} rounded-lg border border-zinc-400 px-4 py-1"
									style="background-color: {color.label == 'NoData' ? 'transparent' : color.color}"
								>
									<div>
										{#if i + 1 == colorMap.length}
											{color.label}
										{:else if i !== 0}
											{color.label == '1000' ? 100 : color.label}
										{:else}
											{color.label}
										{/if}
									</div>
								</div>
							{/each}
						{/if}
					</div>

					{#if colorMap_B && $species_scenario_B?.english_name !== $species_scenario_A?.english_name}
						<p class="leading-none text-sm mt-6">
							{$species_scenario_B?.species_name}
						</p>
						<div class="grid sm:flex sm:flex-row gap-1 text-sm md:text-sm">
							{#each colorMap_B as color, i}
								<div
									class="text-{blackOrWhiteText(
										color.label == 'NoData' ? '#fffff' : color.color
									)} rounded-lg border border-zinc-400 px-4 py-1"
									style="background-color: {color.label == 'NoData' ? 'transparent' : color.color}"
								>
									<div>
										{#if i + 1 == colorMap_B.length}
											{color.label}
										{:else if i !== 0}
											{color.label == '1000' ? 100 : color.label}
										{:else}
											{color.label}
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>
		</Popover.Content>
	</Popover.Root>
</div>
