# CommerceHub AI Frontend

## Project Overview

This is the enterprise frontend for CommerceHub AI. It provides reusable React, TypeScript, routing, API, query, layout, theme, form, table, loading, and error-handling infrastructure for seller-owned modules.

## Architecture

```text
src/
  api/          Axios client, interceptors, request helpers
  components/   Reusable UI, layout, forms, tables, modals, states
  constants/    App, API, and UI constants
  context/      Theme context
  hooks/        Reusable UI and state hooks
  layouts/      App shell and nested layouts
  lib/          Query client and shared libraries
  pages/        Foundation, seller, product, inventory, and error pages
  providers/    Global providers
  routes/       React Router configuration
  services/     API service contracts
  styles/       Tailwind global styles
  types/        Shared TypeScript types
  utils/        Formatting, strings, regex, validation, class merging
```

## Design System

The foundation uses CommerceHub AI marketplace styling:

- Gold primary actions
- White surfaces
- Light gray workspace
- Dark gray text
- Blue, green, red, and yellow accents
- Soft shadows
- 8px rounded cards and controls
- Responsive sidebar and header

## Install

```bash
cd frontend
npm install
cp .env.example .env
```

## Run

```bash
npm run dev
```

Open `http://localhost:5173`.

The integrated Docker/Nginx deployment serves the frontend at `http://localhost:8080` and proxies API calls through `/api/v1`.

## Build

```bash
npm run build
```

## Quality

```bash
npm run lint
npm run test
npm run format:check
```

`npm run test` runs the Playwright suite.

## Inventory Management

Inventory frontend routes:

- `/inventory` - dashboard, summary cards, inventory charts, filters, listing, stock update workflow
- `/inventory/:inventoryId` - inventory details, product information, stock balances, settings, history
- `/inventory/low-stock` - low stock alert management and restock workflow

Inventory data is loaded through `src/services/inventoryService.ts` using the centralized Axios API layer. The UI does not include dummy inventory or static records.

## Warehouse Management

Warehouse frontend routes:

- `/warehouses` - dashboard, summary cards, charts, filters, listing, refresh, export action, and transfer entry point
- `/warehouses/new` - create warehouse form
- `/warehouses/:warehouseId` - warehouse details, statistics, capacity, and activity overview
- `/warehouses/:warehouseId/edit` - edit warehouse form
- `/warehouses/:warehouseId/inventory` - warehouse-scoped inventory view
- `/warehouses/:warehouseId/capacity` - capacity utilization view
- `/warehouses/:warehouseId/activity` - warehouse activity timeline

Warehouse data is loaded through `src/services/warehouseService.ts` using live FastAPI endpoints. Inventory transfers and activity timelines use the Warehouse API directly and do not rely on mock data.

## Seller Dashboard

Seller dashboard route:

- `/seller-dashboard` - seller workspace with KPI cards, charts, operational widgets, alerts, activities, quick actions, and dashboard search

Dashboard data is loaded through `src/services/sellerDashboardService.ts` using live FastAPI endpoints. Set `VITE_SELLER_ID` for a fixed local seller context; otherwise the page resolves the first active seller through the live Seller API.

## Module Integration

Future Warehouse and Seller Dashboard modules should plug into:

- `src/routes/router.tsx` for route registration
- `src/services` for API service contracts
- `src/components/table/DataTable.tsx` for enterprise tables
- `src/components/forms` for validated forms
- `src/components/ui` for shared controls
- `src/layouts/AppLayout.tsx` for application shell
- `src/services/notificationService.ts` for shared notifications
- `src/context/AppStateContext.tsx` for shared application state
