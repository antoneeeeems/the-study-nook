# Market Basket Analysis - School Supplies Kiosk

## Project Overview

A Market Basket Analysis "Machine Learning" system for a school supplies kiosk/bookstore. It ingests transactions, mines patterns (FP-Growth), evaluates rules, adapts thresholds via drift detection, and outputs business-ready recommendations (bundles, cross-sell, promos, homepage ranking).

## Business Context

- **Scenario**: School supplies kiosk serving elementary + high school/college students
- **Users**: Store owner/admin (views insights, manages promos), cashier (sees cross-sell at checkout)
- **Datasets**: Dataset A (elementary, 1200 txns, 20 items, avg 4/basket), Dataset B (HS/college, 1200 txns, 20 items, avg 6.4/basket)

## Architecture

```text
backend/          # FastAPI - wraps existing notebook logic as API
  core/           # FP-Growth, Apriori, rules engine, drift detection, threshold, pipeline
  services/       # recommendation.py (bundles, FBT, cross-sell, promos, insights), dataset.py
  routers/        # datasets, recommendations, pipeline
  models/         # Pydantic schemas

frontend/         # Next.js 14 (App Router) + TypeScript + Tailwind CSS v4
  app/            # Pages: dashboard, transactions, bundles, rules, shop, promos, insights, pipeline, compare
  components/
    layout/       # Sidebar (Lucide icons, indigo gradient), Header (segmented toggle, breadcrumb, cart badge)
    shared/       # StatCard, MetricBadge, LoadingSpinner, EmptyState
  lib/            # api.ts (fetch wrapper), types.ts (TypeScript interfaces)
  context/        # DatasetContext (A/B toggle), CartContext (shop simulation), ToastContext (notifications)
```

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, pandas, numpy
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS v4, Recharts, lucide-react
- **Fonts**: Plus Jakarta Sans (display/body), JetBrains Mono (data/metrics)
- **Analysis Engine**: Custom FP-Growth + Apriori (comparison), adaptive thresholds, drift detection (Jaccard), composite rule scoring
- **Data**: CSV files (no database needed)

## Key Conventions

