<script lang="ts">
	import type { GroupItem } from '$lib/utils/types';
	import MixtureGroupSpecie from './MixtureGroupSpecie.svelte';

	export let otherGroup: GroupItem[];
	export let rank: number;
</script>

<div class="bg-white shadow border rounded-lg pt-4 mb-3">
	<div class="mt-3">
		<div class="grid grid-cols-1 gap-2 lg:gap-8 px-5 mb-2 font-bold text-lg">
			<div class="mb-2">
				<div class="font-bold text-lg">
					{rank}. Other species
				</div>
				<div class="flex flex-wrap gap-1 mt-1">
					<MixtureGroupSpecie group={otherGroup} isOtherGroup={true} />
				</div>
			</div>
		</div>
	</div>
</div>
