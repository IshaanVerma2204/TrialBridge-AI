from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user, require_role
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
        raise HTTPException(status_code=500, detail=str(e)) from e

from src.models import TrialInvitation, ClinicalTrial

@router.get("/me/invitations")
def get_patient_invitations(
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can view invitations")
        
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        return []
        
    # Get all invites for this patient
    # Join with ClinicalTrial to get trial details
    invites = db.query(TrialInvitation, ClinicalTrial).join(
        ClinicalTrial, TrialInvitation.trial_id == ClinicalTrial.nct_id
    ).filter(
        TrialInvitation.patient_id == f"PAT-{str(patient.id)[:6].upper()}"
    ).all()
    
    results = []
    for inv, trial in invites:
        results.append({
            "invite_id": inv.id,
            "status": inv.status,
            "created_at": inv.created_at,
            "trial": {
                "nct_id": trial.nct_id,
                "title": trial.title,
                "status": trial.status,
                "location": trial.location
            }
        })
        
    return results

from pydantic import BaseModel
class InviteStatusUpdate(BaseModel):
    status: str

@router.put("/me/invitations/{invite_id}")
def update_invitation_status(
    invite_id: str,
    update_data: InviteStatusUpdate,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can update invitations")
        
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
        
    invite = db.query(TrialInvitation).filter(
        TrialInvitation.id == invite_id,
        TrialInvitation.patient_id == f"PAT-{str(patient.id)[:6].upper()}"
    ).first()
    
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found")
        
    if update_data.status not in ["accepted", "declined"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    invite.status = update_data.status
    db.commit()
    
    return {"status": "success", "message": f"Invitation {update_data.status}"}


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
