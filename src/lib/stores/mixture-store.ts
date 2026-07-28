import type { CustomGroup } from '$lib/utils/types';
import { writable } from 'svelte/store';

export const customGroup = writable<CustomGroup>();
export const mixtureHashMap = writable<Record<string, string>>({});
