<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { tv } from 'tailwind-variants';

	const dispatch = createEventDispatcher();

	const onClick = () => {
		dispatch('click');
	};

	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'sm';
	export let color: 'primary' | 'secondary' | 'success' | 'tertiary' | 'ghost' | 'danger' =
		'primary';
	export let disabled: boolean = false;
	export let id: string | undefined = undefined;
	export let extraStyle: string = '';

	const button = tv({
		base: 'rounded-lg px-4 py-1 transition-all flex gap-1 items-center border ring-none focus:ring-none',
		variants: {
			color: {
				primary: 'bg-white hover:bg-[#c3e3c9]  text-zinc-800 border-zinc-700',
				secondary: 'bg-[#5DB570] hover:bg-[#3e9d53] text-white border-white',
				success: 'bg-green-300 hover:bg-green-400 text-green-800',
				danger: 'border-red-600 hover:bg-red-600 text-red-600 hover:text-white',
				tertiary: 'bg-orange-300 hover:bg-orange-400 text-orange-800',
				ghost: 'bg-transparent hover:bg-zinc-200  text-zinc-800 border-none'
			},
			size: {
				xs: 'text-xs',
				sm: 'text-sm',
				md: 'text-base',
				lg: 'px-4 py-3 text-lg'
			}
		},
		compoundVariants: [
			{
				size: ['sm', 'md'],
				class: 'px-3 py-2'
			},
			{
				size: 'xs',
				class: 'px-2 py-1'
			}
		],
		defaultVariants: {
			size: 'sm',
			color: 'primary'
		}
	});

	let style = button({ size, color });
</script>

<button
	{disabled}
	{id}
	on:click={onClick}
	class="{$$restProps.class} {style} {disabled
		? 'cursor-not-allowed opacity-50 text-dark'
		: ''} {extraStyle}"
>
	<slot name="icon" />
	<slot />
</button>
