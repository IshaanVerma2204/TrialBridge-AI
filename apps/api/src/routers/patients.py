from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.auth.dependencies import require_role, get_current_user
from src.database import get_db
from src.models import Patient, User
from src.schemas.patients import PatientCreate, PatientResponse
from src.services.ai_matcher import find_matches_for_patient

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("/me/matches")
def get_patient_matches(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can view matches")
        
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
        
    # Search Qdrant for matches
    try:
        matches = find_matches_for_patient(patient)
        return matches
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me", response_model=PatientResponse)
def get_my_patient_profile(
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Patient profile not found"
        )
    return patient


@router.put("/me", response_model=PatientResponse)
def update_my_patient_profile(
    profile_data: PatientCreate,
    current_user: User = Depends(require_role(["patient"])),
    db: Session = Depends(get_db),
):
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()

    if patient:
        for key, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(patient, key, value)
    else:
        patient = Patient(user_id=current_user.id, **profile_data.model_dump())
        db.add(patient)

    db.commit()
    db.refresh(patient)
    return patient
