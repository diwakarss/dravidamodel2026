# Dravida Model Showcase 2021-26

A transparent, bilingual (English/Tamil) showcase tracking Tamil Nadu's development initiatives from 2021-2026. Every claim backed by verifiable government and media sources.

**Live Site:** [dravidamodel2026.top](https://dravidamodel2026.top)

## What's Tracked

### Infrastructure Projects (150+)
Transport, healthcare, education, water, power - each with budget, timeline, location, and verified sources.

### Government Schemes
- **Agriculture** - Free electricity, Uzhavar Sandhai, crop insurance, micro irrigation
- **Education** - Naan Mudhalvan, breakfast scheme, free laptops, library upgrades
- **Healthcare** - Makkalai Thedi Maruthuvam, insurance expansion, medical colleges
- **Employment** - Job fairs, MSME support, skill development, industrial MoUs
- **Welfare** - Kalaignar Magalir Urimai Thogai, social security pensions

### Industrial Investments (70+)
Foxconn, Hyundai, Tata Electronics, TIDEL Neo parks, data centers, footwear clusters - with investment amounts, job creation, and source links.

## Features

- **Interactive Map** - Choropleth by district, project markers with details
- **Bilingual** - Full English and Tamil translations
- **Source Verification** - Government portals + media articles for each entry
- **Responsive** - Works on mobile, tablet, desktop

## Tech Stack

- **Framework:** Next.js 15 (Static Export)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Maps:** Leaflet with custom markers
- **i18n:** next-intl
- **Hosting:** AWS S3 + CloudFront

## Quick Start

```bash
cd app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/                    # Next.js application
├── src/
│   ├── app/           # App router pages
│   ├── components/    # React components
│   ├── lib/           # Utilities, data, schemas
│   └── messages/      # i18n translations (en.json, ta.json)
├── public/            # Static assets, images
└── docs/              # Security documentation
data/                  # Project JSON data (source of truth)
scripts/               # Build and deployment scripts
```

## Data

Project data is maintained in `data/projects/` as individual JSON files with:
- Project details (name, description, budget, timeline)
- Location with coordinates
- Verified sources (government portals, news articles)
- Status tracking (completed, ongoing, planned)

## Contributing

1. Fork the repository
2. Add/update project data in `data/projects/`
3. Ensure sources are verifiable
4. Submit a pull request

## License

MIT

## Acknowledgments

Data sourced from Tamil Nadu Government portals, press releases, and verified news sources.
