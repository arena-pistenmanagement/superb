import {
	type Thresholds,
	type ClimateScenarios,
	type Dataset,
	type SpeciesData,
	type DataBasis,
	type ChartData,
	type SeedLocations,
	type Coordinates,
	type ToastId,
	type ProvenanceState
} from '$lib/utils/types';
import { writable } from 'svelte/store';

export const location = writable<Coordinates | undefined>(undefined);
export const locationConfirmed = writable<boolean>(false);
export const locationDefinition = writable<string | undefined>(undefined);
export const lookup = writable<Dataset>([]);
export const thresholds = writable<Thresholds>({});
export const toastIds = writable<ToastId[]>([]);

export const species_scenario_A = writable<SpeciesData | undefined>(undefined);
export const species_scenario_B = writable<SpeciesData | undefined>(undefined);
export const year = writable<string | undefined>(undefined);
export const climateScenario = writable<ClimateScenarios | undefined>(undefined);

export const locationIsOpen = writable<boolean>(true);
export const speciesDialogOpen = writable<boolean>(false);
export const mixtureDialogOpen = writable<boolean>(false);
export const provenanceIsOpen = writable<boolean>(false);
export const exportDialogOpen = writable<boolean>(false);
export const faqDialogOpen = writable<boolean>(false);
export const popoverIsOpen = writable<boolean>(false);

export const isLoadingSpecies = writable<boolean>(true);
export const isLoadingProvenance = writable<boolean>(false);
export const selectedDataBasis = writable<DataBasis>('Suitability');

export const helpTracker = writable<number>(0);
export const lineChartData = writable<ChartData>({
	Suitability: { rcp45: {}, rcp85: {} },
	Productivity: { rcp45: {}, rcp85: {} }
});
export const isMobileDevice = writable<boolean>(false);
export const recommendedProvenance = writable<SeedLocations[] | undefined>(undefined);
export const hasSpeciesComposition = writable<boolean>(false);
export const currentProvenance = writable<ProvenanceState | null>(null);
