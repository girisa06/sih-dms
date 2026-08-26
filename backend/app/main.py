from fastapi import FastAPI

from app.api.security import router as security_router

app = FastAPI(title="Secure DMS API")
app.include_router(security_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
