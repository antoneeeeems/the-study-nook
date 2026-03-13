import pandas as pd
from collections import defaultdict
from itertools import combinations

from ..core.fpgrowth import run_fpgrowth
from ..core.rules import derive_association_rules, score_rules
from ..core.threshold import adaptive_threshold

PRICE_LIST = {
    'Notebook': 35, 'Pencil': 10, 'Eraser': 8, 'Sharpener': 12,
    'Pencil Case': 55, 'Ruler': 20, 'Colored Pencils': 75, 'Crayon Set': 90,
    'Watercolor Set': 120, 'Glue Stick': 25, 'Scissors': 40, 'Folder': 18,
    'Highlighter': 30, 'Correction Tape': 28, 'Index Cards': 22,
    'Intermediate Pad': 32, 'Paper Clips': 15, 'Sticky Notes': 28,
    'Compass': 45, 'Protractor': 25,
    'Ballpen': 12, 'Bond Paper': 55, 'Gel Pen': 35, 'Mechanical Pencil': 65,
    'Calculator': 280, 'Graphing Paper': 28, 'Binder': 95, 'Clearbook': 75,
    'Yellow Pad': 38, 'Stapler': 85, 'Staple Wire': 18, 'Puncher': 70,
    'Scotch Tape': 22, 'Double-Sided Tape': 30, 'Permanent Marker': 40,
    'Whiteboard Marker': 45, 'Ballpen Ink Refill': 20, 'Art Paper': 15,
    'Geometry Set': 120, 'Plastic Envelope': 25,
}

FALLBACK_PRICE = 50


def get_item_price(item_name: str):
    if item_name in PRICE_LIST:
        return PRICE_LIST[item_name], True
    return FALLBACK_PRICE, False

# Cache mined rules per dataset
_rules_cache = {}


def _clean_col(series):
    return series.astype(str).str.replace(r'[\{\}]', '', regex=True).str.strip()


def get_rules(transactions, dataset_id=None):
    if dataset_id and dataset_id in _rules_cache:
        return _rules_cache[dataset_id]

    minsup, minconf, _ = adaptive_threshold(transactions)
    fi = run_fpgrowth(transactions, minsup)
    N = len(transactions)
    rules_raw = derive_association_rules(fi, N, minconf)
    rules = score_rules(rules_raw)

    if rules is not None and not rules.empty:
        rules['antecedent'] = _clean_col(rules['antecedent'])
        rules['consequent'] = _clean_col(rules['consequent'])

    if dataset_id:
        _rules_cache[dataset_id] = rules
    return rules


def clear_rules_cache(dataset_id=None):
    if dataset_id:
        _rules_cache.pop(dataset_id, None)
    else:
        _rules_cache.clear()


def get_top_bundles(rules_df, top_n=5):
    if rules_df is None or rules_df.empty:
        return []
    seen, bundles = set(), []
    for _, row in rules_df.iterrows():
        pair = tuple(sorted([row['antecedent'], row['consequent']]))
        if pair not in seen:
            seen.add(pair)
            bundles.append({
                'bundle': f"{pair[0]}  +  {pair[1]}",
                'support': round(row['support'], 4),
                'confidence': round(row['confidence'], 4),
                'lift': round(row['lift'], 4),
                'score': round(row['score'], 4),
                'explanation': _bundle_explanation(pair[0], pair[1], row),
            })
        if len(bundles) == top_n:
            break
    return bundles


def _bundle_explanation(item_a, item_b, row):
    strength = 'strongly' if row['lift'] >= 1.2 else ('moderately' if row['lift'] >= 1.0 else 'weakly')
    return (f"Customers who buy {item_a} are {row['confidence']*100:.1f}% likely to also buy {item_b} "
            f"— {row['lift']:.2f}x more than average ({strength} associated)")


