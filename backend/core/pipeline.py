import time
import random
import numpy as np
from collections import Counter
from datetime import datetime

from .fpgrowth import run_fpgrowth
from .apriori import run_apriori
from .rules import derive_association_rules, score_rules
from .drift import detect_drift
from .threshold import adaptive_threshold


def run_iteration(iteration_num, label, transactions, prev_rules=None, prev_drift_report=None, rng=None):
    N = len(transactions)

    minsup, minconf, adaptation_msg = adaptive_threshold(
        transactions, prev_drift_report=prev_drift_report, rng=rng
    )

    fi = run_fpgrowth(transactions, minsup)
    k_max = int(fi['k'].max()) if not fi.empty else 0

    rules_raw = derive_association_rules(fi, N, minconf)
    rules = score_rules(rules_raw)

    drift_report = None
    if prev_rules is not None:
        drift_report = detect_drift(prev_rules, rules, threshold=0.5)

    top_rule = 'N/A'
    if rules is not None and not rules.empty:
        r = rules.iloc[0]
        top_rule = f"{r['antecedent']} -> {r['consequent']} (lift={r['lift']:.3f})"

    result = {
        'iteration': iteration_num,
        'timestamp': datetime.now().isoformat(),
        'dataset_label': label,
        'n_transactions': N,
        'minsup': minsup,
        'minconf': minconf,
        'adaptation_msg': adaptation_msg,
        'n_frequent_itemsets': len(fi),
        'n_rules': len(rules) if rules is not None else 0,
        'avg_support': round(fi['support'].mean(), 4) if not fi.empty else 0,
        'avg_confidence': round(rules['confidence'].mean(), 4) if rules is not None and not rules.empty else 0,
        'avg_lift': round(rules['lift'].mean(), 4) if rules is not None and not rules.empty else 0,
        'top_rule': top_rule,
        'drift': drift_report,
        'k_max': k_max,
    }

    return rules, fi, drift_report, result


def compare_fpgrowth_vs_apriori(transactions, minsup, minconf):
    N = len(transactions)

    t0 = time.time()
    fi_fp = run_fpgrowth(transactions, minsup)
    r_fp = derive_association_rules(fi_fp, N, minconf)
    t_fp = round(time.time() - t0, 4)

    t0 = time.time()
    fi_ap = run_apriori(transactions, minsup, max_k=3)
    r_ap = derive_association_rules(fi_ap, N, minconf)
    t_ap = round(time.time() - t0, 4)

    return {
        'fpgrowth': {
            'algorithm': 'FP-Growth',
            'frequent_itemsets': len(fi_fp),
            'rules_generated': len(r_fp) if r_fp is not None and not r_fp.empty else 0,
            'avg_lift': round(r_fp['lift'].mean(), 4) if r_fp is not None and not r_fp.empty else 0,
            'runtime_seconds': t_fp,
        },
        'apriori': {
            'algorithm': 'Apriori (max_k=3)',
            'frequent_itemsets': len(fi_ap),
            'rules_generated': len(r_ap) if r_ap is not None and not r_ap.empty else 0,
            'avg_lift': round(r_ap['lift'].mean(), 4) if r_ap is not None and not r_ap.empty else 0,
            'runtime_seconds': t_ap,
        },
    }


