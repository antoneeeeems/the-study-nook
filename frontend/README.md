# SchoolMart Frontend

Next.js dashboard for the SchoolMart MBA Engine.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Recharts

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Backend API base URL defaults to http://localhost:8000.

Optional environment override:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Build and Lint

```bash
npm run lint
npm run build
```

## Main Routes

- /dashboard (home): summary KPIs and quick links.
- /transactions: dataset browser and upload flow.
- /bundles: top bundles and rationale.
- /rules: association rules with full metrics.
- /shop: product discovery and recommendation interactions.
- /cart: quantity-based cart management.
- /promos: generated promo bundles.
- /insights: cross-dataset business insights.
- /compare: dataset A vs B analysis.
- /pipeline: 3-iteration self-learning loop visualization.

## Pipeline Features in UI

- Run pipeline with deterministic backend seed support.
- Show drift detection and stability outcomes per iteration.
- Show FP-Growth vs Apriori comparison metrics.
- Render iteration timeline and threshold evolution charts.

## Demo Flow for Assignment Video

1. Open /transactions and show Dataset A and Dataset B stats.
2. Open /pipeline and run the 3-iteration loop.
3. Explain drift and adaptation per iteration.
4. Open /shop and /cart to demonstrate cross-sell behavior.
5. Open /promos and /insights to discuss business value.
