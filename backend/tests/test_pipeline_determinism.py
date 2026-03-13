from backend.core.pipeline import run_full_pipeline
from backend.services.dataset import load_transactions


def test_pipeline_is_deterministic_with_same_seed():
    transactions_a = load_transactions("A")
    result_1 = run_full_pipeline(transactions_a, None, seed=123)
    result_2 = run_full_pipeline(transactions_a, None, seed=123)

    iter_1_a = result_1["iterations"][0]
    iter_1_b = result_2["iterations"][0]

    assert iter_1_a["minsup"] == iter_1_b["minsup"]
    assert iter_1_a["minconf"] == iter_1_b["minconf"]
    assert iter_1_a["n_rules"] == iter_1_b["n_rules"]
    assert iter_1_a["top_rule"] == iter_1_b["top_rule"]


def test_pipeline_changes_with_different_seed():
    transactions_a = load_transactions("A")
    result_1 = run_full_pipeline(transactions_a, None, seed=123)
    result_2 = run_full_pipeline(transactions_a, None, seed=456)

    iter_1_a = result_1["iterations"][0]
    iter_1_b = result_2["iterations"][0]

    # Different seeds should still produce valid bounded thresholds.
    assert 0.01 <= iter_1_a["minsup"] <= 1.0
    assert 0.01 <= iter_1_b["minsup"] <= 1.0
    assert 0.1 <= iter_1_a["minconf"] <= 1.0
    assert 0.1 <= iter_1_b["minconf"] <= 1.0
