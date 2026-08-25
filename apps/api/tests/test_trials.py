from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


def test_create_and_get_trial():
    trial_data = {
        "nct_id": "NCT00000001",
        "title": "Test Clinical Trial",
        "inclusion_criteria": "Adults over 18",
        "exclusion_criteria": "Pregnant women",
        "status": "RECRUITING",
        "location": "New York, NY",
    }

    # Create trial
    post_response = client.post("/api/v1/trials/", json=trial_data)
    assert post_response.status_code in [201, 400]  # 400 if already exists

    if post_response.status_code == 201:
        assert post_response.json()["title"] == "Test Clinical Trial"

    # Get trial
    get_response = client.get("/api/v1/trials/NCT00000001")
    assert get_response.status_code == 200
    assert get_response.json()["nct_id"] == "NCT00000001"

    # List trials
    list_response = client.get("/api/v1/trials/")
    assert list_response.status_code == 200
    assert isinstance(list_response.json(), list)
    assert len(list_response.json()) > 0
