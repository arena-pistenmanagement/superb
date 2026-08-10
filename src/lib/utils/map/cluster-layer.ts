import CustomToast from '$lib/components/ui/sonner/CustomToast.svelte';
import {
	helpTracker,
	species_scenario_A,
	species_scenario_B,
	provenanceIsOpen,
	isLoadingProvenance,
	location,
	recommendedProvenance,
	exportDialogOpen,
	currentProvenance,
	toastIds,
	popoverIsOpen
} from '$lib/stores/map-store';
import { toast } from 'svelte-sonner';
import { get } from 'svelte/store';
import type mapboxgl from 'mapbox-gl';
import {
	ClimateScenarios,
	type Coordinates,
	type Dataset,
	type ProvenanceState,
	type SeedLocations
} from '../types';
import { local_provenance_species } from '$lib/components/special_species';
import { geoserverUrl } from '$lib/utils/map/geoserver';
import { s3BucketUrl, titilerUrl } from '$lib/utils/map/data-services';

let description: string;

type ClusterScenario = 'rcp45' | 'rcp85';
type ClusterKey = `cluster_${ClusterScenario}`;

interface PointQueryResponse {
	values: number[];
}

interface SeedFeatureCollection extends GeoJSON.FeatureCollection<
	GeoJSON.Geometry,
	Omit<SeedLocations, 'distance_to_loc'>
> {
	totalFeatures: number;
}

export async function queryClusterValue(
	selectedLocation: Coordinates | undefined,
	lookupData: Dataset,
	signal?: AbortSignal
): Promise<Dataset> {
	if (!selectedLocation) return lookupData;
	const tempLookup = structuredClone(lookupData);
	const base = `${titilerUrl}/cog/point/`;
	const coordinates = `${selectedLocation[0]},${selectedLocation[1]}?`;
	const options = 'unscale=false&resampling=nearest';

	await Promise.all(
		(['rcp45', 'rcp85'] as const).map(async (scenario: ClusterScenario) => {
			const uri = `url=${s3BucketUrl}/cluster_${scenario}_lzw.tif&`;
			const response = await fetch(base + coordinates + uri + options, { signal });
			if (!response.ok) return;

			const result = (await response.json()) as PointQueryResponse;
			const unique = [...new Set(result.values)];

			if (unique.length === 1 && unique[0] === 9998) {
				toast.message(CustomToast, {
					componentProps: {
						title: 'Out of bounds',
						description:
							'The selected location does not overlap the dataset. Select a different point via the map or search box and confirm.'
					},
					duration: 60000
				});
				return;
			}

			const clusterKey: ClusterKey = `cluster_${scenario}`;
			result.values.forEach((value, index) => {
				tempLookup
					.filter((element) => element.cluster_band === index + 1)
					.forEach((element) => {
						element[clusterKey] = value;
						const selectedSpecies = get(species_scenario_A);
						if (selectedSpecies?.id === element.id) {
							species_scenario_A.set({ ...selectedSpecies, [clusterKey]: value });
						}
					});
			});
		})
	);
	return tempLookup;
}

