from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import datasets, recommendations, pipeline

app = FastAPI(
    title="SchoolMart MBA Engine",
    description="Market Basket Analysis API for School Supplies Kiosk",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasets.router)
app.include_router(recommendations.router)
app.include_router(pipeline.router)


@app.get("/")
def root():
    return {"message": "SchoolMart MBA Engine API", "docs": "/docs"}
