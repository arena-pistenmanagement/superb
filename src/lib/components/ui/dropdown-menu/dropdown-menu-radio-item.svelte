<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type $$Props = DropdownMenuPrimitive.RadioItemProps;
	type $$Events = DropdownMenuPrimitive.RadioItemEvents;

	let className: $$Props['class'] = undefined;
	export let value: DropdownMenuPrimitive.RadioItemProps['value'];
	export { className as class };
</script>

<DropdownMenuPrimitive.RadioItem
	class={cn(
		'relative hover:bg-zinc-200  cursor-pointer flex select-none items-center rounded-sm py-1.5 px-4 text-sm outline-none data-[disabled]:pointer-events-none  data-[disabled]:opacity-50 ',
		className
	)}
	{value}
	{...$$restProps}
	on:click
	on:keydown
	on:focusin
	on:focusout
	on:pointerdown
	on:pointerleave
	on:pointermove
>
	<slot />
</DropdownMenuPrimitive.RadioItem>
