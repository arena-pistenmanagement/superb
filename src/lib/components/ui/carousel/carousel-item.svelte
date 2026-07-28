<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getEmblaContext } from './context.js';
	import { cn } from '$lib/utils.js';

	type $$Props = HTMLAttributes<HTMLDivElement>;
	let className: string | undefined | null = undefined;
	export { className as class };

	const { orientation } = getEmblaContext('<Carousel.Item/>');
	let innerWidth: number = 375;
</script>

<svelte:window bind:innerWidth />
<div
	role="group"
	aria-roledescription="slide"
	class={cn(
		`min-w-0 shrink-0 grow-0 lg:basis-full lg:m-4 p-2 h-60 lg:h-80 px-4`,
		$orientation === 'horizontal' ? 'lg:pl-4' : 'lg:pt-4',
		className
	)}
	style="width:{innerWidth * 0.8}px"
	data-embla-slide=""
	{...$$restProps}
>
	<slot />
</div>
