# Pydantic schemas for Datastore entity validation and serialization.
# Defines create, update, and response models for datastore management endpoints.

from pydantic import BaseModel
from typing import Optional


class DatastoreBase(BaseModel):
    name: str
    type: str
    version: Optional[str] = None
    region: Optional[str] = None
    storage_size: Optional[int] = None
    endpoint: Optional[str] = None


class DatastoreCreate(DatastoreBase):
    id: str


class DatastoreUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    version: Optional[str] = None
    region: Optional[str] = None
    storage_size: Optional[int] = None
    endpoint: Optional[str] = None


class DatastoreResponse(DatastoreBase):
    id: str

    class Config:
        from_attributes = True
