import json
from datetime import datetime

from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas
from ..deps import get_db, get_current_user
from ..pdf_utils import extract_text
from ..gemini_service import analyze_resume

router = APIRouter(tags=["analysis"])


@router.post("/analyze", response_model=schemas.AnalysisOut)
async def analyze(
    job_description: str = Form(...),
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF resumes are supported")

    contents = await resume.read()
    resume_text = extract_text(contents)
    if not resume_text:
        raise HTTPException(400, "Couldn't extract text from that PDF")

    result = analyze_resume(resume_text, job_description)

    record = models.Analysis(
        user_id=current_user.id,
        resume_filename=resume.filename,
        job_description=job_description,
        ats_score=result.get("ats_score", 0),
        matched_skills=json.dumps(result.get("matched_skills", [])),
        missing_skills=json.dumps(result.get("missing_skills", [])),
        suggestions=json.dumps(result.get("suggestions", [])),
        created_at=datetime.utcnow(),
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return schemas.AnalysisOut(
        id=record.id,
        ats_score=record.ats_score,
        matched_skills=result.get("matched_skills", []),
        missing_skills=result.get("missing_skills", []),
        suggestions=result.get("suggestions", []),
        created_at=record.created_at,
    )


@router.get("/history", response_model=list[schemas.HistoryItem])
def get_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    records = (
        db.query(models.Analysis)
        .filter(models.Analysis.user_id == current_user.id)
        .order_by(models.Analysis.created_at.desc())
        .all()
    )
    return records


@router.get("/stats", response_model=schemas.StatsOut)
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    total = (
        db.query(func.count(models.Analysis.id))
        .filter(models.Analysis.user_id == current_user.id)
        .scalar()
    ) or 0
    avg = (
        db.query(func.avg(models.Analysis.ats_score))
        .filter(models.Analysis.user_id == current_user.id)
        .scalar()
    ) or 0

    return schemas.StatsOut(total_analyses=total, average_score=round(float(avg), 1))
