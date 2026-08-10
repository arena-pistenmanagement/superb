<script lang="ts">
	import { Trees } from 'lucide-svelte';
	import Footer from './Footer.svelte';

	let innerHeight: number;
</script>

<svelte:window bind:innerHeight />

<div class="prose-sm overflow-auto lg:px-6 px-2" style="height: {innerHeight * 0.8}px">
	<h3 class="font-semibold">Species Considered</h3>
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		How were target tree species selected for the Decision Support Tool (DST)?
	</h3>
	<p>
		Species selection was based on consultations with demonstration (DEMO) sites in the SUPERB
		project. These sites identified ecologically and practically significant species for
		restoration. Based on these consultations, species with sufficient data were selected to develop
		reliable models for the tool.
	</p>

	<h3 class="font-semibold">Climate Change Scenarios</h3>
	<!-- Climate Change Scenarios -->
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>What climate
		change scenarios are used in the DST?
	</h3>
	<p>The DST incorporates two Representative Concentration Pathway (RCP) scenarios:</p>
	<ul>
		<li>
			RCP 4.5 (Intermediate scenario): Greenhouse gas emissions peak around 2040 before declining,
			leading to a projected global temperature increase of approximately 2.7°C by 2100.
		</li>
		<li>
			RCP 8.5 (High-emission scenario): Emissions continue to rise throughout the century, resulting
			in a projected temperature increase of 4.4°C by 2100.
		</li>
	</ul>

	<!-- Climate Change Projections -->
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>How does the DST
		incorporate climate change projections?
	</h3>
	<p>The DST provides species suitability and productivity projections for four timeframes:</p>
	<ul>
		<li>1981–2010 (historical reference)</li>
		<li>2011–2040</li>
		<li>2041–2070</li>
		<li>2071–2100</li>
	</ul>
	<p>Each timeframe represents the average climate conditions for that period.</p>

	<!-- Models for Single-Species Recommendations -->
	<h3 class="font-semibold">Models for Single-Species Recommendations</h3>
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		What modelling framework is used for individual tree species recommendations?
	</h3>
	<p>
		The DST uses Species Distribution Models (SDMs) developed with Generalized Additive Models
		(GAMs). These models generate species suitability scores (0–100), indicating the likelihood of a
		species thriving in a given location based on climate conditions.
	</p>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		What does species suitability mean?
	</h3>
	<p>
		In the DST, species suitability refers to how likely a species is to thrive in a specific area
		based on climate conditions. In the DST, suitability it is determined exclusively by climate
		factors and projected using Species Distribution Models (SDMs).
	</p>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		What is a species distribution model (SDM)?
	</h3>
	<p>
		A species distribution model (SDM) is a statistical or machine learning model that predicts
		where a species is likely to occur based on environmental factors. SDMs use species occurrence
		data (locations where the species has been observed) and relate it to environmental conditions
		to estimate the species' potential distribution across a landscape. These models are commonly
		used in biodiversity conservation, ecological research, and climate change impact assessments.
	</p>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		What data was used to build the SDMs?
	</h3>
	<p>
		The models were trained using species occurrence data from national forest inventories across
		Europe and other forest databases such as ICP Forests.
	</p>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>How is tree
		productivity assessed in the DST?
	</h3>
	<p>
		Productivity is estimated using guide curves, which predict tree height at a reference age of
		100 years. These reference height values were then projected based solely on climate variables
		under different climate change scenarios. The models were developed using data from National
		Forest Inventories across Europe.
	</p>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		Why might suitability and productivity produce divergent estimates?
	</h3>
	<p>
		There are two main reasons why suitability estimates do not always correlate with productivity
		estimates:
	</p>
	<ol>
		<li>
			Modelling Framework Differences: Suitability and productivity are estimated using distinct
			models, each with its own underlying assumptions, input variables, and associated
			uncertainties. These methodological differences can lead to variations in the predicted
			outcomes.
		</li>
		<li>
			Conceptual Differences: Suitability, based on species distribution models (SDMs), reflects
			where a species is commonly found, influenced by factors like management, competition, and
			historical distribution. Productivity, however, estimates potential tree growth, which may be
			highest in areas with more favourable climate conditions, even if the species is rarely
			present there. This can lead to mismatches between suitability and productivity estimates. For
			example, Norway spruce may exhibit high suitability near the upper tree line due to its
			tolerance of cold temperatures, short growing seasons, and frequent occurrence in such
			environments. However, at these elevations, tree growth is constrained by low temperatures,
			limited soil fertility, and a shorter vegetation period, resulting in lower productivity. In
			contrast, spruce stands at lower elevations may achieve higher productivity due to more
			favourable growth conditions. However, their suitability may be lower if these areas are at
			the edge or outside the species' natural distribution, where such stands are less common.
		</li>
	</ol>

	<!-- Models for Species Composition Recommendations -->
	<h3 class="font-semibold">Models for Species Composition Recommendations</h3>
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		How does the DST suggest species compositions?
	</h3>
	<p>The DST applies two methods:</p>
	<ul>
		<li>
			Co-occurrence analysis – Identifies positive, negative, or random species associations based
			on observed presence in the same environments.
		</li>
		<li>
			Association rule mining (ECLAT method) – Detects frequently observed species combinations in
			forest plots to ensure recommendations reflect real-world interactions.
		</li>
	</ul>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		What are the species groups in the species composition module?
	</h3>
	<p>
		The DST displays the 20 most common species groupings in the selected region, ranked by their
		average suitability. These groups prioritize biodiversity, but in practice, smaller subsets may
		be more common in the field.
	</p>

	<!-- Models for Seed Source Recommendations -->
	<h3 class="font-semibold">Models for Seed Source Recommendations</h3>
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		What information is used to recommend seed sources?
	</h3>
	<p>Seed source selection is based on two modelling approaches:</p>
	<ul>
		<li>
			Universal Response Functions (URFs) – Predict seed source suitability by integrating genetic
			and environmental data.
		</li>
		<li>
			Climate Analogue Models – Identify present-day locations with climates similar to projected
			future conditions.
		</li>
	</ul>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>How does the DST
		determine the best seed sources using URFs?
	</h3>
	<p>
		The DST applies URFs trained on data from 587 forest provenance trials across Europe. These
		models predict the most suitable seed sources for seven tree species under both current and
		future climate conditions.
	</p>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		What is a Climate Analogue Model, and how does it help with seed sourcing?
	</h3>
	<p>
		Climate Analogue Models identify regions where today's climate closely matches projected future
		conditions. This approach helps users locate optimal areas for sourcing forest reproductive
		material under changing climate scenarios.
	</p>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>Which seed stands
		are recommended by the DST?
	</h3>
	<p>
		The DST identifies suitable seed stands by integrating data from the Forest Reproductive
		Material Information System (FOREMATIS), a European Commission platform that standardizes and
		manages national lists of forest reproductive material. To ensure comprehensive species
		distribution coverage across Europe, the DST also incorporates data from national forest
		inventories. This combined approach enables users to select genetically and ecologically
		suitable seed sources for restoration, reforestation, and afforestation projects.
	</p>

	<!-- Natural Regeneration and Seeding -->
	<h3 class="font-semibold">Natural Regeneration and Seeding</h3>
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		Can the DST assess natural regeneration potential?
	</h3>
	<p>Yes. The DST provides a decision tree framework to evaluate:</p>
	<ul>
		<li>Presence of natural regeneration</li>
		<li>Suitability of regenerating species under future climate conditions</li>
		<li>Genetic diversity of the regenerating population</li>
	</ul>

	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>
		How does the DST support seeding decisions?
	</h3>
	<p>
		The DST offers species-specific germination data from meta-analyses and International Seed
		Testing Association (ISTA) data. It helps users determine whether natural regeneration, seeding,
		or planting is the best strategy for a given location.
	</p>

	<!-- Supplementary Material -->
	<h3 class="font-semibold">Supplementary Material</h3>
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>The data behind
		the tool
	</h3>
	<p>
		Chakraborty, D., Wang, T., Andre, K., Konnert, M., Lexer, M.J., Matulla, C., Schueler, S. (2015)
		Selecting Populations for Non-Analogous Climate Conditions Using Universal Response Functions:
		The Case of Douglas-Fir in Central Europe. PLOS ONE. 10(8):e0136357. <a
			class="underline underline-blue-700"
			href="https://doi.org/10.1371/journal.pone.0136357"
			>https://doi.org/10.1371/journal.pone.0136357</a
		>
	</p>
	<p>
		Chakraborty, D., Dobor, L., Zolles, A., Hlásny, T., Schueler, S. (2020) High-resolution gridded
		climate data for Europe based on bias-corrected EURO-CORDEX: the ECLIPS-2.0 dataset. Zenodo. <a
			class="underline underline-blue-700"
			href="https://doi.org/10.5281/zenodo.3952159">https://doi.org/10.5281/zenodo.3952159</a
		>
	</p>
	<p>
		Chakraborty, D., Móricz, N., Rasztovits, E. et al. (2021) Provisioning forest and conservation
		science with high-resolution maps of potential distribution of major European tree species under
		climate change. Annals of Forest Science 78, 26. <a
			class="underline underline-blue-700"
			href="https://doi.org/10.1007/s13595-021-01029-4"
			>https://doi.org/10.1007/s13595-021-01029-4</a
		>
	</p>
	<p>
		Chakraborty D, Ciceu A, Ballian D, et al (2024) Assisted tree migration can preserve the
		European forest carbon sink under climate change. Nat Clim Chang 1–8. <a
			class="underline underline-blue-700"
			href="https://doi.org/10.1038/s41558-024-02080-5"
			>https://doi.org/10.1038/s41558-024-02080-5</a
		>
	</p>

	<!-- Policy Briefs -->
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>Policy briefs
	</h3>
	<p>
		SUSTREE Policy Brief 1: Gaviria, Julian, Debojyoti Chakraborty, Dagmar Bednárová, Andreas Bolte,
		Rafael Buchacher, Christina Bouissou, Reneema Hazarika et al. "Conservation and sustainable
		utilization of forest tree diversity in climate change". SUSTREE Policy Brief No. 1, Output of
		the INTERREG CENTRAL EUROPE Programme 2014-2020. (2019).
	</p>
	<p>
		SUSTREE Policy Brief 2: Chakraborty, Debojyoti, Julian Gaviria, Dagmar Bednárová, Andreas Bolte,
		Christina Bouissou, Rafael Buchacher, Reneema Hazarika et al. "Implementing assisted migration.
		SUSTREE Policy Brief No. 2, Output of the INTERREG CENTRAL EUROPE Programme 2014-2020." (2019).
	</p>
	<p>
		SUPERB Policy Brief: Chakraborty, D., Schüler S., Ciceu, A., Bauhus, J., Bou Dagher, M., Đodan,
		M., Kramer, K., Svensson, J., Schatzdorfer, E. 2024. How to strengthen the European forest
		carbon sink through prestoration: integrating active restoration and adaptation. Policy Brief
		11. European Forest Institute. <a class="underline" href="https://doi.org/10.36333/pb11"
			>https://doi.org/10.36333/pb11</a
		>
	</p>

	<!-- FOREMATIS Information -->
	<h3 class="font-light">
		<Trees class="inline align-end pr-2 pb-1" strokeWidth="1.5" size="28"></Trees>Information about
		Forest Reproductive Material
	</h3>
	<p>
		FOREMATIS Forest Reproductive Material Information System website: <a
			class="underline underline-blue-700"
			href="https://ec.europa.eu/forematis/">https://ec.europa.eu/forematis/</a
		>
	</p>
	<Footer />
</div>
