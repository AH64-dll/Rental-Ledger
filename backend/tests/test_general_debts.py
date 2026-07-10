def _setup_tenant_and_lease(client, headers):
    prop = client.post("/properties/", json={"name": "Test Property"}, headers=headers)
    prop_id = prop.json()["id"]
    tenant = client.post("/tenants/", json={"name": "John Doe"}, headers=headers)
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
        headers=headers,
    )
    return lease.json()["id"], tenant_id


def test_general_debt_lifecycle(client, auth_headers):
    # 1. Setup tenant
    _, tenant_id = _setup_tenant_and_lease(client, auth_headers)

    # 2. Create general debt (charge with lease_id = null, direct tenant_id)
    create_resp = client.post(
        "/charges/",
        json={
            "tenant_id": tenant_id,
            "lease_id": None,
            "description": "General Damage Fee",
            "amount_cents": 15000,
            "charge_date": "2026-01-15",
            "due_date": "2026-02-15",
            "category": "other",
        },
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    charge_data = create_resp.json()
    assert charge_data["lease_id"] is None
    assert charge_data["tenant_id"] == tenant_id
    assert charge_data["description"] == "General Damage Fee"
    assert charge_data["amount_cents"] == 15000
    charge_id = charge_data["id"]

    # 3. Retrieve general debt
    get_resp = client.get(f"/charges/{charge_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == charge_id
    assert get_resp.json()["lease_id"] is None

    # 4. Check list flat charges contains the general debt
    list_resp = client.get(f"/charges/?tenant_id={tenant_id}", headers=auth_headers)
    assert list_resp.status_code == 200
    charge_ids = [c["id"] for c in list_resp.json()]
    assert charge_id in charge_ids

    # 5. Delete general debt
    delete_resp = client.delete(f"/charges/{charge_id}", headers=auth_headers)
    assert delete_resp.status_code == 204

    # 6. Verify deleted general debt is gone
    get_resp_deleted = client.get(f"/charges/{charge_id}", headers=auth_headers)
    assert get_resp_deleted.status_code == 404


def test_tenant_balance_with_general_debts(client, auth_headers):
    # 1. Setup tenant and lease
    lease_id, tenant_id = _setup_tenant_and_lease(client, auth_headers)

    # 2. Create a lease charge (e.g. rent)
    lease_charge_resp = client.post(
        f"/leases/{lease_id}/charges/",
        json={
            "description": "January Rent",
            "amount_cents": 100000,
            "charge_date": "2026-01-01",
            "due_date": "2026-01-05",
            "category": "rent",
        },
        headers=auth_headers,
    )
    assert lease_charge_resp.status_code == 201
    lease_charge_id = lease_charge_resp.json()["id"]

    # 3. Create a general debt
    general_debt_resp = client.post(
        "/charges/",
        json={
            "tenant_id": tenant_id,
            "lease_id": None,
            "description": "General Utility Surcharge",
            "amount_cents": 5000,
            "charge_date": "2026-01-10",
            "category": "other",
        },
        headers=auth_headers,
    )
    assert general_debt_resp.status_code == 201
    general_debt_id = general_debt_resp.json()["id"]

    # 4. Check balance statement: net balance should be 100000 + 5000 = 105000 cents
    balance_resp = client.get(f"/tenants/{tenant_id}/balance", headers=auth_headers)
    assert balance_resp.status_code == 200
    balance_data = balance_resp.json()
    assert balance_data["net_balance_cents"] == 105000

    # 5. Check charges summaries contain both and have correct id and lease_id fields populated
    summaries = balance_data["charges"]
    assert len(summaries) >= 2

    # Find the general debt in summaries
    gen_summary = next((c for c in summaries if c["id"] == general_debt_id), None)
    assert gen_summary is not None
    assert gen_summary["lease_id"] is None
    assert gen_summary["description"] == "General Utility Surcharge"
    assert gen_summary["amount_cents"] == 5000

    # Find the lease charge in summaries
    lease_summary = next((c for c in summaries if c["id"] == lease_charge_id), None)
    assert lease_summary is not None
    assert lease_summary["lease_id"] == lease_id
    assert lease_summary["description"] == "January Rent"
    assert lease_summary["amount_cents"] == 100000

    # 6. Try deleting a charge with payments (should fail with 409)
    # First add a payment to general debt
    client.post(
        f"/charges/{general_debt_id}/payments/",
        json={"amount_cents": 2000, "payment_date": "2026-01-12"},
        headers=auth_headers,
    )
    # Try deleting it
    delete_fail_resp = client.delete(
        f"/charges/{general_debt_id}", headers=auth_headers
    )
    assert delete_fail_resp.status_code == 409

    # Check net balance is updated to 105000 - 2000 = 103000
    balance_resp = client.get(f"/tenants/{tenant_id}/balance", headers=auth_headers)
    assert balance_resp.json()["net_balance_cents"] == 103000


def test_negative_debt_creditor_workflow(client, auth_headers):
    # 1. Setup tenant
    _, tenant_id = _setup_tenant_and_lease(client, auth_headers)

    # 2. Create negative debt (creditor / we owe them)
    create_resp = client.post(
        "/charges/",
        json={
            "tenant_id": tenant_id,
            "lease_id": None,
            "description": "Utility Refund Owed",
            "amount_cents": -50000, # We owe them 500 EGP
            "charge_date": "2026-01-15",
            "category": "other",
        },
        headers=auth_headers,
    )
    assert create_resp.status_code == 201
    charge_data = create_resp.json()
    assert charge_data["amount_cents"] == -50000
    assert charge_data["balance_cents"] == -50000
    charge_id = charge_data["id"]

    # 3. Verify tenant net balance is -50000
    balance_resp = client.get(f"/tenants/{tenant_id}/balance", headers=auth_headers)
    assert balance_resp.json()["net_balance_cents"] == -50000

    # 4. Make a payment of 20000 (200 EGP) towards the negative debt
    pay_resp = client.post(
        f"/charges/{charge_id}/payments/",
        json={"amount_cents": 20000, "payment_date": "2026-01-16"},
        headers=auth_headers,
    )
    assert pay_resp.status_code == 201

    # 5. Check remaining balance on the charge is -30000 (-50000 + 20000)
    get_resp = client.get(f"/charges/{charge_id}", headers=auth_headers)
    assert get_resp.json()["balance_cents"] == -30000
    assert get_resp.json()["paid_cents"] == 20000
    assert get_resp.json()["status"] == "partial"

    # 6. Check tenant net balance is updated to -30000
    balance_resp = client.get(f"/tenants/{tenant_id}/balance", headers=auth_headers)
    assert balance_resp.json()["net_balance_cents"] == -30000

