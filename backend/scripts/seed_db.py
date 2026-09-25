"""
Database Seeding Script for SavoryByte SaaS
Populates initial roles, admin/staff/customer accounts, restaurant tables,
menu categories, gourmet dishes, and realistic sample reservations & orders.
"""

import asyncio
from datetime import date, time
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal, engine
from app.core.security import get_password_hash
from app.models.base import Base
from app.models.menu import Category, MenuItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.reservation import Reservation, ReservationStatus
from app.models.table import RestaurantTable, TableLocation, TableStatus
from app.models.user import User, UserRole


async def seed_data() -> None:
    print("🌱 Starting database seeding for SavoryByte...")

    async with AsyncSessionLocal() as db:
        # 1. Create Users
        existing_admin = await db.execute(
            select(User).where(User.email == "admin@savorybyte.com")
        )
        if existing_admin.scalar_one_or_none():
            print("⚠️ Database already contains seed data. Skipping user creation.")
            return

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
                table_number="VIP-SALON",
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
                table_number="BAR-01",
                capacity=2,
                location=TableLocation.BAR,
                status=TableStatus.AVAILABLE,
                is_active=True,
            ),
        ]
        db.add_all(tables)
        await db.flush()

        # 3. Create Menu Categories
        print("📋 Creating menu categories...")
        cat_appetizers = Category(
            name="Appetizers & Starters",
            slug="appetizers",
            description="Delicate starters to awaken the palate",
            display_order=1,
            is_active=True,
        )
        cat_mains = Category(
            name="Main Courses",
            slug="mains",
            description="Exquisite prime cuts and artisanal seafood creations",
            display_order=2,
            is_active=True,
        )
        cat_desserts = Category(
            name="Desserts & Patisserie",
            slug="desserts",
            description="Handcrafted confections and decadent sweets",
            display_order=3,
            is_active=True,
        )
        cat_beverages = Category(
            name="Signature Cocktails & Wines",
            slug="beverages",
            description="Curated reserve wines and mixologist creations",
            display_order=4,
            is_active=True,
        )

        db.add_all([cat_appetizers, cat_mains, cat_desserts, cat_beverages])
        await db.flush()

        # 4. Create Gourmet Menu Items
        print("🍲 Creating gourmet menu dishes...")
        menu_items = [
            # Appetizers
            MenuItem(
                category_id=cat_appetizers.id,
                name="Truffle Burrata & Heirloom Tomatoes",
                slug="truffle-burrata",
                description="Imported Pugliese burrata, 25-year aged balsamic reduction, basil oil, toasted focaccia.",
                price=Decimal("24.00"),
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=10,
            ),
            MenuItem(
                category_id=cat_appetizers.id,
                name="Hamachi Crudo",
                slug="hamachi-crudo",
                description="Yellowtail sashimi, yuzu kosho ponzu, pickled shallots, serrano pepper, black sea salt.",
                price=Decimal("28.00"),
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=12,
            ),
            # Mains
            MenuItem(
                category_id=cat_mains.id,
                name="Dry-Aged Wagyu Ribeye (A5)",
                slug="a5-wagyu-ribeye",
                description="45-day dry-aged Japanese Wagyu, black garlic butter, roasted bone marrow, pomme purée.",
                price=Decimal("95.00"),
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=25,
            ),
            MenuItem(
                category_id=cat_mains.id,
                name="Pan-Seared Chilean Sea Bass",
                slug="chilean-sea-bass",
                description="Miso-glazed sea bass, lemongrass-infused dashi broth, baby bok choy, shiitake mushrooms.",
                price=Decimal("58.00"),
                is_available=True,
                is_vegetarian=False,
                is_gluten_free=True,
                preparation_time_mins=20,
            ),
            MenuItem(
                category_id=cat_mains.id,
                name="Wild Morel & Black Truffle Risotto",
                slug="truffle-risotto",
                description="Acquerello carnaroli rice, foraged morels, 36-month Parmigiano-Reggiano, fresh black truffle shavings.",
                price=Decimal("42.00"),
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=True,
                preparation_time_mins=22,
            ),
            # Desserts
            MenuItem(
                category_id=cat_desserts.id,
                name="Valrhona Dark Chocolate Soufflé",
                slug="chocolate-souffle",
                description="70% Guanaja chocolate, Madagascar bourbon vanilla bean gelato, salted caramel drizzle.",
                price=Decimal("18.00"),
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=18,
            ),
            MenuItem(
                category_id=cat_desserts.id,
                name="Yuzu Matcha Tart",
                slug="yuzu-matcha-tart",
                description="Ceremonial Uji matcha mousse, crisp sable breton, candied yuzu zest, gold leaf.",
                price=Decimal("16.00"),
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=False,
                preparation_time_mins=10,
            ),
            # Beverages
            MenuItem(
                category_id=cat_beverages.id,
                name="Smoked Rosemary Old Fashioned",
                slug="smoked-old-fashioned",
                description="Small-batch bourbon, demerara syrup, angostura bitters, flamed rosemary, hand-cut crystal ice.",
                price=Decimal("22.00"),
                is_available=True,
                is_vegetarian=True,
                is_gluten_free=True,
                preparation_time_mins=5,
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
            special_requests="Window seat preferred. Celebrating anniversary.",
        )
        sample_res_2 = Reservation(
            customer_id=customer_user.id,
            table_id=tables[5].id,
            reservation_date=today,
            start_time=time(20, 30),
            end_time=time(22, 30),
            party_size=6,
            status=ReservationStatus.SEATED,
            special_requests="VIP business dining. Sommelier pairing requested.",
        )
        db.add_all([sample_res_1, sample_res_2])
        await db.flush()

        # 6. Create Sample Food Orders
        print("🍽️ Creating initial restaurant orders...")
        sample_order = Order(
            customer_id=customer_user.id,
            table_id=tables[5].id,
            reservation_id=sample_res_2.id,
            order_number="ORD-20260925-0001",
            status=OrderStatus.PAID,
            total_amount=Decimal("183.00"),
            notes="VIP table priority service",
        )
        db.add(sample_order)
        await db.flush()

        order_items = [
            OrderItem(
                order_id=sample_order.id,
                menu_item_id=menu_items[0].id,  # Burrata
                quantity=2,
                unit_price=Decimal("24.00"),
                subtotal=Decimal("48.00"),
            ),
            OrderItem(
                order_id=sample_order.id,
                menu_item_id=menu_items[2].id,  # Wagyu Ribeye
                quantity=1,
                unit_price=Decimal("95.00"),
                subtotal=Decimal("95.00"),
            ),
            OrderItem(
                order_id=sample_order.id,
                menu_item_id=menu_items[7].id,  # Cocktail
                quantity=2,
                unit_price=Decimal("20.00"),
                subtotal=Decimal("40.00"),
            ),
        ]
        db.add_all(order_items)

        await db.commit()
        print("✅ Database seeding completed successfully!")
        print("\n✨ Default Test Credentials:")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("👑 Admin:    admin@savorybyte.com    / AdminSecret123!")
        print("👔 Staff:    staff@savorybyte.com    / StaffSecret123!")
        print("🥂 Customer: customer@savorybyte.com / CustomerSecret123!")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")


if __name__ == "__main__":
    asyncio.run(seed_data())
