import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { mapbox } from './mapbox.js';
import * as mapboxgl from 'mapbox-gl';
import { get } from 'svelte/store';
import { lookup, lineChartData, isLoadingSpecies } from '$lib/stores/map-store';
import { type ClimateScenario, type Dataset } from '$lib/utils/types';
import { toast } from 'svelte-sonner';
import CustomToast from '$lib/components/ui/sonner/CustomToast.svelte';
import { queryClusterValue } from '$lib/utils/map/cluster-layer';
import { s3BucketUrl, titilerUrl } from '$lib/utils/map/data-services';

let pointQueryGeneration = 0;
let activePointQueryController: AbortController | undefined;

interface PointQueryResponse {
	values: number[];
}

export async function queryPointFeature(lon: number, lat: number): Promise<boolean> {
	if (
		!Number.isFinite(lon) ||
		!Number.isFinite(lat) ||
		lon < -180 ||
		lon > 180 ||
		lat < -90 ||
		lat > 90
	) {
		isLoadingSpecies.set(false);
		toast.error('The selected location is invalid.');
		return false;
	}

	activePointQueryController?.abort();
	const controller = new AbortController();
	activePointQueryController = controller;

	const queryGeneration = ++pointQueryGeneration;
	const base = `${titilerUrl}/cog/point/`;
	const coordinates = `${lon},${lat}?`;
	const options = 'unscale=false&resampling=nearest';
	let outOfBoundsReported = false;

	try {
		let tempLookup = structuredClone(get(lookup));
		lineChartData.set({
			Suitability: { rcp45: {}, rcp85: {} },
			Productivity: { rcp45: {}, rcp85: {} }
		});

		const responsesSucceeded = await Promise.all(
			(['suitabilities', 'productivities'] as const).map(async (datasetName) => {
				const uri = `url=${s3BucketUrl}/${datasetName}.tif&`;
				const response = await fetch(base + coordinates + uri + options, {
					signal: controller.signal
				});

				if (response.status === 500 && !outOfBoundsReported) {
					outOfBoundsReported = true;
					toast.message(CustomToast, {
						componentProps: {
							title: 'Out of bounds',
							description:
								'The selected location does not overlap the dataset. Select a different point via the map or search box and confirm.'
						},
						duration: 60000
					});
				}
				if (!response.ok) return false;

				const result = (await response.json()) as PointQueryResponse;
				result.values.forEach((value, index) => {
					const species = tempLookup.find((element) => element.id === index);
					if (!species) return;
					if (datasetName === 'suitabilities') species.suitability = value / 10;
					else species.productivity = value;
				});
				return true;
			})
		);

		if (!responsesSucceeded.every(Boolean)) {
			if (!outOfBoundsReported) toast.error('Species data could not be loaded. Please try again.');
			return false;
		}

		tempLookup = orderBySubKey(tempLookup, 'suitability', 'ref');
		tempLookup = await queryClusterValue([lon, lat], tempLookup, controller.signal);
		if (queryGeneration !== pointQueryGeneration) return false;
		lookup.set(tempLookup);

		const chartData = get(lineChartData);
		const speciesReference = tempLookup.filter((element) => element.climate_scenario === 'ref');
		for (const element of speciesReference) {
			const speciesList = tempLookup.filter((item) => item.file_name === element.file_name);
			const rcp45 = speciesList
				.filter((item) => ['rcp45', 'ref'].includes(item.climate_scenario))
				.sort((a, b) => a.band_number - b.band_number);
			const rcp85 = speciesList
				.filter((item) => ['rcp85', 'ref'].includes(item.climate_scenario))
				.sort((a, b) => a.band_number - b.band_number);
			const seriesKey = `species-id-${element.id}` as const;

			chartData.Suitability.rcp45[seriesKey] = rcp45.map((item) =>
				item.suitability === null || item.suitability > 100 ? null : item.suitability
			);
			chartData.Productivity.rcp45[seriesKey] = rcp45.map((item) =>
				item.productivity === null || item.productivity > 100 ? null : item.productivity
			);
			chartData.Suitability.rcp85[seriesKey] = rcp85.map((item) =>
				item.suitability === null || item.suitability > 100 ? null : item.suitability
			);
			chartData.Productivity.rcp85[seriesKey] = rcp85.map((item) =>
				item.productivity === null || item.productivity > 100 ? null : item.productivity
			);
		}
		lineChartData.set(chartData);
		return true;
	} catch (cause) {
		if (
			controller.signal.aborted ||
			queryGeneration !== pointQueryGeneration ||
			(cause instanceof Error && cause.name === 'AbortError')
		) {
			return false;
		}
		console.error('Failed to load species data:', cause);
		toast.error('Species data could not be loaded. Please try again.');
		return false;
	} finally {
		if (activePointQueryController === controller) {
			activePointQueryController = undefined;
			isLoadingSpecies.set(false);
		}
	}
}

