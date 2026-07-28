import { toast } from 'svelte-sonner';
import CustomToast from '$lib/components/ui/sonner/CustomToast.svelte';
import { get } from 'svelte/store';
import {
	helpTracker,
	isLoadingProvenance,
	species_scenario_A,
	toastIds
} from '$lib/stores/map-store';
import { helpActive } from '$lib/stores/starter-guide';
import type { Unsubscriber } from 'svelte/store';

export default function setClickInstructions() {
	// Show toasts as click - tour
	let unsubscribeHelpTracker: Unsubscriber | undefined;

	function clearToasts() {
		get(toastIds).forEach((id) => toast.dismiss(id));
		toastIds.set([]);
	}

	function rememberToast(id: string | number) {
		toastIds.update((ids) => [...ids, id]);
	}

	unsubscribeHelpTracker = helpTracker.subscribe((value) => {
		if (value == 0) {
			// First step - select location
			clearToasts();
			const id = toast.message(CustomToast, {
				componentProps: {
					description: 'Click Location. Select a point via the map or search box and confirm.'
				},
				duration: Infinity
			});
			rememberToast(id);
		} else if (value == 1) {
			// select species
			clearToasts();
			const id = toast.message(CustomToast, {
				componentProps: {
					description:
						'Select a species. You can compare suitability and productivity in a graph and on the map.'
				},
				duration: Infinity
			});
			rememberToast(id);
		} else if (value == 2) {
			// compare two datasets
			clearToasts();
			const id = toast.message(CustomToast, {
				componentProps: {
					description:
						'You can compare productivity and suitability between species. To enable the slider, click Compare at the bottom.'
				},
				duration: Infinity
			});
			rememberToast(id);
		} else if (value == 2.1) {
			// compare two datasets
			clearToasts();
			const id = toast.message(CustomToast, {
				componentProps: {
					description:
						'You can adjust climate scenarios, species, year and data basis by clicking the pills at the bottom.'
				},
				duration: Infinity
			});
			rememberToast(id);
		} else if (value == 3) {
			// compare two datasets
			clearToasts();
			const id = toast.message(CustomToast, {
				componentProps: {
					description: 'Click Composition to discover suitable compositions of different species.'
				},
				duration: Infinity
			});
			rememberToast(id);
		} else if (value == 4) {
			// show detailed mixtures
			clearToasts();
			const id = toast.message(CustomToast, {
				componentProps: {
					description:
						'Composition groups are based on species association mining, identifying common co-occurring species. Click on the group for details.'
				},
				duration: Infinity
			});
			rememberToast(id);
		} else if (value == 5) {
			// get provenance
			clearToasts();
			const id = toast.message(CustomToast, {
				componentProps: {
					description:
						'Get suitable seeds for the selected main species. Close Species Compositions and click Provenance.' +
						`${get(species_scenario_A)?.cluster_band == null ? ` Warning! ${get(species_scenario_A)?.species_name} has no provenance data. Select a different species or proceed.` : ''}`
				},
				duration: Infinity
			});
			rememberToast(id);
		} else if (value == 6 && !get(isLoadingProvenance)) {
			// get provenance
			clearToasts();
			const id = toast.message(CustomToast, {
				componentProps: {
					description:
						get(species_scenario_A)?.cluster_band != null
							? 'A subset of seed stands will be saved in the output. Export the report to view the most suitable ones.'
							: 'Generate a report to export the analysis.'
				},
				duration: Infinity
			});
			rememberToast(id);
		} else if (value == 7) {
			// get provenance
			clearToasts();
			helpActive.set(false);
			toast.message(CustomToast, {
				componentProps: {
					title: 'Tour is finished',
					description: 'If you need more help with a step go back and click help button again.'
				},
				duration: Infinity
			});
		} else {
			clearToasts();
		}
	});

	helpActive.subscribe((value) => {
		if (!value) {
			clearToasts();
			unsubscribeHelpTracker?.();
			unsubscribeHelpTracker = undefined;
		}
	});
}
