"""
Automated Verification Script for SavoryByte Menu & Imagery
Queries live API/database to ensure 100% data integrity and uniqueness of images.
"""

import httpx


def main():
    print("[AUDIT] Auditing SavoryByte Live Menu Items via API...")
    url = "http://localhost:8000/api/v1/menu/items"

    with httpx.Client(timeout=10.0) as client:
        resp = client.get(url)
        assert resp.status_code == 200, f"API failed with status {resp.status_code}"
        items = resp.json()

    print(f"\nTotal menu items retrieved: {len(items)}")
    assert len(items) == 18, f"Expected 18 items, got {len(items)}"

    image_urls = []
    print("\n" + "="*120)
    print(f"{'#':<3} | {'Dish Name':<35} | {'Category':<28} | {'Price':<8} | {'Dietary':<12} | {'Image URL'}")
    print("="*120)

    for idx, item in enumerate(items, 1):
        name = item["name"]
        cat = item["category"]["name"] if item.get("category") else "Unknown"
        price = f"${float(item['price']):.2f}"
        diet = []
        if item.get("is_vegetarian"):
            diet.append("Veg")
        if item.get("is_gluten_free"):
            diet.append("GF")
        diet_str = ", ".join(diet) if diet else "Halal"
        img = item.get("image_url")

        assert img is not None, f"Dish '{name}' has NULL image_url!"
        assert img.startswith("https://images.unsplash.com/"), f"Dish '{name}' has non-Unsplash URL: {img}"

        image_urls.append(img)
        print(f"{idx:<3} | {name:<35} | {cat:<28} | {price:<8} | {diet_str:<12} | {img[:55]}...")

    print("="*120)

    # Check for duplicate image URLs
    unique_images = set(image_urls)
    print(f"\nTotal items: {len(items)} | Unique images: {len(unique_images)}")
    assert len(unique_images) == 18, f"Found duplicate images! {len(unique_images)} unique out of {len(items)}"

    print("\n[SUCCESS] 100% PASS: All 18 menu items have unique, valid, non-null photography directly from the database!")

if __name__ == "__main__":
    main()
