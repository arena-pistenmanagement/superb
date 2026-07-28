export enum ClimateScenarios {
	'ref' = 'Reference',
	'rcp45' = 'RCP4.5',
	'rcp85' = 'RCP8.5'
}

export type ClimateScenario = 'rcp45' | 'rcp85' | 'ref';

export type Years = '1995' | '2025' | '2055' | '2085';
export type Coordinates = [longitude: number, latitude: number];
export type ToastId = string | number;

export interface SpeciesData {
	id: number;
	species_name: string;
	file_name: string;
	english_name: string;
	band_number: number;
	climate_scenario: ClimateScenario;
	timeframe: string;
	suitability: number | null;
	productivity: number | null;
	has_productivity: string;
	cluster_band: number | null;
	cluster: number | null;
	cluster_rcp45: number | null;
	cluster_rcp85: number | null;
}

export type SpeciesSeries = Record<`species-id-${number}`, Array<number | null>>;

export interface ChartData {
	Suitability: {
		rcp45: SpeciesSeries;
		rcp85: SpeciesSeries;
	};
	Productivity: {
		rcp45: SpeciesSeries;
		rcp85: SpeciesSeries;
	};
}

export interface SeedLocations {
	ISO3_CODE: string;
	altitude: number;
	cluster: number;
	index: number;
	lat: number;
	lon: number;
	nationalre: string;
	source: string;
	species: string;
	distance_to_loc: number;
}

export interface ProvenanceState {
	cluster_rcp45: number | null | undefined;
	cluster_rcp85: number | null | undefined;
	species: string | undefined;
}

export type Dataset = SpeciesData[];

export interface Thresholds {
	[key: string]: { [key: string]: number[] };
}

export type ProductivityThresholds = {
	[key: string]: ProductivityThreshold[];
};

export type ProductivityThreshold = {
	min: number;
	max: number;
	class: string;
};

export type DataBasis = 'Suitability' | 'Productivity';

export type Specie = {
	index: number;
	band: number;
	name: string;
	englishName: string;
};

export interface SpecieDto extends Specie {
	suitability: number;
	productivity: number;
}

export type GroupItem = {
	group: string;
	name: string;
	value: string;
	productivity: number;
	suitability: number;
	checked?: boolean;
};

export type Group = {
	name?: string;
	items: GroupItem[];
	groupSuitability: number;
	groupProductivity: number;
	group: string;
	isCustomGroup?: boolean;
	selectedItems?: GroupItem[];
};

export interface CustomGroup extends Group {
	isCustomGroup: boolean;
	selectedItems: GroupItem[];
}

export type ReportSelection = {
	includeSuitability: boolean;
	includeSuitabilityChart: boolean;
	includeSuitabilityTable: boolean;
	includeProductivity: boolean;
	includeProductivityChart: boolean;
	includeProductivityTable: boolean;
	includeMixtures: boolean;
	mixtureTimeframe: 'ref' | 'future';
	mixtureClimateScenario: 'rcp45' | 'rcp85';
	includeProvenance: boolean;
	includeCustomGroup: boolean;
};
