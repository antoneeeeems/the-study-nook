from fastapi import APIRouter, Query, HTTPException
from typing import Annotated
import pandas as pd
from ..models.schemas import (
    BusinessInsightsOut,
    BundleOut,
    CartPromoRequest,
    CartPromoResponse,
    CrossSellItem,
    CrossSellRequest,
    FBTItem,
    HomepageItem,
    PromoOut,
    RecommendationSourceQuery,
    RuleOut,
)
from ..services.dataset import load_transactions
from ..core.versioning import load_run
from ..services.recommendation import (
    get_rules, get_top_bundles, get_top_rules, get_homepage_ranking,
    get_frequently_bought_together, get_cross_sell, get_promos,
    get_cart_promos,
    get_business_insights,
)

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


def _load_rules(dataset_id: str):
    transactions = load_transactions(dataset_id)
    if transactions is None:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")
    rules = get_rules(transactions, dataset_id)
    return rules


def _parse_source_selector(run_id: str | None, iteration: int | None) -> RecommendationSourceQuery | None:
    if run_id is None and iteration is None:
        return None
    if not run_id or iteration is None:
        raise HTTPException(status_code=422, detail="Both run_id and iteration are required together")
    try:
        return RecommendationSourceQuery(run_id=run_id, iteration=iteration)
    except Exception as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


def _normalize_rules_frame(rules_records: list[dict]) -> pd.DataFrame:
    rules = pd.DataFrame(rules_records)
    if rules.empty:
        return rules

    for column in ["antecedent", "consequent"]:
        if column in rules.columns:
            rules[column] = rules[column].astype(str).str.replace(r"[\{\}]", "", regex=True).str.strip()

    if "score" in rules.columns:
        rules = rules.sort_values("score", ascending=False, kind="stable").reset_index(drop=True)
    return rules


def _load_rules_from_iteration(selector: RecommendationSourceQuery) -> pd.DataFrame:
    run = load_run(selector.run_id)
    if run is None:
        raise HTTPException(status_code=404, detail=f"Pipeline run '{selector.run_id}' not found")

    iterations = run.get("iterations", [])
    selected = next((it for it in iterations if int(it.get("iteration", -1)) == selector.iteration), None)
    if selected is None:
        raise HTTPException(status_code=404, detail=f"Iteration v{selector.iteration} not found in run '{selector.run_id}'")

    rules_records = selected.get("rules") or []
    return _normalize_rules_frame(rules_records)


def _load_rules_for_source(dataset_id: str, run_id: str | None, iteration: int | None):
    selector = _parse_source_selector(run_id, iteration)
    if selector is None:
        return _load_rules(dataset_id)
    return _load_rules_from_iteration(selector)


@router.get(
    "/{dataset_id}/top-bundles",
    response_model=list[BundleOut],
    responses={404: {"description": "Dataset not found"}},
)
def top_bundles(
    dataset_id: str,
    top_n: Annotated[int, Query(ge=1, le=20)] = 5,
    run_id: str | None = Query(default=None),
    iteration: int | None = Query(default=None, ge=1),
):
    rules = _load_rules_for_source(dataset_id, run_id, iteration)
    return get_top_bundles(rules, top_n)


@router.get(
    "/{dataset_id}/top-rules",
    response_model=list[RuleOut],
    responses={404: {"description": "Dataset not found"}},
)
def top_rules(
    dataset_id: str,
    top_n: Annotated[int, Query(ge=1, le=50)] = 10,
    run_id: str | None = Query(default=None),
    iteration: int | None = Query(default=None, ge=1),
):
    rules = _load_rules_for_source(dataset_id, run_id, iteration)
    return get_top_rules(rules, top_n)


@router.get(
    "/{dataset_id}/homepage-ranking",
    response_model=list[HomepageItem],
    responses={404: {"description": "Dataset not found"}},
)
def homepage_ranking(
    dataset_id: str,
    top_n: Annotated[int, Query(ge=1, le=20)] = 10,
    run_id: str | None = Query(default=None),
    iteration: int | None = Query(default=None, ge=1),
):
    rules = _load_rules_for_source(dataset_id, run_id, iteration)
    return get_homepage_ranking(rules, top_n)


@router.get(
    "/{dataset_id}/frequently-bought-together",
    response_model=list[FBTItem],
    responses={404: {"description": "Dataset not found"}},
)
def frequently_bought_together(
    dataset_id: str,
    item: Annotated[str, Query(...)],
    top_n: Annotated[int, Query(ge=1, le=10)] = 5,
    run_id: str | None = Query(default=None),
    iteration: int | None = Query(default=None, ge=1),
):
    rules = _load_rules_for_source(dataset_id, run_id, iteration)
    return get_frequently_bought_together(item, rules, top_n)


@router.post(
    "/{dataset_id}/cross-sell",
    response_model=list[CrossSellItem],
    responses={404: {"description": "Dataset not found"}},
)
def cross_sell(
    dataset_id: str,
    body: CrossSellRequest,
    run_id: str | None = Query(default=None),
    iteration: int | None = Query(default=None, ge=1),
):
    rules = _load_rules_for_source(dataset_id, run_id, iteration)
    return get_cross_sell(body.cart_items, rules, body.top_n)


@router.get(
    "/{dataset_id}/promos",
    response_model=list[PromoOut],
    responses={404: {"description": "Dataset not found"}},
)
def promos(
    dataset_id: str,
    top_n: Annotated[int, Query(ge=1, le=20)] = 5,
    run_id: str | None = Query(default=None),
    iteration: int | None = Query(default=None, ge=1),
):
    rules = _load_rules_for_source(dataset_id, run_id, iteration)
    return get_promos(rules, top_n)


@router.post(
    "/{dataset_id}/cart-promos",
    response_model=CartPromoResponse,
    responses={404: {"description": "Dataset not found"}},
)
def cart_promos(
    dataset_id: str,
    body: CartPromoRequest,
    run_id: str | None = Query(default=None),
    iteration: int | None = Query(default=None, ge=1),
):
    rules = _load_rules_for_source(dataset_id, run_id, iteration)
    payload_items = [{'name': i.name, 'qty': i.qty} for i in body.cart_items]
    return get_cart_promos(payload_items, rules)


@router.get(
    "/compare/insights",
    response_model=BusinessInsightsOut,
    responses={404: {"description": "Required datasets not found"}},
)
def business_insights(
    run_id: str | None = Query(default=None),
    iteration_a: int | None = Query(default=None, ge=1),
    iteration_b: int | None = Query(default=None, ge=1),
):
    if run_id is not None or iteration_a is not None or iteration_b is not None:
        if not run_id or iteration_a is None or iteration_b is None:
            raise HTTPException(
                status_code=422,
                detail="run_id, iteration_a, and iteration_b are required together",
            )
        if iteration_a == iteration_b:
            raise HTTPException(
                status_code=422,
                detail="iteration_a and iteration_b must be different",
            )

        selector_a = RecommendationSourceQuery(run_id=run_id, iteration=iteration_a)
        selector_b = RecommendationSourceQuery(run_id=run_id, iteration=iteration_b)
        rules_a = _load_rules_from_iteration(selector_a)
        rules_b = _load_rules_from_iteration(selector_b)
        return get_business_insights(rules_a, rules_b)

    transactions_a = load_transactions('A')
    transactions_b = load_transactions('B')
    if not transactions_a or not transactions_b:
        raise HTTPException(status_code=404, detail="Both datasets A and B are required")
    rules_a = get_rules(transactions_a, 'A')
    rules_b = get_rules(transactions_b, 'B')
    return get_business_insights(rules_a, rules_b)
