# Database connection and session management using SQLAlchemy.
# Provides database engine, session factory, and dependency injection for routes.

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency for injecting database sessions into route handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
