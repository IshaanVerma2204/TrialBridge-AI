from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PatientBase(BaseModel):
    age: str | None = None
    medical_history: str | None = None
    conditions: str | None = None
    genes: str | None = None


class PatientCreate(PatientBase):
    pass


class PatientResponse(PatientBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
