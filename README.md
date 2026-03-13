# SchoolMart MBA Engine

Market Basket Analysis system for a school supplies kiosk that mines patterns from transactions and produces business-ready recommendations.

## What This Project Demonstrates

- Three-iteration self-learning pipeline.
- Adaptive thresholding (minsup/minconf) with drift-aware adjustments.
- FP-Growth mining with Apriori comparison endpoint.
- Rule scoring using lift, confidence, and support.
- Recommendation outputs: bundles, top rules, homepage ranking, frequently-bought-together, cross-sell, promos, and business insights.
- Deterministic pipeline runs through explicit seed support.
- Persistent pipeline run history saved to rec_outputs/pipeline_runs.

## Repository Structure

- backend: FastAPI API, mining engine, self-learning pipeline.
- frontend: Next.js dashboard and recommendation experience.
- dataset_A.csv, dataset_B.csv: assignment datasets.
- rec_outputs: generated recommendation artifacts.

## Requirements

- Python 3.10+
- Node.js 20+
- npm 10+

## Backend Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Run API from repository root:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

API docs:

- http://localhost:8000/docs

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- http://localhost:3000

Desktop-only storyboard assets:

- docs/VIDEO_STORYBOARD.md
- docs/PIPELINE_DIAGRAM.md

Desktop-only screenshots for demo recording:

```bash
cd frontend
npm run snapshots:desktop
```

## Reproducible Pipeline Runs

Pipeline endpoint accepts a seed:

```http
POST /api/pipeline/run
{
  "dataset_id": "A",
  "dataset_b_id": "B",
  "seed": 42
}
```

Behavior:

- Same seed + same data => same adaptive thresholds and rule outcomes.
- Every run is persisted with metadata and iteration results.
- Run history endpoint:
  - GET /api/pipeline/history?limit=20

## Key API Endpoints

Datasets:

- GET /api/datasets
- GET /api/datasets/{dataset_id}/stats
- GET /api/datasets/{dataset_id}/transactions
- POST /api/datasets/upload

Recommendations:

- GET /api/recommendations/{dataset_id}/top-bundles
- GET /api/recommendations/{dataset_id}/top-rules
- GET /api/recommendations/{dataset_id}/homepage-ranking
- GET /api/recommendations/{dataset_id}/frequently-bought-together
- POST /api/recommendations/{dataset_id}/cross-sell
- GET /api/recommendations/{dataset_id}/promos
- GET /api/recommendations/compare/insights

Pipeline:

- POST /api/pipeline/run
- GET /api/pipeline/iterations
- GET /api/pipeline/history
- GET /api/pipeline/comparison
- GET /api/pipeline/comparison/{dataset_id}

## Testing

Backend tests:

```bash
cd backend
pytest -q
```

## Assignment Rubric Mapping (Quick)

- Business context and decision support: frontend pages plus recommendation endpoints.
- Data handling and validation: upload validation and dataset diagnostics in backend/services/dataset.py.
- Pipeline architecture and loop clarity: frontend pipeline page and backend/core/pipeline.py.
- MBA correctness and metrics: backend/core/rules.py.
- Self-learning automation: adaptive thresholds + drift + stability across 3 iterations.
- A vs B evaluation: compare endpoints and business insights endpoint.
- Reproducibility: explicit run seed and persisted run history.

## Notes for Submission ZIP

Include only required deliverables and avoid generated folders:

- frontend/.next
- frontend/node_modules
- rec_outputs/pipeline_runs/*.json
- uploads/*.csv
