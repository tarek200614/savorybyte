"""
Refresh Database Menu & Category Seed Data for SavoryByte
Cleans and repopulates the 5 100% Halal categories and 18 gourmet dishes
with verified, distinct Unsplash imagery.
"""

import asyncio
from decimal import Decimal

from sqlalchemy import delete, select

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.menu import Category, MenuItem
from app.models.order import Order, OrderItem
from app.models.reservation import Reservation
from app.models.table import RestaurantTable, TableLocation, TableStatus
from app.models.user import User, UserRole


async def sync_database():
    print("🔄 Starting Database Refresh & Image Sync...")
    async with AsyncSessionLocal() as db:
        # 1. Clean old order items and menu items
        print("🧹 Cleaning old menu items and orders...")
        await db.execute(delete(OrderItem))
        await db.execute(delete(Order))
        await db.execute(delete(Reservation))
        await db.execute(delete(MenuItem))
        await db.execute(delete(Category))
        await db.commit()

        # 2. Ensure Users exist
        print("👤 Checking users...")
        user_res = await db.execute(select(User).where(User.email == "admin@savorybyte.com"))
        admin_user = user_res.scalar_one_or_none()
        if not admin_user:
            admin_user = User(
                email="admin@savorybyte.com",
                hashed_password=get_password_hash("AdminSecret123!"),
                full_name="Marcus Vance (Executive Admin)",
                phone="+1 (555) 100-2000",
                role=UserRole.ADMIN,
                is_active=True,
            )
            db.add(admin_user)

        user_res = await db.execute(select(User).where(User.email == "staff@savorybyte.com"))
        staff_user = user_res.scalar_one_or_none()
        if not staff_user:
            staff_user = User(
                email="staff@savorybyte.com",
                hashed_password=get_password_hash("StaffSecret123!"),
                full_name="Elena Rostova (Head Maitre D')",
                phone="+1 (555) 100-3000",
                role=UserRole.STAFF,
                is_active=True,
            )
            db.add(staff_user)

        user_res = await db.execute(select(User).where(User.email == "customer@savorybyte.com"))
        customer_user = user_res.scalar_one_or_none()
        if not customer_user:
            customer_user = User(
                email="customer@savorybyte.com",
                hashed_password=get_password_hash("CustomerSecret123!"),
                full_name="Sophia Montgomery (VIP Guest)",
                phone="+1 (555) 100-4000",
                role=UserRole.CUSTOMER,
                is_active=True,
            )
            db.add(customer_user)

        await db.flush()

        # 3. Ensure Tables exist
        print("🪑 Checking tables...")
        table_res = await db.execute(select(RestaurantTable))
        existing_tables = table_res.scalars().all()
        if not existing_tables:
            tables = [
                RestaurantTable(
                    table_number="T-01",
                    capacity=2,
                    location=TableLocation.MAIN_HALL,
                    status=TableStatus.AVAILABLE,
                    is_active=True,
                ),
                RestaurantTable(
                    table_number="T-02",
                    capacity=4,
                    location=TableLocation.MAIN_HALL,
                    status=TableStatus.AVAILABLE,
                    is_active=True,
                ),
                RestaurantTable(
                    table_number="T-03",
                    capacity=4,
                    location=TableLocation.MAIN_HALL,
                    status=TableStatus.AVAILABLE,
                    is_active=True,
                ),
                RestaurantTable(
                    table_number="TERR-01",
                    capacity=2,
                    location=TableLocation.TERRACE,
                    status=TableStatus.AVAILABLE,
                    is_active=True,
                ),
                RestaurantTable(
                    table_number="TERR-02",
                    capacity=4,
                    location=TableLocation.TERRACE,
                    status=TableStatus.AVAILABLE,
                    is_active=True,
                ),
                RestaurantTable(
                    table_number="MAJLIS-01",
                    capacity=8,
                    location=TableLocation.PRIVATE_ROOM,
                    status=TableStatus.AVAILABLE,
                    is_active=True,
                ),
                RestaurantTable(
                    table_number="CHEF-TABLE",
                    capacity=6,
                    location=TableLocation.PRIVATE_ROOM,
                    status=TableStatus.AVAILABLE,
                    is_active=True,
                ),
                RestaurantTable(
                    table_number="LOUNGE-01",
                    capacity=2,
                    location=TableLocation.BAR,
                    status=TableStatus.AVAILABLE,
                    is_active=True,
                ),
            ]
            db.add_all(tables)
            await db.flush()

        # 4. Create the 5 Halal Categories
        print("📋 Seeding 5 Halal categories...")
        cat_starters = Category(
            name="Artisanal Mezze & Starters",
            slug="starters",
            description="Delicately composed hot and cold appetizers, aged carnaroli risottos, and artisanal mezze.",
            display_order=1,
            is_active=True,
        )
        cat_grill = Category(
            name="Prime Halal Cuts & Grill",
            slug="grill",
            description="Halal-grade A5 Wagyu, pasture-raised slow-cooked lamb, and charcoal-grilled skewers.",
            display_order=2,
            is_active=True,
        )
        cat_seafood = Category(
            name="Pristine Ocean Catch",
            slug="seafood",
            description="Sustainable line-caught seafood and wild jumbo tiger prawns.",
            display_order=3,
            is_active=True,
        )
        cat_desserts = Category(
            name="Artisanal Patisserie & Sweets",
            slug="desserts",
            description="Decadent handcrafted desserts made without animal gelatins or alcohol essences.",
            display_order=4,
            is_active=True,
        )
        cat_beverages = Category(
            name="Botanical Mocktails & Brews",
            slug="beverages",
            description="Cold-pressed organic fruit elixirs, smoked botanical mocktails, ceremonial teas, and single-origin coffee.",
            display_order=5,
            is_active=True,
        )

        db.add_all([cat_starters, cat_grill, cat_seafood, cat_desserts, cat_beverages])
        await db.flush()

        # 5. Seed the 18 Gourmet Menu Items with verified Unsplash photography
        print("🍲 Seeding 18 gourmet dishes with unique imagery...")
        items = [
            # Category 1: Starters & Primi (5 dishes)
            MenuItem(
                category_id=cat_starters.id,
                name="Truffle Burrata Pugliese",
                slug="truffle-burrata",
                description="Artisan Pugliese burrata, heirloom cherry tomatoes, cold-pressed basil oil and warm rosemary focaccia.",
                price=Decimal("22.00"),
                image_url="https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=9,
            ),
            MenuItem(
                category_id=cat_starters.id,
                name="Halal Yellowtail Hamachi Crudo",
                slug="hamachi-crudo",
                description="Thinly sliced Pacific yellowtail with yuzu-kosho ponzu, pickled shallots, serrano chili and black volcanic sea salt.",
                price=Decimal("26.00"),
                image_url="https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=10,
            ),
            MenuItem(
                category_id=cat_starters.id,
                name="Smoked Za'atar & Truffle Hummus",
                slug="zaatar-truffle-hummus",
                description="Creamy whipped chickpeas with Palestinian wild za'atar, shaved black winter truffle and stone-baked flatbread.",
                price=Decimal("16.00"),
                image_url="https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=8,
            ),
            MenuItem(
                category_id=cat_starters.id,
                name="Pomegranate Sumac Fattoush Salad",
                slug="sumac-fattoush-salad",
                description="Crisp romaine hearts, garden radishes, baby cucumbers, crispy sumac pita chips and pomegranate molasses vinaigrette.",
                price=Decimal("17.00"),
                image_url="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=8,
            ),
            MenuItem(
                category_id=cat_starters.id,
                name="Wild Morel & Truffle Risotto",
                slug="truffle-risotto",
                description="Aged Acquerello carnaroli rice with foraged morel mushrooms, 36-month Parmigiano-Reggiano and fresh black truffle carpaccio.",
                price=Decimal("38.00"),
                image_url="https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=True,
                preparation_time_mins=20,
            ),
            # Category 2: Prime Cuts & Grill (4 dishes)
            MenuItem(
                category_id=cat_grill.id,
                name="Halal A5 Japanese Wagyu Ribeye",
                slug="a5-wagyu-ribeye",
                description="45-day dry-aged Japanese Miyazaki Wagyu ribeye with roasted bone marrow jus, black garlic butter and silk pommes purée.",
                price=Decimal("95.00"),
                image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=25,
            ),
            MenuItem(
                category_id=cat_grill.id,
                name="Slow-Braised Royal Lamb Shank",
                slug="royal-lamb-shank",
                description="8-hour braised pasture-raised lamb shank with saffron pearl couscous, caramelized Turkish apricots and toasted almonds.",
                price=Decimal("46.00"),
                image_url="https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=False,
                preparation_time_mins=28,
            ),
            MenuItem(
                category_id=cat_grill.id,
                name="Charcoal Grilled Chicken Shish",
                slug="chicken-shish-kebab",
                description="Saffron-marinated free-range chicken breast grilled over charcoal, roasted sumac tomatoes, garlic toum and jeweled rice.",
                price=Decimal("32.00"),
                image_url="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=18,
            ),
            MenuItem(
                category_id=cat_grill.id,
                name="Royal Moroccan Lamb Couscous",
                slug="moroccan-lamb-couscous",
                description="Hand-rolled steamed semolina, tender braised lamb shoulder, baby courgettes, sweet chickpeas and spiced lamb broth.",
                price=Decimal("42.00"),
                image_url="https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=False,
                preparation_time_mins=22,
            ),
            # Category 3: Pristine Ocean Catch (2 dishes)
            MenuItem(
                category_id=cat_seafood.id,
                name="Pan-Seared Chilean Sea Bass",
                slug="chilean-sea-bass",
                description="Golden pan-seared Chilean sea bass with lemongrass dashi reduction, charred baby bok choy and wild shiitake.",
                price=Decimal("54.00"),
                image_url="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=20,
            ),
            MenuItem(
                category_id=cat_seafood.id,
                name="Garlic Butter Jumbo Tiger Prawns",
                slug="jumbo-tiger-prawns",
                description="Wild jumbo tiger prawns sautéed in garlic-infused butter, smoked Aleppo pepper, fresh lemon parsley and grilled sourdough.",
                price=Decimal("48.00"),
                image_url="https://images.unsplash.com/photo-1559742811-822873691df8?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=False,
                preparation_time_mins=16,
            ),
            # Category 4: Artisanal Patisserie & Sweets (3 dishes)
            MenuItem(
                category_id=cat_desserts.id,
                name="Valrhona Dark Chocolate Soufflé",
                slug="chocolate-souffle",
                description="Warm 70% Guanaja chocolate soufflé with a molten center, Sicilian pistachio gelato and Bourbon vanilla crème anglaise.",
                price=Decimal("18.00"),
                image_url="https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=18,
            ),
            MenuItem(
                category_id=cat_desserts.id,
                name="Rosewater & Cardamom Milk Cake",
                slug="rosewater-milk-cake",
                description="Cardamom three-milk soaked sponge with whipped mascarpone, crushed emerald pistachios and 24k gold leaf.",
                price=Decimal("15.00"),
                image_url="https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=10,
            ),
            MenuItem(
                category_id=cat_desserts.id,
                name="Ceremonial Uji Matcha Tart",
                slug="uji-matcha-tart",
                description="Ceremonial grade Uji green tea mousse in a crisp sablé breton crust with candied yuzu zest and raspberry coulis.",
                price=Decimal("16.00"),
                image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=10,
            ),
            # Category 5: Botanical Mocktails & Brews (4 drinks)
            MenuItem(
                category_id=cat_beverages.id,
                name="Royal Saffron Pomegranate Fizz",
                slug="saffron-pomegranate-fizz",
                description="Cold-pressed ruby pomegranate, Persian saffron threads, organic rose elixir and sparkling mineral water.",
                price=Decimal("15.00"),
                image_url="https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=True,
                preparation_time_mins=5,
            ),
            MenuItem(
                category_id=cat_beverages.id,
                name="Smoked Rosemary Citrus Elixir",
                slug="smoked-citrus-elixir",
                description="Blood orange extract, Japanese yuzu, agave nectar and a torched fresh rosemary sprig (100% alcohol-free).",
                price=Decimal("14.00"),
                image_url="https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=True,
                preparation_time_mins=5,
            ),
            MenuItem(
                category_id=cat_beverages.id,
                name="Moroccan Mint & Cardamom Tea",
                slug="moroccan-mint-tea",
                description="Gunpowder green tea, fresh spearmint leaves and crushed green cardamom pods served in traditional silver service.",
                price=Decimal("11.00"),
                image_url="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=True,
                preparation_time_mins=6,
            ),
            MenuItem(
                category_id=cat_beverages.id,
                name="Artisanal Cardamom Cold Brew",
                slug="cardamom-cold-brew",
                description="Single-origin Ethiopian Yirgacheffe cold brew steeped for 24 hours, green cardamom, oat milk and vanilla foam.",
                price=Decimal("10.00"),
                image_url="https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=True,
                preparation_time_mins=4,
            ),
        ]

        db.add_all(items)
        await db.commit()
        print(
            f"✅ Successfully seeded {len(items)} dishes across 5 categories with unique image URLs!"
        )


if __name__ == "__main__":
    asyncio.run(sync_database())