def simulate_drift(transactions, rng_np):
    """Simulate concept drift by boosting mid-tier items, suppressing top items, injecting new ones."""
    popular_items_counter = Counter(item for t in transactions for item in t)
    sorted_by_freq = [item for item, _ in popular_items_counter.most_common()]

    mid_tier_items = sorted_by_freq[5:10] if len(sorted_by_freq) >= 10 else sorted_by_freq[len(sorted_by_freq) // 2:]
    declining_items = set(sorted_by_freq[:5])
    new_launch_items = ['NEWPROD_X1', 'NEWPROD_X2']

    drifted = []
    for t in transactions:
        new_t = [item for item in t if item not in declining_items or rng_np.random() > 0.60]
        if rng_np.random() < 0.50 and mid_tier_items:
            new_t.append(rng_np.choice(mid_tier_items))
        if rng_np.random() < 0.25:
            new_t.append(rng_np.choice(new_launch_items))
        if new_t:
            drifted.append(list(set(new_t)))
    return drifted


def _compute_stability(rules_v1, rules_v2, rules_v3):
    if rules_v1 is None or rules_v1.empty:
        return None

    top_ant = rules_v1.iloc[0]['antecedent']
    top_cons = rules_v1.iloc[0]['consequent']

    def check_survival(rules_df):
        if rules_df is None or rules_df.empty:
            return False
        pairs = set(zip(rules_df['antecedent'], rules_df['consequent']))
        return (top_ant, top_cons) in pairs

    survived_v2 = check_survival(rules_v2)
    survived_v3 = check_survival(rules_v3)
    if survived_v2 and survived_v3:
        verdict = 'FULL'
    elif survived_v2:
        verdict = 'PARTIAL'
    else:
        verdict = 'UNSTABLE'

    return {
        'top_rule_antecedent': top_ant,
        'top_rule_consequent': top_cons,
        'survived_v2': survived_v2,
        'survived_v3': survived_v3,
        'verdict': verdict,
    }


def run_full_pipeline(transactions_a, transactions_b=None, seed=42):
    """Run the full 3-iteration self-learning pipeline."""
    np.random.seed(seed)
    rng_np = np.random.default_rng(seed)
    rng = random.Random(seed)

    # Iteration 1: Dataset A
    rules_v1, _, _, result_v1 = run_iteration(
        iteration_num=1,
        label='Dataset A (initial)',
        transactions=transactions_a,
        prev_rules=None,
        prev_drift_report=None,
        rng=rng,
    )

    # Bootstrap drift for iter 2
    split_idx = int(len(transactions_a) * 0.70)
    txns_early = transactions_a[:split_idx]
    txns_late = transactions_a[split_idx:]
    ms_e, mc_e, _ = adaptive_threshold(txns_early, rng=rng)
    ms_l, mc_l, _ = adaptive_threshold(txns_late, rng=rng)
    fi_early = run_fpgrowth(txns_early, ms_e)
    fi_late = run_fpgrowth(txns_late, ms_l)
    rules_early = score_rules(derive_association_rules(fi_early, len(txns_early), mc_e))
    rules_late = score_rules(derive_association_rules(fi_late, len(txns_late), mc_l))
    drift_v1 = detect_drift(rules_early, rules_late, threshold=0.5)

    # Iteration 2: Dataset A+B (or just A with drift if no B)
    if transactions_b:
        transactions_ab = transactions_a + transactions_b
        label_v2 = 'Dataset A+B (updated)'
    else:
        transactions_ab = transactions_a
        label_v2 = 'Dataset A (re-mined)'

    rules_v2, _, drift_v2, result_v2 = run_iteration(
        iteration_num=2,
        label=label_v2,
        transactions=transactions_ab,
        prev_rules=rules_v1,
        prev_drift_report=drift_v1,
        rng=rng,
    )

    # Iteration 3: Drift-simulated
    drifted = simulate_drift(transactions_ab, rng_np)
    transactions_v3 = transactions_ab + drifted[:800]

    rules_v3, _, _, result_v3 = run_iteration(
        iteration_num=3,
        label='Dataset v3 (drift-simulated)',
        transactions=transactions_v3,
        prev_rules=rules_v2,
        prev_drift_report=drift_v2,
        rng=rng,
    )

    stability = _compute_stability(rules_v1, rules_v2, rules_v3)

    # Convert rules to serializable format
    def rules_to_list(rules_df):
        if rules_df is None or rules_df.empty:
            return []
        return rules_df.to_dict(orient='records')

    return {
        'iterations': [
            {**result_v1, 'rules': rules_to_list(rules_v1)},
            {**result_v2, 'rules': rules_to_list(rules_v2)},
            {**result_v3, 'rules': rules_to_list(rules_v3)},
        ],
        'stability': stability,
    }
