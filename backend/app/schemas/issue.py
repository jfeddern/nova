# Pydantic schemas for Issue entity validation and serialization.
# Defines create, update, and response models for issue knowledgebase endpoints.

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class IssueBase(BaseModel):
    application_id: str
    title: str
    description: Optional[str] = None
    symptoms: Optional[str] = None
    causes: Optional[str] = None
    troubleshooting_steps: Optional[str] = None
    severity: str
    tags: Optional[List[str]] = []


class IssueCreate(IssueBase):
    pass


class IssueUpdate(BaseModel):
    application_id: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    symptoms: Optional[str] = None
    causes: Optional[str] = None
    troubleshooting_steps: Optional[str] = None
    severity: Optional[str] = None
    tags: Optional[List[str]] = None


class IssueResponse(IssueBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
