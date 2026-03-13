from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from typing import Annotated, Optional

from ..services.dataset import (
    list_datasets, get_dataset_stats, get_transactions_paginated,
    save_uploaded_csv, load_transactions, delete_uploaded_dataset,
)
from ..models.schemas import (
    DatasetInfoOut,
    DatasetStats,
    DatasetUploadResponse,
    PaginatedTransactionsOut,
)

router = APIRouter(prefix="/api/datasets", tags=["datasets"])


@router.get("", response_model=list[DatasetInfoOut])
def get_datasets():
    return list_datasets()


@router.get(
    "/{dataset_id}/stats",
    response_model=DatasetStats,
    responses={404: {"description": "Dataset not found"}},
)
def dataset_stats(dataset_id: str):
    stats = get_dataset_stats(dataset_id)
    if stats is None:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")
    return stats


@router.get(
    "/{dataset_id}/transactions",
    response_model=PaginatedTransactionsOut,
    responses={404: {"description": "Dataset not found"}},
)
def dataset_transactions(
    dataset_id: str,
    page: Annotated[int, Query(ge=1)] = 1,
    per_page: Annotated[int, Query(ge=1, le=200)] = 50,
    search: Annotated[Optional[str], Query()] = None,
):
    rows, total = get_transactions_paginated(dataset_id, page, per_page, search)
    if rows is None:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")
    return {
        "data": rows,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }


@router.post(
    "/upload",
    response_model=DatasetUploadResponse,
    responses={400: {"description": "Invalid upload file"}},
)
async def upload_dataset(file: Annotated[UploadFile, File(...)]):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    dataset_id, error, quality = save_uploaded_csv(content, file.filename)
    if error:
        raise HTTPException(status_code=400, detail=error)

    stats = get_dataset_stats(dataset_id)
    return {"dataset_id": dataset_id, "stats": stats, "quality": quality}


@router.delete(
    "/{dataset_id}",
    responses={
        400: {"description": "Cannot delete built-in dataset"},
        404: {"description": "Dataset not found"},
    },
)
def remove_uploaded_dataset(dataset_id: str):
    deleted, error = delete_uploaded_dataset(dataset_id)
    if error:
        if "cannot be deleted" in error:
            raise HTTPException(status_code=400, detail=error)
        raise HTTPException(status_code=404, detail=error)
    return {"deleted": deleted, "dataset_id": dataset_id}
