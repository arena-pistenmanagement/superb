<script lang="ts">
	import { productivityThresholdsColor } from '$lib/utils/map/color-styling';
	export let value: number;
	export let isGroup: boolean = false;
	export let speciesName = '';

	let color = productivityThresholdsColor(value, speciesName);

	$: if (value || speciesName) color = productivityThresholdsColor(value, speciesName);
</script>

<div
	style="background-color: {color.backgroundColor}; color: {color.textColor}"
	class="h-7 w-7 flex items-center justify-center text-sm shadow rounded-full {isGroup
		? '!bg-[#4b5563] !text-white'
		: ''}"
>
	{value > 100 || isNaN(value) || value == null ? '-' : value}
</div>
