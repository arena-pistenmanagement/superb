import { getSpeciesDataByName } from './map/query-features';
import type { GroupItem, Group, SpeciesData } from './types';
import speciesMixtureGroups from '../components/combined_species_asociations.json';

type SpeciesAssociation = {
	[region: string]: string[][]; // Region name mapped to an array of species combinations
};

type GroupData = {
	[species: string]: {
		'Species association': SpeciesAssociation;
		'Co-occurance': SpeciesAssociation;
	};
};

export type Species = {
	sp1_name: string;
	sp2_name: string;
};

// Helper function to filter rows
function filter<T>(arr: T[], condition: (item: T) => boolean): T[] {
	return arr.filter(condition);
}

// Helper function to rename object keys
function renameKeys<T extends object>(
	obj: T,
	newKeys: Partial<Record<keyof T, string>>
): { [key: string]: unknown } {
	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => {
			const newKey = newKeys[key as keyof T] || key;
			return [newKey, value];
		})
	);
}

function createGraph(species: Species[]): Record<string, Set<string>> {
	const graph: Record<string, Set<string>> = {};

	species.forEach(({ sp1_name, sp2_name }) => {
		if (!graph[sp1_name]) graph[sp1_name] = new Set();
		if (!graph[sp2_name]) graph[sp2_name] = new Set();

		graph[sp1_name].add(sp2_name);
		graph[sp2_name].add(sp1_name);
	});

	return graph;
}

/**
 * Implements the Bron-Kerbosch algorithm to find all maximal cliques in an undirected graph.
 *
 * @param currentClique - The vertices in the clique being built
 * @param candidates - The vertices that can be added to the clique
 * @param excluded - The vertices that have already been processed
 * @param graph - The graph represented as an adjacency list
 * @param maximalCliques - The list to store all found maximal cliques
 *
 * This recursive function explores all possible cliques in the graph.
 * It terminates when there are no more candidates and excluded vertices,
 * at which point it has found a maximal clique.
 *
 */
function bronKerbosch(
	currentClique: string[],
	candidates: string[],
	excluded: string[],
	graph: Record<string, Set<string>>,
	maximalCliques: string[][]
): void {
	if (candidates.length === 0 && excluded.length === 0) {
		maximalCliques.push([...currentClique]);
		return;
	}

	for (const vertex of candidates) {
		const neighbors = graph[vertex];
		bronKerbosch(
			[...currentClique, vertex],
			candidates.filter((v) => neighbors.has(v)),
			excluded.filter((v) => neighbors.has(v)),
			graph,
			maximalCliques
		);
		candidates = candidates.filter((v) => v !== vertex);
		excluded.push(vertex);
	}
}

// Find maximum cliques
function findMaxCliques(graph: Record<string, Set<string>>) {
	const cliques: string[][] = [];
	const nodes = Object.keys(graph);
	bronKerbosch([], nodes, [], graph, cliques);
	return cliques;
}

/**
 * Finds groups of co-selected species based on a given species.
 *
 * @param coSelected - Array of co-selected species pairs
 * @param targetSpecies - The target species to start the group finding process
 * @returns An array of objects representing the groups in a long format
 *
 * This function performs the following steps:
 * 1. Filters and processes co-selected species related to the target species
 * 2. Creates a graph representation of the species relationships
 * 3. Finds maximal cliques in the graph (presumably using Bron-Kerbosch algorithm)
 * 4. Formats the results into groups
 * 5. Converts the group data to a long format for easy processing
 */
export async function findGroups(
	coSelected: Species[],
	targetSpecies: SpeciesData,
	climate_scenario = targetSpecies.climate_scenario,
	target_year = targetSpecies.timeframe
): Promise<{ groups: Group[]; allRelatedSpecies: Species[] }> {
	const directCoSelections = filter(
		coSelected,
		(row) => row.sp1_name === targetSpecies.species_name
	);
	const reversedCoSelections = filter(
		coSelected,
		(row) => row.sp2_name === targetSpecies.species_name
	).map((row) => renameKeys(row, { sp1_name: 'sp2_name', sp2_name: 'sp1_name' }) as Species);

	const primaryCoSelections = [...directCoSelections, ...reversedCoSelections];

	let secondaryCoSelections = filter(coSelected, (row) =>
		primaryCoSelections.some((s) => s.sp2_name === row.sp1_name)
	);
	secondaryCoSelections = filter(secondaryCoSelections, (row) =>
		primaryCoSelections.some((s) => s.sp2_name === row.sp2_name)
	);

	const allRelatedSpecies = [...primaryCoSelections, ...secondaryCoSelections];
	const graph = createGraph(allRelatedSpecies);
	const listGroups = findMaxCliques(graph);

	// Create dataframe with species groups
	const dfGroups = listGroups.map((group, index) => {
		const row: { [key: string]: string } = {
			group: `Group ${String.fromCharCode(97 + index).toUpperCase()}`
		};
		group.forEach((sp, spIndex) => {
			row[`SP_${spIndex + 1}`] = sp;
		});
		return row;
	});

	const climateScenario = climate_scenario;
	const year = target_year;

	const result: GroupItem[] = [];
	dfGroups.forEach((row) => {
		Object.entries(row).forEach(async ([key, value]) => {
			if (key !== 'group' && value != null) {
				const speciesData = getSpeciesDataByName(value, climateScenario, year);
				result.push({
					group: row.group,
					name: key,
					value: value,
					suitability: speciesData?.suitability ?? NaN,
					productivity: speciesData?.productivity ?? NaN
				});
			}
		});
	});
	return { groups: groupByGroup(result), allRelatedSpecies };
}

