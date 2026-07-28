// TreeReport.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mapbox } from '../map/mapbox';
import type { ClimateScenario, CustomGroup, ReportSelection, SpeciesData } from '../types';
import { getSpeciesDataByName, queryGeographicalRegion } from '../map/query-features';
import { findPrecalculatedGroups } from '../mixtures';
import {
	productivityThresholdsDescription,
	suitabilityThresholdsDescription
} from '../map/color-styling';
import { customGroup } from '$lib/stores/mixture-store';
import { local_provenance_species } from '$lib/components/special_species';
import { hasSpeciesComposition, recommendedProvenance } from '$lib/stores/map-store';
import { get } from 'svelte/store';

export class TreeReport {
	private doc: jsPDF;
	private pageNumber: number = 1;
	private scenarios: ClimateScenario[] = ['rcp45', 'rcp85'];
	private years: string[] = ['2025', '2055', '2085'];
	private reportSelection: ReportSelection;
	private speciesReferenceYear: string;
	private tableCounter: number = 1;
	private figureCounter: number = 1;

	constructor(reportSelection: ReportSelection, _selectedSpecies: string) {
		this.doc = new jsPDF();
		this.doc.setFont('helvetica');
		this.speciesReferenceYear = '1995';
		this.reportSelection = reportSelection;
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	private addPage(): void {
		this.doc.addPage();
		this.pageNumber++;
	}

	private addFooter(): void {
		const today = new Date().toLocaleDateString();
		this.doc.setFontSize(10);
		this.doc.text(`${today}`, 20, 285);
		this.doc.text(`${this.pageNumber}`, 190, 285);
	}

	private async loadImage(url: string): Promise<string> {
		try {
			const response = await fetch(url);
			if (!response.ok) return '';
			const blob = await response.blob();
			return await this.blobToBase64(blob);
		} catch (error) {
			return '';
		}
	}

	private blobToBase64(blob: Blob): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	}

	private async addHeader() {
		this.doc.addImage(await this.loadImage('superb_logo.png'), 'PNG', 150, 10, 40, 15);
		this.doc.addImage(await this.loadImage('report-bfw-logo.png'), 'PNG', 20, 10, 49, 10);
	}

	private async addTitlePage() {
		await this.addHeader();
		this.doc.addImage(await this.loadImage('eu_statement.png'), 'PNG', 20, 240, 100, 26.9);
		this.doc.addImage(await this.loadImage('seed4forest-logo.png'), 'PNG', 50, 90, 100, 46);
		this.addFooter();
	}

	private async addCoverPage(location: number[], selectedSpecie: SpeciesData): Promise<void> {
		this.addPage();
		await this.addHeader();
		this.doc.setFontSize(24);
		this.doc.text('Seed4Forest Decision Support Tool', this.doc.internal.pageSize.width / 2, 60, {
			align: 'center'
		});
		this.doc.text('Report', this.doc.internal.pageSize.width / 2, 80, {
			align: 'center'
		});
		this.doc.setFontSize(18);
		this.doc.text('Background', 20, 100);
		this.doc.setFontSize(12);
		const paragraph = `This report provides an overview of the information accessed by users through the Seed4Forest Decision Support Tool. While the tool is primarily designed to provide forest practitioners with actionable recommendations for afforestation, reforestation, and restoration planning, it also serves as a valuable resource for policymakers, conservationists, and other stakeholders seeking data-driven insights for forest management and climate adaptation. The tool offers guidance on the potential suitability and productivity of various tree species and provenances across different future timeframes and climate change scenarios. Additionally, it provides recommendations for species compositions to support the establishment of climate-adapted forest ecosystems. For more detailed information on model development, please refer to the publications listed in the information section of the online version of the decision support tool.`;

		this.doc.text(this.doc.splitTextToSize(paragraph, 160), 20, 107, {
			align: 'justify',
			maxWidth: 170
		});

		this.doc.setFontSize(18);
		this.doc.text('Selected Location:', 20, 175);
		this.doc.setFontSize(12);
		const locationText = `Location: ${await getReverseGeoCodingString(location)}`;
		this.doc.text(this.doc.splitTextToSize(locationText, 160), 20, 182, {
			align: 'justify',
			maxWidth: 100
		});
		this.doc.text(`Lon. ${location[0].toFixed(4)}°, Lat. ${location[1].toFixed(4)}°`, 20, 192);
		this.doc.text(`Altitude: ${await getAltitude(location)} m`, 20, 197);
		this.doc.setFontSize(18);
		this.doc.text('Main species selected:', 20, 209);
		this.doc.setFontSize(12);
		this.doc.text(
			`Species: ${selectedSpecie.english_name} lat. ${selectedSpecie.species_name}`,
			20,
			215
		);

		this.addFooter();
	}

