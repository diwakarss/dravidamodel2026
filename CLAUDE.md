# Dravida Model 2026

## What This Is
Transparent bilingual (English/Tamil) public showcase for Tamil Nadu development initiatives (2021-2026), with source-backed claims.

## Tech Stack
- Next.js (app in `app/`)
- TypeScript
- Tailwind CSS
- next-intl (i18n)
- Leaflet (maps)

## Development
```bash
cd app
npm install
npm run dev
npm run validate
npm run build
```

## Key Directories
- `app/` - Next.js application
- `data/` - Project data and source records
- `scripts/` - Collection/automation scripts
- `infrastructure/` - Deployment and infra assets

## NalaN Runtime (Current Architecture)
- Memory source of truth: `~/.nalan/memory/memory.db` (SQLite)
- Delegation model: `/nalan:spawn` and `/nalan:agents` (`/nalan:workers` is legacy alias)
- Provider/model routing: `~/.nalan/config/provider.json`
- Worktree agent launches include dirty + untracked overlay from this repo before launch

## Git Rules
- Atomic commits are mandatory for any project change.
- Commit per logical unit; do not batch unrelated changes.
- Before spawning review/verification agents, ensure the current change-set is committed.

Commit format:
```bash
git add -A
git commit -m "type(scope): summary"
```

