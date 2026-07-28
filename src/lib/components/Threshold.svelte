<script lang="ts">
	import { selectedDataBasis } from '$lib/stores/map-store';
	import type { DataBasis } from '$lib/utils/types';

	export let switchScale: boolean = true;
	export let tempSelectedDataBasis: DataBasis = $selectedDataBasis;

	let good: string;
	let neutral: string;
	let bad: string;

	selectedDataBasis.subscribe((value) => {
		good = value == 'Productivity' && switchScale ? 'high' : 'good';
		neutral = value == 'Productivity' && switchScale ? 'medium' : 'neutral';
		bad = value == 'Productivity' && switchScale ? 'low' : 'insufficient';
	});

	$: if (tempSelectedDataBasis) {
		good = tempSelectedDataBasis == 'Productivity' ? 'high' : 'good';
		neutral = tempSelectedDataBasis == 'Productivity' ? 'medium' : 'neutral';
		bad = tempSelectedDataBasis == 'Productivity' ? 'low' : 'insufficient';
	}
</script>

<div class="flex gap-4 *:text-xs font-light w-full items-end justify-end">
	<!-- <div class="grid grid-cols-3 gap-2 w-full"> -->
	<div class="flex items-end gap-1">
		<div class="h-4 bg-green-500 rounded-full w-4 my-0.5"></div>
		{good}
	</div>
	<div class=" flex items-end gap-1">
		<div class="h-4 bg-yellow-400 rounded-full w-4 my-0.5"></div>
		{neutral}
	</div>
	<div class="flex items-end gap-1">
		<div class="h-4 bg-red-400 rounded-full w-4 my-0.5"></div>
		<p>{bad}</p>
	</div>
	<!-- </div> -->
</div>
