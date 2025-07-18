from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class StudyPlanCreate(BaseModel):
    user_id: int
    subject: str
    hours_per_week: float

class StudyPlanResponse(BaseModel):
    id: int
    user_id: int
    subject: str
    hours_per_week: float
    recommended_resources: str
    created_at: datetime
    
    class Config:
        from_attributes = True