- Backend serves data computed on-demand from CSV datasets; caches rules in memory.
- All API responses use Pydantic models defined in `backend/models/schemas.py`.
- Frontend uses React Context for dataset toggle (`DatasetContext`), cart state (`CartContext`), and toast notifications (`ToastContext`).
- **Color palette**: Deep indigo primary (#312e81), teal accent (#14b8a6), coral for promos (#f97316), warm off-white surface (#faf9f7).
- **Card classes**: `.card` (standard), `.card-elevated` (prominent), `.card-glass` (frosted glass overlay).
- **Icons**: All Lucide React SVG icons - no emojis in UI.
- MetricBadge color coding: teal (strong, lift >= 1.2), amber (moderate, 1.0-1.2), rose (weak, < 1.0).
- Promo tiers: Hot Deal (lift >= 1.3 and conf >= 0.45 -> 15%), Bundle Saver (lift >= 1.1 and conf >= 0.35 -> 10%), Starter Bundle (5%).
- Pipeline runs 3 iterations: v1 (Dataset A), v2 (A+B merged), v3 (drift-simulated).
- **Recharts**: Always imported via `next/dynamic` with `{ ssr: false }` to avoid hydration errors and reduce bundle.
- **Animations**: `animate-fade-in-up`, `animate-slide-in-right`, `animate-scale-in`, `animate-shimmer` (skeleton), `hover-lift`.

## Running the Project

```bash
# Backend (from project root)
cd backend && pip install -r requirements.txt && uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Frontend (from project root)
cd frontend && npm install && npm run dev
```

## Important Files

- `MBA _SELF_LEARNING_AUTOMATION.ipynb` - Original analysis engine (FP-Growth, drift, adaptive thresholds, 3-iteration loop)
- `BusinessLogic.ipynb` - Original recommendation engine (bundles, rules, FBT, cross-sell, promos, insights)
- `dataset_A.csv` / `dataset_B.csv` - Input datasets (long format: TransactionID, Item)
- `backend/core/pipeline.py` - Self-learning pipeline orchestrator
- `backend/services/recommendation.py` - All recommendation logic + PRICE_LIST
- `frontend/app/pipeline/page.tsx` - Pipeline visualization (most complex page, 55pts on rubric)
- `frontend/app/shop/page.tsx` - Kiosk shop simulation (creativity showcase: item icons, checkout overlay, FBT carousel)
- `frontend/app/globals.css` - Design system: colors, card classes, animations, gradient utilities
- `frontend/context/ToastContext.tsx` - Toast notification system (success/error/info)

## Design System Progress Log

### 2026-03-13

- Added semantic theme foundation and dark-mode plumbing in frontend UI shell.
- Added typed token sources (`design-tokens.ts`) and centralized chart styles (`chart-config.ts`).
- Updated global styles to use semantic variables, focus-visible defaults, and reduced-motion support.
- Improved accessibility and semantics in header/sidebar/shared loading and metric components.
- Standardized chart styling usage in dashboard, compare, insights, and pipeline pages.
- Added formal design system documentation at `frontend/DESIGN_SYSTEM.md`.
- Ongoing cleanup target: reduce remaining cognitive complexity in compare/pipeline pages and finish full-page primitive adoption.
- Added reusable shared `Button` primitive and started migration on high-impact pages (`pipeline`, `shop`).
- Normalized CLAUDE.md markdown structure (heading/list/fence spacing and fence language) to align with markdown lint rules.
- Resolved strict lint/accessibility issues in `shop` and `pipeline` pages after primitive migration (keyboard-safe interactions, effect-state cleanup, and ternary simplification).
- Added shared `Input` primitive and migrated transactions search/upload/pagination controls to shared primitives.
- Refactored rules/promos pages to reduce complexity (sort/filter helpers, stable keys, ternary extraction) and aligned actions with design-system components.
- Added shared `Select` primitive for standardized form controls in upcoming migrations.
- Removed broad frontend lint blockers by typing `lib/api.ts` responses and cleaning remaining `bundles` page effect/key issues.
- Improved shop UX with searchable/sortable product controls using shared `Input` + `Select`, plus reset/empty-state flows for faster product discovery.
- Added shop quick-filter chips (`Top 10`, `High Frequency`, `Budget <= P50`) and recommendation trust badges (confidence + lift) to make product discovery and cross-sell decisions clearer.
- Added a mobile sticky mini-filter bar for one-tap quick filters and "Why recommended" hover/focus explanations on cross-sell items using plain-language confidence/lift context.
- Started CRO implementation pass: rewrote value-first hero/shop/promos/transactions messaging, added dashboard trust note, strengthened reset/checkout microcopy, changed add-to-cart behavior to non-intrusive toast feedback, and made cross-sell drawer user-invoked via `View AI Picks`.
- Continued CRO readability pass: upgraded bundles and rules page benefit copy, expanded metric labels (`Confidence`, `Conviction`), added plain-language rules helper text, and simplified cross-sell rationale messaging for shopper clarity.
- Added WCAG-focused improvements: replaced hover-only recommendation explanations with always-visible text, introduced accessible mobile cart dialog with explicit controls, improved drawer dialog semantics (`role="dialog"`, labels), and made rules sorting/details interactions keyboard-operable with mobile card alternatives.
- Implemented separate cart architecture: moved cart to dedicated `/cart` page, added global right-side mini cart drawer opened from header, persisted cart items via `localStorage`, simplified `/shop` to product discovery + FBT only, and added dual drawer actions (`Go to Main Cart`, `Continue Shopping`) with WCAG-safe dialog controls.
- Implemented quantity-based cart flows end-to-end: `add` now increments existing items, cart state stores `qty`, and mini drawer + `/cart` include accessible +/- quantity controls with line-total math and updated quantity badge semantics.
- Added dataset item normalization with synonym collapsing on ingest, plus diagnostics surfaced in transactions UI (`raw_unique_items`, `normalized_unique_items`, `unmapped_items`) to monitor data quality after uploads.
- Added fallback pricing transparency for unseen items: recommendation payloads now include `mapped_price` metadata, and cart UIs show clear warnings when fallback price is used.
- Executed a full neutral UI redesign pass across shell + all primary routes while preserving existing content and business behavior (dataset switching, cart persistence, recommendation flows, and pipeline execution states).
- Migrated typography to `Outfit` + `IBM Plex Mono` and re-tuned design tokens to a neutral grayscale base with subtle accent usage for semantic states.
- Standardized semantic variable class usage across pages/components (`text-[color:var(--...)]`, `bg-[color:var(--...)]`, `border-[color:var(--...)]`) to reduce styling drift and Tailwind parser ambiguity.
- Completed route migration sequence continuously: `promos` -> `bundles` -> `rules` -> `compare` -> `insights` -> `dashboard` -> `transactions` -> `shop` -> `cart` -> `pipeline`.
- Aligned dynamic Recharts color usage to shared `CHART_COLORS` tokens in analytics-heavy pages to maintain palette consistency after theme/token changes.
- Updated shared UI surfaces and controls (`Button`, `Input`, `Select`, `StatCard`, `LoadingSpinner`, `EmptyState`, `MiniCartDrawer`) for full semantic-theme parity.
- Verified stabilization gates successfully: full frontend lint pass and production `next build` completed without errors.
- Started a dedicated neumorphic alignment pass: expanded soft UI tokens/utilities (`soft-shell`, `soft-pressed`, raised/inset shadows) and applied framed shell composition in `app/layout.tsx`.
- Added automated route screenshot capture workflow (`npm run snapshots`) via `scripts/capture-screenshots.mjs` for desktop/mobile visual QA on dashboard/shop/cart/pipeline/insights.
- Applied follow-up soft-depth propagation to shared KPI cards (`components/shared/StatCard.tsx`) and high-traffic routes (`app/insights/page.tsx`, `app/shop/page.tsx`) while preserving business logic.
- Revalidated the current pass with targeted frontend lint and refreshed snapshot outputs under `playwright-snapshots/`.
- Removed the outer framed shell wrapper in `app/layout.tsx` to keep the app full-bleed and focused on internal UI depth only.
- Continued soft-depth propagation on `app/cart/page.tsx` and `app/compare/page.tsx` (`soft-shell` for containers and `soft-pressed` for nested controls/chips).
- Revalidated the latest pass with targeted lint and refreshed screenshot captures for dashboard/shop/cart/pipeline/insights.
- Extended internal soft-depth propagation to `app/pipeline/page.tsx` across architecture/timeline/detail/charts/stability sections for consistent raised-vs-pressed hierarchy.
- Extended internal soft-depth propagation to `app/promos/page.tsx` for legend and coupon card internals while preserving promo logic and interactions.
- Revalidated this phase with targeted lint and refreshed route snapshots under `playwright-snapshots/`.
- Applied mini-cart internal depth consistency in `components/layout/MiniCartDrawer.tsx` (pressed line items, quantity controls, and recommendation cards) to align drawer interactions with route-level soft UI treatment.
- Completed final stabilization gates for this pass with full frontend lint and production `next build` succeeding after the internal-only Soft UI propagation.
- Implemented backend-driven cart promo calculation endpoint with deterministic multi-promo stacking (non-overlapping item-unit usage), integrated promo breakdown into frontend cart totals, added visible +/- quantity controls on store cards, and standardized user-facing terminology from "kiosk" to "Store" while preserving right-side mini-cart slide behavior.
- Implemented WCAG-focused contrast remediation pass across frontend surfaces: strengthened pipeline/timeline arrow visibility, introduced semantic divider/strong-border/chart-grid tokens, improved disabled-state readability in shared/cart/shop controls, and added toast live-region semantics; validated with frontend lint, production build, and refreshed route snapshots.
