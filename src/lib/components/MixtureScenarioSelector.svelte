<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Selected } from 'bits-ui';
	import Label from './ui/label/label.svelte';
	import { isMobileDevice, species_scenario_A } from '$lib/stores/map-store';
	import { Thermometer } from 'lucide-svelte';

	const climateScenarioItems = [
		{ value: 'ref', label: 'Reference' },
		{ value: 'rcp45', label: 'RCP4.5' },
		{ value: 'rcp85', label: 'RCP8.5' }
	];
	export let scenarioSelectedItem: Selected<unknown> | undefined;
	export let scenario;
</script>

<div>
	{#if !$isMobileDevice}<Label>Selected climate scenario</Label>{/if}
	<Select.Root
		selected={scenarioSelectedItem}
		onSelectedChange={(v) => {
			scenario = v?.value;
		}}
	>
		<Select.Trigger
			disabled={scenarioSelectedItem?.value ? false : true}
			class="min-w-[120px] bg-white "
		>
			<Thermometer strokeWidth="1.5" size="16" />
			<Select.Value placeholder="Select a climate scenario" />
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#each climateScenarioItems as scenario}
					<Select.Item
						value={scenario.value}
						label={scenario.label}
						disabled={($species_scenario_A?.climate_scenario == 'ref' &&
							(scenario.value == 'rcp45' || scenario.value == 'rcp85')) ||
							($species_scenario_A?.climate_scenario != 'ref' && scenario.value == 'ref')}
						>{scenario.label}</Select.Item
					>
				{/each}
			</Select.Group>
		</Select.Content>
		<Select.Input name="favoriteFruit" />
	</Select.Root>
</div>
