import {
	exportDialogOpen,
	faqDialogOpen,
	helpTracker,
	locationIsOpen,
	mixtureDialogOpen,
	popoverIsOpen,
	provenanceIsOpen,
	species_scenario_B,
	speciesDialogOpen
} from '$lib/stores/map-store';

export default function handleActiveButtons() {
	helpTracker.subscribe((value) => {
		handleMenuFlow(value);
	});
}

function handleMenuFlow(tracker: number) {
	if (tracker == 0) toggleActiveButtonStyle(0);
	if ([1, 2, 3].includes(tracker)) toggleActiveButtonStyle(1);
	if ([4, 5].includes(tracker)) toggleActiveButtonStyle(2);
	if (tracker == 6) toggleActiveButtonStyle(3);
	if (tracker == 7) toggleActiveButtonStyle(4);
}

function toggleActiveButtonStyle(index: number) {
	const buttons = ['locationBtn', 'speciesBtn', 'mixturesBtn', 'provenanceBtn', 'exportBtn'];
	const dialogs = [
		locationIsOpen,
		speciesDialogOpen,
		mixtureDialogOpen,
		provenanceIsOpen,
		exportDialogOpen,
		faqDialogOpen,
		popoverIsOpen
	];

	// style active button
	const dom = document.getElementById(buttons[index]);
	dom?.classList.add('active-menu-btn');
	if (index != 1) species_scenario_B.set(undefined);

	// remove style from all not-active buttons
	dialogs.splice(index, 1);
	buttons.splice(index, 1);

	dialogs.forEach((dialog) => {
		dialog.set(false);
	});

	buttons.forEach((element) => {
		const dom = document.getElementById(element);
		dom?.classList.remove('active-menu-btn');
	});
}
