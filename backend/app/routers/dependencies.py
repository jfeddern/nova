# Dependency Graph API endpoints for managing application dependencies.
# Provides operations to create, retrieve, and delete dependency relationships.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Dependency, Application
from app.schemas.dependency import DependencyCreate, DependencyResponse

router = APIRouter(prefix="/dependencies", tags=["dependencies"])


@router.get("", response_model=List[DependencyResponse])
def get_dependencies(db: Session = Depends(get_db)):
    """Get all dependencies."""
    dependencies = db.query(Dependency).all()
    return dependencies


@router.post("", response_model=DependencyResponse, status_code=status.HTTP_201_CREATED)
def create_dependency(dependency: DependencyCreate, db: Session = Depends(get_db)):
    """Create a new dependency relationship."""
    # Verify source application exists
    source_app = db.query(Application).filter(Application.id == dependency.source_application_id).first()
    if not source_app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source application {dependency.source_application_id} not found"
        )

    # Verify target application exists
    target_app = db.query(Application).filter(Application.id == dependency.target_application_id).first()
    if not target_app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Target application {dependency.target_application_id} not found"
        )

    db_dependency = Dependency(**dependency.model_dump())
    db.add(db_dependency)
    db.commit()
    db.refresh(db_dependency)
    return db_dependency


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dependency(id: int, db: Session = Depends(get_db)):
    """Delete a dependency relationship."""
    db_dependency = db.query(Dependency).filter(Dependency.id == id).first()
    if not db_dependency:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dependency not found")

    db.delete(db_dependency)
    db.commit()
    return None
