import pytest
from fastapi.testclient import TestClient

from src.main import app

client = TestClient(app)


@pytest.fixture(scope="module")
def test_user():
    return {"email": "test@example.com", "password": "password123", "role": "patient"}


def test_register_user(test_user):
    response = client.post("/api/v1/auth/register", json=test_user)
    # Check for 201 or 400 (if already exists from previous test run)
    assert response.status_code in [201, 400]
    if response.status_code == 201:
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["role"] == test_user["role"]


def test_login_user(test_user):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": test_user["email"], "password": test_user["password"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    return data["access_token"]


def test_read_users_me(test_user):
    token = test_login_user(test_user)
    response = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user["email"]
