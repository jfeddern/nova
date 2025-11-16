# Pydantic schemas for Team entity validation and serialization.
# Defines create, update, and response models for team management endpoints.

from pydantic import BaseModel, EmailStr
from typing import Optional, List


class TeamBase(BaseModel):
    name: str
    description: Optional[str] = None
    department: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    chat_channel: Optional[str] = None
    lead_name: Optional[str] = None
    lead_email: Optional[EmailStr] = None
    member_count: Optional[int] = None
    tags: Optional[List[str]] = []
    custom_links: Optional[str] = None


class TeamCreate(TeamBase):
    id: str


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    chat_channel: Optional[str] = None
    lead_name: Optional[str] = None
    lead_email: Optional[EmailStr] = None
    member_count: Optional[int] = None
    tags: Optional[List[str]] = None
    custom_links: Optional[str] = None


class TeamResponse(TeamBase):
    id: str

    class Config:
        from_attributes = True
