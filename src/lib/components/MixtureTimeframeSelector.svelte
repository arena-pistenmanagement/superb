<script lang="ts">
	import * as Select from '$lib/components/ui/select/index.js';
	import type { Selected } from 'bits-ui';
	import Label from './ui/label/label.svelte';
	import { isMobileDevice } from '$lib/stores/map-store';
	import { CalendarDays } from 'lucide-svelte';

	export let yearSelectedItem: Selected<unknown> | undefined;
	export let year;

	const yearsItems = [
		{ value: '1995', label: 'Reference (1995)' },
		{ value: '2025', label: '2025' },
		{ value: '2055', label: '2055' },
		{ value: '2085', label: '2085' }
	];

	$: {
		yearsItems[0] = { value: '1995', label: 'Reference (1995)' };
	}
</script>

<div>
	{#if !$isMobileDevice}<Label>Selected timeframe</Label>{/if}
	<Select.Root
		selected={yearSelectedItem}
		onSelectedChange={(v) => {
			year = v?.value;
		}}
	>
		<Select.Trigger class="min-w-[180px] bg-white">
			<CalendarDays strokeWidth="1.5" size="16" />
			<Select.Value placeholder="Select a timeframe" />
		</Select.Trigger>
		<Select.Content>
			<Select.Group>
				{#each yearsItems as year}
					<Select.Item value={year.value} label={year.label}>
						{year.label}
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
		<Select.Input name="favoriteFruit" />
	</Select.Root>
</div>
