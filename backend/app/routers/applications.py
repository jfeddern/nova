# Application Registry API endpoints for managing application metadata.
# Provides CRUD operations and relationship queries for applications.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Application, Dependency, Issue, Vulnerability
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationResponse
from app.schemas.dependency import DependencyResponse
from app.schemas.issue import IssueResponse
from app.schemas.vulnerability import VulnerabilityResponse

router = APIRouter(prefix="/applications", tags=["applications"])


@router.get("", response_model=List[ApplicationResponse])
def get_applications(db: Session = Depends(get_db)):
    """Get all applications."""
    applications = db.query(Application).all()
    return applications


@router.get("/{id}", response_model=ApplicationResponse)
def get_application(id: str, db: Session = Depends(get_db)):
    """Get application by ID."""
    application = db.query(Application).filter(Application.id == id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return application


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(application: ApplicationCreate, db: Session = Depends(get_db)):
    """Create a new application."""
    # Check if application with same ID already exists
    existing = db.query(Application).filter(Application.id == application.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application ID already exists")

    db_application = Application(**application.model_dump())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)

    # TODO: Generate embedding for semantic search (placeholder)

    return db_application


@router.put("/{id}", response_model=ApplicationResponse)
def update_application(id: str, application: ApplicationUpdate, db: Session = Depends(get_db)):
    """Update an existing application."""
    db_application = db.query(Application).filter(Application.id == id).first()
    if not db_application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    update_data = application.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_application, field, value)

    db.commit()
    db.refresh(db_application)

    # TODO: Update embedding for semantic search (placeholder)

    return db_application


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(id: str, db: Session = Depends(get_db)):
    """Delete an application."""
    db_application = db.query(Application).filter(Application.id == id).first()
    if not db_application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    db.delete(db_application)
    db.commit()
    return None


@router.get("/{id}/dependencies", response_model=List[DependencyResponse])
def get_application_dependencies(id: str, db: Session = Depends(get_db)):
    """Get all dependencies for an application (both outbound and inbound)."""
    application = db.query(Application).filter(Application.id == id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    outbound = db.query(Dependency).filter(Dependency.source_application_id == id).all()
    inbound = db.query(Dependency).filter(Dependency.target_application_id == id).all()

    return outbound + inbound


@router.get("/{id}/dependencies/outbound", response_model=List[DependencyResponse])
def get_application_outbound_dependencies(id: str, db: Session = Depends(get_db)):
    """Get outbound dependencies for an application."""
    application = db.query(Application).filter(Application.id == id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    dependencies = db.query(Dependency).filter(Dependency.source_application_id == id).all()
    return dependencies


@router.get("/{id}/dependencies/inbound", response_model=List[DependencyResponse])
def get_application_inbound_dependencies(id: str, db: Session = Depends(get_db)):
    """Get inbound dependencies for an application."""
    application = db.query(Application).filter(Application.id == id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    dependencies = db.query(Dependency).filter(Dependency.target_application_id == id).all()
    return dependencies


@router.get("/{id}/issues", response_model=List[IssueResponse])
def get_application_issues(id: str, db: Session = Depends(get_db)):
    """Get all issues for an application."""
    application = db.query(Application).filter(Application.id == id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    issues = db.query(Issue).filter(Issue.application_id == id).all()
    return issues


@router.get("/{id}/vulnerabilities", response_model=List[VulnerabilityResponse])
def get_application_vulnerabilities(id: str, db: Session = Depends(get_db)):
    """Get all vulnerabilities for an application."""
    application = db.query(Application).filter(Application.id == id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    vulnerabilities = db.query(Vulnerability).filter(Vulnerability.application_id == id).all()
    return vulnerabilities


# TODO: Add GET /applications/{id}/datastores endpoint when datastore-application relationship is defined
