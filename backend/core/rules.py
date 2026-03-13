import itertools
import numpy as np
import pandas as pd

SCORE_WEIGHTS = {'lift': 0.40, 'confidence': 0.40, 'support': 0.20}


def derive_association_rules(frequent_itemsets_df, N, min_confidence):
    support_map = {row['itemsets']: row['support_count']
                   for _, row in frequent_itemsets_df.iterrows()}
    rules = []
    for _, row in frequent_itemsets_df.iterrows():
        itemset = row['itemsets']
        if len(itemset) < 2:
            continue
        for size in range(1, len(itemset)):
            for ant_tuple in itertools.combinations(sorted(itemset), size):
                ant = frozenset(ant_tuple)
                cons = itemset - ant
                ant_sup = support_map.get(ant, 0)
                if ant_sup == 0:
                    continue
                conf = row['support_count'] / ant_sup
                if conf < min_confidence:
                    continue
                cons_sup = support_map.get(cons, 0)
                cons_sup_frac = cons_sup / N if cons_sup else 0
                lift = conf / cons_sup_frac if cons_sup_frac > 0 else 0
                leverage = (row['support_count'] / N) - (ant_sup / N) * cons_sup_frac
                conviction = (1 - cons_sup_frac) / (1 - conf) if conf < 1 else np.inf
                rules.append({
                    'antecedent': ', '.join(sorted(ant)),
                    'consequent': ', '.join(sorted(cons)),
                    'support_count': row['support_count'],
                    'support': row['support_count'] / N,
                    'confidence': conf,
                    'lift': lift,
                    'leverage': leverage,
                    'conviction': conviction,
                })
    if not rules:
        return pd.DataFrame()
    return (pd.DataFrame(rules)
            .sort_values(['lift', 'confidence', 'support'], ascending=False)
            .reset_index(drop=True))


def score_rules(rules_df, weights=None):
    if rules_df is None or rules_df.empty:
        return rules_df
    if weights is None:
        weights = SCORE_WEIGHTS
    df = rules_df.copy()

    for col in ['lift', 'confidence', 'support']:
        col_min, col_max = df[col].min(), df[col].max()
        if col_max > col_min:
            df[f'norm_{col}'] = (df[col] - col_min) / (col_max - col_min)
        else:
            df[f'norm_{col}'] = 1.0

    df['score'] = (
        weights['lift'] * df['norm_lift']
        + weights['confidence'] * df['norm_confidence']
        + weights['support'] * df['norm_support']
    ).round(4)

    df = df.drop(columns=['norm_lift', 'norm_confidence', 'norm_support'])
    df = df.sort_values('score', ascending=False).reset_index(drop=True)
    return df
