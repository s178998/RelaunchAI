# app/api/routes/ai_router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.sessions import get_current_user
from app.services.openai_service import openai_service
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/ai", tags=["ai"])

class UserProfile(BaseModel):
    company: str
    department: str
    role: str
    level: str
    tenure: Optional[str] = None
    skills: Optional[str] = None

@router.post("/analyze-risk")
async def analyze_risk(
    profile: UserProfile,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get personalized layoff risk analysis using ChatGPT"""
    try:
        result = await openai_service.analyze_risk(profile.dict())
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )

@router.post("/match-jobs")
async def match_jobs(
    profile: UserProfile,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get job matches using ChatGPT"""
    try:
        jobs = await openai_service.match_jobs(profile.dict())
        return {"jobs": jobs, "total": len(jobs)}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job matching failed: {str(e)}"
        )

@router.post("/analyze-skills")
async def analyze_skills(
    profile: UserProfile,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get skills analysis using ChatGPT"""
    try:
        skills = await openai_service.analyze_skills(profile.dict())
        return skills
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Skills analysis failed: {str(e)}"
        )