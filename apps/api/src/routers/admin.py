from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.database import get_db
from src.models import ClinicalTrial, User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
def get_platform_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view platform stats")

    total_patients = db.query(User).filter(User.role == "patient").count()
    total_researchers = db.query(User).filter(User.role == "researcher").count()
    total_trials = db.query(ClinicalTrial).count()
    
    # We mock matches since it's dynamic via qdrant
    # In a real app we would query the MatchEvaluations table
    active_matches = total_trials * total_patients * 2

    return {
        "total_patients": total_patients,
        "total_researchers": total_researchers,
        "total_trials": total_trials,
        "active_matches": active_matches,
    }
