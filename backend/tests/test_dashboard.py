def test_dashboard_empty(client, auth_headers):
    resp = client.get("/dashboard/overview", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["active_leases"] == 0
    assert data["overdue_charges"] == 0
    assert data["total_owed_to_you_cents"] == 0
    assert data["deposits_held_cents"] == 0
    assert data["expiring_leases"] == 0


def test_dashboard_with_data(client, auth_headers):
    prop = client.post("/properties/", json={"name": "Test"}, headers=auth_headers)
    prop_id = prop.json()["id"]
    tenant = client.post("/tenants/", json={"name": "John"}, headers=auth_headers)
    tenant_id = tenant.json()["id"]
    lease = client.post(
        "/leases/",
        json={
            "property_id": prop_id,
            "tenant_id": tenant_id,
            "start_date": "2026-01-01",
            "end_date": "2026-12-31",
            "monthly_rent_cents": 500000,
            "rent_due_day_of_month": 5,
        },
        headers=auth_headers,
    )
    lease_id = lease.json()["id"]

    client.post(
        f"/leases/{lease_id}/charges/",
        json={
            "description": "Past Due Rent",
            "amount_cents": 500000,
            "charge_date": "2025-01-01",
            "due_date": "2025-01-05",
        },
        headers=auth_headers,
    )

    resp = client.get("/dashboard/overview", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["active_leases"] == 1
    assert data["overdue_charges"] == 1
    assert data["total_owed_to_you_cents"] == 500000
