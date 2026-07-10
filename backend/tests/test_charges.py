def _setup_lease(client, headers):
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
    return lease.json()["id"], tenant_id


def test_create_charge(client, auth_headers):
    lease_id, _ = _setup_lease(client, auth_headers)

    resp = client.post(
        f"/leases/{lease_id}/charges/",
        json={
            "description": "January Rent",
            "amount_cents": 500000,
            "charge_date": "2026-01-01",
            "due_date": "2026-01-05",
            "category": "rent",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["description"] == "January Rent"
    assert data["amount_cents"] == 500000
    assert data["paid_cents"] == 0
    assert data["balance_cents"] == 500000
    assert data["status"] in ("unpaid", "overdue")


def test_charge_unpaid_status(client, auth_headers):
    lease_id, _ = _setup_lease(client, auth_headers)

    resp = client.post(
        f"/leases/{lease_id}/charges/",
        json={
            "description": "Future Rent",
            "amount_cents": 300000,
            "charge_date": "2027-06-01",
            "due_date": "2027-06-05",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "unpaid"


def test_charge_overdue_status(client, auth_headers):
    lease_id, _ = _setup_lease(client, auth_headers)

    resp = client.post(
        f"/leases/{lease_id}/charges/",
        json={
            "description": "Past Rent",
            "amount_cents": 200000,
            "charge_date": "2025-01-01",
            "due_date": "2025-01-05",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["status"] == "overdue"


def test_pay_and_status_paid(client, auth_headers):
    lease_id, _ = _setup_lease(client, auth_headers)
    charge = client.post(
        f"/leases/{lease_id}/charges/",
        json={
            "description": "Rent to Pay",
            "amount_cents": 100000,
            "charge_date": "2026-01-01",
        },
        headers=auth_headers,
    )
    charge_id = charge.json()["id"]

    resp = client.post(
        f"/charges/{charge_id}/payments/",
        json={"amount_cents": 100000, "payment_date": "2026-01-10"},
        headers=auth_headers,
    )
    assert resp.status_code == 201

    resp = client.get(f"/leases/{lease_id}/charges/{charge_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "paid"
    assert resp.json()["paid_cents"] == 100000
    assert resp.json()["balance_cents"] == 0


def test_partial_payment_status(client, auth_headers):
    lease_id, _ = _setup_lease(client, auth_headers)
    charge = client.post(
        f"/leases/{lease_id}/charges/",
        json={
            "description": "Rent Partial",
            "amount_cents": 500000,
            "charge_date": "2026-01-01",
        },
        headers=auth_headers,
    )
    charge_id = charge.json()["id"]

    client.post(
        f"/charges/{charge_id}/payments/",
        json={"amount_cents": 200000, "payment_date": "2026-01-10"},
        headers=auth_headers,
    )

    resp = client.get(f"/leases/{lease_id}/charges/{charge_id}", headers=auth_headers)
    assert resp.json()["status"] == "partial"
    assert resp.json()["paid_cents"] == 200000
    assert resp.json()["balance_cents"] == 300000


def test_delete_charge_409_with_payments(client, auth_headers):
    lease_id, _ = _setup_lease(client, auth_headers)
    charge = client.post(
        f"/leases/{lease_id}/charges/",
        json={
            "description": "Rent",
            "amount_cents": 100000,
            "charge_date": "2026-01-01",
        },
        headers=auth_headers,
    )
    charge_id = charge.json()["id"]

    client.post(
        f"/charges/{charge_id}/payments/",
        json={"amount_cents": 50000, "payment_date": "2026-01-10"},
        headers=auth_headers,
    )

    resp = client.delete(f"/leases/{lease_id}/charges/{charge_id}", headers=auth_headers)
    assert resp.status_code == 409
