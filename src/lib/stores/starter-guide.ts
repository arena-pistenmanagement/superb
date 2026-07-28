import { readLocalStorageStarterGuide } from '$lib/utils/starter-guide';
import { writable } from 'svelte/store';

export const starterGuideState = writable(readLocalStorageStarterGuide());
export const helpActive = writable<boolean>();
