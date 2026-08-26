from fastapi import FastAPI

from app.api.routes.auth import router as auth_router
from app.api.routes.cases import router as cases_router
from app.api.routes.documents import router as documents_router

app = FastAPI(title="Secure DMS API")

app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(documents_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
