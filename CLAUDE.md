# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

jsgrids (https://jsgrids.statico.io/) is a searchable, curated reference site for JavaScript spreadsheet and data grid libraries. It aggregates metadata from GitHub, NPM, Package Phobia, and npms.io to help developers compare ~80 grid libraries across different frameworks (React, Vue, Angular, Svelte, etc.).

## Development Commands

```bash
# Development server with Turbopack
pnpm dev

# Production build (fetches all API data)
pnpm build

# Start production server
pnpm start

# Format code (runs automatically on commit via husky)
pnpm prettier --write .
```

## Architecture Overview

### Server-Side Data Fetching (Next.js App Router)

- **Entry point**: `app/page.tsx` - Server Component that calls `getLibraries()` at build/request time
- **Data source**: 80+ YAML files in `/data` directory (e.g., `react-data-grid.yml`, `ag-grid.yml`)
- **Processing pipeline** (`lib/libraries.ts`):
  1. Parse all YAML files
  2. Validate with Zod schemas (`ImportedYAMLInfo` → `AugmentedInfo` → `ReadonlyLibraryInfo`)
  3. Enrich each library with external API data (GitHub stats, NPM downloads, package sizes, quality scores)
  4. Return type-safe `LibraryInfo[]` array to client

### Multi-Source API Aggregation

The `getLibraries()` function fetches from 4 external APIs:

1. **GitHub API** - Stars, forks, open issues, contributors (requires `GITHUB_TOKEN` env var)
2. **NPM API** - Weekly download counts (requires `NPM_TOKEN` env var)
3. **Package Phobia API** - Publish and install sizes
4. **npms.io API** - Quality score, maintenance score, dependency count

**Fetching strategy** (`lib/fetcher.ts`):

- Throttled at 1 request per second (1000ms) for non-npm APIs (GitHub, Package Phobia, npms.io)
- NPM API throttled at 1 request per minute (60s) with dynamic backoff on 429 errors (increases by 60s per 429)
- Retries with exponential backoff (3 retries, 3s min timeout)
- 24-hour filesystem cache in `.next/cache/jsgrids/` (survives Vercel builds)
- Authentication via GitHub/NPM tokens for increased rate limits
- Graceful degradation: API failures logged but don't break build

### Client-Side Filtering & State

- **State management**: Zustand store (`lib/store.ts`) - minimal, flat store with 6 filters
  - `sort`: Popularity, GitHub stars, or NPM downloads
  - `framework`: Single framework filter (React, Vue, etc.)
  - `features`: Multi-select feature filter (Set<FeatureName>)
  - `license`: License type filter
  - `viewMode`: "cards" or "table" view toggle
  - `search`: Text search filter

- **Main UI component**: `components/IndexPage.tsx` (client component)
  - Receives server-fetched `LibraryInfo[]` as props
  - `FilterBar` component applies filters using `useMemo` for performance
  - Renders either card grid or table view based on `viewMode`

### Key Data Structures

**YAML Schema** (validated by Zod):

```yaml
title: React Data Grid
homeUrl: https://github.com/Comcast/react-data-grid
githubRepo: Comcast/react-data-grid # Format: owner/repo
npmPackage: react-data-grid # NPM package name
license: MIT License
frameworks:
  react: true
  vue: false
  # ... supports 10 frameworks total
features:
  editable: true
  virtualization: true
  typescript: true
  # ... 30+ features defined in lib/features.ts
```

**Runtime TypeScript Types**:

- `ImportedYAMLInfo` - Raw YAML data after parsing
- `AugmentedInfo` - After adding computed fields
- `ReadonlyLibraryInfo` / `LibraryInfo` - Final enriched data with API stats

## Feature System

30+ grid features defined in `lib/features.ts` with:

- Display title
- Description
- Importance flag (highlights when missing: `maintained`, `openSource`, `typescript`)
- Categories for filtering

## UI Components

### Component Library

Uses shadcn/ui components in `components/ui/`:

- `button.tsx`, `card.tsx`, `checkbox.tsx`, `select.tsx`, `popover.tsx`, `tooltip.tsx`, `table.tsx`
- Built on Radix UI primitives
- Styled with Tailwind CSS using class-variance-authority

### Custom Components

- `Card.tsx` - Library card with framework icons, feature badges, and stats
- `FilterBar.tsx` - Main filter controls (framework picker, feature selector, sort dropdown)
- `MultiItemPicker.tsx` / `SingleItemPicker.tsx` - Reusable filter components
- `TableView.tsx` - Minimal table layout for `/list` page

## Adding a New Library

1. Create `data/library-name.yml` with required fields (see schema above)
2. Run `pnpm build` to validate YAML and fetch API data
3. Library will appear automatically on next page load

## Adding a New Feature

1. Add feature definition to `lib/features.ts`:
   ```typescript
   export const features = {
     newFeature: {
       title: "Display Title",
       description: "Feature description",
       important: false, // Set true to highlight when missing
     },
   };
   ```
2. Add feature to YAML schema in `lib/libraries.ts` (ImportedYAMLInfo type)
3. Update existing library YAML files as needed

## Performance Considerations

- **Build time**: Extended to 300s on Vercel due to ~80 libraries × 4 API calls each
- **API rate limits**: Use GitHub/NPM tokens in production to increase limits
- **Caching**: Filesystem cache prevents repeated API calls during development
- **Memoization**: Card components and filter computations use React.memo/useMemo
- **Throttling**:
  - Non-npm APIs: 1 request per second (1000ms)
  - NPM API: 1 request per minute (60s) with dynamic backoff on 429 errors

## Environment Variables

Required for production builds:

```bash
GITHUB_TOKEN=ghp_xxx  # Personal access token for GitHub API
NPM_TOKEN=npm_xxx     # NPM registry token
```

## Conventions

- **Imports**: Use `@/` path alias (configured in tsconfig.json)
- **File naming**: PascalCase for components, camelCase for utilities
- **Styling**: Tailwind utilities + shadcn/ui components
- **Server/Client boundary**: Mark interactive components with "use client"
- **Type safety**: All YAML validated with Zod, strict TypeScript mode enabled
