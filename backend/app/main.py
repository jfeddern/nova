# Main FastAPI application entry point for the Nova backend API.
# Configures CORS, registers all routers, and provides health check endpoint.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import applications, teams, dependencies, datastores, issues, vulnerabilities

app = FastAPI(
    title="Nova Backend API",
    description="Backend API for Nova Platform - Application Registry, Team Management, and more",
    version="0.1.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(applications.router)
app.include_router(teams.router)
app.include_router(dependencies.router)
app.include_router(datastores.router)
app.include_router(issues.router)
app.include_router(vulnerabilities.router)


@app.get("/")
def root():
    """Root endpoint returning API information."""
    return {
        "name": "Nova Backend API",
        "version": "0.1.0",
        "status": "running",
    }


@app.get("/health")
def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}
