import os
import pandas as pd
from collections import Counter

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
UPLOAD_DIR = os.path.join(DATA_DIR, 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATASETS = {
    'A': os.path.join(DATA_DIR, 'dataset_A.csv'),
    'B': os.path.join(DATA_DIR, 'dataset_B.csv'),
}

BUILTIN_DATASET_ORDER = ['A', 'B']

# Cache loaded transactions
_cache = {}

FALLBACK_PRICE = 50

# Map lowercased variants to a canonical display name.
ITEM_SYNONYMS = {
    "ball pen": "Ballpen",
    "ballpen": "Ballpen",
    "signpen": "Sign Pen",
    "sign pen": "Sign Pen",
    "gelpen": "Gel Pen",
    "paperclips": "Paper Clips",
    "paper clips": "Paper Clips",
    "crayons": "Crayon Set",
    "crayon set": "Crayon Set",
    "marker": "Permanent Marker",
    "sticky notes": "Sticky Notes",
    "sticky note": "Sticky Notes",
}

# Keep this list aligned with recommendation service PRICE_LIST keys.
KNOWN_PRICE_ITEMS = {
    'Notebook', 'Pencil', 'Eraser', 'Sharpener', 'Pencil Case', 'Ruler', 'Colored Pencils', 'Crayon Set',
    'Watercolor Set', 'Glue Stick', 'Scissors', 'Folder', 'Highlighter', 'Correction Tape', 'Index Cards',
    'Intermediate Pad', 'Paper Clips', 'Sticky Notes', 'Compass', 'Protractor', 'Ballpen', 'Bond Paper',
    'Gel Pen', 'Mechanical Pencil', 'Calculator', 'Graphing Paper', 'Binder', 'Clearbook', 'Yellow Pad',
    'Stapler', 'Staple Wire', 'Puncher', 'Scotch Tape', 'Double-Sided Tape', 'Permanent Marker',
    'Whiteboard Marker', 'Ballpen Ink Refill', 'Art Paper', 'Geometry Set', 'Plastic Envelope',
}


def _normalize_whitespace(text: str) -> str:
    return " ".join(text.split())


def normalize_item_name(item: str) -> str:
    raw = _normalize_whitespace(str(item).strip())
    lowered = raw.lower()
    if lowered in ITEM_SYNONYMS:
        return ITEM_SYNONYMS[lowered]
    # Title-case unknown items for display consistency.
    return raw.title()


def list_datasets():
    result = []
    seen_ids = set()

    for ds_id in BUILTIN_DATASET_ORDER:
        path = DATASETS.get(ds_id)
        if path and os.path.exists(path):
            result.append({'id': ds_id, 'name': f'Dataset {ds_id}', 'path': path})
            seen_ids.add(ds_id)

    # Include uploaded datasets in deterministic order.
    for ds_id in get_uploaded_dataset_ids_ordered():
        if ds_id in seen_ids:
            continue
        upload_path = os.path.join(UPLOAD_DIR, f'{ds_id}.csv')
        if os.path.exists(upload_path):
            result.append({'id': ds_id, 'name': f'Uploaded: {ds_id}', 'path': upload_path})
            seen_ids.add(ds_id)

    # Include any other registered datasets not in built-ins/uploads.
    for ds_id, path in DATASETS.items():
        if ds_id in seen_ids:
            continue
        if os.path.exists(path):
            result.append({'id': ds_id, 'name': f'Dataset {ds_id}', 'path': path})
    return result


def get_uploaded_dataset_ids_ordered():
    if not os.path.exists(UPLOAD_DIR):
        return []

    candidates = []
    for filename in os.listdir(UPLOAD_DIR):
        if not filename.endswith('.csv'):
            continue
        full_path = os.path.join(UPLOAD_DIR, filename)
        dataset_id = filename[:-4]
        candidates.append((os.path.getmtime(full_path), filename.lower(), dataset_id))

    candidates.sort(key=lambda row: (row[0], row[1]))
    return [dataset_id for _, _, dataset_id in candidates]


def get_pipeline_dataset_ids_ordered():
    ordered_ids = []
    seen_ids = set()

    for ds_id in BUILTIN_DATASET_ORDER:
        path = DATASETS.get(ds_id)
        if path and os.path.exists(path) and ds_id not in seen_ids:
            ordered_ids.append(ds_id)
            seen_ids.add(ds_id)

    for ds_id in get_uploaded_dataset_ids_ordered():
        if ds_id not in seen_ids and get_dataset_path(ds_id):
            ordered_ids.append(ds_id)
            seen_ids.add(ds_id)

    # Keep backward compatibility for any additional registered datasets.
    for ds_id, path in DATASETS.items():
        if ds_id in seen_ids:
            continue
        if os.path.exists(path):
            ordered_ids.append(ds_id)
            seen_ids.add(ds_id)

    return ordered_ids


def get_dataset_path(dataset_id):
    if dataset_id in DATASETS:
        return DATASETS[dataset_id]
    upload_path = os.path.join(UPLOAD_DIR, f'{dataset_id}.csv')
    if os.path.exists(upload_path):
        return upload_path
    return None


def load_dataframe(dataset_id):
    path = get_dataset_path(dataset_id)
    if not path or not os.path.exists(path):
        return None
    df = pd.read_csv(path)
    if 'TransactionID' in df.columns:
        df['TransactionID'] = df['TransactionID'].astype(str).map(lambda v: _normalize_whitespace(v.strip()))
    if 'Item' in df.columns:
        df['Item'] = df['Item'].astype(str).map(normalize_item_name)
    return df


def load_transactions(dataset_id):
    if dataset_id in _cache:
        return _cache[dataset_id]
    df = load_dataframe(dataset_id)
    if df is None:
        return None
    transactions = df.groupby('TransactionID')['Item'].apply(list).tolist()
    _cache[dataset_id] = transactions
    return transactions


def clear_cache(dataset_id=None):
    if dataset_id:
        _cache.pop(dataset_id, None)
    else:
        _cache.clear()


def get_dataset_stats(dataset_id):
    df = load_dataframe(dataset_id)
    if df is None:
        return None
    transactions = load_transactions(dataset_id)
    basket_sizes = [len(t) for t in transactions]
    item_counts = Counter(item for t in transactions for item in t)
    raw_df = pd.read_csv(get_dataset_path(dataset_id))
    raw_unique_items = raw_df['Item'].astype(str).nunique() if 'Item' in raw_df.columns else len(item_counts)
    unmapped_items = sorted([item for item in item_counts.keys() if item not in KNOWN_PRICE_ITEMS])

    return {
        'dataset_id': dataset_id,
        'total_transactions': len(transactions),
        'total_rows': len(df),
        'unique_items': len(item_counts),
        'raw_unique_items': int(raw_unique_items),
        'normalized_unique_items': len(item_counts),
        'unmapped_items': unmapped_items,
        'fallback_price': FALLBACK_PRICE,
        'avg_basket_size': round(sum(basket_sizes) / len(basket_sizes), 2),
        'min_basket_size': min(basket_sizes),
        'max_basket_size': max(basket_sizes),
        'items': sorted(item_counts.keys()),
        'item_frequencies': dict(item_counts.most_common()),
    }


def get_transactions_paginated(dataset_id, page=1, per_page=50, search=None):
    df = load_dataframe(dataset_id)
    if df is None:
        return None, 0

    grouped = df.groupby('TransactionID')['Item'].apply(list).reset_index()
    grouped['item_count'] = grouped['Item'].apply(len)
    grouped['items_display'] = grouped['Item'].apply(lambda x: ', '.join(sorted(x)))

    if search:
        search_lower = search.lower()
        mask = (
            grouped['TransactionID'].str.lower().str.contains(search_lower, na=False) |
            grouped['items_display'].str.lower().str.contains(search_lower, na=False)
        )
        grouped = grouped[mask]

    total = len(grouped)
    start = (page - 1) * per_page
    end = start + per_page
    page_data = grouped.iloc[start:end]

    rows = []
    for _, row in page_data.iterrows():
        rows.append({
            'transaction_id': row['TransactionID'],
            'items': row['Item'],
            'item_count': row['item_count'],
        })

    return rows, total


def save_uploaded_csv(file_content, filename):
    """Save uploaded CSV and return dataset_id plus quality report."""
    dataset_id = filename.replace('.csv', '').replace(' ', '_')
    # Ensure unique ID
    counter = 1
    original_id = dataset_id
    while os.path.exists(os.path.join(UPLOAD_DIR, f'{dataset_id}.csv')):
        dataset_id = f'{original_id}_{counter}'
        counter += 1

    path = os.path.join(UPLOAD_DIR, f'{dataset_id}.csv')
    with open(path, 'wb') as f:
        f.write(file_content)

    # Validate CSV
    try:
        df = pd.read_csv(path)
        if 'TransactionID' not in df.columns or 'Item' not in df.columns:
            os.remove(path)
            return None, 'CSV must have TransactionID and Item columns', None

        working = df[['TransactionID', 'Item']].copy()
        working['TransactionID'] = working['TransactionID'].astype(str).map(lambda v: _normalize_whitespace(v.strip()))
        working['Item'] = working['Item'].astype(str).map(lambda v: _normalize_whitespace(v.strip()))

        empty_mask = (working['TransactionID'] == '') | (working['Item'] == '')
        empty_rows = int(empty_mask.sum())
        if empty_rows > 0:
            os.remove(path)
            return None, 'CSV contains empty TransactionID or Item values', None

        duplicate_rows = int(working.duplicated(subset=['TransactionID', 'Item']).sum())
        if duplicate_rows > 0:
            working = working.drop_duplicates(subset=['TransactionID', 'Item'])

        tx_group = working.groupby('TransactionID')['Item'].apply(list)
        basket_sizes = tx_group.apply(len)

        total_transactions = int(tx_group.shape[0])
        unique_items = int(working['Item'].nunique())
        min_basket = int(basket_sizes.min()) if total_transactions > 0 else 0
        max_basket = int(basket_sizes.max()) if total_transactions > 0 else 0
        avg_basket = float(round(float(basket_sizes.mean()), 2)) if total_transactions > 0 else 0.0

        warnings = []
        if total_transactions < 1000:
            warnings.append('Dataset has fewer than 1000 transactions; this may not satisfy assignment minimums.')
        if unique_items < 15:
            warnings.append('Dataset has fewer than 15 unique items; this may not satisfy assignment minimums.')
        if basket_sizes.nunique() < 3:
            warnings.append('Basket sizes show low variability; real-world simulation may be weak.')
        if duplicate_rows > 0:
            warnings.append(f'{duplicate_rows} duplicate TransactionID+Item rows were removed.')

        normalized = working.copy()
        normalized['Item'] = normalized['Item'].map(normalize_item_name)
        normalized.to_csv(path, index=False)

        quality = {
            'total_rows': int(len(normalized)),
            'total_transactions': total_transactions,
            'unique_items': unique_items,
            'duplicate_transaction_item_rows': duplicate_rows,
            'empty_value_rows': empty_rows,
            'min_basket_size': min_basket,
            'max_basket_size': max_basket,
            'avg_basket_size': avg_basket,
            'warnings': warnings,
        }

        DATASETS[dataset_id] = path
        clear_cache(dataset_id)

        # Import lazily to avoid circular imports during startup.
        from .recommendation import clear_rules_cache

        clear_rules_cache(dataset_id)
        return dataset_id, None, quality
    except Exception as e:
        if os.path.exists(path):
            os.remove(path)
        return None, str(e), None


def delete_uploaded_dataset(dataset_id):
    """Delete an uploaded dataset file and clear related caches.

    Built-in datasets (A/B) are protected and cannot be removed.
    """
    if dataset_id in BUILTIN_DATASET_ORDER:
        return False, "Built-in datasets cannot be deleted"

    upload_path = os.path.join(UPLOAD_DIR, f'{dataset_id}.csv')
    if not os.path.exists(upload_path):
        return False, f"Uploaded dataset '{dataset_id}' not found"

    os.remove(upload_path)
    DATASETS.pop(dataset_id, None)
    clear_cache(dataset_id)

    # Import lazily to avoid circular imports during startup.
    from .recommendation import clear_rules_cache

    clear_rules_cache(dataset_id)
    return True, None
