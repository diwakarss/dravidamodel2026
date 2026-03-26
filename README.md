# Dravida Model Showcase 2021-26

A transparent, bilingual (English/Tamil) showcase tracking Tamil Nadu's development initiatives from 2021-2026. Every claim backed by verifiable government and media sources.

**Live Site:** [dravidamodel2026.top](https://dravidamodel2026.top)

## What's Tracked

### Infrastructure Projects (225)
Roads, water, urban development, public transport, education/health facilities, industrial parks, cultural heritage, sports, housing, ports, and power - each with budget, timeline, location, and verified sources.

### Government Schemes (245+)
- **Healthcare (55)** - CMCHIS, Makkalai Thedi Maruthuvam, HPV vaccination, 108 ambulance, new medical colleges
- **Social Welfare (52)** - Kalaignar Magalir Urimai Thogai, TAPS pensions, Vidiyal Payanam, Pongal gifts, housing
- **Education (33)** - Illam Thedi Kalvi, Pudhumai Penn, breakfast scheme, free laptops, Naan Mudhalvan
- **Agriculture (29)** - Free electricity, Uzhavar Sandhai, crop insurance, micro irrigation, organic farming
- **Environment (28)** - Electric buses, EV policy, 20GW renewable target, solar rooftop, green hydrogen
- **Sports & Culture (27)** - FIDE Chess Olympiad, Formula Racing Night, state academies, stadium infrastructure
- **Employment (21)** - Naan Mudhalvan, StartupTN, job fairs, MSME support, skill development

### Industrial Investments (149 parks across 8 sectors)
Electronics, automobile & EV, textiles, footwear, renewable energy, pharma & biotech, IT & data centers, semiconductors - with investment amounts, job creation, and source links.

## Features

- **Interactive Map** - Choropleth by district, project markers with details
- **Bilingual** - Full English and Tamil translations
- **Source Verification** - Government portals + media articles for each entry
- **Responsive** - Works on mobile, tablet, desktop

## Tech Stack

- **Framework:** Next.js 16 (Static Export)
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
data/                  # Raw data and PDF extractions
scripts/               # Build and deployment scripts
infrastructure/        # Terraform (AWS S3, CloudFront, Lambda)
```

## Data

Project data is maintained in `app/src/data/` as JSON files covering infrastructure, industries, agriculture, education, healthcare, employment, social welfare, environment, and sports & culture. Each entry includes:
- Project details (name, description, budget, timeline)
- Location with coordinates (where applicable)
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
