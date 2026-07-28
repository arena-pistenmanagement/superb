<script lang="ts">
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { CirclePlay } from 'lucide-svelte';
	import { writeLocalStorageStarterGuide } from '$lib/utils/starter-guide';
	import { X } from 'lucide-svelte';
	import { Dialog } from 'bits-ui';

	import { fade } from 'svelte/transition';
	import GettingStartedDialog from './GettingStartedDialog.svelte';
	import { starterGuideState } from '$lib/stores/starter-guide';
</script>

<Dialog.Root open={$starterGuideState == 'open'}>
	<Dialog.Trigger>
		<Tooltip.Root openDelay={150}>
			<div class="z-30 text-zinc-700">
				<Tooltip.Trigger>
					<button
						on:click={() => writeLocalStorageStarterGuide('open')}
						class="h-10 w-10 flex items-center justify-center bg-[#F0FFF3] rounded-full shadow-lg border border-zinc-700"
					>
						<CirclePlay size="20" strokeWidth="1.5" />
					</button>
				</Tooltip.Trigger>
				<Tooltip.Content side="left">
					<p>Open getting started guide</p>
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
			class="fixed left-[50%] top-[50%] z-[999] lg:w-[90%] w-[100%] h-[90%] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-gray-100 text-zinc-700 lg:p-5 p-2 outline-none lg:pt-8 pt-2"
		>
			<Dialog.Title
				class="lg:mx-4 font-semibold text-xl py-4 px-2 flex items-center justify-between"
				>Getting Started Guide
				<Dialog.Close
					on:click={() => writeLocalStorageStarterGuide('closed')}
					class="border rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98"
				>
					<X strokeWidth="1.5" size="20" />
				</Dialog.Close>
			</Dialog.Title>

			<Dialog.Description class="text-sm text-foreground-alt overflow-hidden">
				<GettingStartedDialog />
			</Dialog.Description>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