	private async addSuitabilityPage(selectedSpecie: SpeciesData): Promise<void> {
		this.addPage();
		await this.addHeader();

		this.doc.setFontSize(18);
		this.doc.text('Species suitability', 20, 35);

		this.doc.setFontSize(12);
		this.doc.text(`Suitability of ${selectedSpecie.species_name}`, 20, 42);
		this.doc.text(
			`Reference (${this.speciesReferenceYear}) suitability: ${getSpeciesDataByName(selectedSpecie.species_name, 'ref', this.speciesReferenceYear)?.suitability} %`,
			20,
			47
		);

		const suitabilityCurrent =
			getSpeciesDataByName(selectedSpecie.species_name, 'ref', this.speciesReferenceYear)
				?.suitability ?? 0;
		const suitabilityRCP45 =
			getSpeciesDataByName(selectedSpecie.species_name, 'rcp45', '2085')?.suitability ?? 0;
		const suitabilityRCP85 =
			getSpeciesDataByName(selectedSpecie.species_name, 'rcp85', '2085')?.suitability ?? 0;

		const suitabilityCatergoryCurrent = suitabilityThresholdsDescription(
			suitabilityCurrent,
			'Suitability',
			selectedSpecie.file_name
		);
		const suitabilityCatergoryRCP45 = suitabilityThresholdsDescription(
			suitabilityRCP45,
			'Suitability',
			selectedSpecie.file_name
		);

		const rcp45GreaterRcp85 = suitabilityRCP45 > suitabilityRCP85;

		const suitabilityCatergoryRCP85 = suitabilityThresholdsDescription(
			suitabilityRCP85,
			'Suitability',
			selectedSpecie.file_name
		);

		const summaryParagraph = `The reference suitability of the species in the selected location is classified as ${suitabilityCatergoryCurrent}. Under the RCP 4.5 climate change scenario, the species suitability is projected to be ${suitabilityCatergoryRCP45} and it ${suitabilityCatergoryCurrent == suitabilityCatergoryRCP45 ? 'remains' : rcp45GreaterRcp85 ? 'decreases to' : 'increases to'} ${suitabilityCatergoryRCP85} in the RCP 8.5 scenario. All for the end of the century (2085).`;
		this.doc.text(this.doc.splitTextToSize(summaryParagraph, 160), 20, 55, {
			align: 'justify',
			maxWidth: 170
		});

		if (this.reportSelection.includeSuitabilityTable) {
			this.doc.text(
				`Table ${this.tableCounter}: Projected Suitability of ${selectedSpecie.species_name} Under Future Climate Change Scenarios.`,
				20,
				80
			);
			this.tableCounter++;

			const result = this.scenarios.flatMap((scenario) =>
				this.years.map((year) => getSpeciesDataByName(selectedSpecie.species_name, scenario, year))
			);

			const suitabilityTable: string[][] = [];

			result.forEach((data) => {
				if (data?.timeframe !== undefined) {
					suitabilityTable.push([
						`${data?.climate_scenario === 'rcp45' ? 'RCP4.5' : 'RCP8.5'}`,
						data?.timeframe ?? '',
						`${data.suitability !== null && data.suitability <= 100 ? data.suitability : ' - '}`
					]);
				}
			});

			autoTable(this.doc, {
				theme: 'grid',
				head: [['Scenario', 'Timeframe', 'Suitability in %']],
				margin: { top: 85, left: 20, right: 20 },
				body: suitabilityTable
			});
		}

		if (this.reportSelection.includeSuitabilityChart) {
			const marginTop = this.reportSelection.includeSuitabilityTable ? 150 : 90;
			// wait for 400 ms before the chart is rendered
			await this.delay(400);
			const suitabilityChart = document.getElementById('suitability-export-container')
				?.children[0] as HTMLCanvasElement;
			this.doc.addImage(
				suitabilityChart.toDataURL('image/png'),
				'PNG',
				20,
				marginTop,
				150,
				75,
				undefined,
				'MEDIUM'
			);
			this.doc.text(
				this.doc.splitTextToSize(
					`Figure ${this.figureCounter}: Projected Suitability of ${selectedSpecie.species_name} Under the Reference Climate and Future Climate Change Scenarios`,
					160
				),
				20,
				marginTop + 80,
				{
					align: 'justify',
					maxWidth: 160
				}
			);
			this.figureCounter++;
		}
		this.addFooter();
	}

