from sqlalchemy.orm import Session
from . import models, schemas

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_study_plan(db: Session, plan: schemas.StudyPlanCreate, resources: str):
    db_plan = models.StudyPlan(
        user_id=plan.user_id,
        subject=plan.subject,
        hours_per_week=plan.hours_per_week,
        recommended_resources=resources
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

def get_user_study_plans(db: Session, user_id: int):
    return db.query(models.StudyPlan).filter(models.StudyPlan.user_id == user_id).all()