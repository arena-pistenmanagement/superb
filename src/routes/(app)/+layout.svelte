<script>
	import '../../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
</script>

<Toaster richColors />
<div class="w-screen h-dvh max-h-screen overflow-hidden flex flex-col items-start">
	<main class="w-full flex-1 bg-zinc-50">
		<slot />
	</main>
</div>
