import uuid

from sqlalchemy import Boolean, Column, DateTime, String
from sqlalchemy.sql import func

from src.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(
        String, nullable=False, default="patient"
    )  # patient, doctor, researcher, admin
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String, index=True, unique=True, nullable=False)
    age = Column(String, nullable=True)  # or Integer
    medical_history = Column(String, nullable=True)
    conditions = Column(
        String, nullable=True
    )  # Stored as comma separated or JSON string for simplicity
    genes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ClinicalTrial(Base):
    __tablename__ = "clinical_trials"

    nct_id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    inclusion_criteria = Column(String, nullable=True)
    exclusion_criteria = Column(String, nullable=True)
    status = Column(String, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class MatchEvaluation(Base):
    __tablename__ = "match_evaluations"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    patient_id = Column(String, index=True, nullable=False)
    trial_id = Column(String, index=True, nullable=False)
    compatibility_score = Column(String, nullable=False)  # Float as String or Float
    explanation = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class TrialInvitation(Base):
    __tablename__ = "trial_invitations"

    id = Column(String, primary_key=True, default=generate_uuid, index=True)
    patient_id = Column(String, index=True, nullable=False) # e.g. PAT-123456
    trial_id = Column(String, index=True, nullable=False)
    status = Column(String, default="pending") # pending, accepted, declined
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
