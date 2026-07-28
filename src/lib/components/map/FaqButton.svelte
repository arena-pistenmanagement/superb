<script lang="ts">
	import { X } from 'lucide-svelte';
	import { Dialog } from 'bits-ui';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { fade } from 'svelte/transition';
	import Faq from '../Faq.svelte';
	import { faqDialogOpen } from '$lib/stores/map-store';
</script>

<Dialog.Root open={$faqDialogOpen}>
	<Dialog.Trigger>
		<Tooltip.Root openDelay={150}>
			<div class="z-30 text-zinc-700">
				<Tooltip.Trigger>
					<button
						class="h-10 w-10 flex items-center justify-center border border-zinc-500 bg-[#F0FFF3] rounded-full shadow-lg text-xs"
					>
						FAQ
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="left">
					<p>Frequently asked questions</p>
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
			class="fixed left-[50%] top-[50%] z-50 lg:w-[90%] w-[100%] h-[90%] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-gray-100 text-zinc-700 lg:p-5 p-2 shadow-popover outline-none lg:pt-8 pt-2"
		>
			<Dialog.Title
				class="lg:mx-4 font-semibold text-xl py-4 px-2 flex items-center justify-between"
				>Frequently asked questions
				<Dialog.Close
					class="border rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98"
				>
					<X strokeWidth="1.5" size="20" />
				</Dialog.Close>
			</Dialog.Title>

			<Dialog.Description class="text-sm text-foreground-alt overflow-hidden">
				<Faq />
			</Dialog.Description>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
