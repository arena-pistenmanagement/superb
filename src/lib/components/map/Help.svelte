<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { CircleHelp } from 'lucide-svelte';
	import setClickInstructions from '$lib/utils/map/click-instructions';
	import { helpActive } from '$lib/stores/starter-guide';
	import { onMount } from 'svelte';

	let isPulsing = true;

	onMount(() => {
		helpActive.set(false);

		setTimeout(() => {
			isPulsing = false;
		}, 10000);
	});

	function activateHelp() {
		helpActive.set(!$helpActive);
		setClickInstructions();
	}
</script>

<Tooltip.Root openDelay={150}>
	<div class="z-30 text-zinc-700">
		{#if isPulsing || $helpActive}
			<span
				class="relative ml-7 -mb-2.5 outline outline-white outline-1.5 rounded-full flex h-3 w-3 z-50"
			>
				<span
					class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
				></span>
				<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
			</span>
		{/if}
		<Tooltip.Trigger>
			<button
				on:click={() => activateHelp()}
				class="h-10 w-10 flex items-center justify-center border border-zinc-700 bg-[#F0FFF3] rounded-full shadow-lg"
			>
				<CircleHelp size="20" strokeWidth="1.5" />
			</button>
		</Tooltip.Trigger>
		<Tooltip.Content side="left">
			<p>Activate Help</p>
		</Tooltip.Content>
	</div>
</Tooltip.Root>
