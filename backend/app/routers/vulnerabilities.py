# Vulnerability Management API endpoints for tracking security vulnerabilities.
# Provides CRUD operations for vulnerability records and remediation tracking.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Vulnerability, Application
from app.schemas.vulnerability import VulnerabilityCreate, VulnerabilityUpdate, VulnerabilityResponse

router = APIRouter(prefix="/vulnerabilities", tags=["vulnerabilities"])


@router.get("", response_model=List[VulnerabilityResponse])
def get_vulnerabilities(db: Session = Depends(get_db)):
    """Get all vulnerabilities."""
    vulnerabilities = db.query(Vulnerability).all()
    return vulnerabilities


@router.post("", response_model=VulnerabilityResponse, status_code=status.HTTP_201_CREATED)
def create_vulnerability(vulnerability: VulnerabilityCreate, db: Session = Depends(get_db)):
    """Create a new vulnerability."""
    # Verify application exists
    application = db.query(Application).filter(Application.id == vulnerability.application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {vulnerability.application_id} not found"
        )

    db_vulnerability = Vulnerability(**vulnerability.model_dump())
    db.add(db_vulnerability)
    db.commit()
    db.refresh(db_vulnerability)
    return db_vulnerability


@router.put("/{id}", response_model=VulnerabilityResponse)
def update_vulnerability(id: int, vulnerability: VulnerabilityUpdate, db: Session = Depends(get_db)):
    """Update an existing vulnerability."""
    db_vulnerability = db.query(Vulnerability).filter(Vulnerability.id == id).first()
    if not db_vulnerability:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerability not found")

    update_data = vulnerability.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_vulnerability, field, value)

    db.commit()
    db.refresh(db_vulnerability)
    return db_vulnerability


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vulnerability(id: int, db: Session = Depends(get_db)):
    """Delete a vulnerability."""
    db_vulnerability = db.query(Vulnerability).filter(Vulnerability.id == id).first()
    if not db_vulnerability:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vulnerability not found")

    db.delete(db_vulnerability)
    db.commit()
    return None
