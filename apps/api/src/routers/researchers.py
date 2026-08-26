from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.database import get_db
from src.models import ClinicalTrial, Patient
from src.schemas.trials import ClinicalTrialResponse

router = APIRouter(prefix="/researchers", tags=["researchers"])

@router.get("/trials", response_model=list[ClinicalTrialResponse])
def get_researcher_trials(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    if current_user.role != "researcher":
        raise HTTPException(status_code=403, detail="Only researchers can view their trials")
    
    # Fetch up to 50 of the latest trials across all diseases
    trials = db.query(ClinicalTrial).order_by(ClinicalTrial.created_at.desc()).limit(50).all()
    return trials

@router.get("/trials/{nct_id}/patients")
def get_matched_patients(
    nct_id: str,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    if current_user.role != "researcher":
        raise HTTPException(status_code=403, detail="Only researchers can view matched patients")
        
    trial = db.query(ClinicalTrial).filter(ClinicalTrial.nct_id == nct_id).first()
    if not trial:
        raise HTTPException(status_code=404, detail="Trial not found")
        
    # Simulate finding patients. In reality, we'd embed the trial and search Qdrant for patients,
    # or just pull from the MatchEvaluations table.
    # For the mock, we just return any patients that exist in the DB.
    patients = db.query(Patient).limit(5).all()
    
    # Anonymize and format for researcher view
    results = []
    for p in patients:
        # Generate a random high score for demonstration if they have a profile
        score = 85 + (p.id % 15)
        results.append({
            "patient_id": f"PAT-{p.id:04d}", # Anonymized ID
            "age": p.age,
            "conditions": p.conditions,
            "genes": p.genes,
            "compatibility_score": score,
            "explanation": f"Patient's profile indicates strong semantic match for {trial.title}."
        })
        
    # Sort by score descending
    results.sort(key=lambda x: x["compatibility_score"], reverse=True)
    return results
