import asyncio

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.models.menu import Category, MenuItem


async def main():
    async with AsyncSessionLocal() as db:
        cat_res = await db.execute(select(Category))
        categories = cat_res.scalars().all()
        print(f"=== CATEGORIES IN DB ({len(categories)}) ===")
        for c in categories:
            print(f"[{c.id}] {c.name} (slug={c.slug})")

        item_res = await db.execute(select(MenuItem))
        items = item_res.scalars().all()
        print(f"\n=== MENU ITEMS IN DB ({len(items)}) ===")
        for idx, i in enumerate(items, 1):
            print(
                f"{idx}. [{i.id}] '{i.name}' | Price: ${i.price} | Cat: {i.category_id} | Image: {i.image_url}"
            )


if __name__ == "__main__":
    asyncio.run(main())
