from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Annotated
from fastapi import Query

from ..services.dataset import load_transactions
from ..core.pipeline import run_full_pipeline, compare_fpgrowth_vs_apriori
from ..core.threshold import adaptive_threshold
from ..core.versioning import save_pipeline_run, load_latest_run, list_runs
from ..models.schemas import (
    AlgorithmComparisonResponse,
    PipelineRunHistoryResponse,
    PipelineRunResponse,
)

router = APIRouter(prefix="/api/pipeline", tags=["pipeline"])

# Cache pipeline results
_pipeline_cache = {}


class PipelineRunRequest(BaseModel):
    dataset_id: str = "A"
    dataset_b_id: Optional[str] = "B"
    seed: int = 42


@router.post(
    "/run",
    response_model=PipelineRunResponse,
    responses={404: {"description": "Dataset not found"}},
)
def run_pipeline(body: PipelineRunRequest):
    transactions_a = load_transactions(body.dataset_id)
    if not transactions_a:
        raise HTTPException(status_code=404, detail=f"Dataset '{body.dataset_id}' not found")

    transactions_b = None
    if body.dataset_b_id:
        transactions_b = load_transactions(body.dataset_b_id)

    result = run_full_pipeline(transactions_a, transactions_b, seed=body.seed)
    record = save_pipeline_run(result, body.dataset_id, body.dataset_b_id, body.seed)
    _pipeline_cache['latest'] = record
    return record


@router.get(
    "/iterations",
    response_model=PipelineRunResponse,
    responses={404: {"description": "No pipeline results available"}},
)
def get_iterations():
    if 'latest' not in _pipeline_cache:
        latest = load_latest_run()
        if latest is not None:
            _pipeline_cache['latest'] = latest
            return latest

        transactions_a = load_transactions('A')
        transactions_b = load_transactions('B')
        if transactions_a:
            result = run_full_pipeline(transactions_a, transactions_b, seed=42)
            record = save_pipeline_run(result, 'A', 'B', 42)
            _pipeline_cache['latest'] = record
            return record

        raise HTTPException(status_code=404, detail="No pipeline results. Run the pipeline first.")
    return _pipeline_cache['latest']


@router.get("/history", response_model=PipelineRunHistoryResponse)
def get_run_history(limit: Annotated[int, Query(ge=1, le=100)] = 20):
    safe_limit = min(max(limit, 1), 100)
    return {"runs": list_runs(limit=safe_limit)}


@router.get(
    "/comparison",
    response_model=AlgorithmComparisonResponse,
    responses={404: {"description": "Dataset A not found"}},
)
def get_comparison():
    transactions_a = load_transactions('A')
    if not transactions_a:
        raise HTTPException(status_code=404, detail="Dataset A not found")
    minsup, minconf, _ = adaptive_threshold(transactions_a)
    return compare_fpgrowth_vs_apriori(transactions_a, minsup, minconf)


@router.get(
    "/comparison/{dataset_id}",
    response_model=AlgorithmComparisonResponse,
    responses={404: {"description": "Dataset not found"}},
)
def get_comparison_for_dataset(dataset_id: str):
    transactions = load_transactions(dataset_id)
    if not transactions:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")
    minsup, minconf, _ = adaptive_threshold(transactions)
    return compare_fpgrowth_vs_apriori(transactions, minsup, minconf)
