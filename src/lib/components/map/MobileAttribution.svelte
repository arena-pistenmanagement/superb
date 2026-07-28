<script lang="ts">
	import { Info, X } from 'lucide-svelte';
	import { Dialog } from 'bits-ui';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { fade } from 'svelte/transition';
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Tooltip.Root openDelay={150}>
			<div class="z-30 text-zinc-700">
				<Tooltip.Trigger>
					<button
						class="h-10 w-10 flex items-center justify-center border border-zinc-500 bg-[#F0FFF3] rounded-full shadow-lg"
					>
						<Info size="20" strokeWidth="1.5" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="left">
					<p>See attribution</p>
				</Tooltip.Content>
			</div>
		</Tooltip.Root>
	</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay
			transition={fade}
			transitionConfig={{ duration: 150 }}
			class="fixed inset-0 z-50 bg-black/80"
		/>
		<Dialog.Content
			class="fixed left-[50%] top-[50%] z-50 lg:max-w-[80%] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-[#F0FFF3] text-zinc-700 lg:p-5 p-2 shadow-popover outline-none w-fit h-fit lg:pt-8 pt-2"
		>
			<Dialog.Title class="lg:mx-4">Attribution</Dialog.Title>

			<Dialog.Description class="text-sm text-foreground-alt">
				<div class="text-black text-xs p-8 flex flex-col">
					<a href="https://powergis.at/" target="_blank" title="Powergis GmbH" aria-label="Mapbox"
						>© PowerGIS GmbH</a
					>
					<a
						href="https://www.mapbox.com/about/maps/"
						target="_blank"
						title="Mapbox"
						aria-label="Mapbox">© Mapbox</a
					>
					<a
						href="https://www.openstreetmap.org/about/"
						target="_blank"
						title="OpenStreetMap"
						aria-label="OpenStreetMap">© OpenStreetMap</a
					>
					<a href="https://www.maxar.com/" target="_blank" title="Maxar" aria-label="Maxar"
						>© Maxar</a
					>
				</div>
			</Dialog.Description>
			<Dialog.Close
				class="absolute right-5 lg:top-5 top-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98"
			>
				<X strokeWidth="1.5" size="20" />
			</Dialog.Close>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
