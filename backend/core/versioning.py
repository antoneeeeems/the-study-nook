import json
import os
from datetime import datetime, timezone
from uuid import uuid4

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
PIPELINE_RUN_DIR = os.path.join(ROOT_DIR, "rec_outputs", "pipeline_runs")
os.makedirs(PIPELINE_RUN_DIR, exist_ok=True)


def _run_file_path(run_id: str) -> str:
    return os.path.join(PIPELINE_RUN_DIR, f"{run_id}.json")


def save_pipeline_run(result: dict, dataset_ids: list[str], seed: int) -> dict:
    now_utc = datetime.now(timezone.utc)
    run_id = f"run_{now_utc.strftime('%Y%m%d_%H%M%S')}_{uuid4().hex[:8]}"
    created_at = now_utc.isoformat()

    payload = {
        "run_id": run_id,
        "created_at": created_at,
        "dataset_ids": dataset_ids,
        "seed": seed,
        "iterations": result.get("iterations", []),
        "stability": result.get("stability"),
    }

    with open(_run_file_path(run_id), "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    return payload


def load_run(run_id: str) -> dict | None:
    path = _run_file_path(run_id)
    if not os.path.exists(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_latest_run() -> dict | None:
    files = [f for f in os.listdir(PIPELINE_RUN_DIR) if f.endswith(".json")]
    if not files:
        return None
    files.sort(reverse=True)
    path = os.path.join(PIPELINE_RUN_DIR, files[0])
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def list_runs(limit: int = 20) -> list[dict]:
    files = [f for f in os.listdir(PIPELINE_RUN_DIR) if f.endswith(".json")]
    files.sort(reverse=True)

    runs = []
    for filename in files[:limit]:
        path = os.path.join(PIPELINE_RUN_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            run = json.load(f)
        runs.append(
            {
                "run_id": run.get("run_id"),
                "created_at": run.get("created_at"),
                "dataset_ids": run.get("dataset_ids", []),
                "seed": int(run.get("seed", 42)),
                "iterations": len(run.get("iterations", [])),
            }
        )

    return runs