	private async addProductivityPage(selectedSpecie: SpeciesData): Promise<void> {
		this.addPage();
		await this.addHeader();

		this.doc.setFontSize(18);
		this.doc.text('Species productivity', 20, 33);

		if (
			getSpeciesDataByName(selectedSpecie.species_name, 'ref', this.speciesReferenceYear)
				?.productivity === 0
		) {
			this.doc.setFontSize(12);
			this.doc.text(
				`No productivity data for ${selectedSpecie.english_name} lat. ${selectedSpecie.species_name} available.`,
				20,
				40
			);
			return;
		}

		this.doc.setFontSize(12);
		this.doc.text(`Productivity of ${selectedSpecie.species_name}`, 20, 40);
		this.doc.text(
			`Reference (${this.speciesReferenceYear}) Productivity: ${getSpeciesDataByName(selectedSpecie.species_name, 'ref', this.speciesReferenceYear)?.productivity} (Height [m] at 100 yrs)`,
			20,
			45
		);

		const productivityCurrent =
			getSpeciesDataByName(selectedSpecie.species_name, 'ref', this.speciesReferenceYear)
				?.productivity ?? 0;
		const productivityRCP45 =
			getSpeciesDataByName(selectedSpecie.species_name, 'rcp45', '2085')?.productivity ?? 0;
		const productivityRCP85 =
			getSpeciesDataByName(selectedSpecie.species_name, 'rcp85', '2085')?.productivity ?? 0;

		const productivityCatergoryCurrent = productivityThresholdsDescription(
			productivityCurrent,
			selectedSpecie.file_name
		);
		const productivityCatergoryRCP45 = productivityThresholdsDescription(
			productivityRCP45,
			selectedSpecie.file_name
		);

		const rcp45GreaterRcp85 = productivityRCP45 > productivityRCP85;

		const productivityCatergoryRCP85 = productivityThresholdsDescription(
			productivityRCP85,
			selectedSpecie.file_name
		);

		const summaryParagraph = `The reference productivity of the species in the selected location is classified as ${productivityCatergoryCurrent}. Under the RCP 4.5 climate change scenario, the species productivity is projected to be ${productivityCatergoryRCP45} and it ${productivityCatergoryCurrent == productivityCatergoryRCP45 ? 'remains' : rcp45GreaterRcp85 ? 'decreases to' : 'increases to'} ${productivityCatergoryRCP85} in the RCP 8.5 scenario. All for the end of the century (2085).`;
		this.doc.text(this.doc.splitTextToSize(summaryParagraph, 160), 20, 55, {
			align: 'justify',
			maxWidth: 170
		});

		if (this.reportSelection.includeProductivityTable) {
			this.doc.text(
				`Table ${this.tableCounter}: Projected Productivity of ${selectedSpecie.species_name} Under Future Climate Change Scenarios.`,
				20,
				80
			);
			this.tableCounter++;

			const result = this.scenarios.flatMap((scenario) =>
				this.years.map((year) => getSpeciesDataByName(selectedSpecie.species_name, scenario, year))
			);

			const productivityTable: string[][] = [];

			result.forEach((data) => {
				if (data?.timeframe !== undefined) {
					productivityTable.push([
						`${data?.climate_scenario === 'rcp45' ? 'RCP4.5' : 'RCP8.5'}`,
						data?.timeframe ?? '',
						`${data.productivity !== null && data.productivity <= 100 ? data.productivity : ' - '}`
					]);
				}
			});
			autoTable(this.doc, {
				theme: 'grid',
				head: [['Scenario', 'Timeframe', 'Productivity (Height [m] at 100 yrs)']],
				margin: { top: 85, left: 20, right: 20 },
				body: productivityTable
			});
		}

		if (this.reportSelection.includeProductivityChart) {
			const marginTop = this.reportSelection.includeProductivityTable ? 150 : 90;
			await this.delay(400);
			this.doc.addImage(
				(
					document.getElementById('productivity-export-container')?.children[0] as HTMLCanvasElement
				).toDataURL('image/png'),
				'PNG',
				20,
				marginTop,
				150,
				75,
				undefined,
				'MEDIUM'
			);
			this.doc.text(
				this.doc.splitTextToSize(
					`Figure ${this.figureCounter}: Projected Productivity of ${selectedSpecie.species_name} Under the Reference Climate and Future Climate Change Scenarios`,
					160
				),
				20,
				marginTop + 80,
				{
					align: 'justify',
					maxWidth: 160
				}
			);
			this.figureCounter++;
		}
		this.addFooter();
	}

