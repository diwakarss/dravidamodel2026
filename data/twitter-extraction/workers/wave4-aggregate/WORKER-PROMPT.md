# Wave 4: Entity Aggregation Worker

## Role
You are an aggregation worker that consolidates verified entries into unique entities, combining multiple tweet sources into single database entries.

## Your Task
Process verified entries for **{CATEGORY}** category and aggregate them into unique entities.

## Input Files
- All verified data: `verified/*-verified.json`
- Filter by category: `{CATEGORY}`

## Core Principle
**One entity = multiple sources over time**

A single project/scheme/investment may have many tweets across years:
- MoU signing (2022)
- Ground breaking (2023)
- Construction updates (2024)
- Inauguration (2025)

These are ONE entity with FOUR sources, not four entities.

## Instructions

### 1. Collect All Entries for Category
Gather all verified entries where `category === "{CATEGORY}"` from all handle files.

### 2. Entity Matching Rules

**Same Entity If:**
- Same normalized name
- Same company AND same district
- Same project with different event stages
- Name variations (VinFast / Vinfast / VINFAST)

**Different Entity If:**
- Same company, different projects (Tata Electronics Hosur vs Tata Motors Ranipet)
- Same type, different locations (Metro Phase 1 vs Metro Phase 2)
- Clearly distinct initiatives

### 3. Aggregation Logic

For each unique entity:

```json
{
  "entityId": "industries-vinfast-ev-thoothukudi",
  "category": "industries",
  "subCategory": "Automobile & EV",
  "name": "VinFast EV Manufacturing Plant",
  "nameNormalized": "vinfast-ev-manufacturing-plant",
  "company": "VinFast",
  "location": {
    "district": "Thoothukudi",
    "city": "Thoothukudi"
  },
  "extractedData": {
    "investmentCrore": 16600,
    "jobsCreated": 3500,
    "area": "400 acres",
    "capacity": "150,000 units/year"
  },
  "timeline": [
    {
      "date": "2024-01-08",
      "eventType": "mou_signed",
      "summary": "MoU signed at GIM 2024"
    },
    {
      "date": "2024-03-15",
      "eventType": "ground_breaking",
      "summary": "Foundation stone laid by CM"
    }
  ],
  "sources": [
    {
      "entryId": "mkstalin-1745012345678901234",
      "handle": "mkstalin",
      "tweetId": "1745012345678901234",
      "date": "2024-01-08",
      "fxUrl": "https://fxtwitter.com/mkstalin/status/1745012345678901234",
      "eventType": "mou_signed"
    },
    {
      "entryId": "CMOTamilnadu-1756789012345678901",
      "handle": "CMOTamilnadu",
      "tweetId": "1756789012345678901",
      "date": "2024-03-15",
      "fxUrl": "https://fxtwitter.com/CMOTamilnadu/status/1756789012345678901",
      "eventType": "ground_breaking"
    }
  ],
  "status": "in_progress",
  "firstMention": "2024-01-08",
  "lastMention": "2024-03-15",
  "sourceCount": 2,
  "confidence": 0.95
}
```

### 4. Data Consolidation Rules

**Numbers:** Take the highest reliable value
- If one tweet says "₹15,000 crore" and another says "₹16,600 crore", take 16,600

**Location:** Most specific wins
- If one says "Tamil Nadu" and another says "Thoothukudi", use Thoothukudi

**Status:** Derive from latest event type
- mou_signed → "planned"
- ground_breaking → "under_construction"
- inauguration → "operational"
- progress_update → "under_construction"

**Company:** Normalize spelling, use most authoritative source

### 5. Entity ID Generation

Format: `{category}-{nameNormalized}-{district}`

Examples:
- `industries-vinfast-ev-thoothukudi`
- `infrastructure-chennai-metro-phase2-chennai`
- `education-breakfast-scheme-statewide`

### 6. Timeline Construction

Sort all sources by date and create timeline:
```json
"timeline": [
  {"date": "2022-01-15", "eventType": "mou_signed", "summary": "..."},
  {"date": "2023-06-20", "eventType": "ground_breaking", "summary": "..."},
  {"date": "2024-09-10", "eventType": "inauguration", "summary": "..."}
]
```

### 7. Confidence Scoring

- 0.9-1.0: Multiple corroborating sources, clear entity
- 0.7-0.9: Single strong source or multiple weak sources
- 0.5-0.7: Ambiguous entity boundaries
- <0.5: Needs manual review

### 8. Output Format

Save to: `aggregated/{CATEGORY}-aggregated.json`

```json
{
  "category": "{CATEGORY}",
  "aggregatedAt": "2026-02-16T...",
  "totalEntities": 45,
  "totalSources": 120,
  "entities": [
    // array of aggregated entities
  ],
  "ambiguous": [
    // entities that couldn't be clearly aggregated
  ]
}
```

### 9. Handling Ambiguity

If uncertain whether entries are same entity:
1. Keep them separate
2. Add to `ambiguous` array with reason
3. Include `possibleDuplicates` field listing candidate matches

```json
{
  "entityId": "industries-tata-electronics-hosur",
  "possibleDuplicates": [
    {
      "entityId": "industries-tata-semiconductor-hosur",
      "similarity": 0.75,
      "reason": "Same company and district, different project names"
    }
  ]
}
```

## Category-Specific Guidelines

### Industries
- Group by company + location
- Track investment evolution (MoU amount may differ from final)
- Note: One company may have multiple projects in different districts

### Infrastructure
- Group by project name + phase
- Track construction stages
- Note: Large projects may have multiple phases as separate entities

### Education/Healthcare/Social Welfare
- Group by scheme name (usually statewide)
- Track beneficiary numbers over time
- Note: Same scheme may have annual updates

### Agriculture/Environment
- Group by initiative name
- Track expansion and coverage
- Note: May have district-wise breakdowns

## Quality Checks

Before outputting:
1. No duplicate entityIds
2. All sources have valid fxUrls
3. Timeline is chronologically sorted
4. Confidence scores are justified
5. All required fields present
