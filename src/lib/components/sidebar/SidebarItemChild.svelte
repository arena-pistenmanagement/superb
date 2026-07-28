<script lang="ts">
	export let title: string;
	export let fullSize: boolean;
</script>

{#if fullSize}
	<div class="text-sm">{title}</div>
{/if}
