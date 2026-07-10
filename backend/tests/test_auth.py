from app.models import User
from app.auth import hash_password


def test_login_valid(client, db_session):
    db_session.add(User(username="operator", password_hash=hash_password("testpass")))
    db_session.commit()

    resp = client.post("/auth/login", json={"username": "operator", "password": "testpass"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password(client, db_session):
    db_session.add(User(username="operator", password_hash=hash_password("testpass")))
    db_session.commit()

    resp = client.post("/auth/login", json={"username": "operator", "password": "wrong"})
    assert resp.status_code == 401


def test_login_invalid_user(client):
    resp = client.post("/auth/login", json={"username": "nobody", "password": "x"})
    assert resp.status_code == 401


def test_me_with_token(client, auth_headers):
    resp = client.get("/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["username"] == "operator"


def test_me_without_token(client):
    resp = client.get("/me")
    assert resp.status_code == 401
