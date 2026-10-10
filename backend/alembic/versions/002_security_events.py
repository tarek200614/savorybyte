"""Add security_events table for AppSec event logging and telemetry

Revision ID: 002_security_events
Revises: 001_initial_schema
Create Date: 2026-09-29 22:15:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = '002_security_events'
down_revision: str | None = '001_initial_schema'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        'security_events',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column(
            'event_type',
            sa.Enum(
                'LOGIN_SUCCESS',
                'LOGIN_FAILURE',
                'ACCOUNT_LOCKED',
                'ACCOUNT_UNLOCKED',
                'UNAUTHORIZED_ACCESS',
                'FORBIDDEN_ACCESS',
                'RATE_LIMIT_TRIGGERED',
                'VALIDATION_FAILURE',
                'SUSPICIOUS_REQUEST',
                'CSRF_REJECTED',
                'ADMIN_ACTION',
                'SECURITY_TEST_RUN',
                name='securityeventtype',
            ),
            nullable=False,
        ),
        sa.Column(
            'severity',
            sa.Enum('INFO', 'NOTICE', 'WARNING', 'HIGH', 'CRITICAL', name='securityseverity'),
            nullable=False,
        ),
        sa.Column('actor_id', sa.UUID(), nullable=True),
        sa.Column('actor_email', sa.String(length=255), nullable=True),
        sa.Column('actor_ip', sa.String(length=45), nullable=True),
        sa.Column('target_type', sa.String(length=100), nullable=True),
        sa.Column('target_id', sa.String(length=100), nullable=True),
        sa.Column('request_id', sa.String(length=64), nullable=True),
        sa.Column('details', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_security_events_id'), 'security_events', ['id'], unique=False)
    op.create_index(op.f('ix_security_events_event_type'), 'security_events', ['event_type'], unique=False)
    op.create_index(op.f('ix_security_events_severity'), 'security_events', ['severity'], unique=False)
    op.create_index(op.f('ix_security_events_actor_id'), 'security_events', ['actor_id'], unique=False)
    op.create_index(op.f('ix_security_events_request_id'), 'security_events', ['request_id'], unique=False)
    op.create_index('ix_security_events_type_created', 'security_events', ['event_type', 'created_at'], unique=False)
    op.create_index('ix_security_events_severity_created', 'security_events', ['severity', 'created_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_security_events_severity_created', table_name='security_events')
    op.drop_index('ix_security_events_type_created', table_name='security_events')
    op.drop_index(op.f('ix_security_events_request_id'), table_name='security_events')
    op.drop_index(op.f('ix_security_events_actor_id'), table_name='security_events')
    op.drop_index(op.f('ix_security_events_severity'), table_name='security_events')
    op.drop_index(op.f('ix_security_events_event_type'), table_name='security_events')
    op.drop_index(op.f('ix_security_events_id'), table_name='security_events')
    op.drop_table('security_events')
    op.execute('DROP TYPE IF EXISTS securityeventtype')
    op.execute('DROP TYPE IF EXISTS securityseverity')
