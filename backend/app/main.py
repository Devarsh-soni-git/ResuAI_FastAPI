from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models, database
from .routers import auth, analysis

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="ResuAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(analysis.router)


@app.get("/")
def root():
    return {"status": "ResuAI API is running"}
