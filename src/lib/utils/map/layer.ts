import type { SpeciesData } from '../types';
import type mapboxgl from 'mapbox-gl';
import { provenanceIsOpen, selectedDataBasis, thresholds } from '$lib/stores/map-store';
import { get } from 'svelte/store';

export default async function setLayer(element: SpeciesData, map: mapboxgl.Map) {
	// list of bands from json start with 0 , bands uploaded in Geoserver with 1
	if (element != undefined) {
		const band: number = element.band_number;
		const datasetName: string = element.file_name;
		const type: string = get(selectedDataBasis) == 'Suitability' ? 'suit' : 'prod';

		for (const layer of map.getStyle().layers) {
			if (layer.type == 'raster' && !['satellite', element.file_name].includes(layer.id)) {
				map.removeLayer(layer.id);
				map.removeSource(layer.id);
				map.triggerRepaint();
			}
		}

		const boundaryResponse = await fetch(
			`https://client-tiles.powergis.at/geoserver/bfw/${type}_${datasetName}/gwc/service/wmts?REQUEST=GetCapabilities&service=wmts&version=1.1.0`
		);
		const text = await boundaryResponse.text();

		let upperBound: string | string[] = text.split('ows:UpperCorner')[1];
		upperBound = upperBound.substring(1, upperBound.length - 2).split(' ');

		let lowerBound: string | string[] = text.split('ows:LowerCorner')[1];
		lowerBound = lowerBound.substring(1, lowerBound.length - 2).split(' ');

		let bounds: number[] | string[] = lowerBound.concat(upperBound);
		bounds = bounds.map(function (str) {
			return parseFloat(str);
		});

		const scale = get(selectedDataBasis) == 'Suitability' ? 'suitabilities' : 'productivities';
		let species_thresholds = get(thresholds)[scale][element.file_name];

		if (scale == 'suitabilities') {
			species_thresholds = species_thresholds.map((value) => value * 10);
		}

		const url =
			`https://client-tiles.powergis.at/geoserver/bfw/wms?layers=bfw%3A${type}_${datasetName}` +
			`&bbox={bbox-epsg-3857}&format=image/png&service=WMS&version=1.3.0&request=GetMap&crs=EPSG:3857` +
			`&transparent=true&width=256&height=256&styles=bfw:style_${type}_${band}&` +
			`env=low:${species_thresholds[0]};medium:${species_thresholds[1]}`;

		if (!map.getLayer(datasetName)) {
			map.addSource(`${datasetName}`, {
				type: 'raster',
				bounds: bounds,
				tiles: [url],
				tileSize: 256
			});

			// get first drawn symbol layer & place raster underneath
			let firstSymbolLayer: string | undefined;
			for (const layer of map.getStyle().layers) {
				if (['line', 'fill', 'symbol'].includes(layer.type)) {
					firstSymbolLayer = layer.id;
					break;
				}
			}

			map.addLayer(
				{
					id: `${datasetName}`,
					type: 'raster',
					source: `${datasetName}`,
					minzoom: 0,
					maxzoom: 22,
					paint: {
						'raster-opacity': get(provenanceIsOpen) ? 0.2 : 0.8
					}
				},
				firstSymbolLayer
			);
		} else {
			(map.getSource(datasetName) as mapboxgl.RasterSourceImpl).setTiles([url]);
		}
	} else {
		for (const layer of map.getStyle().layers) {
			if (layer.type == 'raster' && !['satellite'].includes(layer.id)) {
				map.removeLayer(layer.id);
				map.removeSource(layer.id);
			}
		}
	}
}
