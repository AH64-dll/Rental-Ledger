def _create_property(client, headers, name="Test Property"):
    return client.post("/properties/", json={"name": name}, headers=headers)


def _create_unit(client, headers, property_id, name="Unit A"):
    return client.post(f"/properties/{property_id}/units/", json={"name": name}, headers=headers)


def _create_tenant(client, headers, name="John Doe"):
    return client.post("/tenants/", json={"name": name}, headers=headers)


def _create_lease(client, headers, unit_id, tenant_id):
    return client.post(
        "/leases/",
        json={
            "unit_id": unit_id,
            "tenant_id": tenant_id,
            "start_date": "2026-01-01",
            "end_date": "2026-12-31",
            "monthly_rent_cents": 500000,
            "rent_due_day_of_month": 5,
            "late_fee_percent": 5.0,
            "security_deposit_cents": 100000,
        },
        headers=headers,
    )


def test_create_lease(client, auth_headers):
    prop = _create_property(client, auth_headers)
    prop_id = prop.json()["id"]
    unit = _create_unit(client, auth_headers, prop_id)
    unit_id = unit.json()["id"]
    tenant = _create_tenant(client, auth_headers)
    tenant_id = tenant.json()["id"]

    resp = _create_lease(client, auth_headers, unit_id, tenant_id)
    assert resp.status_code == 201
    data = resp.json()
    assert data["unit_id"] == unit_id
    assert data["tenant_id"] == tenant_id
    assert data["status"] == "active"
    assert data["monthly_rent_cents"] == 500000


def test_create_lease_bad_unit(client, auth_headers):
    tenant = _create_tenant(client, auth_headers)
    resp = _create_lease(client, auth_headers, 999, tenant.json()["id"])
    assert resp.status_code == 404


def test_create_lease_bad_tenant(client, auth_headers):
    prop = _create_property(client, auth_headers)
    unit = _create_unit(client, auth_headers, prop.json()["id"])
    resp = _create_lease(client, auth_headers, unit.json()["id"], 999)
    assert resp.status_code == 404


def test_end_lease(client, auth_headers):
    prop = _create_property(client, auth_headers)
    unit = _create_unit(client, auth_headers, prop.json()["id"])
    tenant = _create_tenant(client, auth_headers)
    lease = _create_lease(client, auth_headers, unit.json()["id"], tenant.json()["id"])
    lease_id = lease.json()["id"]

    resp = client.post(f"/leases/{lease_id}/end", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "ended"


def test_list_leases(client, auth_headers):
    prop = _create_property(client, auth_headers)
    unit = _create_unit(client, auth_headers, prop.json()["id"])
    tenant = _create_tenant(client, auth_headers)
    _create_lease(client, auth_headers, unit.json()["id"], tenant.json()["id"])

    resp = client.get("/leases/", headers=auth_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1
