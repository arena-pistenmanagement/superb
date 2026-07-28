<script lang="ts">
	import { X } from 'lucide-svelte';
	import Button from './Button.svelte';
	import { isMobileDevice } from '$lib/stores/map-store';
	import { fly } from 'svelte/transition';

	export let sidebarIsOpen: boolean = true;
	export let classes: string | undefined = undefined;
	export let side: string = 'left';
	export let onContentScroll: (event: Event) => void = () => {};

	let clientHeight: number;
	let clientHeightHeader: number;
	let clientHeightFooter: number = 0;
	let sidebar: HTMLDivElement;

	// avoid overlapping sidebars in mobilemode
	$: if (sidebar && $isMobileDevice && side == 'right') {
		let leftSidebar = document?.getElementById('sidebar-left');
		leftSidebar?.classList.add('hidden');
	}
</script>

{#if sidebarIsOpen}
	<div
		id={`sidebar-${side}`}
		bind:this={sidebar}
		class="pointer-events-auto z-30 {$isMobileDevice && side == 'right' ? 'order-2' : ''}"
	>
		<div
			in:fly={{
				duration: 700,
				x: $isMobileDevice ? 0 : side == 'right' ? 1000 : -1000,
				y: $isMobileDevice ? 2000 : 0
			}}
			out:fly={{
				duration: 2000,
				x: $isMobileDevice ? 0 : side == 'right' ? 2000 : -2000,
				y: $isMobileDevice ? 2000 : 0
			}}
			bind:clientHeight
			class="fixed lg:top-20 gap-1 lg:bottom-4 bottom-0 {side == 'right'
				? 'right-0 lg:right-4'
				: 'left-0 lg:left-4'} bg-gray-100 border border-zinc-700 shadow-lg lg:w-1/3 lg:max-w-1/3 w-full rounded-lg p-3 lg:px-4 pb-2 min-h-1/3 overflow-hidden {classes
				? classes
				: ''}"
		>
			<div bind:clientHeight={clientHeightHeader} class="sticky">
				<div class="flex justify-between items-center">
					<div class="*:flex *:gap-4 *:items-center w-full">
						<slot name="header"></slot>
					</div>
					<Button
						color="ghost"
						size="lg"
						on:click={() => {
							sidebarIsOpen = false;
						}}><X size="20" color="gray" /></Button
					>
				</div>
				<div class="flex flex-col justify-between items-start py-1 lg:mr-4 lg:pb-2 w-full">
					<p class="lg:text-sm text-xs font-light pb-2 w-full">
						<slot name="description"></slot>
					</p>
				</div>
			</div>
			<div
				class="overflow-y-auto"
				on:scroll={onContentScroll}
				style={!$isMobileDevice
					? `height: ${clientHeight - clientHeightHeader - clientHeightFooter - 30}px`
					: ''}
			>
				<slot name="content" />
			</div>
			<div
				bind:clientHeight={clientHeightFooter}
				class="absolute w-full lg:bottom-4 bottom-0 bg-gray-100"
			>
				<slot name="footer" />
			</div>
		</div>
	</div>
{/if}
