<script lang="ts">
	import { textThresholdsColor, thresholdsColor } from '$lib/utils/map/color-styling';
	import type { CustomGroup, DataBasis, Group, GroupItem } from '$lib/utils/types';

	export let chartType: DataBasis = 'Suitability';
	export let group: CustomGroup | Group | GroupItem[];
	export let isOtherGroup: boolean = false;

	const getColor = (tempValue: number, species_name: string) => {
		return thresholdsColor(tempValue, chartType, species_name?.toLowerCase().replace(' ', '_'));
	};

	const getText = (tempValue: number, species_name: string) => {
		return textThresholdsColor(tempValue, chartType, species_name?.toLowerCase().replace(' ', '_'));
	};

	$: groupData = group as Group;
	$: otherSpecies = group as GroupItem[];
</script>

{#if !isOtherGroup && groupData.isCustomGroup}
	<div class="flex lg:flex-wrap items-start h-fit gap-1 mt-1 overflow-auto no-scrollbar">
		{#each groupData.items as species}
			{#if species.checked}
				{#if chartType === 'Suitability'}
					<div
						class="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-normal"
						style="background-color:{getColor(
							species?.suitability,
							species?.value
						)}; color: {getText(species.suitability, species.value)}"
					>
						{species.value}
					</div>
				{/if}
			{/if}
		{/each}
	</div>
{:else if isOtherGroup}
	<div class="flex lg:flex-wrap items-start h-fit gap-1 mt-1 overflow-auto no-scrollbar">
		{#each otherSpecies as species}
			{#if chartType === 'Suitability'}
				<div
					class="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-normal"
					style="background-color:{getColor(species.suitability, species?.value)}; color: {getText(
						species.suitability,
						species.value
					)}"
				>
					{species.value}
				</div>
			{/if}
		{/each}
	</div>
{:else}
	<div class="flex lg:flex-wrap items-start h-fit gap-1 mt-1 overflow-auto no-scrollbar">
		{#each groupData.items as species}
			{#if chartType === 'Suitability'}
				<div
					class="flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-normal"
					style="background-color:{getColor(species.suitability, species.value)}; color: {getText(
						species.suitability,
						species.value
					)}"
				>
					{species.value}
				</div>
			{/if}
		{/each}
	</div>
{/if}