export async function loadProvenanceLayer(
	mapInstance: mapboxgl.Map,
	noToast: boolean = false,
	newLocation: boolean = false
): Promise<ProvenanceState> {
	isLoadingProvenance.set(true);
	get(toastIds).forEach((id) => {
		toast.dismiss(id);
	});
	toastIds.set([]);

	const selectedSpecies = get(species_scenario_A);
	const emptyProvenance: ProvenanceState = {
		cluster_rcp45: undefined,
		cluster_rcp85: undefined,
		species: undefined
	};
	if (!selectedSpecies) {
		closeProvananceLayer(mapInstance);
		isLoadingProvenance.set(false);
		return emptyProvenance;
	}

	const newProvenance: ProvenanceState = {
		cluster_rcp45: selectedSpecies.cluster_rcp45,
		cluster_rcp85: selectedSpecies.cluster_rcp85,
		species: selectedSpecies.file_name
	};

	// fade rasters first
	for (const layer of mapInstance.getStyle().layers) {
		if (layer.type == 'raster' && !(layer.id == 'satellite')) {
			mapInstance.setPaintProperty(layer.id, 'raster-opacity', 0.2);
		}
	}

	// prevent query with same parameters
	const previousProvenance = get(currentProvenance);
	if (
		!newLocation &&
		previousProvenance &&
		previousProvenance?.cluster_rcp45 === newProvenance.cluster_rcp45 &&
		previousProvenance?.cluster_rcp85 === newProvenance.cluster_rcp85 &&
		previousProvenance?.species === newProvenance.species
	) {
		isLoadingProvenance.set(false);
		return previousProvenance;
	}

	const currentScenario: ClusterKey =
		selectedSpecies.climate_scenario === 'rcp85' ? 'cluster_rcp85' : 'cluster_rcp45';
	const selectedCluster = selectedSpecies[currentScenario];

	if (
		(get(provenanceIsOpen) || get(exportDialogOpen)) &&
		selectedSpecies.cluster_band != null &&
		selectedCluster != null &&
		selectedCluster !== 0
	) {
		const response = await fetch(
			`${geoserverUrl}/bfw/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=bfw%3Aseed_provenance&` +
				`CQL_FILTER=cluster=${selectedCluster}%20and%20species='${selectedSpecies.file_name}'` +
				`&outputFormat=application%2Fjson`
		);

		if (response.ok) {
			const result = (await response.json()) as SeedFeatureCollection;

			if (result.totalFeatures === 0 && get(species_scenario_B) === undefined && !noToast) {
				get(toastIds).forEach((id) => {
					toast.dismiss(id);
				});
				toastIds.set([]);

				const id = toast.message(CustomToast, {
					componentProps: {
						title: `${selectedSpecies.species_name} has no recommended provenance data.`,
						description: `No data available for selected species, climate scenario ${ClimateScenarios[selectedSpecies.climate_scenario]} and location.`
					},
					duration: 30000
				});
				toastIds.update((ids) => [...ids, id]);
				closeProvananceLayer(mapInstance);
				isLoadingProvenance.set(false);

				return newProvenance;
			} else {
				const updatedDescription = `${result.totalFeatures} recommended seed stand locations found for ${selectedSpecies.species_name} - ${ClimateScenarios[selectedSpecies.climate_scenario]}`;
				if (description != updatedDescription && !noToast && get(provenanceIsOpen)) {
					get(toastIds).forEach((id) => {
						toast.dismiss(id);
					});
					toastIds.set([]);

					const id = toast.message(CustomToast, {
						componentProps: {
							title: 'Loading finished',
							description: updatedDescription
						},
						duration: 30000
					});
					toastIds.update((ids) => [...ids, id]);
					description = updatedDescription;
				}
			}

			const provenance: mapboxgl.CircleLayer = {
				id: 'provenance',
				type: 'circle',
				source: 'provenance',
				paint: {
					'circle-color': 'purple',
					'circle-radius': {
						base: 4,
						stops: [
							[7, 4],
							[15, 50],
							[22, 250]
						]
					},
					'circle-stroke-color': 'white',
					'circle-stroke-width': 1
				}
			};
			if (get(helpTracker) >= 6) {
				if (!mapInstance.getLayer('provenance')) {
					mapInstance.addSource('provenance', {
						type: 'geojson',
						data: result
					});
					mapInstance.addLayer(provenance);
				} else {
					(mapInstance.getSource('provenance') as mapboxgl.GeoJSONSource).setData(
						result as unknown as GeoJSON.FeatureCollection
					);
				}
			}

			// query elevation, filter provenance by altitude
			const selectedLocation = get(location);
			if (!selectedLocation) {
				isLoadingProvenance.set(false);
				return newProvenance;
			}
			const lngLat = {
				lng: selectedLocation[0],
				lat: selectedLocation[1]
			};

			// Do not use terrain exaggeration to get actual meter values
			const queriedElevation = mapInstance.queryTerrainElevation(lngLat, { exaggerated: false });
			const elevation = Math.floor(queriedElevation ?? 0);

			let tempProvenance: SeedLocations[] = [];
			result.features.forEach((feature) => {
				if (
					feature.properties.altitude < elevation + 300 &&
					feature.properties.altitude > elevation - 300
				) {
					tempProvenance.push({
						...feature.properties,
						distance_to_loc: calcCrow(
							selectedLocation[1],
							selectedLocation[0],
							feature.properties.lat,
							feature.properties.lon
						)
					});
				}
			});

			if (tempProvenance.length == 0) {
				result.features.forEach((feature) => {
					tempProvenance.push({
						...feature.properties,
						distance_to_loc: calcCrow(
							selectedLocation[1],
							selectedLocation[0],
							feature.properties.lat,
							feature.properties.lon
						)
					});
				});
			}
			tempProvenance = sortByDistance(tempProvenance);
			recommendedProvenance.set(tempProvenance.slice(0, 15));
		}
	} else {
		closeProvananceLayer(mapInstance);
		if (
			selectedCluster === 0 &&
			local_provenance_species().includes(selectedSpecies.species_name) &&
			!noToast
		) {
			const id = toast.message(CustomToast, {
				componentProps: {
					title: `Provenance data for ${selectedSpecies.species_name}:`,
					description: `The use of local seed sources is recommended, prioritizing natural regeneration where available.`
				},
				duration: 300000
			});
			toastIds.update((ids) => [...ids, id]);

			isLoadingProvenance.set(false);
			return newProvenance;
		}

		if (
			(selectedSpecies.cluster_band == null ||
				!local_provenance_species().includes(selectedSpecies.species_name)) &&
			get(species_scenario_B) == undefined &&
			!noToast
		) {
			const id = toast.message(CustomToast, {
				componentProps: {
					title: `${selectedSpecies.species_name} has no provenance data${selectedSpecies.cluster_band == null ? '' : ' for the selected location'}.`,
					description: `Select a different ${selectedSpecies.cluster_band == null ? 'species' : 'location'} to see seed stand locations.`
				},
				duration: 30000
			});
			if (get(helpTracker) == 6) popoverIsOpen.set(true);
			toastIds.update((ids) => [...ids, id]);
		}
	}
	isLoadingProvenance.set(false);

	const currentSpecies = get(species_scenario_A);
	return currentSpecies
		? {
				cluster_rcp45: currentSpecies.cluster_rcp45,
				cluster_rcp85: currentSpecies.cluster_rcp85,
				species: currentSpecies.file_name
			}
		: emptyProvenance;
}

export function closeProvananceLayer(mapInstance: mapboxgl.Map) {
	if (mapInstance && mapInstance?.getLayer('provenance')) {
		mapInstance?.removeLayer('provenance');
		mapInstance?.removeSource('provenance');
	}

	for (const layer of mapInstance.getStyle().layers) {
		if (layer.type == 'raster' && !(layer.id == 'satellite')) {
			mapInstance.setPaintProperty(layer.id, 'raster-opacity', 0.8);
		}
	}
}

function calcCrow(userLat: number, userLon: number, seedLat: number, seedLon: number) {
	const R = 6371; // km
	const dLat = toRad(seedLat - userLat);
	const dLon = toRad(seedLon - userLon);
	const userLatitude = toRad(userLat);
	const seedLatitude = toRad(seedLat);

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(userLatitude) * Math.cos(seedLatitude);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	const d = R * c;
	return Math.floor(d);
}

// Converts numeric degrees to radians
function toRad(value: number) {
	return (value * Math.PI) / 180;
}

const sortByDistance = (values: SeedLocations[]): SeedLocations[] =>
	values.sort((a, b) => a.distance_to_loc - b.distance_to_loc);
