# Datastore Management API endpoints for tracking databases and storage systems.
# Provides CRUD operations for datastores like databases, queues, and buckets.

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models import Datastore
from app.schemas.datastore import DatastoreCreate, DatastoreUpdate, DatastoreResponse

router = APIRouter(prefix="/datastores", tags=["datastores"])


@router.get("", response_model=List[DatastoreResponse])
def get_datastores(db: Session = Depends(get_db)):
    """Get all datastores."""
    datastores = db.query(Datastore).all()
    return datastores


@router.get("/{id}", response_model=DatastoreResponse)
def get_datastore(id: str, db: Session = Depends(get_db)):
    """Get datastore by ID."""
    datastore = db.query(Datastore).filter(Datastore.id == id).first()
    if not datastore:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Datastore not found")
    return datastore


@router.post("", response_model=DatastoreResponse, status_code=status.HTTP_201_CREATED)
def create_datastore(datastore: DatastoreCreate, db: Session = Depends(get_db)):
    """Create a new datastore."""
    # Check if datastore with same ID already exists
    existing = db.query(Datastore).filter(Datastore.id == datastore.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Datastore ID already exists")

    db_datastore = Datastore(**datastore.model_dump())
    db.add(db_datastore)
    db.commit()
    db.refresh(db_datastore)
    return db_datastore


@router.put("/{id}", response_model=DatastoreResponse)
def update_datastore(id: str, datastore: DatastoreUpdate, db: Session = Depends(get_db)):
    """Update an existing datastore."""
    db_datastore = db.query(Datastore).filter(Datastore.id == id).first()
    if not db_datastore:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Datastore not found")

    update_data = datastore.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_datastore, field, value)

    db.commit()
    db.refresh(db_datastore)
    return db_datastore


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_datastore(id: str, db: Session = Depends(get_db)):
    """Delete a datastore."""
    db_datastore = db.query(Datastore).filter(Datastore.id == id).first()
    if not db_datastore:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Datastore not found")

    db.delete(db_datastore)
    db.commit()
    return None


# TODO: Add GET /datastores/{id}/applications endpoint when datastore-application relationship is defined
