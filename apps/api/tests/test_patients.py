import pytest
from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def patient_token():
    # Register and login a test patient to get a token
    user_data = {
        "email": "patient_test@example.com",
        "password": "password123",
        "role": "patient",
    }
    client.post("/api/v1/auth/register", json=user_data)
    response = client.post(
        "/api/v1/auth/login",
        data={"username": user_data["email"], "password": user_data["password"]},
    )
    return response.json()["access_token"]


def test_create_and_get_patient_profile(patient_token):
    headers = {"Authorization": f"Bearer {patient_token}"}
    profile_data = {
        "age": "35",
        "medical_history": "No major issues",
        "conditions": "Diabetes",
        "genes": "BRCA1",
    }

    # Create profile
    put_response = client.put("/api/v1/patients/me", json=profile_data, headers=headers)
    assert put_response.status_code == 200
    data = put_response.json()
    assert data["age"] == "35"
    assert data["conditions"] == "Diabetes"

    # Get profile
    get_response = client.get("/api/v1/patients/me", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["genes"] == "BRCA1"
