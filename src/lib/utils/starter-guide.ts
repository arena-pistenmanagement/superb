import { browser } from '$app/environment';
import { starterGuideState } from '$lib/stores/starter-guide';

export const readLocalStorageStarterGuide = () => {
	if (browser) {
		return window.localStorage.getItem('starterGuideState') ?? 'open';
	}
};

export const writeLocalStorageStarterGuide = (value: string) => {
	if (browser) {
		window.localStorage.setItem('starterGuideState', value);
		starterGuideState.set(value);
	}
};
