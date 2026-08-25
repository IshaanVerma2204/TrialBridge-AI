from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MatchEvaluationBase(BaseModel):
    trial_id: str
    compatibility_score: str
    explanation: str | None = None


class MatchEvaluationCreate(MatchEvaluationBase):
    patient_id: str


class MatchEvaluationResponse(MatchEvaluationBase):
    id: str
    patient_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
