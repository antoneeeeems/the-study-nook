import numpy as np
import pandas as pd
from collections import defaultdict, Counter


class FPNode:
    def __init__(self, item, count, parent):
        self.item = item
        self.count = count
        self.parent = parent
        self.children = {}
        self.link = None


class FPTree:
    def __init__(self):
        self.root = FPNode(None, 0, None)
        self.header = defaultdict(list)

    def insert(self, transaction, count=1):
        node = self.root
        for item in transaction:
            if item in node.children:
                node.children[item].count += count
            else:
                new_node = FPNode(item, count, node)
                node.children[item] = new_node
                self.header[item].append(new_node)
            node = node.children[item]


def build_fp_tree(transactions, min_support_count):
    item_counts = Counter(item for t in transactions for item in t)
    freq_items = {item for item, cnt in item_counts.items() if cnt >= min_support_count}
    freq_order = sorted(freq_items, key=lambda x: -item_counts[x])
    order_map = {item: i for i, item in enumerate(freq_order)}
    tree = FPTree()
    for t in transactions:
        filtered = sorted([i for i in t if i in freq_items], key=lambda x: order_map[x])
        if filtered:
            tree.insert(filtered)
    return tree, item_counts


def mine_fp_tree(tree, min_support_count, prefix=frozenset()):
    results = []
    for item, nodes in tree.header.items():
        item_count = sum(n.count for n in nodes)
        if item_count < min_support_count:
            continue
        new_itemset = prefix | {item}
        results.append((new_itemset, item_count))

        cond_patterns = []
        for node in nodes:
            path, cnt = [], node.count
            cur = node.parent
            while cur.item is not None:
                path.append(cur.item)
                cur = cur.parent
            if path:
                cond_patterns.extend([path] * cnt)

        if cond_patterns:
            cond_item_counts = Counter(i for p in cond_patterns for i in p)
            freq_cond = {i for i, c in cond_item_counts.items() if c >= min_support_count}
            if freq_cond:
                cond_order = sorted(freq_cond, key=lambda x: -cond_item_counts[x])
                cond_order_map = {x: i for i, x in enumerate(cond_order)}
                cond_tree = FPTree()
                for p in cond_patterns:
                    filtered = sorted([i for i in p if i in freq_cond], key=lambda x: cond_order_map[x])
                    if filtered:
                        cond_tree.insert(filtered)
                results.extend(mine_fp_tree(cond_tree, min_support_count, new_itemset))
    return results


def run_fpgrowth(transactions, min_support):
    N = len(transactions)
    min_sup_cnt = max(1, int(np.ceil(min_support * N)))
    tree, _ = build_fp_tree(transactions, min_sup_cnt)
    raw = mine_fp_tree(tree, min_sup_cnt)
    rows = [{'itemsets': fs, 'support_count': cnt, 'support': cnt / N, 'k': len(fs)}
            for fs, cnt in raw]
    if not rows:
        return pd.DataFrame(columns=['itemsets', 'support', 'support_count', 'k'])
    df = (pd.DataFrame(rows)
          .sort_values(['k', 'support'], ascending=[True, False])
          .reset_index(drop=True))
    return df
