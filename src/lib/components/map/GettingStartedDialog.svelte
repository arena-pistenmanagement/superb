<script lang="ts">
	import { writeLocalStorageStarterGuide } from '$lib/utils/starter-guide';
	import Button from '../Button.svelte';
	import { faqDialogOpen } from '$lib/stores/map-store';
	let innerHeight: number;
</script>

<svelte:window bind:innerHeight />

<div class="prose-sm overflow-auto pb-8" style="height: {innerHeight * 0.8}px">
	<div class="text-sm px-8 mb-8">
		<div class="font-medium text-sm mt-2 py-8 pb-1">About the Tool</div>
		This tool was developed under the
		<strong> SUPERB project</strong> (<a
			class="mt-2 text-primary underline"
			href="https://forest-restoration.eu/">https://forest-restoration.eu/</a
		>) to help stakeholders select
		<strong
			>climate-adapted tree species, species compositions, and provenances for restoration,
			reforestation, and afforestation</strong
		>
		projects.

		<div class="font-medium text-sm mt-2 py-8 pb-1">How to Use the Tool</div>
		<span>1. Select a Location</span>
		<br />
		<p class="font-light mb-3">
			Enter or click on your area of interest to receive tailored species recommendations.
		</p>
		<span>2. Explore Species Suitability and Productivity </span>
		<br />
		<p class="font-light mb-3">
			View a ranked list of tree species based on their suitability for the selected location under
			different climate scenarios. Explore species productivity and visualize how climate change
			affects growth potential.
		</p>
		<span> 3. Assess Species Compositions </span>
		<br />
		<p class="font-light mb-3">
			Discover species groupings designed to maximize biodiversity and enhance resilience.
		</p>
		<span>4. Identify Optimal Seed Sources </span>
		<br />
		<p class="font-light mb-3">
			Find the optimal seed source for your area of interest and species, tailored to future climate
			scenarios.
		</p>
		<span>5. Export Results</span>
		<br />
		<p class="font-light mb-3">
			Download the report containing suitability and productivity values, optimal species
			compositions, seed source information, and guidance on assessing natural regeneration
			feasibility to support informed decisions on seeding or planting strategies.
		</p>

		<div class="font-medium text-sm mt-2 py-8 pb-1">Need Help?</div>
		For further guidance, please refer to the <Button
			color="ghost"
			size="xs"
			extraStyle="!inline-block underline"
			on:click={() => {
				writeLocalStorageStarterGuide('closed');
				$faqDialogOpen = true;
			}}
			on:keydown={() => {
				writeLocalStorageStarterGuide('closed');
				$faqDialogOpen = true;
			}}
		>
			FAQ ->
		</Button> section. Get started today and build climate-resilient forests!
	</div>
</div>
