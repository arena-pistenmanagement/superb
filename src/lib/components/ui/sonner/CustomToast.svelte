<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { helpTracker } from '$lib/stores/map-store';

	export let description: string;
	export let title: string | undefined = undefined;
</script>

<div class="toaster group">
	<p class="font-semibold">{title ? title : 'Instructions'}</p>
	<div class="group-[.toast]:text-muted-foreground">
		<p>{description}</p>

		{#if description.endsWith('proceed.')}
			<div class="w-full flex justify-end">
				<Button
					size="xs"
					on:click={() => {
						helpTracker.set(6);
					}}>Proceed</Button
				>
			</div>
		{/if}
	</div>
</div>
