import random

from backend.core.drift import detect_drift
from backend.core.threshold import adaptive_threshold
from backend.services.dataset import load_transactions


def test_adaptive_threshold_is_reproducible_with_seeded_rng():
    transactions_a = load_transactions("A")
    rng_1 = random.Random(42)
    rng_2 = random.Random(42)

    minsup_1, minconf_1, _ = adaptive_threshold(transactions_a, rng=rng_1)
    minsup_2, minconf_2, _ = adaptive_threshold(transactions_a, rng=rng_2)

    assert minsup_1 == minsup_2
    assert minconf_1 == minconf_2


def test_drift_detected_for_disjoint_rule_sets():
    prev_rules = {
        "antecedent": ["A", "B"],
        "consequent": ["C", "D"],
        "lift": [1.2, 1.3],
    }
    curr_rules = {
        "antecedent": ["X", "Y"],
        "consequent": ["Z", "W"],
        "lift": [1.1, 1.05],
    }

    import pandas as pd

    report = detect_drift(pd.DataFrame(prev_rules), pd.DataFrame(curr_rules), threshold=0.5)

    assert report["drift_detected"] is True
    assert report["jaccard"] == 0.0
