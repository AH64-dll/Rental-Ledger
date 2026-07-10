from app.services.balance import derive_charge_status


def test_status_paid():
    assert derive_charge_status(0, 100, None) == "paid"


def test_status_partial():
    assert derive_charge_status(300, 200, None) == "partial"


def test_status_unpaid_future():
    from datetime import date, timedelta

    future = date.today() + timedelta(days=30)
    assert derive_charge_status(500, 0, future) == "unpaid"


def test_status_overdue():
    from datetime import date

    past = date(2020, 1, 1)
    assert derive_charge_status(500, 0, past) == "overdue"


def test_status_unpaid_no_due_date():
    assert derive_charge_status(500, 0, None) == "unpaid"
