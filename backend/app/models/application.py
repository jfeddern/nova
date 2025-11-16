# SQLAlchemy model for Application entity representing software applications.
# Stores application metadata, ownership, and relationships to teams, dependencies, and datastores.

from sqlalchemy import Column, String, Text, ARRAY, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    owner_team_id = Column(String, ForeignKey("teams.id"))
    department = Column(String)
    category = Column(String)
    tags = Column(ARRAY(String), default=[])
    external_links = Column(Text)  # JSON string for list of {title, url}
    version = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner_team = relationship("Team", back_populates="applications")
    issues = relationship("Issue", back_populates="application", cascade="all, delete-orphan")
    vulnerabilities = relationship("Vulnerability", back_populates="application", cascade="all, delete-orphan")
    outbound_dependencies = relationship(
        "Dependency",
        foreign_keys="Dependency.source_application_id",
        back_populates="source_application",
        cascade="all, delete-orphan"
    )
    inbound_dependencies = relationship(
        "Dependency",
        foreign_keys="Dependency.target_application_id",
        back_populates="target_application",
        cascade="all, delete-orphan"
    )
