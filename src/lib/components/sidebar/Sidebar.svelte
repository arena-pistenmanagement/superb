<script lang="ts">
	import { ChevronLeft, ChevronRight, LayoutDashboard, Settings, Workflow } from 'lucide-svelte';
	import SidebarItem from './SidebarItem.svelte';
	import SidebarItemChild from './SidebarItemChild.svelte';
	let minimizer: boolean = false;
	let isFullWidth: boolean = false;
</script>

<aside
	on:mouseenter={() => (minimizer = true)}
	on:mouseleave={() => (minimizer = false)}
	class="{isFullWidth
		? 'w-fit'
		: 'w-30 items-center'} hidden transition-all p-3 py-6 border-r h-full sm:flex flex-col gap-6 relative"
>
	{#if minimizer}
		<button
			class="absolute bg-zinc-50 rounded-r-lg border py-2 top-1/2 translate-x-full z-20 right-0"
			on:click={() => (isFullWidth = !isFullWidth)}
		>
			{#if isFullWidth}
				<ChevronLeft />
			{:else}
				<ChevronRight />
			{/if}
		</button>
	{/if}
	<SidebarItem title={'Dashboard'} fullSize={isFullWidth}>
		<div slot="icon">
			<LayoutDashboard strokeWidth={1.5} size="20" />
		</div>
	</SidebarItem>
	<SidebarItem title={'Settings'} fullSize={isFullWidth}>
		<div slot="icon">
			<Settings strokeWidth={1.5} size="20" />
		</div>
	</SidebarItem>
	<SidebarItem title={'Workflow'} fullSize={isFullWidth}>
		<div slot="icon">
			<Workflow strokeWidth={1.5} size="20" />
		</div>
		<div slot="child">
			<SidebarItemChild title={'Automation'} fullSize={isFullWidth} />
			<SidebarItemChild title={'Tasks'} fullSize={isFullWidth} />
		</div>
	</SidebarItem>
</aside>
