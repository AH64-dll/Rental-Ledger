def _create_tenant(client, headers, name="John Doe"):
    return client.post("/tenants/", json={"name": name}, headers=headers)


def test_create_tenant(client, auth_headers):
    resp = _create_tenant(client, auth_headers)
    assert resp.status_code == 201
    assert resp.json()["name"] == "John Doe"


def test_list_tenants(client, auth_headers):
    _create_tenant(client, auth_headers, "John")
    _create_tenant(client, auth_headers, "Jane")

    resp = client.get("/tenants/", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_get_tenant_404(client, auth_headers):
    resp = client.get("/tenants/999", headers=auth_headers)
    assert resp.status_code == 404


def test_update_tenant(client, auth_headers):
    resp = _create_tenant(client, auth_headers)
    tenant_id = resp.json()["id"]

    resp = client.put(f"/tenants/{tenant_id}", json={"name": "John Updated"}, headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "John Updated"


def test_delete_tenant(client, auth_headers):
    resp = _create_tenant(client, auth_headers)
    tenant_id = resp.json()["id"]
    resp = client.delete(f"/tenants/{tenant_id}", headers=auth_headers)
    assert resp.status_code == 204


def test_tenant_balance_empty(client, auth_headers):
    resp = _create_tenant(client, auth_headers)
    tenant_id = resp.json()["id"]

    resp = client.get(f"/tenants/{tenant_id}/balance", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["net_balance_cents"] == 0
    assert data["deposits_held_cents"] == 0
    assert data["charges"] == []
