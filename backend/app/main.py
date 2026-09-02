from fastapi import FastAPI
from app.api.v1 import auth
from app.database.session import engine
from app.models import User, RefreshToken, VerificationToken  # so SQLModel creates tables

app = FastAPI()

app.include_router(auth.router)


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)