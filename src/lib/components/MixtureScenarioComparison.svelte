<script lang="ts">
	import { getSpeciesDataByName } from '$lib/utils/map/query-features';
	import type { ClimateScenario, DataBasis, SpeciesData, Years } from '$lib/utils/types';
	import MixtureBarChart from './MixtureBarChart.svelte';
	import { fade } from 'svelte/transition';
	import MixtureTrafficLights from './MixtureTrafficLights.svelte';

	export let selectedSpecies: string;
	export let type: DataBasis;
	export let hidden: boolean = false;

	const scenarios: ClimateScenario[] = ['rcp45', 'rcp85'];
	const years: Years[] = ['2025', '2055', '2085'];

	const speciesReferenceYear = '1995';
	let species = getSpeciesDataByName(selectedSpecies, 'ref', speciesReferenceYear);
	let dataMap: Record<string, Record<string, number | string>> = {};

	$: species = getSpeciesDataByName(selectedSpecies, 'ref', speciesReferenceYear);
	$: if (selectedSpecies) {
		const speciesData = scenarios
			.flatMap((scenario) =>
				years.map((year) => getSpeciesDataByName(selectedSpecies, scenario, year))
			)
			.filter((item): item is SpeciesData => item !== undefined);
		const values: Record<string, number | string> = {};

		speciesData.forEach((item) => {
			const key = `${item?.climate_scenario ?? 'unknown'}-${item?.timeframe ?? 'unknown'}`;
			if (type === 'Suitability') {
				values[key] =
					item?.suitability != null && item?.suitability <= 100
						? parseFloat(item.suitability.toFixed(1))
						: '-';
			} else {
				values[key] =
					item?.productivity != null && item?.productivity <= 100
						? parseFloat(item.productivity.toFixed(1))
						: '-';
			}
		});
		dataMap = { [selectedSpecies]: values };
	}
</script>

<div
	transition:fade={{ delay: 100, duration: 300 }}
	class="lg:mt-3 w-full {hidden ? 'hidden' : ''}"
>
	{#if type === 'Suitability'}
		<div class="text-gray-500 text-xs">
			Reference Suitability: {species?.suitability !== null &&
			species?.suitability !== undefined &&
			species.suitability <= 100
				? species.suitability
				: ' - '}
			%
		</div>
	{:else}
		<div class="text-gray-500 text-xs">
			Reference Productivity: {species?.productivity !== null &&
			species?.productivity !== undefined &&
			species.productivity <= 100
				? species.productivity
				: ' - '} m at 100 yrs
		</div>
	{/if}

	<div class="relative overflow-x-auto mt-2 bg-white border rounded-lg shadow">
		<table class="w-full text-xs text-left">
			<thead>
				<tr>
					<th class="bg-gray-200 text-gray-500"></th>
					{#each years as year}
						<th class="bg-gray-200 text-gray-500 py-1 text-center font-semibold">{year}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#if dataMap[selectedSpecies]}
					{#each scenarios as scenario}
						<tr class="border-t h-10">
							<th class="pl-2 text-gray-600 font-semibold"
								>{scenario == 'rcp45' ? 'RCP4.5' : scenario == 'rcp85' ? 'RCP8.5' : 'Baseline'}</th
							>
							{#each years as year}
								<td class="py-2 px-1">
									{#if type == 'Productivity'}
										<div class="w-full flex justify-center">
											<MixtureTrafficLights
												speciesName={selectedSpecies}
												value={parseInt(String(dataMap[selectedSpecies][`${scenario}-${year}`]))}
											/>
										</div>
									{:else}
										<MixtureBarChart
											species_name={selectedSpecies}
											chartType={type}
											value={parseInt(String(dataMap[selectedSpecies][`${scenario}-${year}`]))}
										/>
										<div class="text-xs mt-1">
											{dataMap[selectedSpecies][`${scenario}-${year}`] ?? '-'}
										</div>
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
