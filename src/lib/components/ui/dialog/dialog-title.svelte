<script lang="ts">
	import { Dialog as DialogPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	type $$Props = DialogPrimitive.TitleProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<DialogPrimitive.Title
	class={cn('text-left text-sm lg:mx-2 max-h-[20%]', className)}
	{...$$restProps}
>
	<slot />
</DialogPrimitive.Title>
