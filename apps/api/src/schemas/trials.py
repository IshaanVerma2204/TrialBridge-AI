from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ClinicalTrialBase(BaseModel):
    nct_id: str
    title: str
    inclusion_criteria: str | None = None
    exclusion_criteria: str | None = None
    status: str | None = None
    location: str | None = None


class ClinicalTrialCreate(ClinicalTrialBase):
    pass


class ClinicalTrialResponse(ClinicalTrialBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
