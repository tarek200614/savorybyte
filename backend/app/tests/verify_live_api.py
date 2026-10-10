import httpx

BASE = "http://localhost:8000/api/v1"

with httpx.Client() as client:
    # 1. Admin login
    res = client.post(
        f"{BASE}/auth/login",
        data={"username": "admin@savorybyte.com", "password": "AdminSecret123!"},
    )
    assert res.status_code == 200, f"Admin login failed: {res.text}"
    admin_token = res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("✓ Admin login successful")

    # 2. Staff login
    res = client.post(
        f"{BASE}/auth/login",
        data={"username": "staff@savorybyte.com", "password": "StaffSecret123!"},
    )
    assert res.status_code == 200, f"Staff login failed: {res.text}"
    staff_token = res.json()["access_token"]
    staff_headers = {"Authorization": f"Bearer {staff_token}"}
    print("✓ Staff login successful")

    # 3. Customer login
    res = client.post(
        f"{BASE}/auth/login",
        data={"username": "customer@savorybyte.com", "password": "CustomerSecret123!"},
    )
    assert res.status_code == 200, f"Customer login failed: {res.text}"
    cust_token = res.json()["access_token"]
    cust_headers = {"Authorization": f"Bearer {cust_token}"}
    print("✓ Customer login successful")

    # 4. Get items
    items = client.get(f"{BASE}/menu/items").json()
    assert len(items) > 0, "No menu items found"
    item = items[0]
    item_id = item["id"]
    item_name = item["name"]
    print(f"✓ Found {len(items)} menu items. Testing on item: {item_name} ({item_id})")

    # 5. Non-admin update attempts
    res = client.patch(f"{BASE}/menu/items/{item_id}", json={"price": 123.45}, headers=cust_headers)
    assert res.status_code == 403, f"Expected 403 for customer, got {res.status_code}"
    print("✓ Customer 403 Forbidden verified")

    res = client.patch(
        f"{BASE}/menu/items/{item_id}", json={"price": 123.45}, headers=staff_headers
    )
    assert res.status_code == 403, f"Expected 403 for staff, got {res.status_code}"
    print("✓ Staff 403 Forbidden verified")

    res = client.patch(f"{BASE}/menu/items/{item_id}", json={"price": 123.45})
    assert res.status_code == 401, f"Expected 401 for unauth, got {res.status_code}"
    print("✓ Unauthenticated 401 Unauthorized verified")

    # 6. Admin update
    old_price = float(item["price"])
    new_price = round(old_price + 1.0, 2)
    res = client.patch(
        f"{BASE}/menu/items/{item_id}", json={"price": new_price}, headers=admin_headers
    )
    assert res.status_code == 200, f"Admin update failed: {res.text}"
    updated = res.json()
    assert float(updated["price"]) == new_price, f'Price not updated: {updated["price"]}'
    print(f"✓ Admin updated price from {old_price} to {new_price}")

    # 7. Check audit history
    res = client.get(f"{BASE}/menu/items/{item_id}/history", headers=admin_headers)
    assert res.status_code == 200, f"Audit history failed: {res.text}"
    history = res.json()
    assert len(history) > 0, "No audit history returned"
    latest = history[0]
    assert "price" in latest["changes"], f'Price change not in diff: {latest["changes"]}'
    print(f'✓ Audit event captured diff: {latest["changes"]}')

    # Revert price back cleanly
    client.patch(f"{BASE}/menu/items/{item_id}", json={"price": old_price}, headers=admin_headers)
    print(f"✓ Cleanly reverted price back to {old_price}")

    print("\n🎉 ALL LIVE E2E INTEGRATION CHECKS PASSED!")
