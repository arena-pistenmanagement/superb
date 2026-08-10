# Seed4Forest Decision Support Tool

Seed4Forest is a web-based decision support tool for selecting climate-adapted tree species, species compositions, and seed sources for forest restoration, reforestation, and afforestation projects in Europe.

The tool was developed in the context of the [SUPERB project](https://forest-restoration.eu/) and supports users in exploring how tree species may respond to current and projected future climate conditions.

> Seed4Forest is a decision-support tool. Its results should be interpreted together with local ecological knowledge, forest management experience, legal requirements, and site-specific assessments.

## Features

### Location-based assessment

Users can select a location directly on the map, search for a place, or enter coordinates. The application retrieves spatial information for the selected point and produces location-specific recommendations.

### Tree species suitability

Seed4Forest ranks tree species according to their projected climatic suitability.

Suitability values range from 0 to 100 and are derived from Species Distribution Models (SDMs). The models relate observed species occurrence to climatic conditions.

The current implementation considers:

- the historical reference period 1981–2010;
- the future periods 2011–2040, 2041–2070, and 2071–2100;
- the RCP 4.5 intermediate-emission scenario;
- the RCP 8.5 high-emission scenario.

Suitability reflects climatic suitability only. Other important factors, including soils, forest management, competition, pests, disturbances, and local microsite conditions, may not be represented completely.

### Tree species productivity

The application also presents projected tree productivity. Productivity is expressed as expected tree height at a reference age of 100 years.

Suitability and productivity are produced by different modelling approaches and may therefore lead to different rankings. A species may, for example, occur frequently under particular conditions while showing higher potential growth elsewhere.

### Climate scenario comparison

Suitability and productivity can be compared across climate scenarios and time periods. Interactive charts illustrate how projected conditions change throughout the century.

### Species compositions

Seed4Forest proposes tree-species compositions intended to support biodiversity and forest resilience.

The composition module is based on:

- co-occurrence analysis of species observed in similar environments;
- association-rule mining using the ECLAT method;
- regional environmental zones;
- average projected suitability of the species in each group.

The interface displays common species groupings for the selected region and ranks them by their average suitability. Users can also create and compare custom species groups.

### Seed-source and provenance recommendations

For supported tree species, Seed4Forest helps identify potentially suitable seed sources under current and future climates.

The recommendations use two modelling approaches:

- Universal Response Functions (URFs), combining genetic and environmental information;
- Climate Analogue Models, matching projected future climates with similar present-day conditions.

The provenance models draw on European provenance trials and seed-stand information. Seed-stand data include information from the European Commission's [FOREMATIS](https://ec.europa.eu/forematis/) system and complementary national sources.

### Natural regeneration and seeding guidance

The generated report contains supporting information for evaluating:

- whether natural regeneration is present;
- whether regenerating species are suitable under future climate conditions;
- whether the regenerating population has sufficient genetic diversity;
- whether natural regeneration, seeding, or planting may be appropriate;
- species-specific germination requirements.

Germination information is based on published meta-analyses and data from the International Seed Testing Association.

### Report export

Users can generate a PDF report containing selected results, including:

- location information;
- species suitability;
- productivity projections;
- climate-scenario charts;
- species-composition recommendations;
- seed-source and provenance information;
- natural-regeneration guidance;
- germination information.

## Scientific background

### Species Distribution Models

Species suitability is estimated using Species Distribution Models developed with Generalized Additive Models. The models were trained using species-occurrence information from European national forest inventories and other forest databases, including ICP Forests.

### Productivity models

Productivity is estimated with guide-curve models describing tree height at a reference age of 100 years. Reference-height values are projected using climatic variables for the supported periods and climate scenarios.

### Species associations

Recommended species compositions are informed by observed co-occurrence and frequent species associations in forest plots. These results describe statistical patterns and do not by themselves demonstrate ecological causality or compatibility at every site.

### Provenance models

Universal Response Functions use data from forest provenance trials to predict the relative performance of seed sources across environments. Climate Analogue Models identify present-day areas whose climate resembles expected future conditions at the selected planting location.

## Data and external services

The application currently uses or references:

- European national forest inventory data;
- ICP Forests data;
- FOREMATIS forest reproductive material data;
- European forest provenance trials;
- species-suitability and productivity raster datasets;
- environmental-zone raster data;
- species co-occurrence and association datasets;
- Mapbox mapping and geocoding services;
- GeoServer WMS, WMTS, and WFS services;
- Cloud Optimized GeoTIFF data hosted on Amazon S3;
- a TiTiler-compatible API hosted through AWS API Gateway.

Availability of some application functions therefore depends on external services.

## Technology

The web application is built with:

- [SvelteKit](https://kit.svelte.dev/);
- [TypeScript](https://www.typescriptlang.org/);
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/);
- [Chart.js](https://www.chartjs.org/);
- [Tailwind CSS](https://tailwindcss.com/);
- [jsPDF](https://github.com/parallax/jsPDF);
- [Vitest](https://vitest.dev/).

## Local development

### Requirements

- Node.js 20 or later;
- npm;
- access to the required public geospatial services and datasets.

### Installation

```bash
git clone https://github.com/arena-pistenmanagement/superb.git
cd superb
npm ci
cp .env.example .env
```

### Start the development server

```bash
npm run dev
```

The development server will print the local URL in the terminal.

### Type and Svelte checks

```bash
npm run check
```

### Lint and formatting checks

```bash
npm run lint
```

### Tests

```bash
npm test -- --run
```

### Production build

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Configuration

Do not commit passwords, private API keys, private keys, or unrestricted service credentials.
The application requires these public environment variables:

- `PUBLIC_MAPBOX_ACCESS_TOKEN`: a restricted public Mapbox token;
- `PUBLIC_GEOSERVER_URL`: the GeoServer base URL without a trailing slash;
- `PUBLIC_S3_BUCKET_URL`: the public S3 bucket URL without a trailing slash;
- `PUBLIC_TITILER_URL`: the TiTiler API base URL without a trailing slash.

Before deployment, verify:

- Mapbox URL and scope restrictions;
- AWS API Gateway rate limits;
- S3 bucket permissions;
- GeoServer access controls;
- CORS configuration;
- service quotas and billing alerts.

An `.env.example` file may document required variables, but it must contain placeholders only.

## Repository structure

```text
src/
  lib/
    components/       User-interface and map components
    stores/           Svelte application state
    utils/            Mapping, reporting, and data utilities
  routes/             SvelteKit pages and server routes

static/               Public images and static assets
package.json          JavaScript dependencies and npm commands
svelte.config.js      SvelteKit configuration
vite.config.ts        Vite and Vitest configuration
```

## Security

Please do not report vulnerabilities through public issues.

Follow the instructions in [`SECURITY.md`](SECURITY.md) to report:

- exposed credentials;
- unintended data access;
- path-traversal or file-disclosure issues;
- injection vulnerabilities;
- insecure external-service configuration;
- other security-sensitive findings.

No operational credentials should ever be stored in this repository.

Deployment and DDoS hardening requirements for Vercel and the external geospatial services are
documented in [`DEPLOYMENT_SECURITY.md`](DEPLOYMENT_SECURITY.md).

## Limitations

Seed4Forest results are model-based projections and include uncertainty.

The tool does not replace:

- field surveys;
- soil and microsite assessments;
- local provenance regulations;
- evaluation of invasive-species risks;
- pest and disturbance risk assessments;
- professional silvicultural advice;
- national rules for forest reproductive material.

Climate scenarios describe possible future conditions rather than exact forecasts. Recommendations should be reassessed when new data, models, regulations, or climate projections become available.

## Selected references

- Chakraborty, D. et al. (2015). Selecting Populations for Non-Analogous Climate Conditions Using Universal Response Functions: The Case of Douglas-Fir in Central Europe.  
  <https://doi.org/10.1371/journal.pone.0136357>

- Chakraborty, D. et al. (2020). High-resolution gridded climate data for Europe based on bias-corrected EURO-CORDEX: the ECLIPS-2.0 dataset.  
  <https://doi.org/10.5281/zenodo.3952159>

- Chakraborty, D. et al. (2021). Provisioning forest and conservation science with high-resolution maps of potential distribution of major European tree species under climate change.  
  <https://doi.org/10.1007/s13595-021-01029-4>

- Chakraborty, D. et al. (2024). Assisted tree migration can preserve the European forest carbon sink under climate change.  
  <https://doi.org/10.1038/s41558-024-02080-5>

- Chakraborty, D. et al. (2024). How to strengthen the European forest carbon sink through prestoration: integrating active restoration and adaptation.  
  <https://doi.org/10.36333/pb11>

Additional scientific references and policy briefs are listed in the application's FAQ.

## Acknowledgements

Seed4Forest was developed in the context of the [SUPERB project](https://forest-restoration.eu/).

The current application includes attribution to:

- the Austrian Research Centre for Forests (BFW);
- SUPERB;
- the European Union;
- PowerGIS GmbH;
- Mapbox;
- OpenStreetMap;
- Maxar.

Exact institutional roles and the required funding statement should be confirmed before publication.

## Licence

Software and documentation are provided under the terms stated in [`LICENSE`](LICENSE).