	private async addMixturesPage(selectedSpecie: SpeciesData, location: number[]): Promise<void> {
		this.addPage();
		await this.addHeader();
		const coordinate = { lat: location[0], lon: location[1] };

		const geographicalRegion = (await queryGeographicalRegion(coordinate)) ?? '';
		const otherSpecies = (
			await findPrecalculatedGroups(
				selectedSpecie,
				geographicalRegion,
				'ref',
				this.speciesReferenceYear
			)
		).otherGroup;
		const resultCurrent = (
			await findPrecalculatedGroups(
				selectedSpecie,
				geographicalRegion,
				'ref',
				this.speciesReferenceYear
			)
		).groups;
		const resultRCP45 = (
			await findPrecalculatedGroups(selectedSpecie, geographicalRegion, 'rcp45', '2085')
		).groups;
		const resultRCP85 = (
			await findPrecalculatedGroups(selectedSpecie, geographicalRegion, 'rcp85', '2085')
		).groups;

		this.doc.setFontSize(18);
		this.doc.text('Species Composition', 20, 35);
		this.doc.setFontSize(12);

		const otherSpeciesList = otherSpecies.map((species) => species.value);
		const otherSpeciesFormatted =
			otherSpeciesList.length == 1
				? `is ${otherSpeciesList}`
				: `are ${otherSpeciesList.slice(0, -1).join(', ')} and ${otherSpeciesList.slice(-1)}`;
		const paragraph =
			`The following table represents the top ${resultCurrent.length >= 5 ? 'five' : resultCurrent.length} tree species compositions, ranked by suitability. Each of these compositions include ${selectedSpecie.species_name} ` +
			`and are recommended for the selected location under the ` +
			`${
				this.reportSelection.mixtureTimeframe == 'ref'
					? `reference climate (${this.speciesReferenceYear})`
					: this.reportSelection.mixtureClimateScenario == 'rcp45'
						? 'RCP 4.5 climate change scenario for the end of the century (2085).'
						: 'RCP 8.5 climate change scenario for the end of the century (2085).'
			} ${otherSpeciesList.length > 0 ? `Additional tree species that can be combined with ${selectedSpecie.species_name} ${otherSpeciesFormatted}.` : ''}`;

		this.doc.text(this.doc.splitTextToSize(paragraph, 160), 20, 42, {
			align: 'justify',
			maxWidth: 170
		});

		this.addFooter();
		const additionalPages: number[] = [this.pageNumber];

		this.doc.setFontSize(12);
		this.doc.text(
			this.doc.splitTextToSize(
				`Table ${this.tableCounter}: Projected Suitability and Productivity of the Top ${resultCurrent.length >= 5 ? 5 : resultCurrent.length} Species Composition Groups Under the ${this.reportSelection.mixtureTimeframe === 'ref' ? `Reference Climate (${this.speciesReferenceYear})` : this.reportSelection.mixtureClimateScenario == 'rcp45' ? 'RCP 4.5 Climate Change Scenario for 2085' : 'RCP 8.5 Climate Change Scenario for 2085'}.`,
				160
			),
			20,
			80,
			{
				align: 'justify',
				maxWidth: 160
			}
		);
		this.tableCounter++;

		if (this.reportSelection.mixtureTimeframe == 'ref') {
			resultCurrent.slice(0, 5).forEach(async (group, index) => {
				const groupTable: string[][] = [
					[
						`${group.group} / avg.`,
						`${group.groupSuitability <= 100 ? group.groupSuitability : '-'}`,
						`${group.groupProductivity <= 100 ? group.groupProductivity : '-'}`
					]
				];

				group.items.forEach((item) => {
					groupTable.push([
						item.value,
						`${item.suitability <= 100 ? item.suitability : '-'}`,
						`${item.productivity <= 100 ? item.productivity : '-'}`
					]);
				});

				autoTable(this.doc, {
					theme: 'grid',
					head: [['Name', 'Suitability in %', 'Productivity in height [m] at 100 yrs']],
					body: groupTable,
					margin: index == 0 ? { top: 90, left: 20, right: 20 } : { top: 30, left: 20, right: 20 },
					pageBreak: 'avoid',
					didDrawPage: function (data) {
						const pageNumber = data.table.startPageNumber;
						if (pageNumber !== undefined && !additionalPages.includes(pageNumber)) {
							additionalPages.push(pageNumber);
						}
					}
				});
			});
		} else {
			if (this.reportSelection.mixtureClimateScenario == 'rcp45') {
				resultRCP45.slice(0, 5).forEach((group, index) => {
					const groupTable: string[][] = [
						[
							group.group,
							`${group.groupSuitability <= 100 ? group.groupSuitability : '-'}`,
							`${group.groupProductivity <= 100 ? group.groupProductivity : '-'}`
						]
					];

					group.items.forEach((item) => {
						groupTable.push([
							item.value,
							`${item.suitability <= 100 ? item.suitability : '-'}`,
							`${item.productivity <= 100 ? item.productivity : '-'}`
						]);
					});

					autoTable(this.doc, {
						theme: 'grid',
						head: [['Name', 'Suitability in %', 'Productivity (Height [m] at 100 yrs)']],
						body: groupTable,
						margin:
							index == 0 ? { top: 90, left: 20, right: 20 } : { top: 30, left: 20, right: 20 },
						pageBreak: 'avoid'
					});
				});
			} else {
				resultRCP85.slice(0, 5).forEach((group, index) => {
					const groupTable: string[][] = [
						[group.group, `${group.groupSuitability}`, `${group.groupProductivity}`]
					];

					group.items.forEach((item) => {
						groupTable.push([
							item.value,
							`${item.suitability <= 100 ? item.suitability : '-'}`,
							`${item.productivity <= 100 ? item.productivity : '-'}`
						]);
					});

					autoTable(this.doc, {
						theme: 'grid',
						head: [['Name', 'Suitability in %', 'Productivity (Height [m] at 100 yrs)']],
						body: groupTable,
						margin:
							index == 0 ? { top: 90, left: 20, right: 20 } : { top: 30, left: 20, right: 20 },
						pageBreak: 'avoid'
					});
				});
			}
		}

		await this.addHeader();
		this.pageNumber++;
		this.addFooter();

		if (this.reportSelection.includeCustomGroup) {
			let customGroupFromStore: CustomGroup = {
				group: '',
				isCustomGroup: true,
				selectedItems: [],
				groupSuitability: 0,
				groupProductivity: 0,
				items: []
			};
			customGroup.subscribe((mixture) => {
				customGroupFromStore = mixture;
			});

			const customGroupTable: string[][] = [
				[
					`Custom Group - ${customGroupFromStore.group} / avg.`,
					`${customGroupFromStore.groupSuitability}`,
					`${customGroupFromStore.groupProductivity}`
				]
			];

			customGroupFromStore.selectedItems.forEach((item) => {
				if (item.checked) {
					customGroupTable.push([item.value, `${item.suitability}`, `${item.productivity}`]);
				}
			});

			autoTable(this.doc, {
				theme: 'grid',
				head: [['Name', 'Suitability in %', 'Productivity (Height [m] at 100 yrs)']],
				body: customGroupTable,
				margin: { left: 20, right: 20 }
			});
		}

		this.addFooter();
	}

