from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.database import get_db
from src.models import ClinicalTrial
from src.schemas.trials import ClinicalTrialCreate, ClinicalTrialResponse
from src.services.clinical_trials import fetch_trials_by_condition
from src.services.ai_matcher import embed_and_store_trials

router = APIRouter(prefix="/trials", tags=["trials"])


@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_trials(condition: str = "diabetes", limit: int = 10, db: Session = Depends(get_db)):
    """Fetches trials from ClinicalTrials.gov and syncs to local Postgres and Qdrant."""
    try:
        trials = await fetch_trials_by_condition(condition, limit)
        
        # Save to Postgres
        saved_trials = []
        for t in trials:
            db_trial = db.query(ClinicalTrial).filter(ClinicalTrial.nct_id == t["nct_id"]).first()
            if not db_trial:
                db_trial = ClinicalTrial(**t)
                db.add(db_trial)
            saved_trials.append(t)
        db.commit()
        
        # Embed and store in Qdrant
        embed_and_store_trials(saved_trials)
        
        return {"message": f"Successfully synced and embedded {len(saved_trials)} trials for '{condition}'."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=list[ClinicalTrialResponse])
def get_trials(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    trials = db.query(ClinicalTrial).offset(skip).limit(limit).all()
    return trials


@router.get("/{nct_id}", response_model=ClinicalTrialResponse)
def get_trial(nct_id: str, db: Session = Depends(get_db)):
    trial = db.query(ClinicalTrial).filter(ClinicalTrial.nct_id == nct_id).first()
    if not trial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Trial not found"
        )
    return trial


@router.post(
    "/", response_model=ClinicalTrialResponse, status_code=status.HTTP_201_CREATED
)
def create_trial(trial_data: ClinicalTrialCreate, db: Session = Depends(get_db)):
    # This endpoint mocks the ingestion of a trial from ClinicalTrials.gov
    db_trial = (
        db.query(ClinicalTrial)
        .filter(ClinicalTrial.nct_id == trial_data.nct_id)
        .first()
    )
    if db_trial:
        raise HTTPException(status_code=400, detail="Trial already exists")

    new_trial = ClinicalTrial(**trial_data.model_dump())
    db.add(new_trial)
    db.commit()
    db.refresh(new_trial)
    return new_trial
