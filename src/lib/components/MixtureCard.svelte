<script lang="ts">
	import MixtureBarChart from './MixtureBarChart.svelte';
	import MixtureTrafficLights from './MixtureTrafficLights.svelte';
	import Button from './Button.svelte';
	import type { CustomGroup, Group, GroupItem } from '$lib/utils/types';
	import { createEventDispatcher } from 'svelte';
	import { customGroup, mixtureHashMap } from '$lib/stores/mixture-store';

	import MixtureScenarioComparison from './MixtureScenarioComparison.svelte';
	import { getEnglishSpeciesName } from '$lib/utils/map/query-features';
	import { helpTracker, isMobileDevice } from '$lib/stores/map-store';
	import MixtureGroupSpecie from './MixtureGroupSpecie.svelte';
	import { toast } from 'svelte-sonner';
	import { CirclePlus, ImageDown, Trash } from 'lucide-svelte';
	import { helpActive } from '$lib/stores/starter-guide';

	export let group: CustomGroup | Group;
	export let maxSuitability: number;
	export let isCustomGroup: boolean = false;
	export let rank: number;
	export let activeGroup: CustomGroup | Group | undefined;

	const saveCustomGroup = () => {
		customGroup.set(group as CustomGroup);
		toast.success('Custom group saved');
	};

	$: if (isCustomGroup && $customGroup) {
		group = $customGroup;
		activeGroup = undefined;
	}

	const dispatch = createEventDispatcher();

	const createCustomGroupFromSelection = (group: Group) => {
		const customSelection = {
			...group,
			selectedItems: group.items,
			isCustomGroup: true,
			name: `${group.name}_${(Math.random() + 1).toString(36).substring(7)}`
		};
		for (const item of customSelection.selectedItems) {
			item.checked = true;
		}
		customSelection.group = `based on ${group.group}`;
		dispatch('createCustomGroup', customSelection);
		toast.success('Custom group created');
		activeGroup = customSelection;
	};

	const createChangeSelection = (customGroup: Group | CustomGroup, species: GroupItem) => {
		species.checked = !species.checked;
		dispatch('createChangeSelection', { customGroup, species });
	};
</script>

<div
	class="bg-white shadow border rounded-lg mb-3 w-full snap-start flex mt-3 items-start"
	id={`mixtures-dom-${group.name}`}
