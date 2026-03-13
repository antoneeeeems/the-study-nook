from fastapi.testclient import TestClient

from backend.main import app


client = TestClient(app)


def test_pipeline_run_returns_metadata_fields():
    response = client.post(
        "/api/pipeline/run",
        json={"dataset_id": "A", "dataset_b_id": "B", "seed": 99},
    )
    assert response.status_code == 200
    data = response.json()

    assert "run_id" in data
    assert "created_at" in data
    assert data["seed"] == 99
    assert isinstance(data.get("iterations", []), list)


def test_pipeline_history_endpoint_returns_runs():
    response = client.get("/api/pipeline/history?limit=5")
    assert response.status_code == 200
    body = response.json()
    assert "runs" in body
    assert isinstance(body["runs"], list)


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