function groupByGroup(data: GroupItem[]): Group[] {
	const groupMap = new Map();
	data.forEach((item) => {
		if (!groupMap.has(item.group)) {
			groupMap.set(item.group, []);
		}
		groupMap.get(item.group).push(item);
	});

	const groupArray = Array.from(groupMap.values()) as GroupItem[][];
	const groups: Group[] = [];

	for (const group of groupArray) {
		let suitabilitySum = 0;
		let productivitySum = 0;
		let lenSuit = 0;
		let lenProd = 0;
		const names: string[] = [];
		group.forEach((value) => {
			names.push(value.value);
			if (value.suitability >= 0 && value.suitability < 9000) {
				suitabilitySum = suitabilitySum + value.suitability;
				lenSuit += 1;
			}
			if (value.productivity >= 0 && value.productivity < 9000) {
				productivitySum = productivitySum + value.productivity;
				lenProd += 1;
			}
		});

		groups.push({
			name: hashArray(names),
			items: group,
			group: JSON.parse(JSON.stringify(group[0].group)),
			groupProductivity: lenProd == 0 ? NaN : Math.round(productivitySum / lenProd),
			groupSuitability: lenSuit == 0 ? NaN : Math.round(suitabilitySum / lenSuit)
		});
	}

	groups.sort((a, b) => b.groupSuitability - a.groupSuitability);
	return groups;
}

function hashArray(arr: string[]): string {
	// Ensure the array is sorted for consistency in case of different order
	const sortedArray = arr.slice().sort();

	// Join array into a single string
	const concatenatedString = sortedArray.join(',');

	// Generate a simple hash using a hash function
	let hash = 0;
	for (let i = 0; i < concatenatedString.length; i++) {
		const char = concatenatedString.charCodeAt(i);
		hash = (hash * 31 + char) % 1000000007; // Prime number for modulo to reduce collisions
	}

	return hash.toString(16); // Convert to hexadecimal for readability
}

export const findPrecalculatedGroups = async (
	targetSpecies: SpeciesData,
	geographicalRegion: string,
	climate_scenario = targetSpecies.climate_scenario,
	target_year = targetSpecies.timeframe
): Promise<{ groups: Group[]; otherGroup: GroupItem[] }> => {
	const filteredGroups = (speciesMixtureGroups as GroupData)[targetSpecies.species_name][
		'Species association'
	][geographicalRegion];
	const otherSpecies =
		(speciesMixtureGroups as GroupData)[targetSpecies.species_name]['Co-occurance'][
			geographicalRegion
		]?.length > 0
			? (speciesMixtureGroups as GroupData)[targetSpecies.species_name]['Co-occurance'][
					geographicalRegion
				][0]
			: [];
	// Create dataframe with species groups
	const dfGroups =
		filteredGroups?.map((group, index) => {
			const row: { [key: string]: string } = {
				group: `Group ${String.fromCharCode(97 + index).toUpperCase()}`
			};
			group.forEach((sp, spIndex) => {
				row[`SP_${spIndex + 1}`] = sp;
			});
			return row;
		}) ?? [];

	const climateScenario = climate_scenario;
	const year = target_year;

	const result: GroupItem[] = [];
	dfGroups.forEach((row) => {
		Object.entries(row).forEach(async ([key, value]) => {
			if (key !== 'group' && value != null) {
				const speciesData = getSpeciesDataByName(value, climateScenario, year);
				result.push({
					group: row.group,
					name: key,
					value: value,
					suitability: speciesData?.suitability ?? NaN,
					productivity: speciesData?.productivity ?? NaN
				});
			}
		});
	});

	const otherResults: GroupItem[] = [];
	otherSpecies?.forEach((value) => {
		const speciesData = getSpeciesDataByName(value, climateScenario, year);
		if (speciesData) {
			otherResults.push({
				group: 'Other',
				name: value,
				value: value,
				suitability: speciesData.suitability ?? NaN,
				productivity: speciesData.productivity ?? NaN
			});
		}
	});

	return { groups: groupByGroup(result), otherGroup: otherResults };
};
