<script lang="ts">
	import ArrowLeft from 'svelte-radix/ArrowLeft.svelte';
	import type { VariantProps } from 'tailwind-variants';
	import { getEmblaContext } from './context.js';
	import { cn } from '$lib/utils.js';
	import { Button, type Props, type buttonVariants } from '$lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import { selectedDataBasis } from '$lib/stores/map-store.js';

	type $$Props = Props;

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let variant: VariantProps<typeof buttonVariants>['variant'] = 'outline';
	export let size: VariantProps<typeof buttonVariants>['size'] = 'icon';

	const { orientation, canScrollPrev, scrollPrev, handleKeyDown } =
		getEmblaContext('<Carousel.Previous/>');
</script>

{#if $canScrollPrev}
	<div transition:fade={{ duration: 800 }}>
		<Button
			{variant}
			{size}
			class={cn(
				'absolute w-fit touch-manipulation rounded-full shadow-lg  border-zinc-700 ',
				$orientation === 'horizontal'
					? '-left-36 top-1/2 -translate-y-1/2'
					: '-top-12 left-1/2 -translate-x-1/2 rotate-90',
				className
			)}
			disabled={!$canScrollPrev}
			on:click={() => {
				scrollPrev();
				selectedDataBasis.set('Suitability');
			}}
			on:keydown={handleKeyDown}
			{...$$restProps}
		>
			<div class="flex items-center px-3 bg-[#F0FFF3] text-zinc-800 rounded-full gap-1">
				{$canScrollPrev ? 'Suitability' : ''}
				<ArrowLeft class="h-4 w-4" />
				<span class="sr-only">Previous slide</span>
			</div>
		</Button>
	</div>
{/if}
