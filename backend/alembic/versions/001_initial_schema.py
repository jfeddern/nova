"""initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create teams table
    op.create_table(
        'teams',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('department', sa.String(), nullable=True),
        sa.Column('contact_email', sa.String(), nullable=True),
        sa.Column('chat_channel', sa.String(), nullable=True),
        sa.Column('lead_name', sa.String(), nullable=True),
        sa.Column('lead_email', sa.String(), nullable=True),
        sa.Column('member_count', sa.Integer(), nullable=True),
        sa.Column('tags', sa.ARRAY(sa.String()), nullable=True),
        sa.Column('custom_links', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_teams_id'), 'teams', ['id'], unique=False)
    op.create_index(op.f('ix_teams_name'), 'teams', ['name'], unique=False)

    # Create applications table
    op.create_table(
        'applications',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_team_id', sa.String(), nullable=True),
        sa.Column('department', sa.String(), nullable=True),
        sa.Column('category', sa.String(), nullable=True),
        sa.Column('tags', sa.ARRAY(sa.String()), nullable=True),
        sa.Column('external_links', sa.Text(), nullable=True),
        sa.Column('version', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_team_id'], ['teams.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_applications_id'), 'applications', ['id'], unique=False)
    op.create_index(op.f('ix_applications_name'), 'applications', ['name'], unique=False)

    # Create datastores table
    op.create_table(
        'datastores',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('version', sa.String(), nullable=True),
        sa.Column('region', sa.String(), nullable=True),
        sa.Column('storage_size', sa.BigInteger(), nullable=True),
        sa.Column('endpoint', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_datastores_id'), 'datastores', ['id'], unique=False)
    op.create_index(op.f('ix_datastores_name'), 'datastores', ['name'], unique=False)

    # Create dependencies table
    op.create_table(
        'dependencies',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('source_application_id', sa.String(), nullable=False),
        sa.Column('target_application_id', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['source_application_id'], ['applications.id'], ),
        sa.ForeignKeyConstraint(['target_application_id'], ['applications.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_dependencies_id'), 'dependencies', ['id'], unique=False)

    # Create issues table
    op.create_table(
        'issues',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('application_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('symptoms', sa.Text(), nullable=True),
        sa.Column('causes', sa.Text(), nullable=True),
        sa.Column('troubleshooting_steps', sa.Text(), nullable=True),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('tags', sa.ARRAY(sa.String()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_issues_id'), 'issues', ['id'], unique=False)

    # Create vulnerabilities table
    op.create_table(
        'vulnerabilities',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('application_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('cvss_score', sa.Float(), nullable=True),
        sa.Column('affected_component', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('external_reference', sa.String(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_vulnerabilities_id'), 'vulnerabilities', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_vulnerabilities_id'), table_name='vulnerabilities')
    op.drop_table('vulnerabilities')
    op.drop_index(op.f('ix_issues_id'), table_name='issues')
    op.drop_table('issues')
    op.drop_index(op.f('ix_dependencies_id'), table_name='dependencies')
    op.drop_table('dependencies')
    op.drop_index(op.f('ix_datastores_name'), table_name='datastores')
    op.drop_index(op.f('ix_datastores_id'), table_name='datastores')
    op.drop_table('datastores')
    op.drop_index(op.f('ix_applications_name'), table_name='applications')
    op.drop_index(op.f('ix_applications_id'), table_name='applications')
    op.drop_table('applications')
    op.drop_index(op.f('ix_teams_name'), table_name='teams')
    op.drop_index(op.f('ix_teams_id'), table_name='teams')
    op.drop_table('teams')
