# Team Management API endpoints for managing organizational teams.
# Provides CRUD operations and application relationship queries for teams.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Team, Application
from app.schemas.team import TeamCreate, TeamUpdate, TeamResponse
from app.schemas.application import ApplicationResponse

router = APIRouter(prefix="/teams", tags=["teams"])


@router.get("", response_model=List[TeamResponse])
def get_teams(db: Session = Depends(get_db)):
    """Get all teams."""
    teams = db.query(Team).all()
    return teams


@router.get("/{id}", response_model=TeamResponse)
def get_team(id: str, db: Session = Depends(get_db)):
    """Get team by ID."""
    team = db.query(Team).filter(Team.id == id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")
    return team


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    """Create a new team."""
    # Check if team with same ID already exists
    existing = db.query(Team).filter(Team.id == team.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Team ID already exists")

    db_team = Team(**team.model_dump())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team


@router.put("/{id}", response_model=TeamResponse)
def update_team(id: str, team: TeamUpdate, db: Session = Depends(get_db)):
    """Update an existing team."""
    db_team = db.query(Team).filter(Team.id == id).first()
    if not db_team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    update_data = team.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_team, field, value)

    db.commit()
    db.refresh(db_team)
    return db_team


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(id: str, db: Session = Depends(get_db)):
    """Delete a team."""
    db_team = db.query(Team).filter(Team.id == id).first()
    if not db_team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    db.delete(db_team)
    db.commit()
    return None


@router.get("/{id}/applications", response_model=List[ApplicationResponse])
def get_team_applications(id: str, db: Session = Depends(get_db)):
    """Get all applications owned by a team."""
    team = db.query(Team).filter(Team.id == id).first()
    if not team:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Team not found")

    applications = db.query(Application).filter(Application.owner_team_id == id).all()
    return applications