	private async addProvenancePage(selectedSpecie: SpeciesData) {
		this.addPage();
		await this.addHeader();
		this.doc.setFontSize(18);
		this.doc.text('Provenance Selection', 20, 35);
		this.doc.setFontSize(12);
		this.addFooter();

		if (
			selectedSpecie[`cluster_${this.reportSelection.mixtureClimateScenario}`] == 0 &&
			local_provenance_species().includes(selectedSpecie.species_name)
		) {
			this.doc.setFontSize(12);
			this.doc.text(
				this.doc.splitTextToSize(
					`The use of local seed sources is recommended, prioritizing natural regeneration where available.`,
					160
				),
				20,
				60,
				{
					align: 'justify',
					maxWidth: 170
				}
			);
		} else {
			const paragraph = `Table ${this.tableCounter}: Recommended Seed Stands for ${selectedSpecie.species_name} at the Selected Location for the end of the century (2085) under ${this.reportSelection.mixtureClimateScenario == 'rcp45' ? 'RCP 4.5' : 'RCP 8.5'} Climate Change Scenario.`;
			this.tableCounter++;
			this.doc.setFontSize(12);
			this.doc.text(this.doc.splitTextToSize(paragraph, 160), 20, 42, {
				align: 'justify',
				maxWidth: 170
			});
			const provenanceTable = get(recommendedProvenance)?.map((element) => [
				element.source,
				element.nationalre,
				element.altitude,
				element.ISO3_CODE,
				element.distance_to_loc
			]);

			autoTable(this.doc, {
				theme: 'grid',
				head: [
					[
						'Source',
						'National Register',
						'Altitude [m a.s.l]',
						'Country',
						'Distance to Location [km]'
					]
				],
				margin: { top: 52, left: 20, right: 20 },
				body: provenanceTable
			});
			this.addFooter();
		}
	}

