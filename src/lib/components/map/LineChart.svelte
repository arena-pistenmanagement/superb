<script lang="ts">
	import 'chart.js/auto';
	import type { ChartData as ChartJsData, ChartOptions, ScriptableContext } from 'chart.js';
	import { lineChartData, isMobileDevice } from '$lib/stores/map-store';
	import { Line } from 'svelte-chartjs';
	import { ClimateScenarios, type DataBasis, type SpeciesData } from '$lib/utils/types';
	import { thresholdsColor } from '$lib/utils/map/color-styling';
	import { superb_labels } from '../special_species';
	import { slide } from 'svelte/transition';

	export let band: SpeciesData;
	export let tempSelectedDataBasis: DataBasis;

	function pointColor(context: ScriptableContext<'line'>, dataBasis: DataBasis): string {
		const value = typeof context.raw === 'number' ? context.raw : Number.NaN;
		return thresholdsColor(value, dataBasis, band.file_name);
	}

	function chartValues(values: Array<number | null> | undefined): number[] {
		return (values ?? [0, 0, 0, 0]).map((value) => value ?? Number.NaN);
	}

	function createData(dataBasis: DataBasis): ChartJsData<'line', number[], string> {
		const key = `species-id-${band.id}` as const;
		return {
			labels: superb_labels(band.species_name),
			datasets: [
				{
					label: `${dataBasis}: ${ClimateScenarios.rcp45}`,
					data: chartValues($lineChartData[dataBasis].rcp45[key]),
					fill: true,
					cubicInterpolationMode: 'monotone',
					tension: 0.3,
					borderWidth: 4,
					borderColor: 'rgba(0,109,91,.8)',
					backgroundColor: 'rgba(0,109,91,.1)',
					pointBorderColor: 'rgba(0, 0, 0,.5)',
					pointBackgroundColor: (context) => pointColor(context, dataBasis),
					pointBorderWidth: 0.5,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: (context) => pointColor(context, dataBasis),
					pointHoverBorderColor: 'rgba(220, 220, 220,1)',
					pointHoverBorderWidth: 2,
					pointRadius: 5,
					pointHitRadius: 20,
					spanGaps: true
				},
				{
					label: `${dataBasis}: ${ClimateScenarios.rcp85}`,
					data: chartValues($lineChartData[dataBasis].rcp85[key]),
					fill: true,
					cubicInterpolationMode: 'monotone',
					tension: 0.3,
					borderWidth: 4,
					borderColor: 'rgba(190,18,87,.8)',
					backgroundColor: 'rgba(190,18,87,.1)',
					pointBorderColor: 'rgba(0, 0, 0,.5)',
					pointBackgroundColor: (context) => pointColor(context, dataBasis),
					pointBorderWidth: 0.5,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: (context) => pointColor(context, dataBasis),
					pointHoverBorderColor: 'rgba(220, 220, 220,1)',
					pointHoverBorderWidth: 2,
					pointRadius: 5,
					pointHitRadius: 20,
					spanGaps: true
				}
			]
		};
	}

	function createOptions(dataBasis: DataBasis): ChartOptions<'line'> {
		return {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				x: {
					type: 'category',
					grid: { drawOnChartArea: false, color: 'gray' },
					border: { color: 'gray' },
					title: {
						display: true,
						text: 'Year',
						padding: $isMobileDevice ? 4 : 0,
						color: 'gray',
						font: { size: $isMobileDevice ? 12 : 14 }
					},
					ticks: { color: 'gray', font: { size: 12 } }
				},
				y: {
					type: 'linear',
					display: true,
					position: 'left',
					grid: { drawOnChartArea: false, color: 'gray' },
					border: { color: 'gray' },
					min: 0,
					max: dataBasis === 'Suitability' ? 100 : 50,
					title: {
						display: true,
						padding: $isMobileDevice ? 4 : 0,
						color: 'gray',
						font: { size: $isMobileDevice ? 12 : 14 }
					},
					ticks: { color: 'gray', font: { size: 12 } }
				}
			},
			animations: {
				y: { from: 2000, duration: 1000, delay: 0 },
				x: { from: 0, duration: 1000, delay: 0 }
			},
			plugins: {
				legend: {
					position: 'bottom',
					labels: {
						boxWidth: $isMobileDevice ? 10 : 12,
						textAlign: 'left',
						font: { size: $isMobileDevice ? 10 : 12 }
					}
				},
				title: {
					display: true,
					text:
						dataBasis === 'Suitability' ? 'Suitability [%]' : 'Productivity: Height [m] at 100 yrs',
					font: { size: 12 }
				}
			}
		};
	}

	$: data = createData(tempSelectedDataBasis);
	$: options = createOptions(tempSelectedDataBasis);
</script>

<div transition:slide={{ duration: 800 }} class="w-full m-5 lg:px-5 h-80">
	<Line {data} {options} />
</div>
