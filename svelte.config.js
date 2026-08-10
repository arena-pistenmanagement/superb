import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		csp: {
			mode: 'auto',
			directives: {
				'default-src': ['self'],
				'base-uri': ['self'],
				'child-src': ['self', 'blob:'],
				'connect-src': ['self', 'https:'],
				'font-src': ['self', 'data:'],
				'form-action': ['self'],
				'frame-ancestors': ['none'],
				'frame-src': ['none'],
				'img-src': ['self', 'data:', 'blob:', 'https:'],
				'manifest-src': ['self'],
				'media-src': ['self', 'blob:'],
				'object-src': ['none'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'worker-src': ['self', 'blob:']
			}
		}
	}
};

export default config;
