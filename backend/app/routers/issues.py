# Issue Knowledgebase API endpoints for managing application troubleshooting knowledge.
# Provides CRUD operations for issue documentation and resolution steps.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Issue, Application
from app.schemas.issue import IssueCreate, IssueUpdate, IssueResponse

router = APIRouter(prefix="/issues", tags=["issues"])


@router.get("/{id}", response_model=IssueResponse)
def get_issue(id: int, db: Session = Depends(get_db)):
    """Get issue by ID."""
    issue = db.query(Issue).filter(Issue.id == id).first()
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")
    return issue


@router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def create_issue(issue: IssueCreate, db: Session = Depends(get_db)):
    """Create a new issue."""
    # Verify application exists
    application = db.query(Application).filter(Application.id == issue.application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application {issue.application_id} not found"
        )

    db_issue = Issue(**issue.model_dump())
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)

    # TODO: Generate embedding for semantic search (placeholder)

    return db_issue


@router.put("/{id}", response_model=IssueResponse)
def update_issue(id: int, issue: IssueUpdate, db: Session = Depends(get_db)):
    """Update an existing issue."""
    db_issue = db.query(Issue).filter(Issue.id == id).first()
    if not db_issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")

    update_data = issue.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_issue, field, value)

    db.commit()
    db.refresh(db_issue)

    # TODO: Update embedding for semantic search (placeholder)

    return db_issue


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(id: int, db: Session = Depends(get_db)):
    """Delete an issue."""
    db_issue = db.query(Issue).filter(Issue.id == id).first()
    if not db_issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found")

    db.delete(db_issue)
    db.commit()
    return None
