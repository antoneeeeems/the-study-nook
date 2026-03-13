from fastapi import APIRouter, Query, HTTPException
from typing import Annotated
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
    RuleOut,
)
from ..services.dataset import load_transactions
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


@router.get(
    "/{dataset_id}/top-bundles",
    response_model=list[BundleOut],
    responses={404: {"description": "Dataset not found"}},
)
def top_bundles(dataset_id: str, top_n: Annotated[int, Query(ge=1, le=20)] = 5):
    rules = _load_rules(dataset_id)
    return get_top_bundles(rules, top_n)


@router.get(
    "/{dataset_id}/top-rules",
    response_model=list[RuleOut],
    responses={404: {"description": "Dataset not found"}},
)
def top_rules(dataset_id: str, top_n: Annotated[int, Query(ge=1, le=50)] = 10):
    rules = _load_rules(dataset_id)
    return get_top_rules(rules, top_n)


@router.get(
    "/{dataset_id}/homepage-ranking",
    response_model=list[HomepageItem],
    responses={404: {"description": "Dataset not found"}},
)
def homepage_ranking(dataset_id: str, top_n: Annotated[int, Query(ge=1, le=20)] = 10):
    rules = _load_rules(dataset_id)
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
):
    rules = _load_rules(dataset_id)
    return get_frequently_bought_together(item, rules, top_n)


@router.post(
    "/{dataset_id}/cross-sell",
    response_model=list[CrossSellItem],
    responses={404: {"description": "Dataset not found"}},
)
def cross_sell(dataset_id: str, body: CrossSellRequest):
    rules = _load_rules(dataset_id)
    return get_cross_sell(body.cart_items, rules, body.top_n)


@router.get(
    "/{dataset_id}/promos",
    response_model=list[PromoOut],
    responses={404: {"description": "Dataset not found"}},
)
def promos(dataset_id: str, top_n: Annotated[int, Query(ge=1, le=20)] = 5):
    rules = _load_rules(dataset_id)
    return get_promos(rules, top_n)


@router.post(
    "/{dataset_id}/cart-promos",
    response_model=CartPromoResponse,
    responses={404: {"description": "Dataset not found"}},
)
def cart_promos(dataset_id: str, body: CartPromoRequest):
    rules = _load_rules(dataset_id)
    payload_items = [{'name': i.name, 'qty': i.qty} for i in body.cart_items]
    return get_cart_promos(payload_items, rules)


@router.get(
    "/compare/insights",
    response_model=BusinessInsightsOut,
    responses={404: {"description": "Required datasets not found"}},
)
def business_insights():
    transactions_a = load_transactions('A')
    transactions_b = load_transactions('B')
    if not transactions_a or not transactions_b:
        raise HTTPException(status_code=404, detail="Both datasets A and B are required")
    rules_a = get_rules(transactions_a, 'A')
    rules_b = get_rules(transactions_b, 'B')
    return get_business_insights(rules_a, rules_b)