export function queryLocationFromInput() {
	const geocoder = new MapboxGeocoder({
		mapboxgl: mapboxgl,
		marker: false,
		accessToken: mapbox.accessToken || '',
		localGeocoder: coordinatesGeocoder,
		reverseGeocode: true,
		bbox: [-10.6166657869999952, 34.5622560979999989, 38.5583381470000006, 71.1872590279999997],
		placeholder: 'Search location',
		language: 'en-EN'
	});

	return geocoder;
}

// Reverse Geocoding - allows to search for coordinates as well
const coordinatesGeocoder = function (query: string): MapboxGeocoder.Result[] {
	// Match anything which looks like decimal degrees coordinate pair.
	const matches = query.match(/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[,\s?]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i);
	if (!matches) {
		return [];
	}

	function coordinateFeature(lng: number, lat: number): MapboxGeocoder.Result {
		return {
			bbox: [lng, lat, lng, lat],
			center: [lng, lat],
			geometry: {
				type: 'Point',
				coordinates: [lng, lat]
			} as GeoJSON.Point,
			place_name: 'Lat: ' + lat + ' Lng: ' + lng,
			place_type: ['coordinate'],
			relevance: 1,
			text: `${lat}, ${lng}`,
			address: '',
			context: [],
			properties: {},
			type: 'Feature'
		};
	}

	const coord1 = Number(matches[1]);
	const coord2 = Number(matches[2]);
	const geocodes = [];

	if (coord1 < -90 || coord1 > 90) {
		// must be lng, lat
		geocodes.push(coordinateFeature(coord1, coord2));
	}

	if (coord2 < -90 || coord2 > 90) {
		// must be lat, lng
		geocodes.push(coordinateFeature(coord2, coord1));
	}

	if (geocodes.length === 0) {
		// else could be either lng, lat or lat, lng
		geocodes.push(coordinateFeature(coord1, coord2));
		geocodes.push(coordinateFeature(coord2, coord1));
	}

	return geocodes;
};

export function orderBySubKey(
	input: Dataset,
	key: 'english_name' | 'productivity' | 'species_name' | 'suitability',
	year: ClimateScenario
): Dataset {
	let sortedList = [...input];
	sortedList = sortedList.sort(function (a, b) {
		if (key == 'species_name') {
			return a.species_name.localeCompare(b.species_name);
		}
		if (key === 'english_name') {
			return a.english_name.localeCompare(b.english_name);
		}
		if (a.climate_scenario == year) {
			const aValue = key === 'suitability' ? a.suitability : a.productivity;
			const bValue = key === 'suitability' ? b.suitability : b.productivity;
			if (bValue == null || bValue > 100) {
				return -1 - (aValue ?? -1);
			} else if (aValue == null || aValue > 100) {
				return bValue + 1;
			} else {
				return bValue - aValue;
			}
		}
		return 1;
	});

	return sortedList;
}

const valueEnvzoneMapping: Record<string, string> = {
	1: 'Alpine North',
	2: 'Boreal',
	3: 'Nemoral',
	4: 'Atlantic North',
	5: 'Alpine South',
	6: 'Continental',
	7: 'Atlantic Central',
	8: 'Pannonian',
	9: 'Lusitanian',
	10: 'Anatolian',
	11: 'Mediterranean Mountains',
	12: 'Mediterranean North',
	13: 'Mediterranean South',
	14: 'Macaronesia',
	15: 'Arctic'
};

export const queryGeographicalRegion = async (coordinate: { lat: number; lon: number }) => {
	const environmentalZonesUrl = encodeURIComponent(`${s3BucketUrl}/env_zones.tif`);
	const requestUrl = `${titilerUrl}/cog/point/${coordinate.lat},${coordinate.lon}?url=${environmentalZonesUrl}&bidx=1&expression=b1&unscale=false&resampling=nearest`;
	const response = await fetch(requestUrl);
	if (!response.ok) return;
	const result = await response.json();
	const value = result.values[0] as string;
	return valueEnvzoneMapping[value];
};

export const getSpeciesDataByName = (
	name: string,
	climateScenario: ClimateScenario,
	year: string
) => {
	const lookupData = get(lookup);
	return lookupData.find(
		(value) =>
			value.species_name == name &&
			value.climate_scenario == climateScenario &&
			value.timeframe == year
	);
};

export const getEnglishSpeciesName = (name: string) => {
	const lookupData = get(lookup);
	const species = lookupData.find((value) => value.species_name == name);
	return species ? species.english_name : '';
};
