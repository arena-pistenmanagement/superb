<script lang="ts">
	import { thresholdsColor } from '$lib/utils/map/color-styling';
	import type { DataBasis } from '$lib/utils/types';
	import { onMount } from 'svelte';

	export let species_name: string | undefined = undefined;
	export let value: number;
	export let maxValue: number = 100;
	export let chartType: DataBasis;

	onMount(() => {
		value = value >= 100 ? NaN : value;
	});

	const getColor = (tempValue: number, species_name: string) => {
		return thresholdsColor(tempValue, chartType, species_name?.toLowerCase().replace(' ', '_'));
	};
</script>

<div class="relative w-full overflow-hidden h-2.5 rounded-full bg-gray-200 shadow">
	{#if chartType === 'Suitability'}
		<div
			style="width: {(value / maxValue) * 100}%; background-color:{getColor(
				value >= 100 || value == null ? NaN : value,
				species_name ?? ''
			)}"
			class="h-2.5 absolute"
		></div>
	{/if}
	{#if chartType === 'Productivity'}
		<div
			style="width: {(value / maxValue) * 100}%; background-color:{getColor(
				value >= 100 || value == null ? NaN : value,
				species_name ?? ''
			)}"
			class="h-2.5 absolute"
		></div>
	{/if}
</div>
