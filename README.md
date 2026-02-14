# Dravida Model Showcase 2021-26

A transparent, bilingual (English/Tamil) showcase of 150+ government infrastructure projects in Tamil Nadu from 2021-2026. Built with verifiable sources and real-time data.

**Live Site:** [dravidamodel2026.top](https://dravidamodel2026.top)

## Features

- **150+ Infrastructure Projects** - Transport, healthcare, education, water, power, and more
- **Interactive Map** - Choropleth visualization by district with project markers
- **Bilingual Support** - Full English and Tamil translations
- **Source Verification** - Each project linked to government and media sources
- **Scheme Tracking** - Agriculture, education, healthcare, employment, and welfare schemes
- **Industry Investments** - 70+ industrial parks and major investments

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
