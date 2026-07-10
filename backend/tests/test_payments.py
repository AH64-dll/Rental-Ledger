def _setup_charge(client, headers):
    prop = client.post("/properties/", json={"name": "Test Property"}, headers=headers)
    prop_id = prop.json()["id"]
    unit = client.post(f"/properties/{prop_id}/units/", json={"name": "Unit A"}, headers=headers)
    unit_id = unit.json()["id"]
    tenant = client.post("/tenants/", json={"name": "John Doe"}, headers=headers)
    tenant_id = tenant.json()["id"]
    lease = client.post(
        "/leases/",
        json={
            "unit_id": unit_id,
            "tenant_id": tenant_id,
            "start_date": "2026-01-01",
            "end_date": "2026-12-31",
            "monthly_rent_cents": 500000,
            "rent_due_day_of_month": 5,
        },
        headers=headers,
    )
    lease_id = lease.json()["id"]
    charge = client.post(
        f"/leases/{lease_id}/charges/",
        json={
            "description": "January Rent",
            "amount_cents": 500000,
            "charge_date": "2026-01-01",
        },
        headers=headers,
    )
    return charge.json()["id"]


def test_create_payment(client, auth_headers):
    charge_id = _setup_charge(client, auth_headers)

    resp = client.post(
        f"/charges/{charge_id}/payments/",
        json={"amount_cents": 100000, "payment_date": "2026-01-10"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["amount_cents"] == 100000
    assert data["charge_id"] == charge_id


def test_payment_exceeds_balance(client, auth_headers):
    charge_id = _setup_charge(client, auth_headers)

    resp = client.post(
        f"/charges/{charge_id}/payments/",
        json={"amount_cents": 999999, "payment_date": "2026-01-10"},
        headers=auth_headers,
    )
    assert resp.status_code == 409


def test_delete_payment(client, auth_headers):
    charge_id = _setup_charge(client, auth_headers)
    payment = client.post(
        f"/charges/{charge_id}/payments/",
        json={"amount_cents": 100000, "payment_date": "2026-01-10"},
        headers=auth_headers,
    )
    payment_id = payment.json()["id"]

    resp = client.delete(f"/payments/{payment_id}", headers=auth_headers)
    assert resp.status_code == 204
