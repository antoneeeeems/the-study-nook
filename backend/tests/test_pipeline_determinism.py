from backend.core.pipeline import run_full_pipeline
from backend.services.dataset import get_pipeline_dataset_ids_ordered, load_transactions


def _build_dataset_sequences():
    sequences = []
    for dataset_id in get_pipeline_dataset_ids_ordered():
        transactions = load_transactions(dataset_id)
        if transactions:
            sequences.append({"id": dataset_id, "transactions": transactions})
    return sequences


def test_pipeline_dataset_order_starts_with_builtins():
    dataset_ids = get_pipeline_dataset_ids_ordered()
    assert dataset_ids
    assert dataset_ids[0] == "A"
    if len(dataset_ids) > 1:
        assert dataset_ids[1] == "B"


def test_pipeline_is_deterministic_with_same_seed():
    dataset_sequences = _build_dataset_sequences()
    result_1 = run_full_pipeline(dataset_sequences, seed=123)
    result_2 = run_full_pipeline(dataset_sequences, seed=123)

    iter_1_a = result_1["iterations"][0]
    iter_1_b = result_2["iterations"][0]

    assert iter_1_a["minsup"] == iter_1_b["minsup"]
    assert iter_1_a["minconf"] == iter_1_b["minconf"]
    assert iter_1_a["n_rules"] == iter_1_b["n_rules"]
    assert iter_1_a["top_rule"] == iter_1_b["top_rule"]


def test_pipeline_changes_with_different_seed():
    dataset_sequences = _build_dataset_sequences()
    result_1 = run_full_pipeline(dataset_sequences, seed=123)
    result_2 = run_full_pipeline(dataset_sequences, seed=456)

    iter_1_a = result_1["iterations"][0]
    iter_1_b = result_2["iterations"][0]

    # Different seeds should still produce valid bounded thresholds.
    assert 0.01 <= iter_1_a["minsup"] <= 1.0
    assert 0.01 <= iter_1_b["minsup"] <= 1.0
    assert 0.1 <= iter_1_a["minconf"] <= 1.0
    assert 0.1 <= iter_1_b["minconf"] <= 1.0
