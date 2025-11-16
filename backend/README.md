# Nova Backend API

Backend API for the Nova Platform built with FastAPI and PostgreSQL.

## Features

- **Application Registry**: Manage application metadata and relationships
- **Team Management**: Organize teams and ownership
- **Dependency Graph**: Track application dependencies
- **Datastore Management**: Monitor databases and storage systems
- **Issue Knowledgebase**: Document known issues and resolutions
- **Vulnerability Tracking**: Monitor and manage security vulnerabilities

## Prerequisites

- Python 3.9+
- PostgreSQL 14+
- pip (Python package manager)

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the database connection settings in `.env`:

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=nova
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
```

### 3. Create Database

Make sure PostgreSQL is running and create the database:

```bash
createdb nova
```

Or using psql:

```sql
CREATE DATABASE nova;
```

### 4. Run Database Migrations

Apply the database schema using Alembic:

```bash
alembic upgrade head
```

### 5. Seed Initial Data

Populate the database with data from the frontend JSON files:

```bash
python scripts/seed_database.py
```

## Running the Application

### Development Server

Start the FastAPI development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Interactive API docs: http://localhost:8000/docs
- Alternative API docs: http://localhost:8000/redoc

### Production Server

For production, use uvicorn without the `--reload` flag:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Applications
- `GET /applications` - List all applications
- `GET /applications/{id}` - Get application details
- `POST /applications` - Create new application
- `PUT /applications/{id}` - Update application
- `DELETE /applications/{id}` - Delete application
- `GET /applications/{id}/dependencies` - Get application dependencies
- `GET /applications/{id}/dependencies/outbound` - Get outbound dependencies
- `GET /applications/{id}/dependencies/inbound` - Get inbound dependencies
- `GET /applications/{id}/issues` - Get application issues
- `GET /applications/{id}/vulnerabilities` - Get application vulnerabilities

### Teams
- `GET /teams` - List all teams
- `GET /teams/{id}` - Get team details
- `POST /teams` - Create new team
- `PUT /teams/{id}` - Update team
- `DELETE /teams/{id}` - Delete team
- `GET /teams/{id}/applications` - Get team's applications

### Dependencies
- `GET /dependencies` - List all dependencies
- `POST /dependencies` - Create new dependency
- `DELETE /dependencies/{id}` - Delete dependency

### Datastores
- `GET /datastores` - List all datastores
- `GET /datastores/{id}` - Get datastore details
- `POST /datastores` - Create new datastore
- `PUT /datastores/{id}` - Update datastore
- `DELETE /datastores/{id}` - Delete datastore

### Issues
- `GET /issues/{id}` - Get issue details
- `POST /issues` - Create new issue
- `PUT /issues/{id}` - Update issue
- `DELETE /issues/{id}` - Delete issue

### Vulnerabilities
- `GET /vulnerabilities` - List all vulnerabilities
- `POST /vulnerabilities` - Create new vulnerability
- `PUT /vulnerabilities/{id}` - Update vulnerability
- `DELETE /vulnerabilities/{id}` - Delete vulnerability

### Health Check
- `GET /health` - Health check endpoint

## Database Management

### Create a New Migration

After modifying models, create a new migration:

```bash
alembic revision --autogenerate -m "description of changes"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback Migrations

```bash
alembic downgrade -1
```

## Project Structure

```
backend/
├── alembic/                 # Database migrations
│   ├── versions/           # Migration scripts
│   └── env.py             # Alembic configuration
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI application entry point
│   ├── config.py          # Configuration management
│   ├── database.py        # Database connection and session
│   ├── models/            # SQLAlchemy models
│   │   ├── application.py
│   │   ├── team.py
│   │   ├── dependency.py
│   │   ├── datastore.py
│   │   ├── issue.py
│   │   └── vulnerability.py
│   ├── schemas/           # Pydantic schemas
│   │   ├── application.py
│   │   ├── team.py
│   │   ├── dependency.py
│   │   ├── datastore.py
│   │   ├── issue.py
│   │   └── vulnerability.py
│   └── routers/           # API route handlers
│       ├── applications.py
│       ├── teams.py
│       ├── dependencies.py
│       ├── datastores.py
│       ├── issues.py
│       └── vulnerabilities.py
├── scripts/
│   └── seed_database.py   # Database seeding script
├── .env.example           # Example environment variables
├── alembic.ini           # Alembic configuration
├── requirements.txt      # Python dependencies
└── README.md            # This file
```

## Development Tips

### Interactive API Documentation

FastAPI automatically generates interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Database Inspection

Connect to the database using psql:

```bash
psql -h localhost -U postgres -d nova
```

View tables:

```sql
\dt
```

Query data:

```sql
SELECT * FROM applications;
```

## Future Enhancements

The following features are planned for future implementation:

- Authentication and RBAC (JWT with Entra ID)
- Embedding generation for semantic search (Qdrant integration)
- AI Chat Module (RAG + LLM integration)
- System and Admin endpoints
- Metrics and monitoring (Prometheus)
- Audit logging

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:
1. Verify PostgreSQL is running
2. Check `.env` configuration
3. Ensure the database exists
4. Verify user permissions

### Migration Issues

If migrations fail:
1. Check the database schema manually
2. Try running `alembic downgrade -1` and then `alembic upgrade head`
3. If necessary, drop and recreate the database (development only)

### Seeding Issues

If seeding fails:
1. Ensure the frontend JSON files exist
2. Verify the database is empty or truncate tables
3. Check for foreign key constraint violations
