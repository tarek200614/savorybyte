"""
Database Seeding Script for SavoryByte SaaS
Populates initial roles, admin/staff/customer accounts, restaurant tables,
100% Halal-certified menu categories, gourmet dishes with high-res photography,
and realistic sample reservations & orders.
"""

import asyncio
from datetime import date, time
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.menu import Category, MenuItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.table import RestaurantTable, TableLocation, TableStatus
from app.models.user import User, UserRole


async def seed_data() -> None:
    print("🌱 Starting database seeding for SavoryByte (100% Halal Dining)...")

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        existing_admin = await db.execute(
            select(User).where(User.email == "admin@savorybyte.com")
        )
        if existing_admin.scalar_one_or_none():
            print("⚠️ Database already contains seed data. Skipping user creation.")
            return

        # 1. Create Users
        print("👤 Creating user accounts (Admin, Staff, Customer)...")
        admin_user = User(
            email="admin@savorybyte.com",
            hashed_password=get_password_hash("AdminSecret123!"),
            full_name="Marcus Vance (Executive Admin)",
            phone="+1 (555) 100-2000",
            role=UserRole.ADMIN,
            is_active=True,
        )
        staff_user = User(
            email="staff@savorybyte.com",
            hashed_password=get_password_hash("StaffSecret123!"),
            full_name="Elena Rostova (Head Maitre D')",
            phone="+1 (555) 100-3000",
            role=UserRole.STAFF,
            is_active=True,
        )
        customer_user = User(
            email="customer@savorybyte.com",
            hashed_password=get_password_hash("CustomerSecret123!"),
            full_name="Sophia Montgomery (VIP Guest)",
            phone="+1 (555) 100-4000",
            role=UserRole.CUSTOMER,
            is_active=True,
        )

        db.add_all([admin_user, staff_user, customer_user])
        await db.flush()

        # 2. Create Restaurant Tables
        print("🪑 Creating restaurant tables across dining zones...")
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

        # 3. Create 100% Halal Menu Categories
        print("📋 Creating 100% Halal menu categories...")
        cat_starters = Category(
            name="Artisanal Mezze & Starters",
            slug="starters",
            description="Delicately composed hot and cold appetizers crafted with pure halal ingredients.",
            display_order=1,
            is_active=True,
        )
        cat_mains = Category(
            name="Prime Halal Cuts & Signatures",
            slug="mains",
            description="Certified Halal A5 Wagyu, pasture-raised slow-cooked lamb, and pristine sustainable seafood.",
            display_order=2,
            is_active=True,
        )
        cat_desserts = Category(
            name="Artisanal Patisserie & Sweets",
            slug="desserts",
            description="Decadent handcrafted desserts made without animal gelatins or alcohol essences.",
            display_order=3,
            is_active=True,
        )
        cat_beverages = Category(
            name="Botanical Mocktails & Teas",
            slug="beverages",
            description="Cold-pressed organic fruit elixirs, smoked botanical mocktails, and ceremonial teas. 100% Alcohol-Free.",
            display_order=4,
            is_active=True,
        )

        db.add_all([cat_starters, cat_mains, cat_desserts, cat_beverages])
        await db.flush()

        # 4. Create Gourmet Halal Menu Items with High-Resolution Photography
        print("🍲 Creating gourmet halal dishes...")
        menu_items = [
            # Starters
            MenuItem(
                category_id=cat_starters.id,
                name="Truffle Burrata Pugliese",
                slug="truffle-burrata",
                description="Imported artisan burrata, heirloom cherry tomatoes, cold-pressed basil emulsion, toasted rosemary focaccia.",
                price=Decimal("24.00"),
                image_url="https://images.unsplash.com/photo-1592417817098-8f3d691068a8?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=10,
            ),
            MenuItem(
                category_id=cat_starters.id,
                name="Halal Yellowtail Hamachi Crudo",
                slug="hamachi-crudo",
                description="Wild yellowtail sashimi, citrus yuzu ponzu, pickled shallots, shaved serrano, smoked black sea salt.",
                price=Decimal("28.00"),
                image_url="https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=12,
            ),
            MenuItem(
                category_id=cat_starters.id,
                name="Smoked Za'atar & Truffle Hummus",
                slug="zaatar-truffle-hummus",
                description="Velvety whipped chickpeas, wild Palestinian za'atar, shaved black winter truffle, warm stone-baked flatbread.",
                price=Decimal("18.00"),
                image_url="https://images.unsplash.com/photo-1577906096429-f73c2c312435?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=8,
            ),
            # Mains
            MenuItem(
                category_id=cat_mains.id,
                name="Halal A5 Japanese Wagyu Ribeye",
                slug="a5-wagyu-ribeye",
                description="100% Halal-certified Japanese Wagyu ribeye, roasted bone marrow jus, black garlic emulsion, silk potato purée.",
                price=Decimal("98.00"),
                image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=25,
            ),
            MenuItem(
                category_id=cat_mains.id,
                name="Slow-Braised Royal Lamb Shank",
                slug="royal-lamb-shank",
                description="8-hour braised pasture-raised halal lamb, saffron pearl couscous, caramelized Turkish apricots, toasted marcona almonds.",
                price=Decimal("48.00"),
                image_url="https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=False,
                preparation_time_mins=20,
            ),
            MenuItem(
                category_id=cat_mains.id,
                name="Pan-Seared Chilean Sea Bass",
                slug="chilean-sea-bass",
                description="Miso-glazed sustainable sea bass, lemongrass-infused dashi reduction, charred baby bok choy, wild shiitake.",
                price=Decimal("58.00"),
                image_url="https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=20,
            ),
            MenuItem(
                category_id=cat_mains.id,
                name="Wild Morel & Truffle Risotto",
                slug="truffle-risotto",
                description="Acquerello aged carnaroli rice, foraged morel mushrooms, 36-month Parmigiano-Reggiano, fresh black truffle carpaccio.",
                price=Decimal("42.00"),
                image_url="https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=True,
                preparation_time_mins=22,
            ),
            MenuItem(
                category_id=cat_mains.id,
                name="Charcoal Grilled Chicken Shish",
                slug="chicken-shish-kebab",
                description="Saffron-marinated organic halal chicken breast, charred sumac tomatoes, garlic toum, jeweled basmati rice.",
                price=Decimal("34.00"),
                image_url="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=18,
            ),
            # Desserts
            MenuItem(
                category_id=cat_desserts.id,
                name="Valrhona Dark Chocolate Soufflé",
                slug="chocolate-souffle",
                description="70% Guanaja chocolate soufflé, Sicilian pistachio gelato, Madagascar vanilla bean crème anglaise.",
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
                description="Delicate sponge soaked in cardamom three-milks, spun sugar, crushed emerald pistachios, edible 24k gold leaf.",
                price=Decimal("16.00"),
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
                description="Japanese green tea mousse, crisp sablé breton, candied yuzu zest, raspberry reduction.",
                price=Decimal("16.00"),
                image_url="https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=10,
            ),
            # Beverages (Mocktails & Infusions)
            MenuItem(
                category_id=cat_beverages.id,
                name="Royal Saffron Pomegranate Fizz",
                slug="saffron-pomegranate-fizz",
                description="Freshly pressed ruby pomegranate, saffron threads, organic rose elixir, sparkling mineral water, crystal ice.",
                price=Decimal("16.00"),
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
                description="Blood orange extract, cold-pressed yuzu, agave nectar, flamed fresh rosemary sprig. 100% Non-Alcoholic.",
                price=Decimal("15.00"),
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
                description="Gunpowder green tea, fresh spearmint leaves, crushed green cardamom pods, served in traditional silver service.",
                price=Decimal("12.00"),
                image_url="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=True,
                preparation_time_mins=6,
            ),
        ]
        db.add_all(menu_items)
        await db.flush()

        # 5. Create Sample Reservations
        print("📅 Creating initial dining reservations...")
        today = date.today()
        sample_res_1 = Reservation(
            customer_id=customer_user.id,
            table_id=tables[0].id,
            reservation_date=today,
            start_time=time(19, 0),
            end_time=time(20, 30),
            party_size=2,
            status=ReservationStatus.CONFIRMED,
            special_requests="Quiet table preferred. Celebrating anniversary with Halal dining.",
        )
        sample_res_2 = Reservation(
            customer_id=customer_user.id,
            table_id=tables[5].id,  # Majlis
            reservation_date=today,
            start_time=time(20, 30),
            end_time=time(22, 30),
            party_size=6,
            status=ReservationStatus.SEATED,
            special_requests="Executive dining in Majlis. Mocktail pairing requested.",
        )
        db.add_all([sample_res_1, sample_res_2])
        await db.flush()

        # 6. Create Sample Orders
        print("🍽️ Creating initial restaurant orders...")
        sample_order = Order(
            customer_id=customer_user.id,
            table_id=tables[5].id,
            reservation_id=sample_res_2.id,
            order_number="ORD-20260925-0001",
            status=OrderStatus.PAID,
            total_amount=Decimal("194.00"),
            notes="Majlis table priority service",
        )
        db.add(sample_order)
        await db.flush()

        order_items = [
            OrderItem(
                order_id=sample_order.id,
                menu_item_id=menu_items[0].id,  # Truffle Burrata
                quantity=2,
                unit_price=Decimal("24.00"),
                subtotal=Decimal("48.00"),
            ),
            OrderItem(
                order_id=sample_order.id,
                menu_item_id=menu_items[3].id,  # Wagyu Ribeye
                quantity=1,
                unit_price=Decimal("98.00"),
                subtotal=Decimal("98.00"),
            ),
            OrderItem(
                order_id=sample_order.id,
                menu_item_id=menu_items[11].id,  # Saffron Mocktail
                quantity=3,
                unit_price=Decimal("16.00"),
                subtotal=Decimal("48.00"),
            ),
        ]
        db.add_all(order_items)

        await db.commit()
        print("✅ 100% Halal database seeding completed successfully!")
        print("\n✨ Default Test Credentials:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("👑 Admin:    admin@savorybyte.com    / AdminSecret123!")
        print("👔 Staff:    staff@savorybyte.com    / StaffSecret123!")
        print("🥂 Customer: customer@savorybyte.com / CustomerSecret123!")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")


if __name__ == "__main__":
    asyncio.run(seed_data())
