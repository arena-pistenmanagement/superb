<script lang="ts">
	import {
		species_scenario_A,
		species_scenario_B,
		selectedDataBasis,
		helpTracker,
		popoverIsOpen
	} from '$lib/stores/map-store';
	import { CircleSlash2, Sprout, SplitSquareVertical } from 'lucide-svelte';
	import Button from '../Button.svelte';
	import SelectorPopover from './SelectorPopover.svelte';
	import { ClimateScenarios } from '$lib/utils/types';
	import { helpActive } from '$lib/stores/starter-guide';

	let isOpenA = false;
	let isOpenB = false;

	$: if (isOpenA || isOpenB) {
		popoverIsOpen.set(true);
	} else if (!isOpenA && !isOpenB) {
		popoverIsOpen.set(false);
	}

	const handleCompare = () => {
		if ($species_scenario_A) species_scenario_B.set($species_scenario_A);
		if ($helpTracker && $helpTracker < 3) {
			helpTracker.set(2.1);
		}
	};
</script>

{#if !$species_scenario_B && $species_scenario_A}
	<div
		class="fixed !z-20 bottom-2 px-1 flex justify-start items-end w-full pointer-events-none gap-1"
	>
		<SelectorPopover scenario="A" bind:isOpen={isOpenA}>
			<div slot="button-text" class="flex">
				<Sprout strokeWidth="1.5" size="16" />
				<div class="flex flex-wrap gap-x-2 items-start text-left">
					<p class="font-bold">{$species_scenario_A.species_name}</p>
					<p>
						{ClimateScenarios[$species_scenario_A?.climate_scenario]}
						- {$species_scenario_A.timeframe}
						- {$selectedDataBasis == 'Productivity' ? 'Prod' : 'Suit'}
					</p>
				</div>
			</div>
			<p slot="tooltip-content">Change Species, Scenario, Year and Databasis</p>
		</SelectorPopover>

		{#if !($helpTracker == 6)}
			<div
				class="border border-zinc-600 cursor-pointer bg-gray-100 hover:bg-[#c3e3c9] transition-all rounded-full w-fit flex flex-0 pointer-events-auto"
			>
				<Button
					color="ghost"
					class="border-0 rounded-full hover:rounded-full shadow-lg !px-3 text-xs flex flex-0"
					on:click={handleCompare}
				>
					Compare
					<SplitSquareVertical strokeWidth="1.5" size="16" />
				</Button>
				{#if $helpTracker == 2 && $helpActive}
					<span class="relative -ml-2 outline outline-white outline-1.5 rounded-full flex h-3 w-3">
						<span
							class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
						></span>
						<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
					</span>
				{/if}
			</div>
		{/if}
	</div>
{:else if $species_scenario_A && $species_scenario_B}
	<div
		class="fixed !z-20 pt-20 pb-2 px-2 flex flex-col justify-between items-start h-full w-full pointer-events-none"
	>
		<div class="flex">
			<SelectorPopover scenario="B" side="right" bind:isOpen={isOpenB}>
				<div slot="button-text" class="flex">
					<Sprout strokeWidth="1.5" size="16" />
					<div class="flex flex-wrap gap-x-2 items-start text-left">
						<p class="font-bold">{$species_scenario_B.species_name}</p>
						<p>
							{ClimateScenarios[$species_scenario_B?.climate_scenario]}
							- {$species_scenario_B.timeframe}
							- {$selectedDataBasis == 'Productivity' ? 'Prod' : 'Suit'}
						</p>
					</div>
				</div>
				<p slot="tooltip-content">Change Species, Scenario, Year and Databasis</p>
			</SelectorPopover>
			{#if $helpTracker == 2.1 && $helpActive}
				<span
					class="relative -ml-3 outline outline-white outline-1.5 rounded-full flex h-3 w-3 z-50"
				>
					<span
						class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
					></span>
					<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
				</span>
			{/if}
		</div>

		<div class="flex w-fit justify-start items-end gap-2">
			<div class="flex">
				<SelectorPopover scenario="A" bind:isOpen={isOpenA}>
					<div slot="button-text" class="flex">
						<Sprout strokeWidth="1.5" size="16" />
						<div class="flex flex-wrap gap-x-2 items-start text-left">
							<p class="font-bold">{$species_scenario_A.species_name}</p>
							<p>
								{ClimateScenarios[$species_scenario_A?.climate_scenario]}
								- {$species_scenario_A.timeframe}
								- {$selectedDataBasis == 'Productivity' ? 'Prod' : 'Suit'}
							</p>
						</div>
					</div>
					<p slot="tooltip-content">Change Species, Scenario, Year and Databasis</p>
				</SelectorPopover>
				{#if $helpTracker == 2.1 && $helpActive}
					<span
						class="relative -ml-3 outline outline-white outline-1.5 rounded-full flex h-3 w-3 z-50"
					>
						<span
							class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
						></span>
						<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
					</span>
				{/if}
			</div>

			<div
				class="border border-zinc-600 cursor-pointer bg-gray-100 hover:bg-[#c3e3c9] transition-all rounded-full w-fit h-fit flex justify-end flex-0"
			>
				<Button
					color="ghost"
					class="border-0 rounded-full hover:rounded-full shadow-lg px-2 text-xs lg:text-sm min-w-1/3 flex flex-0 pointer-events-auto"
					on:click={() => {
						species_scenario_B.set(undefined);
					}}
				>
					Stop
					<CircleSlash2 strokeWidth="1.5" size="16" />
				</Button>
			</div>
		</div>
	</div>
{/if}