	private async addAppendix() {
		this.addPage();
		await this.addHeader();
		this.doc.setFontSize(18);
		this.doc.text(
			this.doc.splitTextToSize(
				'Assessment of natural regeneration and germination conditions',
				160
			),
			20,
			35,
			{
				align: 'justify',
				maxWidth: 170
			}
		);
		this.doc.addImage(
			await this.loadImage('DecisionTreeRegeneration_var3.png'),
			'PNG',
			20,
			52,
			170,
			170
		);
		const paragraphFigure = `Figure ${this.figureCounter}: Decision Tree for Assessing the Suitability of Natural Regeneration for Forest Restoration`;
		this.doc.setFontSize(12);
		this.doc.text(this.doc.splitTextToSize(paragraphFigure, 160), 20, 42 + 170 + 30, {
			align: 'justify',
			maxWidth: 170
		});
		this.figureCounter++;
		this.addFooter();

		this.addPage();
		await this.addHeader();
		this.doc.addImage(await this.loadImage('Germination_graph.png'), 'PNG', 20, 42, 170, 170);
		const paragraph = `Figure ${this.figureCounter}: Optimum germination temperature. The grey shaded area with black bars represents the optimum germination temperature range and average values (red points) based on data from the International Seed Testing Association (ISTA). In the non-shaded area, the red points indicate the optimum germination temperature, while the blue bars represent the studied temperature range. The numbers on the right, associated with each species, indicate the number of germination tests conducted. This data is derived from a global meta-analysis (Vicente and Benito Garzón 2024) available at https://doi.org/10.1111/geb.13921.`;
		this.doc.setFontSize(12);
		this.doc.text(this.doc.splitTextToSize(paragraph, 160), 20, 42 + 170 + 10, {
			align: 'left',
			maxWidth: 170
		});
		this.addFooter();

		this.addPage();
		await this.addHeader();
		this.doc.setFontSize(12);

		const appendix = `The data presented in Figure ${this.figureCounter} are partially derived from a meta-analysis (Vicente and Benito Garzón, 2024) aimed at understanding how global warming may affect the germination of tree species across different biomes. This meta-analysis reviewed only published studies from peer-reviewed journals that conducted germination tests isolating the effects of temperature. In these studies, seeds were exposed solely to thermal variation, while other factors influencing germination, such as water availability, were maintained under optimal conditions. The figure summarizes the observed optimum, maximum, and minimum germination temperatures for several European tree species. Users should be aware that seeds can only germinate within a specific temperature range, defined by minimum and maximum thresholds—this is known as the thermal germination niche, which varies in amplitude across species. Within these limits, the temperature at which the highest germination rates occur is considered the optimum. Germination niches typically exhibit an inverted U-shape, with the lowest germination rates occurring at the minimum and maximum temperature thresholds, and the highest rates at the optimum. However, it is important to note that the temperature ranges observed in the meta-analysis do not necessarily capture the full extent of each species' germination niche. A key indication of this is when the observed optimum is very close to, or even equal to, the recorded minimum or maximum temperatures. This suggests that for some species, germination might still increase beyond the highest tested temperature. Therefore, caution should be exercised when interpreting these values.`;
		this.doc.setFontSize(12);
		this.doc.text(this.doc.splitTextToSize(appendix, 160), 20, 42, {
			align: 'justify',
			maxWidth: 170
		});
		this.figureCounter++;
		this.addFooter();

		this.addPage();
		await this.addHeader();
		this.doc.setFontSize(12);

		const label = `Table ${this.tableCounter}. Minimum number of mother trees recommended for 38 species based on German and Austrian regulations regarding the required number of seed mother trees during legal seed harvests to ensure sufficient genetic diversity.`;
		this.tableCounter++;
		this.doc.text(this.doc.splitTextToSize(label, 160), 20, 42, {
			align: 'justify',
			maxWidth: 170
		});

		this.doc.setFontSize(10);
		const table = [
			['Abies alba', 20],
			['Abies grandis', 20],
			['Acer campestre', 10],
			['Acer monspessulanum', 10],
			['Acer platanoides', 10],
			['Acer pseudoplatanus', 10],
			['Alnus glutinosa', 10],
			['Betula pendula', 10],
			['Carpinus betulus', 10],
			['Castanea sativa', 10 / 20],
			['Fagus sylvatica', 20],
			['Fraxinus excelsior', 20],
			['Juglans nigra', 10],
			['Juglans regia', 10],
			['Larix decidua', 20],
			['Larix kaempferi', 10],
			['Picea abies', 20],
			['Pinus nigra', 20],
			['Pinus sylvestris', 20],
			['Prunus avium', 10],
			['Pseudotsuga menziesii', 20],
			['Pyrus pyraster', 5],
			['Quercus cerris', 10],
			['Quercus petraea', 20],
			['Quercus pubescens', 10],
			['Quercus robur', 20],
			['Quercus rubra', 20],
			['Robinia pseudoacacia', 10],
			['Sorbus aucuparia', 5],
			['Sorbus domestica', 5],
			['Sorbus torminalis', 5],
			['Tilia cordata', 10],
			['Tilia platyphyllos', 10],
			['Ulmus glabra', 10],
			['Ulmus laevis', 10],
			['Fraxinus angustifolia', 20],
			['Populus nigra', 10],
			['Ulmus minor', 10]
		];
		this.addFooter();
		autoTable(this.doc, {
			theme: 'grid',
			head: [['Scientific name', 'Minimum number of mother trees']],
			margin: { top: 65, left: 20, right: 20 },
			body: table,
			columnStyles: {
				0: { cellWidth: 100 },
				1: { cellWidth: 70 }
			}
		});
		await this.addHeader();
		this.pageNumber++;
		this.addFooter();
	}

