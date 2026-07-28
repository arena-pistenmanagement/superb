<script lang="ts">
	import { type Dataset, type DataBasis } from '$lib/utils/types';
	import { lookup, selectedDataBasis } from '$lib/stores/map-store';
	import { Search } from 'lucide-svelte';
	import { orderBySubKey } from '$lib/utils/map/query-features';

	export let speciesList: Dataset = Object.values($lookup).filter(
		(element) => element.climate_scenario == 'ref'
	);
	export let tempSelectedDataBasis: DataBasis = $selectedDataBasis;
	export let sortKey: 'english_name' | 'productivity' | 'species_name' | 'suitability' =
		tempSelectedDataBasis === 'Suitability' ? 'suitability' : 'productivity';

	let value: string;

	selectedDataBasis.subscribe((value) => {
		if (sortKey != 'english_name') {
			sortKey = value === 'Suitability' ? 'suitability' : 'productivity';
		}
	});

	$: if (tempSelectedDataBasis)
		if (sortKey != 'english_name')
			sortKey = tempSelectedDataBasis === 'Suitability' ? 'suitability' : 'productivity';

	$: {
		if (value) {
			if (tempSelectedDataBasis == 'Suitability' || sortKey == 'english_name') {
				speciesList = Object.values(
					Object.values($lookup).filter((element) => element.climate_scenario == 'ref')
				).filter(
					(element) =>
						element.species_name.toLowerCase().includes(value.toLowerCase()) ||
						element.english_name.toLowerCase().includes(value.toLowerCase())
				);
			} else {
				speciesList = Object.values($lookup)
					.filter(
						(element) => element.climate_scenario == 'ref' && element.has_productivity == 'true'
					)
					.filter(
						(element) =>
							element.species_name.toLowerCase().includes(value.toLowerCase()) ||
							element.english_name.toLowerCase().includes(value.toLowerCase())
					);
			}
		} else {
			if (tempSelectedDataBasis == 'Suitability' || sortKey == 'english_name') {
				speciesList = Object.values($lookup).filter((element) => element.climate_scenario == 'ref');
			} else {
				speciesList = Object.values($lookup).filter(
					(element) => element.climate_scenario == 'ref' && element.has_productivity == 'true'
				);
			}
		}
		speciesList = orderBySubKey(speciesList, sortKey, 'ref');
	}
</script>

<div class="relative flex">
	<input
		class="h-input w-full rounded-lg border border-zinc-500 bg-white pl-10 py-1 text-sm text-zinc-700"
		type="text"
		bind:value
		placeholder="Search species ..."
	/>
	<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
		<Search strokeWidth="1.5" size="20" />
	</div>
</div>
