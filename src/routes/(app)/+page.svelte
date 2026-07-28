<script lang="ts">
	import Map from '$lib/components/map/Map.svelte';
	import lookupJson from '$lib/components/lookup.json';
	import thresholdsJson from '$lib/components/species_suitability_thresholds.json';
	import { lookup, thresholds, isMobileDevice } from '$lib/stores/map-store';
	import type { Dataset, Thresholds } from '$lib/utils/types';

	import MobileControls from '$lib/components/map/MobileControls.svelte';
	import { onMount } from 'svelte';
	import getMobileDevice from '$lib/utils/map/is-mobile-device';

	let innerWidth: number;

	lookup.set(structuredClone(Object.values(lookupJson)) as Dataset);
	thresholds.set(thresholdsJson as Thresholds);

	onMount(() => {
		isMobileDevice.set(getMobileDevice());
	});

	$: if (innerWidth) {
		isMobileDevice.set(getMobileDevice());
	}
</script>

<svelte:window bind:innerWidth />
<section class="overflow-hidden relative w-full h-full">
	<div class="fixed bottom-10 right-2.5 z-20 flex flex-col justify-end items-center gap-2">
		<MobileControls />
	</div>
	<Map />
</section>