	public async generatePDF(
		location: number[],
		selectedSpecie: SpeciesData | undefined
	): Promise<void> {
		if (!selectedSpecie) return;
		await this.addTitlePage();
		await this.addCoverPage(location, selectedSpecie);

		if (this.reportSelection.includeSuitability) {
			await this.addSuitabilityPage(selectedSpecie);
		}

		if (this.reportSelection.includeProductivity && selectedSpecie.has_productivity == 'true') {
			await this.addProductivityPage(selectedSpecie);
		}

		if (this.reportSelection.includeMixtures && get(hasSpeciesComposition)) {
			await this.addMixturesPage(selectedSpecie, location);
		}

		if (this.reportSelection.includeProvenance && selectedSpecie.cluster_band != null) {
			await this.addProvenancePage(selectedSpecie);
		}

		await this.addAppendix();
		this.doc.save(`S4F-Report-${new Date().toISOString().split('T')[0]}.pdf`);
	}
}

export const getReverseGeoCodingString = async (coordinate: number[]) => {
	const token = mapbox.accessToken;
	const response = await fetch(
		`https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinate[0]},${coordinate[1]}.json?access_token=${token}`
	);
	if (!response.ok) return;
	const result = await response.json();
	const address = result.features[2]?.place_name ?? '';
	return address;
};

export const getAltitude = async (coordinate: number[]) => {
	const token = mapbox.accessToken;
	const response = await fetch(
		`https://api.mapbox.com/v4/mapbox.mapbox-terrain-v2/tilequery/${coordinate[0]},${coordinate[1]}.json?layers=contour&limit=50&access_token=${token}`
	);
	if (!response.ok) return;
	const result = await response.json();
	return result.features[0].properties.ele;
};