def get_top_rules(rules_df, top_n=10):
    if rules_df is None or rules_df.empty:
        return []
    top = rules_df.head(top_n)
    result = []
    for _, row in top.iterrows():
        strength = 'Strong' if row['lift'] >= 1.2 else ('Moderate' if row['lift'] >= 1.0 else 'Weak')
        result.append({
            'antecedent': row['antecedent'],
            'consequent': row['consequent'],
            'support': round(row['support'], 4),
            'confidence': round(row['confidence'], 4),
            'lift': round(row['lift'], 4),
            'leverage': round(row['leverage'], 6),
            'conviction': round(row['conviction'], 4) if row['conviction'] != float('inf') else 999.0,
            'score': round(row['score'], 4),
            'strength': strength,
            'explanation': f"Customers who buy [{row['antecedent']}] → {row['confidence']*100:.1f}% also buy [{row['consequent']}] (lift: {row['lift']:.2f}x)",
        })
    return result


def get_homepage_ranking(rules_df, top_n=10):
    if rules_df is None or rules_df.empty:
        return []
    item_scores = defaultdict(float)
    item_rule_count = defaultdict(int)
    for _, row in rules_df.iterrows():
        for col in ['antecedent', 'consequent']:
            item_scores[row[col]] += row['score']
            item_rule_count[row[col]] += 1
    ranking = sorted(item_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
    result = []
    for i, (item, score) in enumerate(ranking):
        price, mapped = get_item_price(item)
        result.append({
            'rank': i + 1,
            'item': item,
            'total_score': round(score, 4),
            'rule_appearances': item_rule_count[item],
            'price': price,
            'mapped_price': mapped,
        })
    return result


def get_frequently_bought_together(item, rules_df, top_n=5):
    if rules_df is None or rules_df.empty:
        return []
    matches = rules_df[rules_df['antecedent'].str.lower() == item.lower()].copy()
    if matches.empty:
        matches = rules_df[rules_df['consequent'].str.lower() == item.lower()].copy()
        if matches.empty:
            return []
        matches = matches.rename(columns={'antecedent': 'consequent', 'consequent': 'antecedent'})
    matches = matches.sort_values('confidence', ascending=False).head(top_n)
    result = []
    for _, row in matches.iterrows():
        strength = 'Strong' if row['lift'] >= 1.2 else 'Moderate'
        price, mapped = get_item_price(row['consequent'])
        result.append({
            'item': row['consequent'],
            'confidence': round(row['confidence'], 4),
            'lift': round(row['lift'], 4),
            'strength': strength,
            'price': price,
            'mapped_price': mapped,
        })
    return result


def get_cross_sell(cart_items, rules_df, top_n=5):
    if rules_df is None or rules_df.empty:
        return []
    cart_lower = [i.lower() for i in cart_items]
    suggestions = []
    for _, row in rules_df.iterrows():
        if row['antecedent'].lower() in cart_lower and row['consequent'].lower() not in cart_lower:
            price, mapped = get_item_price(row['consequent'])
            suggestions.append({
                'suggested_item': row['consequent'],
                'because_you_have': row['antecedent'],
                'confidence': round(row['confidence'], 4),
                'lift': round(row['lift'], 4),
                'score': round(row['score'], 4),
                'price': price,
                'mapped_price': mapped,
            })
    # Deduplicate by suggested item, keep highest score
    seen = set()
    deduped = []
    for s in sorted(suggestions, key=lambda x: x['score'], reverse=True):
        if s['suggested_item'] not in seen:
            seen.add(s['suggested_item'])
            deduped.append(s)
        if len(deduped) == top_n:
            break
    return deduped


def _assign_discount(lift, confidence):
    if lift >= 1.3 and confidence >= 0.45:
        return 15, 'Hot Deal'
    elif lift >= 1.1 and confidence >= 0.35:
        return 10, 'Bundle Saver'
    else:
        return 5, 'Starter Bundle'


def get_promos(rules_df, top_n=5):
    if rules_df is None or rules_df.empty:
        return []
    seen, promos = set(), []
    for _, row in rules_df.iterrows():
        ant, con = row['antecedent'], row['consequent']
        pair = tuple(sorted([ant, con]))
        if pair in seen:
            continue
        seen.add(pair)
        ant_price, ant_mapped = get_item_price(ant)
        con_price, con_mapped = get_item_price(con)
        total = ant_price + con_price
        disc_pct, tag = _assign_discount(row['lift'], row['confidence'])
        savings = round(total * disc_pct / 100, 2)
        promos.append({
            'tag': tag,
            'bundle': f'{ant} + {con}',
            'regular_price': total,
            'discount': f'{disc_pct}%',
            'savings': savings,
            'promo_price': round(total - savings, 2),
            'lift': round(row['lift'], 4),
            'mapped_price': bool(ant_mapped and con_mapped),
        })
        if len(promos) == top_n:
            break
    return promos


def _discount_percent(discount_text):
    return int(str(discount_text).replace('%', '').strip())


def get_cart_promos(cart_items, rules_df):
    subtotal = 0.0
    available_qty = {}
    for item in cart_items:
        name = str(item.get('name', '')).strip()
        qty = int(item.get('qty', 0) or 0)
        if not name or qty <= 0:
            continue
        available_qty[name] = available_qty.get(name, 0) + qty
        item_price, _ = get_item_price(name)
        subtotal += item_price * qty

    subtotal = round(subtotal, 2)
    if not available_qty or rules_df is None or rules_df.empty:
        return {
            'subtotal': subtotal,
            'total_discount': 0.0,
            'final_total': subtotal,
            'applied_promos': [],
        }

    # Generate unique promo candidates from rules.
    unique_pairs = set()
    candidates = []
    for _, row in rules_df.iterrows():
        ant, con = row['antecedent'], row['consequent']
        pair = tuple(sorted([ant, con]))
        if pair in unique_pairs:
            continue
        unique_pairs.add(pair)

        ant_price, ant_mapped = get_item_price(pair[0])
        con_price, con_mapped = get_item_price(pair[1])
        regular_price = ant_price + con_price
        disc_pct, tag = _assign_discount(row['lift'], row['confidence'])
        savings = round(regular_price * disc_pct / 100, 2)
        promo_price = round(regular_price - savings, 2)
        candidates.append({
            'tag': tag,
            'bundle': f'{pair[0]} + {pair[1]}',
            'items': pair,
            'discount': f'{disc_pct}%',
            'regular_price': regular_price,
            'savings': savings,
            'promo_price': promo_price,
            'lift': round(row['lift'], 4),
            'confidence': float(row['confidence']),
            'mapped_price': bool(ant_mapped and con_mapped),
        })

    if not candidates:
        return {
            'subtotal': subtotal,
            'total_discount': 0.0,
            'final_total': subtotal,
            'applied_promos': [],
        }

    remaining = dict(available_qty)
    applied = []

    while True:
        eligible = []
        for candidate in candidates:
            item_a, item_b = candidate['items']
            if remaining.get(item_a, 0) > 0 and remaining.get(item_b, 0) > 0:
                eligible.append(candidate)

        if not eligible:
            break

        # Deterministic ordering: max savings, then lift, then confidence,
        # then higher discount percent, then lexical bundle name.
        eligible.sort(
            key=lambda c: (
                -c['savings'],
                -c['lift'],
                -c['confidence'],
                -_discount_percent(c['discount']),
                c['bundle'],
            )
        )
        selected = eligible[0]
        item_a, item_b = selected['items']
        remaining[item_a] -= 1
        remaining[item_b] -= 1
        applied.append(selected)

    grouped = {}
    for promo in applied:
        key = (promo['tag'], promo['bundle'])
        if key not in grouped:
            grouped[key] = {
                'tag': promo['tag'],
                'bundle': promo['bundle'],
                'applications': 0,
                'discount': promo['discount'],
                'regular_price': 0.0,
                'savings': 0.0,
                'promo_price': 0.0,
                'lift': promo['lift'],
                'mapped_price': promo['mapped_price'],
            }
        grouped[key]['applications'] += 1
        grouped[key]['regular_price'] = round(grouped[key]['regular_price'] + promo['regular_price'], 2)
        grouped[key]['savings'] = round(grouped[key]['savings'] + promo['savings'], 2)
        grouped[key]['promo_price'] = round(grouped[key]['promo_price'] + promo['promo_price'], 2)
        grouped[key]['mapped_price'] = bool(grouped[key]['mapped_price'] and promo['mapped_price'])

    applied_promos = sorted(
        grouped.values(),
        key=lambda p: (-p['savings'], -p['lift'], p['bundle']),
    )

    total_discount = round(sum(p['savings'] for p in applied_promos), 2)
    final_total = round(max(subtotal - total_discount, 0.0), 2)

    return {
        'subtotal': subtotal,
        'total_discount': total_discount,
        'final_total': final_total,
        'applied_promos': applied_promos,
    }


def get_business_insights(rules_a, rules_b):
    avg_lift_a = round(rules_a['lift'].mean(), 4) if rules_a is not None and not rules_a.empty else 0
    avg_lift_b = round(rules_b['lift'].mean(), 4) if rules_b is not None and not rules_b.empty else 0

    # Hub products
    def get_hubs(rules_df, top_n=3):
        counts = defaultdict(int)
        if rules_df is None or rules_df.empty:
            return []
        for _, row in rules_df.iterrows():
            counts[row['antecedent']] += 1
            counts[row['consequent']] += 1
        return [{'item': item, 'rule_count': n} for item, n in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:top_n]]

    # Cross-dataset overlap
    pairs_a = set(zip(rules_a['antecedent'], rules_a['consequent'])) if rules_a is not None and not rules_a.empty else set()
    pairs_b = set(zip(rules_b['antecedent'], rules_b['consequent'])) if rules_b is not None and not rules_b.empty else set()
    shared = pairs_a & pairs_b
    jaccard = len(shared) / len(pairs_a | pairs_b) if (pairs_a | pairs_b) else 0

    strongest_a = None
    if rules_a is not None and not rules_a.empty:
        r = rules_a.iloc[0]
        strongest_a = {'antecedent': r['antecedent'], 'consequent': r['consequent'],
                       'confidence': round(r['confidence'], 4), 'lift': round(r['lift'], 4), 'score': round(r['score'], 4)}
    strongest_b = None
    if rules_b is not None and not rules_b.empty:
        r = rules_b.iloc[0]
        strongest_b = {'antecedent': r['antecedent'], 'consequent': r['consequent'],
                       'confidence': round(r['confidence'], 4), 'lift': round(r['lift'], 4), 'score': round(r['score'], 4)}

    return {
        'rule_volume': {
            'dataset_a': len(rules_a) if rules_a is not None else 0,
            'dataset_b': len(rules_b) if rules_b is not None else 0,
            'richer': 'B' if (len(rules_b) if rules_b is not None else 0) > (len(rules_a) if rules_a is not None else 0) else 'A',
        },
        'avg_lift': {
            'dataset_a': avg_lift_a,
            'dataset_b': avg_lift_b,
            'stronger': 'A' if avg_lift_a > avg_lift_b else 'B',
        },
        'strongest_rule': {
            'dataset_a': strongest_a,
            'dataset_b': strongest_b,
        },
        'hub_products': {
            'dataset_a': get_hubs(rules_a),
            'dataset_b': get_hubs(rules_b),
        },
        'cross_dataset_overlap': {
            'jaccard': round(jaccard, 4),
            'shared': len(shared),
            'only_a': len(pairs_a - pairs_b),
            'only_b': len(pairs_b - pairs_a),
        },
        'recommendations': [
            'Bundle top 3 rule pairs into labeled combo deals at the counter.',
            'Place hub products at eye level on the shelf.',
            'Use cross-sell engine at checkout to suggest 1-2 items per basket.',
            'Run Hot Deal bundles during back-to-school season.',
            'Segment promos: simpler bundles for elementary, broader for HS/College.',
            'Refresh rules monthly as buyer patterns shift across semesters.',
        ],
    }
