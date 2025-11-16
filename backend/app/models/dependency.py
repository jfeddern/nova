# SQLAlchemy model for Dependency entity representing application dependencies.
# Stores directed relationships between applications with type and description.

from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source_application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    target_application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    type = Column(String, nullable=False)  # HTTP, Kafka, Queue, DB, External API, Event Stream
    description = Column(Text)

    # Relationships
    source_application = relationship(
        "Application",
        foreign_keys=[source_application_id],
        back_populates="outbound_dependencies"
    )
    target_application = relationship(
        "Application",
        foreign_keys=[target_application_id],
        back_populates="inbound_dependencies"
    )
