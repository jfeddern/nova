# SQLAlchemy model for Team entity representing organizational teams.
# Stores team metadata, contact information, and relationships to applications.

from sqlalchemy import Column, String, Integer, Text, ARRAY
from sqlalchemy.orm import relationship
from app.database import Base


class Team(Base):
    __tablename__ = "teams"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    department = Column(String)
    contact_email = Column(String)
    chat_channel = Column(String)
    lead_name = Column(String)
    lead_email = Column(String)
    member_count = Column(Integer)
    tags = Column(ARRAY(String), default=[])
    custom_links = Column(Text)  # JSON string

    # Relationships
    applications = relationship("Application", back_populates="owner_team")
