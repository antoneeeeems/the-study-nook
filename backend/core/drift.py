import pandas as pd


def jaccard_ruleset(rules_a, rules_b):
    if rules_a.empty or rules_b.empty:
        return 0.0
    set_a = set(zip(rules_a['antecedent'], rules_a['consequent']))
    set_b = set(zip(rules_b['antecedent'], rules_b['consequent']))
    if not set_a and not set_b:
        return 1.0
    return len(set_a & set_b) / len(set_a | set_b)


def detect_drift(prev_rules, curr_rules, threshold=0.5):
    similarity = jaccard_ruleset(prev_rules, curr_rules)
    drift = similarity < threshold

    new_count = 0
    dropped_count = 0
    if not prev_rules.empty and not curr_rules.empty:
        prev_pairs = set(zip(prev_rules['antecedent'], prev_rules['consequent']))
        curr_pairs = set(zip(curr_rules['antecedent'], curr_rules['consequent']))
        new_count = len(curr_pairs - prev_pairs)
        dropped_count = len(prev_pairs - curr_pairs)

    avg_lift_prev = prev_rules['lift'].mean() if not prev_rules.empty else 0
    avg_lift_curr = curr_rules['lift'].mean() if not curr_rules.empty else 0
    lift_delta = avg_lift_curr - avg_lift_prev

    stability = round(similarity, 4)

    return {
        'jaccard': similarity,
        'drift_detected': drift,
        'stability_score': stability,
        'lift_delta': lift_delta,
        'avg_lift_prev': avg_lift_prev,
        'avg_lift_curr': avg_lift_curr,
        'rule_count_prev': len(prev_rules),
        'rule_count_curr': len(curr_rules),
        'new_rules': new_count,
        'dropped_rules': dropped_count,
    }
