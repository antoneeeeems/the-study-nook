from pydantic import BaseModel, Field
from typing import Optional, Any


class RuleOut(BaseModel):
    antecedent: str
    consequent: str
    support: float
    confidence: float
    lift: float
    leverage: float
    conviction: float
    score: float
    strength: str
    explanation: str


class BundleOut(BaseModel):
    bundle: str
    support: float
    confidence: float
    lift: float
    score: float
    explanation: str


class PromoOut(BaseModel):
    tag: str
    bundle: str
    regular_price: float
    discount: str
    savings: float
    promo_price: float
    lift: float
    mapped_price: bool = True


class HomepageItem(BaseModel):
    rank: int
    item: str
    total_score: float
    rule_appearances: int
    price: float
    mapped_price: bool = True


class FBTItem(BaseModel):
    item: str
    confidence: float
    lift: float
    strength: str
    price: float
    mapped_price: bool = True


class CrossSellItem(BaseModel):
    suggested_item: str
    because_you_have: str
    confidence: float
    lift: float
    score: float
    price: float
    mapped_price: bool = True


class DriftReport(BaseModel):
    jaccard: float
    drift_detected: bool
    stability_score: float
    lift_delta: float
    avg_lift_prev: float
    avg_lift_curr: float
    rule_count_prev: int
    rule_count_curr: int
    new_rules: int
    dropped_rules: int


class DatasetStats(BaseModel):
    dataset_id: str
    total_transactions: int
    total_rows: int
    unique_items: int
    raw_unique_items: Optional[int] = None
    normalized_unique_items: Optional[int] = None
    unmapped_items: Optional[list[str]] = None
    fallback_price: Optional[float] = None
    avg_basket_size: float
    min_basket_size: int
    max_basket_size: int
    items: list[str]
    item_frequencies: dict[str, int]


class CrossSellRequest(BaseModel):
    cart_items: list[str]
    top_n: int = 5


class CartPromoItemIn(BaseModel):
    name: str
    qty: int = Field(ge=1)


class CartPromoRequest(BaseModel):
    cart_items: list[CartPromoItemIn]


class AppliedPromoOut(BaseModel):
    tag: str
    bundle: str
    applications: int
    discount: str
    regular_price: float
    savings: float
    promo_price: float
    lift: float
    mapped_price: bool = True


class CartPromoResponse(BaseModel):
    subtotal: float
    total_discount: float
    final_total: float
    applied_promos: list[AppliedPromoOut]


class DatasetInfoOut(BaseModel):
    id: str
    name: str
    path: str


class TransactionRowOut(BaseModel):
    transaction_id: str
    items: list[str]
    item_count: int


class PaginatedTransactionsOut(BaseModel):
    data: list[TransactionRowOut]
    total: int
    page: int
    per_page: int
    total_pages: int


class UploadQualityReport(BaseModel):
    total_rows: int
    total_transactions: int
    unique_items: int
    duplicate_transaction_item_rows: int
    empty_value_rows: int
    min_basket_size: int
    max_basket_size: int
    avg_basket_size: float
    warnings: list[str] = Field(default_factory=list)


class DatasetUploadResponse(BaseModel):
    dataset_id: str
    stats: DatasetStats
    quality: UploadQualityReport


class IterationOut(BaseModel):
    iteration: int
    timestamp: str
    dataset_label: str
    n_transactions: int
    minsup: float
    minconf: float
    adaptation_msg: str
    n_frequent_itemsets: int
    n_rules: int
    avg_support: float
    avg_confidence: float
    avg_lift: float
    top_rule: str
    drift: Optional[DriftReport] = None
    k_max: int
    rules: list[dict[str, Any]] = Field(default_factory=list)


class StabilityOut(BaseModel):
    top_rule_antecedent: str
    top_rule_consequent: str
    survived_v2: bool
    survived_v3: bool
    verdict: str


class PipelineRunResponse(BaseModel):
    run_id: str
    created_at: str
    dataset_id: str
    dataset_b_id: Optional[str] = None
    seed: int
    iterations: list[IterationOut]
    stability: Optional[StabilityOut] = None


class PipelineRunListItem(BaseModel):
    run_id: str
    created_at: str
    dataset_id: str
    dataset_b_id: Optional[str] = None
    seed: int
    iterations: int


class PipelineRunHistoryResponse(BaseModel):
    runs: list[PipelineRunListItem]


class AlgorithmComparisonModel(BaseModel):
    algorithm: str
    frequent_itemsets: int
    rules_generated: int
    avg_lift: float
    runtime_seconds: float


class AlgorithmComparisonResponse(BaseModel):
    fpgrowth: AlgorithmComparisonModel
    apriori: AlgorithmComparisonModel


class BusinessRuleVolume(BaseModel):
    dataset_a: int
    dataset_b: int
    richer: str


class BusinessAvgLift(BaseModel):
    dataset_a: float
    dataset_b: float
    stronger: str


class RuleHeadline(BaseModel):
    antecedent: str
    consequent: str
    confidence: float
    lift: float
    score: float


class StrongestRulesByDataset(BaseModel):
    dataset_a: Optional[RuleHeadline] = None
    dataset_b: Optional[RuleHeadline] = None


class HubItem(BaseModel):
    item: str
    rule_count: int


class HubProductsByDataset(BaseModel):
    dataset_a: list[HubItem]
    dataset_b: list[HubItem]


class CrossDatasetOverlap(BaseModel):
    jaccard: float
    shared: int
    only_a: int
    only_b: int


class BusinessInsightsOut(BaseModel):
    rule_volume: BusinessRuleVolume
    avg_lift: BusinessAvgLift
    strongest_rule: StrongestRulesByDataset
    hub_products: HubProductsByDataset
    cross_dataset_overlap: CrossDatasetOverlap
    recommendations: list[str]
