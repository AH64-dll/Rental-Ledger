def test_create_property(client, auth_headers):
    resp = client.post("/properties/", json={"name": "Sunset Villa"}, headers=auth_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Sunset Villa"
    assert data["id"] is not None


def test_list_properties(client, auth_headers):
    client.post("/properties/", json={"name": "Sunset Villa"}, headers=auth_headers)
    client.post("/properties/", json={"name": "Ocean View"}, headers=auth_headers)

    resp = client.get("/properties/", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 2
    names = [p["name"] for p in data]
    assert "Ocean View" in names
    assert "Sunset Villa" in names


def test_get_property_404(client, auth_headers):
    resp = client.get("/properties/999", headers=auth_headers)
    assert resp.status_code == 404


def test_update_property(client, auth_headers):
    resp = client.post("/properties/", json={"name": "Sunset Villa"}, headers=auth_headers)
    prop_id = resp.json()["id"]

    resp = client.put(f"/properties/{prop_id}", json={"name": "Sunset Villa Updated"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Sunset Villa Updated"


def test_delete_property_409_with_leases(client, auth_headers):
    resp = client.post("/properties/", json={"name": "Sunset Villa"}, headers=auth_headers)
    prop_id = resp.json()["id"]

    tenant = client.post("/tenants/", json={"name": "Tenant A"}, headers=auth_headers)
    tenant_id = tenant.json()["id"]

    client.post(
        "/leases/",
        json={
            "property_id": prop_id,
            "tenant_id": tenant_id,
            "start_date": "2026-01-01",
            "end_date": "2026-12-31",
            "monthly_rent_cents": 100000,
            "rent_due_day_of_month": 1,
        },
        headers=auth_headers,
    )

    resp = client.delete(f"/properties/{prop_id}", headers=auth_headers)
    assert resp.status_code == 409


def test_delete_property(client, auth_headers):
    resp = client.post("/properties/", json={"name": "Empty Property"}, headers=auth_headers)
    prop_id = resp.json()["id"]

    resp = client.delete(f"/properties/{prop_id}", headers=auth_headers)
    assert resp.status_code == 204


def test_property_requires_auth(client):
    resp = client.get("/properties/")
    assert resp.status_code == 401
