"""Initial schema: users, tables, reservations, menu, orders, reviews

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-08-05 19:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Users Table
    op.create_table(
        'users',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('role', sa.Enum('CUSTOMER', 'STAFF', 'ADMIN', name='userrole'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_role'), 'users', ['role'], unique=False)

    # 2. Restaurant Tables Table
    op.create_table(
        'restaurant_tables',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('table_number', sa.String(length=50), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False),
        sa.Column('location', sa.Enum('MAIN_HALL', 'TERRACE', 'PRIVATE_ROOM', 'BAR', name='tablelocation'), nullable=False),
        sa.Column('status', sa.Enum('AVAILABLE', 'RESERVED', 'OCCUPIED', 'OUT_OF_SERVICE', name='tablestatus'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('capacity > 0', name='check_positive_table_capacity'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_restaurant_tables_id'), 'restaurant_tables', ['id'], unique=False)
    op.create_index(op.f('ix_restaurant_tables_table_number'), 'restaurant_tables', ['table_number'], unique=True)

    # 3. Reservations Table
    op.create_table(
        'reservations',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('customer_id', sa.UUID(), nullable=False),
        sa.Column('table_id', sa.UUID(), nullable=False),
        sa.Column('reservation_date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('end_time', sa.Time(), nullable=False),
        sa.Column('party_size', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', name='reservationstatus'), nullable=False),
        sa.Column('special_requests', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('party_size > 0', name='check_positive_party_size'),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['table_id'], ['restaurant_tables.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('idx_reservations_date_table', 'reservations', ['reservation_date', 'table_id', 'status'], unique=False)
    op.create_index(op.f('ix_reservations_customer_id'), 'reservations', ['customer_id'], unique=False)
    op.create_index(op.f('ix_reservations_id'), 'reservations', ['id'], unique=False)
    op.create_index(op.f('ix_reservations_reservation_date'), 'reservations', ['reservation_date'], unique=False)
    op.create_index(op.f('ix_reservations_status'), 'reservations', ['status'], unique=False)
    op.create_index(op.f('ix_reservations_table_id'), 'reservations', ['table_id'], unique=False)

    # 4. Categories Table
    op.create_table(
        'categories',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('display_order', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_categories_id'), 'categories', ['id'], unique=False)
    op.create_index(op.f('ix_categories_slug'), 'categories', ['slug'], unique=True)

    # 5. Menu Items Table
    op.create_table(
        'menu_items',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('category_id', sa.UUID(), nullable=True),
        sa.Column('name', sa.String(length=150), nullable=False),
        sa.Column('slug', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('is_available', sa.Boolean(), nullable=False),
        sa.Column('is_vegetarian', sa.Boolean(), nullable=False),
        sa.Column('is_gluten_free', sa.Boolean(), nullable=False),
        sa.Column('preparation_time_mins', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('price >= 0', name='check_non_negative_price'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_menu_items_category_id'), 'menu_items', ['category_id'], unique=False)
    op.create_index(op.f('ix_menu_items_id'), 'menu_items', ['id'], unique=False)
    op.create_index(op.f('ix_menu_items_is_available'), 'menu_items', ['is_available'], unique=False)
    op.create_index(op.f('ix_menu_items_slug'), 'menu_items', ['slug'], unique=True)

    # 6. Orders Table
    op.create_table(
        'orders',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('customer_id', sa.UUID(), nullable=True),
        sa.Column('table_id', sa.UUID(), nullable=True),
        sa.Column('reservation_id', sa.UUID(), nullable=True),
        sa.Column('order_number', sa.String(length=50), nullable=False),
        sa.Column('status', sa.Enum('PENDING', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED', name='orderstatus'), nullable=False),
        sa.Column('total_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['reservation_id'], ['reservations.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['table_id'], ['restaurant_tables.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_orders_customer_id'), 'orders', ['customer_id'], unique=False)
    op.create_index(op.f('ix_orders_id'), 'orders', ['id'], unique=False)
    op.create_index(op.f('ix_orders_order_number'), 'orders', ['order_number'], unique=True)
    op.create_index(op.f('ix_orders_reservation_id'), 'orders', ['reservation_id'], unique=False)
    op.create_index(op.f('ix_orders_status'), 'orders', ['status'], unique=False)
    op.create_index(op.f('ix_orders_table_id'), 'orders', ['table_id'], unique=False)

    # 7. Order Items Table
    op.create_table(
        'order_items',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('order_id', sa.UUID(), nullable=False),
        sa.Column('menu_item_id', sa.UUID(), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('subtotal', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('item_notes', sa.String(length=255), nullable=True),
        sa.CheckConstraint('quantity > 0', name='check_positive_item_quantity'),
        sa.ForeignKeyConstraint(['menu_item_id'], ['menu_items.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_order_items_id'), 'order_items', ['id'], unique=False)
    op.create_index(op.f('ix_order_items_menu_item_id'), 'order_items', ['menu_item_id'], unique=False)
    op.create_index(op.f('ix_order_items_order_id'), 'order_items', ['order_id'], unique=False)

    # 8. Reviews Table
    op.create_table(
        'reviews',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('customer_id', sa.UUID(), nullable=False),
        sa.Column('reservation_id', sa.UUID(), nullable=True),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('is_approved', sa.Boolean(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_between_1_and_5'),
        sa.ForeignKeyConstraint(['customer_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['reservation_id'], ['reservations.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_reviews_customer_id'), 'reviews', ['customer_id'], unique=False)
    op.create_index(op.f('ix_reviews_id'), 'reviews', ['id'], unique=False)
    op.create_index(op.f('ix_reviews_is_approved'), 'reviews', ['is_approved'], unique=False)
    op.create_index(op.f('ix_reviews_reservation_id'), 'reviews', ['reservation_id'], unique=False)

    # 9. System Settings Table
    op.create_table(
        'system_settings',
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('value', sa.JSON(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('key')
    )
    op.create_index(op.f('ix_system_settings_key'), 'system_settings', ['key'], unique=False)


def downgrade() -> None:
    op.drop_table('system_settings')
    op.drop_table('reviews')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('menu_items')
    op.drop_table('categories')
    op.drop_table('reservations')
    op.drop_table('restaurant_tables')
    op.drop_table('users')
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS tablelocation")
    op.execute("DROP TYPE IF EXISTS tablestatus")
    op.execute("DROP TYPE IF EXISTS reservationstatus")
    op.execute("DROP TYPE IF EXISTS orderstatus")
