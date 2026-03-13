from backend.core.fpgrowth import run_fpgrowth
from backend.core.rules import derive_association_rules, score_rules
from backend.services.dataset import load_transactions
from backend.services.recommendation import get_cart_promos
import pandas as pd


def test_rule_metrics_and_score_columns_exist():
    transactions_a = load_transactions("A")
    fi = run_fpgrowth(transactions_a, min_support=0.05)
    rules = derive_association_rules(fi, len(transactions_a), min_confidence=0.3)
    scored = score_rules(rules)

    assert scored is not None
    assert not scored.empty
    for col in ["support", "confidence", "lift", "leverage", "conviction", "score"]:
        assert col in scored.columns


def test_cart_promos_stacks_non_overlapping_bundles_deterministically():
    rules_df = pd.DataFrame(
        [
            {
                "antecedent": "Notebook",
                "consequent": "Pencil",
                "support": 0.1,
                "confidence": 0.6,
                "lift": 1.4,
                "score": 0.9,
            },
            {
                "antecedent": "Eraser",
                "consequent": "Sharpener",
                "support": 0.08,
                "confidence": 0.42,
                "lift": 1.2,
                "score": 0.8,
            },
        ]
    )

    cart_items = [
        {"name": "Notebook", "qty": 1},
        {"name": "Pencil", "qty": 1},
        {"name": "Eraser", "qty": 1},
        {"name": "Sharpener", "qty": 1},
    ]

    result1 = get_cart_promos(cart_items, rules_df)
    result2 = get_cart_promos(cart_items, rules_df)

    assert result1 == result2
    assert len(result1["applied_promos"]) == 2
    assert result1["total_discount"] > 0
    assert result1["final_total"] == round(result1["subtotal"] - result1["total_discount"], 2)


def test_cart_promos_prevents_double_discounting_same_item_units():
    rules_df = pd.DataFrame(
        [
            {
                "antecedent": "Notebook",
                "consequent": "Pencil",
                "support": 0.1,
                "confidence": 0.6,
                "lift": 1.4,
                "score": 0.9,
            },
            {
                "antecedent": "Pencil",
                "consequent": "Eraser",
                "support": 0.09,
                "confidence": 0.5,
                "lift": 1.3,
                "score": 0.85,
            },
        ]
    )

    # One pencil unit can only satisfy one promo application.
    cart_items = [
        {"name": "Notebook", "qty": 1},
        {"name": "Pencil", "qty": 1},
        {"name": "Eraser", "qty": 1},
    ]

    result = get_cart_promos(cart_items, rules_df)
    applications = sum(promo["applications"] for promo in result["applied_promos"])
    assert applications == 1
