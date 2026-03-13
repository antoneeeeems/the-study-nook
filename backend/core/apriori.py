import numpy as np
import pandas as pd
from collections import Counter


def apriori_get_freq_1(transactions, min_sup_cnt):
    counts = Counter(item for t in transactions for item in t)
    return {frozenset([item]): cnt for item, cnt in counts.items() if cnt >= min_sup_cnt}


def apriori_candidate_gen(prev_freq, k):
    prev_list = list(prev_freq.keys())
    candidates = set()
    for i in range(len(prev_list)):
        for j in range(i + 1, len(prev_list)):
            union = prev_list[i] | prev_list[j]
            if len(union) == k:
                candidates.add(union)
    return candidates


def run_apriori(transactions, min_support, max_k=3):
    N = len(transactions)
    min_sup_cnt = max(1, int(np.ceil(min_support * N)))
    tx_sets = [set(t) for t in transactions]
    all_rows = []

    freq_k = apriori_get_freq_1(transactions, min_sup_cnt)
    for fs, cnt in freq_k.items():
        all_rows.append({'itemsets': fs, 'support_count': cnt, 'support': cnt / N, 'k': 1})

    for k in range(2, max_k + 1):
        candidates = apriori_candidate_gen(freq_k, k)
        if not candidates:
            break
        new_freq = {}
        for cand in candidates:
            cnt = sum(1 for tx in tx_sets if cand.issubset(tx))
            if cnt >= min_sup_cnt:
                new_freq[cand] = cnt
                all_rows.append({'itemsets': cand, 'support_count': cnt, 'support': cnt / N, 'k': k})
        freq_k = new_freq
        if not freq_k:
            break

    if not all_rows:
        return pd.DataFrame(columns=['itemsets', 'support', 'support_count', 'k'])
    df = (pd.DataFrame(all_rows)
          .sort_values(['k', 'support'], ascending=[True, False])
          .reset_index(drop=True))
    return df
