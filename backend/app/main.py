from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from . import models, schemas, crud, ml
from .database import engine, get_db

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Studdy API", version="1.0.0")

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8080",
    "https://your-frontend-domain.netlify.app",  # Replace with your Netlify URL
    "*"  # Allow all origins in development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to Studdy API", "version": "1.0.0"}

@app.post("/api/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.post("/api/studyplan/", response_model=schemas.StudyPlanResponse)
def create_study_plan(plan: schemas.StudyPlanCreate, db: Session = Depends(get_db)):
    resources = ml.recommend_resources(plan.subject, plan.hours_per_week)
    return crud.create_study_plan(db=db, plan=plan, resources=resources)

@app.get("/api/studyplans/{user_id}")
def get_user_plans(user_id: int, db: Session = Depends(get_db)):
    plans = crud.get_user_study_plans(db, user_id)
    return plans

@app.get("/health")
def health_check():
    return {"status": "healthy"}