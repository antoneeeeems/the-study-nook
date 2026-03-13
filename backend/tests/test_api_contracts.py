from fastapi.testclient import TestClient

from backend.main import app
from backend.routers import pipeline as pipeline_router


client = TestClient(app)


def test_pipeline_run_returns_metadata_fields():
    response = client.post(
        "/api/pipeline/run",
        json={"seed": 99},
    )
    assert response.status_code == 200
    data = response.json()

    assert "run_id" in data
    assert "created_at" in data
    assert data["seed"] == 99
    assert isinstance(data.get("dataset_ids", []), list)
    assert "A" in data.get("dataset_ids", [])
    assert isinstance(data.get("iterations", []), list)


def test_pipeline_run_accepts_include_overrides():
    response = client.post(
        "/api/pipeline/run",
        json={"seed": 77, "include_dataset_ids": ["A"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["seed"] == 77
    assert data.get("dataset_ids") == ["A"]


def test_recommendations_can_use_iteration_selector():
    run_response = client.post(
        "/api/pipeline/run",
        json={"seed": 88},
    )
    assert run_response.status_code == 200
    run_payload = run_response.json()

    first_iteration = run_payload.get("iterations", [])[0]
    assert first_iteration is not None

    rules_response = client.get(
        f"/api/recommendations/A/top-rules?top_n=5&run_id={run_payload['run_id']}&iteration={first_iteration['iteration']}"
    )
    assert rules_response.status_code == 200
    assert isinstance(rules_response.json(), list)


def test_recommendations_reject_partial_iteration_selector():
    response = client.get("/api/recommendations/A/top-rules?run_id=test-run")
    assert response.status_code == 422


def test_pipeline_history_endpoint_returns_runs():
    response = client.get("/api/pipeline/history?limit=5")
    assert response.status_code == 200
    body = response.json()
    assert "runs" in body
    assert isinstance(body["runs"], list)


def test_pipeline_run_invalidates_transaction_and_rule_caches(monkeypatch):
    calls = {"dataset": 0, "rules": 0}

    def _track_dataset_cache_clear(dataset_id=None):
        calls["dataset"] += 1

    def _track_rules_cache_clear(dataset_id=None):
        calls["rules"] += 1

    monkeypatch.setattr(pipeline_router, "clear_cache", _track_dataset_cache_clear)
    monkeypatch.setattr(pipeline_router, "clear_rules_cache", _track_rules_cache_clear)

    response = client.post(
        "/api/pipeline/run",
        json={"seed": 123},
    )

    assert response.status_code == 200
    assert calls["dataset"] == 1
    assert calls["rules"] == 1


def test_upload_returns_quality_report_for_small_dataset(tmp_path):
    csv_path = tmp_path / "mini.csv"
    csv_path.write_text("TransactionID,Item\nT1,Pencil\nT1,Pencil\nT2,Eraser\n", encoding="utf-8")

    with csv_path.open("rb") as f:
        response = client.post(
            "/api/datasets/upload",
            files={"file": ("mini.csv", f, "text/csv")},
        )

    assert response.status_code == 200
    payload = response.json()
    assert "quality" in payload
    assert "warnings" in payload["quality"]


def test_delete_uploaded_dataset_endpoint_removes_dataset(tmp_path):
    csv_path = tmp_path / "accidental.csv"
    csv_path.write_text("TransactionID,Item\nT1,Pencil\nT2,Eraser\n", encoding="utf-8")

    with csv_path.open("rb") as f:
        upload_response = client.post(
            "/api/datasets/upload",
            files={"file": ("accidental.csv", f, "text/csv")},
        )

    assert upload_response.status_code == 200
    dataset_id = upload_response.json()["dataset_id"]

    delete_response = client.delete(f"/api/datasets/{dataset_id}")
    assert delete_response.status_code == 200
    body = delete_response.json()
    assert body["deleted"] is True
    assert body["dataset_id"] == dataset_id


def test_cart_promos_endpoint_returns_multi_promo_breakdown():
    response = client.post(
        "/api/recommendations/A/cart-promos",
        json={
            "cart_items": [
                {"name": "Notebook", "qty": 2},
                {"name": "Pencil", "qty": 2},
                {"name": "Eraser", "qty": 1},
            ]
        },
    )
    assert response.status_code == 200
    payload = response.json()

    assert "subtotal" in payload
    assert "total_discount" in payload
    assert "final_total" in payload
    assert "applied_promos" in payload
    assert isinstance(payload["applied_promos"], list)
    assert payload["final_total"] <= payload["subtotal"]

    if payload["applied_promos"]:
        first = payload["applied_promos"][0]
        for field in ["tag", "bundle", "applications", "discount", "regular_price", "savings", "promo_price", "lift"]:
            assert field in first
