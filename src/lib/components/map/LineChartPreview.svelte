<script lang="ts">
	import 'chart.js/auto';
	import type { ChartData as ChartJsData, ChartOptions, ScriptableContext } from 'chart.js';
	import { isLoadingSpecies, lineChartData } from '$lib/stores/map-store';
	import { Line } from 'svelte-chartjs';
	import { type DataBasis, type SpeciesData } from '$lib/utils/types';
	import { thresholdsColor } from '$lib/utils/map/color-styling';
	import { superb_labels } from '../special_species';

	export let band: SpeciesData;
	export let tempSelectedDataBasis: DataBasis;

	function pointColor(context: ScriptableContext<'line'>): string {
		const value = typeof context.raw === 'number' ? context.raw : Number.NaN;
		return [0, 3].includes(context.dataIndex)
			? thresholdsColor(value, tempSelectedDataBasis, band.file_name)
			: 'gray';
	}

	function pointSize(context: ScriptableContext<'line'>): number {
		return [0, 3].includes(context.dataIndex) ? 3 : 1;
	}

	function chartValues(values: Array<number | null> | undefined): number[] {
		return (values ?? [0, 0, 0, 0]).map((value) => value ?? Number.NaN);
	}

	function createData(): ChartJsData<'line', number[], string> {
		const key = `species-id-${band.id}` as const;
		const fallback = [0, 0, 0, 0];
		return {
			labels: superb_labels(band.species_name),
			datasets: [
				{
					data: $isLoadingSpecies
						? fallback
						: chartValues($lineChartData[tempSelectedDataBasis].rcp45[key]),
					fill: false,
					cubicInterpolationMode: 'monotone',
					tension: 0.3,
					pointStyle: 'circle',
					pointRadius: pointSize,
					pointBackgroundColor: pointColor,
					pointBorderColor: pointColor,
					borderColor: 'lightgray',
					spanGaps: true
				},
				{
					data: $isLoadingSpecies
						? fallback
						: chartValues($lineChartData[tempSelectedDataBasis].rcp85[key]),
					fill: false,
					cubicInterpolationMode: 'monotone',
					tension: 0.3,
					pointStyle: 'circle',
					pointRadius: pointSize,
					pointBackgroundColor: pointColor,
					pointBorderColor: pointColor,
					borderColor: 'lightgray',
					spanGaps: true
				}
			]
		};
	}

	$: data = createData();

	$: options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				type: 'category',
				grid: { drawOnChartArea: false },
				display: false
			},
			y: {
				type: 'linear',
				display: false,
				grid: { drawOnChartArea: false },
				title: { display: true },
				min: -10,
				max: tempSelectedDataBasis === 'Suitability' ? 110 : 60
			}
		},
		plugins: {
			legend: { display: false },
			tooltip: { enabled: false }
		}
	} satisfies ChartOptions<'line'>;
</script>

<Line {data} {options} />