>
	<div class="w-full">
		<Button
			color="ghost"
			on:click={() => {
				activeGroup = activeGroup?.name == group.name ? undefined : group;
				helpTracker.set(5);
			}}
			class="w-full text-start flex"
		>
			<div class="grid grid-cols-6 gap-2 lg:gap-x-8 px-2 pt-2 mb-2 font-bold text-lg w-full">
				<div class="col-span-6 flex justify-between items-baseline">
					{#if group.isCustomGroup}
						<div class="font-bold flex flex-col lg:flex-row lg:items-baseline">
							{rank}. Custom Group
							<p class="font-light text-xs pl-5">{group.group}</p>
						</div>
					{:else}
						{rank}. {group.name ? $mixtureHashMap[group.name] : group.group}
					{/if}
					<div
						class="flex justify-start font-normal pointer-events-none pt-3"
						role="presentation"
						on:click|stopPropagation
						on:keyup|stopPropagation
					>
						{#if !group.isCustomGroup}
							<Button
								color="primary"
								size="xs"
								on:click={() => createCustomGroupFromSelection(group)}
								class="gap-1 text-xs m-0 p-0 text-pretty pointer-events-auto"
								>Create custom group {$isMobileDevice ? '' : 'based on these species'}
								<CirclePlus strokeWidth="1.5" size="16" />
							</Button>
						{:else}
							<div class="flex flex-col lg:flex-row gap-1">
								<Button
									color="primary"
									size="xs"
									on:click={saveCustomGroup}
									class="gap-1 text-xs m-0 p-0 whitespace-nowrap pointer-events-auto"
									>Save to export
									<ImageDown strokeWidth="1.5" size="16" />
								</Button>
								<Button
									color="danger"
									size="xs"
									on:click={() => dispatch('deleteCustomGroup', group)}
									class="gap-1 text-xs m-0 p-0 whitespace-nowrap pointer-events-auto"
									>Delete
									<Trash strokeWidth="1.5" size="16" />
								</Button>
							</div>
						{/if}
					</div>
				</div>
				<div class="flex {$isMobileDevice ? 'col-span-6' : 'col-span-2'}">
					<MixtureGroupSpecie {group} />
				</div>
				<div class="col-span-3 lg:col-span-2">
					<div class="font-semibold text-sm lg:text-lg">Suitability</div>
					<div class="text-xs font-normal mb-3">in %</div>
					{#if activeGroup?.name != group.name || $isMobileDevice}
						<MixtureBarChart
							chartType="Suitability"
							value={group.groupSuitability}
							species_name={undefined}
							maxValue={maxSuitability}
						/>
						<div class="text-xs font-normal mt-1 text-gray-500">
							{group.groupSuitability <= 100 ? group.groupSuitability : '-'}
						</div>
					{/if}
				</div>
				<div class="col-span-3 lg:col-span-2">
					<div class="font-semibold text-sm lg:text-lg">Productivity</div>
					<div class="text-xs font-normal mb-2">Height [m] at 100 yrs</div>
					{#if activeGroup?.name != group.name || $isMobileDevice}
						<MixtureTrafficLights isGroup={true} value={group.groupProductivity} />
					{/if}
				</div>
			</div>
		</Button>
		{#if activeGroup?.name == group.name && !$isMobileDevice}
			<div class="px-5">
				<div
					class="grid grid-cols items-center grid-cols-3 lg:gap-8 gap-2 border-t border-zinc-300 py-2"
				>
					<div>
						<div class="font-bold">Group Average</div>
					</div>

					<div class="flex flex-col justify-between">
						<div>
							<MixtureBarChart
								chartType="Suitability"
								value={group.groupSuitability}
								species_name={undefined}
								maxValue={maxSuitability}
							/>
							<div class="text-xs mt-1 text-gray-500">
								{group.groupSuitability <= 100 ? group.groupSuitability : '-'}
							</div>
							<div class="sm:hidden text-xs">Suitability in %</div>
						</div>
					</div>
					<div class="flex flex-col justify-between">
						<MixtureTrafficLights isGroup={true} value={group.groupProductivity} />
						<div class="sm:hidden text-xs">Productivity in Height [m] at 100 yrs</div>
					</div>
				</div>
			</div>
		{/if}
		{#each group.items as species}
			<div class="{activeGroup?.name == group.name ? '' : 'hidden'} lg:px-5 px-2 lg:pt-4">
				<div
					class="grid grid-cols-1 sm:grid-cols-3 lg:gap-8 gap-2 pt-4 pb-2 border-t border-zinc-300"
				>
					<div class="flex gap-1 items-baseline h-fit">
						{#if group.isCustomGroup}
							<input
								class="cursor-pointer"
								on:click={() => createChangeSelection(group, species)}
								type="checkbox"
								bind:checked={species.checked}
							/>
						{/if}
						<div class="flex lg:flex-col items-baseline gap-x-2">
							<div class="font-bold pb-2">{species.value}</div>
							<div class="text-xs text-gray-500">
								{getEnglishSpeciesName(species.value)}
							</div>
						</div>
					</div>
					<div class="flex flex-col justify-start pl-0">
						<div class="text-xs font-bold lg:hidden">Suitability</div>
						<MixtureBarChart
							chartType="Suitability"
							species_name={species.value}
							value={species.suitability}
							maxValue={maxSuitability}
						/>
						<div class="text-xs mt-1 text-gray-500">
							{species.suitability <= 100 && species.suitability != null
								? `${species.suitability} %`
								: 'No data'}
						</div>
						{#if species.suitability != null && !isNaN(species.suitability)}
							<MixtureScenarioComparison
								hidden={activeGroup?.name != group.name}
								type="Suitability"
								selectedSpecies={species.value}
							/>
						{/if}
					</div>

					<div class="flex flex-col justify-start pl-0 pt-4 lg:pt-0">
						<div class="text-xs font-bold lg:hidden">Productivity</div>
						<div class="flex items-end gap-2 text-xs">
							<MixtureTrafficLights value={species.productivity} speciesName={species.value} />
							<div class="lg:hidden">Height [m] at 100 yrs</div>
						</div>
						{#if species.suitability != null && !isNaN(species.productivity)}
							<MixtureScenarioComparison type="Productivity" selectedSpecies={species.value} />
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
	{#if $helpTracker == 4 && $helpActive}
		<span class="relative -ml-5 -mt-1 outline outline-white rounded-full flex h-3 w-3">
			<span
				class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"
			></span>
			<span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
		</span>
	{/if}
</div>
