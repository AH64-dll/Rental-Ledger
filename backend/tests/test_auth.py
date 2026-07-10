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


def test_update_profile_valid(client, db_session, auth_headers):
    # db_session already has user "operator" with password "testpass" (via client/auth_headers fixture setup)
    db_session.add(User(username="operator", password_hash=hash_password("testpass")))
    db_session.commit()

    # Let's change credentials to "newop" and "newpass"
    resp = client.put(
        "/auth/profile",
        json={
            "new_username": "newop",
            "new_password": "newpass",
            "current_password": "testpass",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data

    # Verify the old token is no longer authorized for "/me" or it decodes to old user which is not in db
    # Actually, let's verify login with new credentials succeeds
    login_resp = client.post("/auth/login", json={"username": "newop", "password": "newpass"})
    assert login_resp.status_code == 200


def test_update_profile_invalid_password(client, db_session, auth_headers):
    db_session.add(User(username="operator", password_hash=hash_password("testpass")))
    db_session.commit()

    resp = client.put(
        "/auth/profile",
        json={
            "new_username": "newop",
            "new_password": "newpass",
            "current_password": "wrong_password",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 400


def test_update_profile_duplicate_username(client, db_session, auth_headers):
    db_session.add(User(username="operator", password_hash=hash_password("testpass")))
    # Create another user in the db
    db_session.add(User(username="another_user", password_hash=hash_password("password")))
    db_session.commit()

    # Try to change current user's username to the duplicate one
    resp = client.put(
        "/auth/profile",
        json={
            "new_username": "another_user",
            "current_password": "testpass",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 400
