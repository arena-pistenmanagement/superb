<script lang="ts">
	import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';
	import {
		mixtureDialogOpen,
		speciesDialogOpen,
		isMobileDevice,
		helpTracker
	} from '$lib/stores/map-store';

	type $$Props = SonnerProps;
	let position: SonnerProps['position'];
	let offset: SonnerProps['offset'];

	$: if ($isMobileDevice) {
		position = 'top-center';
	} else {
		position = $mixtureDialogOpen ? 'bottom-right' : 'top-right';
	}

	mixtureDialogOpen.subscribe((value) => {
		position = value || $speciesDialogOpen ? 'bottom-right' : 'top-right';
	});
</script>

<Sonner
	theme="light"
	class="toaster group"
	{position}
	expand={true}
	{offset}
	closeButton={true}
	visibleToasts={1}
	toastOptions={{
		classes: {
			toast: `${$isMobileDevice && [0, 3, 5, 6].includes($helpTracker) ? 'mt-16' : ''} group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-zinc-400 group-[.toaster]:shadow-lg shadow-lg`,
			description: 'group-[.toast]:text-muted-foreground',
			actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
			cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
			closeButton:
				'group-[.toast]:bg-white group-[.toast]:text-zinc-800 border border-zinc-400 group-[.toast]:hover:border group-[.toast]:hover:border-red-400'
		}
	}}
	{...$$restProps}
/>
