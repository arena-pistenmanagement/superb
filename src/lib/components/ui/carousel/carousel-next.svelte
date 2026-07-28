<script lang="ts">
	import ArrowRight from 'svelte-radix/ArrowRight.svelte';
	import type { VariantProps } from 'tailwind-variants';
	import { getEmblaContext } from './context.js';
	import { cn } from '$lib/utils.js';
	import { Button, type Props, type buttonVariants } from '$lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import { selectedDataBasis } from '$lib/stores/map-store.js';

	type $$Props = Props;

	let className: $$Props['class'] = undefined;
	let innerWidth: number;

	export { className as class };
	export let variant: VariantProps<typeof buttonVariants>['variant'] = 'outline';
	export let size: VariantProps<typeof buttonVariants>['size'] = 'icon';

	const { orientation, canScrollNext, scrollNext, handleKeyDown } =
		getEmblaContext('<Carousel.Next/>');
</script>

<svelte:window bind:innerWidth />

{#if $canScrollNext}
	<div transition:fade={{ duration: 800 }}>
		<Button
			{variant}
			{size}
			class={cn(
				'absolute w-fit touch-manipulation rounded-full shadow-lg  border-zinc-700 ',
				$orientation === 'horizontal'
					? '-right-12 top-1/2 -translate-y-1/2'
					: '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
				className
			)}
			disabled={!$canScrollNext}
			on:click={() => {
				scrollNext();
				selectedDataBasis.set('Productivity');
			}}
			on:keydown={handleKeyDown}
			{...$$restProps}
		>
			<div class="flex items-center px-3 bg-[#F0FFF3] text-zinc-800 rounded-full gap-1">
				{$canScrollNext ? 'Productivity' : ''}
				<ArrowRight class="h-4 w-4" />
				<span class="sr-only">{$canScrollNext ? 'Productivity' : ''}</span>
			</div>
		</Button>
	</div>
{/if}
