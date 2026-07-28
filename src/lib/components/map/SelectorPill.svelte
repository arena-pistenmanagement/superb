<script lang="ts">
	import {
		species_scenario_A,
		species_scenario_B,
		selectedDataBasis,
		helpTracker,
		speciesDialogOpen,
		isMobileDevice,
		popoverIsOpen
	} from '$lib/stores/map-store';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { SplitSquareHorizontal, CircleSlash2, Sprout } from 'lucide-svelte';
	import Button from '../Button.svelte';
	import SelectorPopover from './SelectorPopover.svelte';
	import SelectorPillMobile from './SelectorPillMobile.svelte';
	import { onMount } from 'svelte';
	import { ClimateScenarios } from '$lib/utils/types';
	import { helpActive } from '$lib/stores/starter-guide';

	let isOpenA = false;
	let isOpenB = false;

	onMount(() => {
		helpTracker.set(2);
	});

	const handleCompare = () => {
		if ($species_scenario_A) species_scenario_B.set($species_scenario_A);
		if ($helpTracker && $helpTracker < 3) {
			helpTracker.set(2.1);
			speciesDialogOpen.set(false);
		}
	};

	popoverIsOpen.subscribe((value) => {
		if (value && !isOpenA && !isOpenB) isOpenA = true;
	});

	$: if (isOpenA || isOpenB) {
		popoverIsOpen.set(true);
	} else if (!isOpenA && !isOpenB) {
		popoverIsOpen.set(false);
	}
</script>

{#if $isMobileDevice}
	<SelectorPillMobile />
{:else if !$species_scenario_B && $species_scenario_A}
	<div class="fixed z-40 h-dvh w-full pointer-events-none">
		<div class="flex flex-row w-full h-full pb-2 justify-center items-end gap-2">
			<div>
				<SelectorPopover scenario="A" bind:isOpen={isOpenA}>
					<div slot="button-text" class="flex">
						<Sprout strokeWidth="1.5" size="16" />
						<div class="flex flex-wrap gap-x-2 items-start text-left">
							<p class="font-bold">{$species_scenario_A.species_name}</p>
							<p>
								{ClimateScenarios[$species_scenario_A?.climate_scenario]}
								- {$species_scenario_A.timeframe}
								- {$selectedDataBasis == 'Productivity' ? 'Productivity' : 'Suitability'}
							</p>
						</div>
					</div>
					<p slot="tooltip-content">Change Species, Scenario, Year and Databasis</p>
				</SelectorPopover>
			</div>
			{#if $helpTracker != 6}
				<div
					class="border border-zinc-600 cursor-pointer bg-[#F0FFF3] hover:bg-[#c3e3c9] transition-all rounded-full w-fit h-fit pointer-events-auto"
				>
					<Tooltip.Root openDelay={150}>
						<Tooltip.Trigger class="flex">
							<Button
								color="ghost"
								class="border-0 rounded-full hover:rounded-full shadow-lg !px-10 text-xs lg:text-sm"
								on:click={handleCompare}
							>
								Compare
								<SplitSquareHorizontal strokeWidth="1.5" size="16" />
							</Button>
							{#if $helpTracker == 2 && $helpActive}
								<span
									class="relative -ml-2 outline outline-white outline-1.5 rounded-full flex h-3 w-3"
								>
									<span
										class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
									></span>
									<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
								</span>
							{/if}
						</Tooltip.Trigger>
						<Tooltip.Content>
							<p>Compare two datasets on a split-screen</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</div>
			{/if}
		</div>
	</div>
{:else if $species_scenario_A && $species_scenario_B}
	<div class="fixed z-40 bottom-2 flex flex-cols-2 justify-between w-full">
		<div class="w-1/2 flex justify-center">
			<SelectorPopover scenario="B" bind:isOpen={isOpenB}>
				<div slot="button-text" class="flex">
					<Sprout strokeWidth="1.5" size="16" />
					<div class="flex flex-wrap gap-x-2 items-start text-left">
						<p class="font-bold">{$species_scenario_B.species_name}</p>
						<p>
							{ClimateScenarios[$species_scenario_B?.climate_scenario]}
							- {$species_scenario_B.timeframe}
							- {$selectedDataBasis == 'Productivity' ? 'Productivity' : 'Suitability'}
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
			class="border border-zinc-600 cursor-pointer bg-[#F0FFF3] hover:bg-[#c3e3c9] flex rounded-full w-fit"
		>
			<Tooltip.Root openDelay={150}>
				<Tooltip.Trigger>
					<Button
						color="ghost"
						class="border-0 rounded-full hover:rounded-full shadow-lg  px-5"
						on:click={() => species_scenario_B.set(undefined)}
					>
						<CircleSlash2 strokeWidth="1.5" size="16" />
					</Button>
				</Tooltip.Trigger>
				<Tooltip.Content>
					<p>Stop comparing and return to single map</p>
				</Tooltip.Content>
			</Tooltip.Root>
		</div>
		<div class="w-1/2 flex justify-center">
			<SelectorPopover scenario="A" side="right" bind:isOpen={isOpenA}>
				<div slot="button-text" class="flex">
					<Sprout strokeWidth="1.5" size="16" />
					<div class="flex flex-wrap gap-x-2 items-start text-left">
						<p class="font-bold">{$species_scenario_A.species_name}</p>
						<p>
							{ClimateScenarios[$species_scenario_A?.climate_scenario]}
							- {$species_scenario_A.timeframe}
							- {$selectedDataBasis == 'Productivity' ? 'Productivity' : 'Suitability'}
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
	</div>
{/if}
