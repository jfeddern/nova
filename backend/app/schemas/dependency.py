# Pydantic schemas for Dependency entity validation and serialization.
# Defines create and response models for dependency graph endpoints.

from pydantic import BaseModel
from typing import Optional


class DependencyBase(BaseModel):
    source_application_id: str
    target_application_id: str
    type: str
    description: Optional[str] = None


class DependencyCreate(DependencyBase):
    pass


class DependencyResponse(DependencyBase):
    id: int

    class Config:
        from_attributes = True
