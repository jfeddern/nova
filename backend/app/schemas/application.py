# Pydantic schemas for Application entity validation and serialization.
# Defines create, update, and response models for application registry endpoints.

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ApplicationBase(BaseModel):
    name: str
    description: Optional[str] = None
    owner_team_id: Optional[str] = None
    department: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = []
    external_links: Optional[str] = None
    version: Optional[str] = None


class ApplicationCreate(ApplicationBase):
    id: str


class ApplicationUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    owner_team_id: Optional[str] = None
    department: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    external_links: Optional[str] = None
    version: Optional[str] = None


class ApplicationResponse(ApplicationBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
