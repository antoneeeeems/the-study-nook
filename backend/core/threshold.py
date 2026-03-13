import itertools
import random
import numpy as np
from collections import Counter


def _adjust_for_drift(minsup, minconf, prev_drift_report):
    if prev_drift_report is None:
        return minsup, minconf, 'No prior drift info - using base thresholds.'

    jaccard = prev_drift_report.get('jaccard', 1.0)
    if jaccard < 0.5:
        minsup = max(0.01, round(minsup * 0.85, 3))
        minconf = max(0.10, round(minconf * 0.925, 3))
        msg = f'DRIFT (Jaccard={jaccard:.3f}) - minsup lowered 15%, minconf lowered 7.5%'
        return minsup, minconf, msg

    if jaccard >= 0.75:
        minsup = round(minsup * 1.10, 3)
        minconf = round(minconf * 1.05, 3)
        msg = f'STABLE (Jaccard={jaccard:.3f}) - minsup raised 10%, minconf raised 5%'
        return minsup, minconf, msg

    msg = f'MODERATE change (Jaccard={jaccard:.3f}) - thresholds unchanged'
    return minsup, minconf, msg


def adaptive_threshold(transactions, prev_drift_report=None, rng=None):
    N = len(transactions)

    sampler = rng if rng is not None else random
    sample = sampler.sample(transactions, min(500, N))
    pair_counts, ant_counts = Counter(), Counter()
    for t in sample:
        items = list(set(t))
        for a, b in itertools.combinations(sorted(items), 2):
            pair_counts[(a, b)] += 1
        for a, b in itertools.permutations(items, 2):
            ant_counts[a] += 1

    pair_supports = np.array([cnt / len(sample) for cnt in pair_counts.values()])
    minsup = float(np.percentile(pair_supports, 50)) if len(pair_supports) > 0 else 0.05
    minsup = max(0.01, round(minsup, 3))

    pair_confs_lookup = Counter()
    for t in sample:
        items = list(set(t))
        for a, b in itertools.permutations(items, 2):
            pair_confs_lookup[(a, b)] += 1
    confs = [pair_confs_lookup[p] / ant_counts[p[0]]
             for p in pair_confs_lookup if ant_counts[p[0]] > 0]
    minconf = float(np.percentile(confs, 50)) if confs else 0.3
    minconf = max(0.1, round(minconf, 3))

    minsup, minconf, adaptation_msg = _adjust_for_drift(minsup, minconf, prev_drift_report)

    return minsup, minconf, adaptation_msg
