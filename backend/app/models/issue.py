# SQLAlchemy model for Issue entity representing known application issues.
# Stores troubleshooting knowledge including symptoms, causes, and resolution steps.

from sqlalchemy import Column, String, Integer, Text, ARRAY, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    symptoms = Column(Text)
    causes = Column(Text)
    troubleshooting_steps = Column(Text)
    severity = Column(String, nullable=False)  # info, warning, critical
    tags = Column(ARRAY(String), default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    application = relationship("Application", back_populates="issues")
