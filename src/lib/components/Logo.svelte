<script lang="ts">
	import logo from '$lib/assets/logo/logo.jpeg';
	export let to: string;
	export let text: string | undefined = '';
</script>

<a href={to} class="flex flex-shrink-0 items-center gap-3 p-4">
	<img width="60" class="" src={logo} alt="Logo" />
	<div class="hidden sm:block font-bold text-xl tracking-tight">{text}</div>
</a>
