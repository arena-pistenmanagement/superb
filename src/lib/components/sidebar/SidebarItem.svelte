<script lang="ts">
	export let title: string;
	export let fullSize: boolean;
</script>

<div class="group cursor-pointer">
	<div class="flex items-center gap-2 justify-between">
		<div class="flex {fullSize ? 'flex-row gap-3' : 'flex-col gap-1'} items-center">
			<slot name="icon" />
			<span class={fullSize ? 'text-base' : 'text-xs'}>{title}</span>
		</div>
	</div>
	{#if fullSize}
		<div class="ml-4">
			<slot name="child" />
		</div>
	{/if}
</div>
