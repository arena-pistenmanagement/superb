<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import Cross2 from 'svelte-radix/Cross2.svelte';
	import * as Dialog from './index.js';
	import { cn, flyAndScale } from '$lib/utils.js';
	import { mixtureDialogOpen, speciesDialogOpen } from '$lib/stores/map-store.js';

	type $$Props = DialogPrimitive.ContentProps;

	let className: $$Props['class'] = undefined;
	export let transition: $$Props['transition'] = flyAndScale;
	export let transitionConfig: $$Props['transitionConfig'] = {
		duration: 200
	};
	export { className as class };

	function closeDialogs() {
		mixtureDialogOpen.set(false);
		speciesDialogOpen.set(false);
	}
</script>

<Dialog.Portal>
	<Dialog.Overlay />
	<DialogPrimitive.Content
		{transition}
		{transitionConfig}
		class={cn(
			'fixed grid grid-flow-row left-[50%] top-[50%] z-50 w-full lg:max-w-[80%] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white text-zinc-700 p-5 shadow-popover outline-none md:w-full',
			className
		)}
		{...$$restProps}
	>
		<slot />
		<DialogPrimitive.Close
			on:click={() => closeDialogs()}
			class="absolute right-4 top-4 rounded-lg opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
		>
			<Cross2 class="h-5 w-5" />
			<span class="sr-only">Close</span>
		</DialogPrimitive.Close>
	</DialogPrimitive.Content>
</Dialog.Portal>
