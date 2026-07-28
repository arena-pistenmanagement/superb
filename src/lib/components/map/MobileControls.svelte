<script lang="ts">
	import ColorLegend from '$lib/components/map/ColorLegend.svelte';
	import GettingStartedButton from '$lib/components/map/GettingStartedButton.svelte';
	import Help from '$lib/components/map/Help.svelte';
	import { onMount } from 'svelte';
	import MobileAttribution from './MobileAttribution.svelte';
	import { EllipsisVertical } from 'lucide-svelte';
	import { isMobileDevice } from '$lib/stores/map-store';
	import FaqButton from './FaqButton.svelte';

	let showSpeedDial: boolean = false;
	let innerHeight: number;

	onMount(() => {
		if (!$isMobileDevice) showSpeedDial = true;
	});
</script>

<svelte:window bind:innerHeight />
<div data-html2canvas-ignore>
	<div
		class="flex flex-col items-start justify-center group fixed lg:right-2.5 right-1.5 z-20 lg:bottom-10 bottom-12 pointer-events-none"
	>
		<div
			class="{showSpeedDial
				? 'flex flex-col items-center'
				: 'hidden'} mb-2 space-y-2 pointer-events-auto"
		>
			<Help />
			<FaqButton />
			<MobileAttribution />
			<GettingStartedButton />
			<ColorLegend />
		</div>

		<div class="flex flex-col items-stretch lg:justify-end justify-between pointer-events-none">
			<button
				type="button"
				class="bg-white p-2.5 rounded-full border border-zinc-700 shadow-lg h-10 w-10 flex items-center justify-center lg:hidden pointer-events-auto"
				on:click={() => {
					showSpeedDial = !showSpeedDial;
				}}
			>
				<EllipsisVertical size="20" strokeWidth="1.5" />
			</button>
			<div class="p-1 mt-2 w-10 flex flex-col items-center">
				<div id="navigation" class="text-zinc-700 border border-zinc-700 rounded" />
			</div>
		</div>
	</div>
</div>
