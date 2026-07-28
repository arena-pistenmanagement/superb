import { get } from 'svelte/store';
import { thresholds } from '$lib/stores/map-store';
import { type Thresholds, type DataBasis, type ProductivityThresholds } from '$lib/utils/types';
import productivityThresholds from '$lib/components/species_productivity_thresholds.json';

const GREEN_COLOR = 'rgba(34, 197, 94,.9)';
const YELLOW_COLOR = 'rgba(250, 204, 21,.9)';
const RED_COLOR = 'rgba(248,113,113,.9)';
const GRAY_COLOR = 'rgba(110,107,107,.9)';

const GREEN_TEXT_COLOR = '#22c55e';
const YELLOW_TEXT_COLOR = '#facc15';
const RED_TEXT_COLOR = '#f87171';
const WHITE_TEXT_COLOR = '#ffffff';

let threshold: Thresholds;

thresholds.subscribe((value) => {
	if (value) {
		threshold = JSON.parse(JSON.stringify(value));
	}
});

export function thresholdsColor(yvalue: number, dataBasis: DataBasis, file_name: string) {
	if (isNaN(yvalue) || yvalue == null) return GRAY_COLOR;
	const scale = dataBasis == 'Suitability' ? 'suitabilities' : 'productivities';
	if (!Object.hasOwn(threshold[scale], file_name)) return GRAY_COLOR;
	yvalue = Math.round(yvalue);

	if (yvalue >= threshold[scale][file_name][1]) {
		return GREEN_COLOR;
	} else if (yvalue >= threshold[scale][file_name][0]) {
		return YELLOW_COLOR;
	} else if (yvalue < threshold[scale][file_name][0]) {
		return RED_COLOR;
	} else {
		return GRAY_COLOR;
	}
}

export function textThresholdsColor(yvalue: number, dataBasis: DataBasis, file_name: string) {
	const scale = dataBasis == 'Suitability' ? 'suitabilities' : 'productivities';
	yvalue = Math.round(yvalue);
	if (!Object.hasOwn(threshold[scale], file_name) || isNaN(yvalue))
		return blackOrWhiteText('#6e6b6b');

	if (yvalue >= threshold[scale][file_name][1]) {
		return blackOrWhiteText(GREEN_TEXT_COLOR);
	} else if (yvalue >= threshold[scale][file_name][0]) {
		return blackOrWhiteText(YELLOW_TEXT_COLOR);
	} else if (yvalue < threshold[scale][file_name][0]) {
		return blackOrWhiteText(RED_TEXT_COLOR);
	} else {
		return blackOrWhiteText('#6e6b6b');
	}
}

export function productivityThresholdsColor(value: number, speciesName: string) {
	const speciesNameParsed: string | undefined = speciesName?.toLowerCase().replace(' ', '_');
	const thresholdsMap: ProductivityThresholds = productivityThresholds;
	const speciesThresholds = thresholdsMap[speciesNameParsed];
	if (!speciesThresholds) return { backgroundColor: GRAY_COLOR, textColor: WHITE_TEXT_COLOR };

	const threshold = speciesThresholds.find(
		(threshold) => value > threshold.min && value <= threshold.max
	);

	if (!threshold) return { backgroundColor: GRAY_COLOR, textColor: WHITE_TEXT_COLOR };

	switch (threshold.class) {
		case 'high':
			return { backgroundColor: GREEN_COLOR, textColor: blackOrWhiteText(GREEN_TEXT_COLOR) };
		case 'medium':
			return { backgroundColor: YELLOW_COLOR, textColor: blackOrWhiteText(YELLOW_TEXT_COLOR) };
		case 'low':
			return { backgroundColor: RED_COLOR, textColor: blackOrWhiteText(RED_TEXT_COLOR) };
		default:
			return { backgroundColor: GRAY_COLOR, textColor: blackOrWhiteText(WHITE_TEXT_COLOR) };
	}
}

export function suitabilityThresholdsDescription(
	value: number,
	dataBasis: DataBasis,
	speciesName: string
): number | string {
	const file_name: string | undefined = speciesName?.toLowerCase().replace(' ', '_');
	const threshold: Thresholds = get(thresholds);
	const scale = dataBasis == 'Suitability' ? 'suitabilities' : 'productivities';

	if (!Object.hasOwn(threshold[scale], file_name)) return '';

	if (value >= threshold[scale][file_name][1]) {
		return 'good';
	} else if (value >= threshold[scale][file_name][0]) {
		return 'neutral';
	} else if (value < threshold[scale][file_name][0]) {
		return 'insufficient';
	} else {
		return value;
	}
}

export function productivityThresholdsDescription(
	value: number,
	speciesName: string
): number | string {
	const speciesNameParsed: string | undefined = speciesName?.toLowerCase().replace(' ', '_');
	const thresholdsMap: ProductivityThresholds = productivityThresholds;
	const speciesThresholds = thresholdsMap[speciesNameParsed];
	if (!speciesThresholds) return value;

	const threshold = speciesThresholds.find(
		(threshold) => value > threshold.min && value <= threshold.max
	);
	if (!threshold) return value;
	return threshold.class;
}

// get black or white text, depending on contrast score
export function blackOrWhiteText(bgColor: string) {
	const color = bgColor.charAt(0) === '#' ? bgColor.substring(1, 7) : bgColor;
	const r = parseInt(color.substring(0, 2), 16);
	const g = parseInt(color.substring(2, 4), 16);
	const b = parseInt(color.substring(4, 6), 16);

	return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? 'black' : 'white';
}
