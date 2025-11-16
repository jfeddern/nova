# SQLAlchemy model for Datastore entity representing databases, queues, and storage systems.
# Stores datastore metadata including type, version, region, and capacity information.

from sqlalchemy import Column, String, Integer, BigInteger
from app.database import Base


class Datastore(Base):
    __tablename__ = "datastores"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)  # postgres, mysql, redis, S3, mongo, etc.
    version = Column(String)
    region = Column(String)
    storage_size = Column(BigInteger)  # in bytes
    endpoint = Column(String)
