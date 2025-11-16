# Database seeding script to populate initial data from frontend JSON files.
# Reads JSON data from frontend and inserts it into PostgreSQL database.

import json
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import Application, Team, Dependency, Datastore, Issue, Vulnerability


def load_json_file(file_path: Path):
    """Load and parse a JSON file."""
    with open(file_path, 'r') as f:
        return json.load(f)


def seed_teams(db: Session, teams_data: list):
    """Seed teams from JSON data."""
    print("Seeding teams...")
    team_id_map = {}  # Map team name to team ID

    for team_item in teams_data:
        # Convert customLinks to JSON string
        custom_links_str = json.dumps(team_item.get('customLinks', [])) if team_item.get('customLinks') else None

        team = Team(
            id=team_item['id'],
            name=team_item['name'],
            description=team_item.get('description'),
            department=team_item.get('department'),
            contact_email=team_item.get('contact_email'),
            chat_channel=team_item.get('teams_channel'),
            lead_name=team_item.get('lead_name'),
            lead_email=team_item.get('lead_email'),
            member_count=team_item.get('member_count'),
            tags=team_item.get('tags', []),
            custom_links=custom_links_str
        )
        db.add(team)
        team_id_map[team_item['name']] = team_item['id']

    db.commit()
    print(f"Seeded {len(teams_data)} teams")
    return team_id_map


def seed_applications(db: Session, apps_data: list, team_id_map: dict):
    """Seed applications from JSON data."""
    print("Seeding applications...")
    dependency_list = []

    for app_item in apps_data:
        # Map owner team name to team ID
        owner_team_name = app_item.get('owner', {}).get('team')
        owner_team_id = team_id_map.get(owner_team_name) if owner_team_name else None

        # Convert external links to JSON string if exists
        external_links = app_item.get('externalLinks')
        external_links_str = json.dumps(external_links) if external_links else None

        application = Application(
            id=app_item['id'],
            name=app_item['name'],
            description=app_item.get('description'),
            owner_team_id=owner_team_id,
            department=app_item.get('department'),
            category=app_item.get('category'),
            tags=app_item.get('tags', []),
            external_links=external_links_str,
            version=app_item.get('version')
        )
        db.add(application)

        # Store dependencies for later processing
        if 'dependencies' in app_item:
            for dep_name in app_item['dependencies']:
                dependency_list.append({
                    'source': app_item['id'],
                    'target_name': dep_name
                })

    db.commit()
    print(f"Seeded {len(apps_data)} applications")
    return dependency_list


def seed_dependencies(db: Session, dependency_list: list, app_id_map: dict):
    """Seed dependencies from collected data."""
    print("Seeding dependencies...")
    created_count = 0

    for dep_item in dependency_list:
        source_id = dep_item['source']
        target_name = dep_item['target_name']

        # Try to find target application by name (case-insensitive)
        target_id = app_id_map.get(target_name.lower())

        if target_id:
            dependency = Dependency(
                source_application_id=source_id,
                target_application_id=target_id,
                type="HTTP",  # Default type, can be enhanced later
                description=f"Dependency from {source_id} to {target_id}"
            )
            db.add(dependency)
            created_count += 1

    db.commit()
    print(f"Seeded {created_count} dependencies")


def seed_datastores(db: Session, platform_tools_data: list):
    """Seed datastores from platform tools JSON data."""
    print("Seeding datastores...")

    for tool_item in platform_tools_data:
        datastore = Datastore(
            id=tool_item['id'],
            name=tool_item['name'],
            type=tool_item.get('type', 'unknown'),
            version=tool_item.get('version'),
            region=tool_item.get('region'),
            storage_size=tool_item.get('storage_size'),
            endpoint=tool_item.get('endpoint')
        )
        db.add(datastore)

    db.commit()
    print(f"Seeded {len(platform_tools_data)} datastores")


def seed_issues(db: Session, issues_data: list):
    """Seed issues from known issues JSON data."""
    print("Seeding issues...")

    for issue_item in issues_data:
        # Convert arrays to text
        symptoms_text = '\n'.join(issue_item.get('symptoms', [])) if issue_item.get('symptoms') else None
        causes_text = '\n'.join(issue_item.get('possible_causes', [])) if issue_item.get('possible_causes') else None
        steps_text = '\n'.join(issue_item.get('resolution_steps', [])) if issue_item.get('resolution_steps') else None

        issue = Issue(
            application_id=issue_item['application_id'],
            title=issue_item['title'],
            description=issue_item.get('description'),
            symptoms=symptoms_text,
            causes=causes_text,
            troubleshooting_steps=steps_text,
            severity=issue_item.get('severity', 'info').lower(),
            tags=issue_item.get('tags', [])
        )
        db.add(issue)

    db.commit()
    print(f"Seeded {len(issues_data)} issues")


def seed_vulnerabilities(db: Session, vulns_data: list):
    """Seed vulnerabilities from JSON data."""
    print("Seeding vulnerabilities...")

    for vuln_item in vulns_data:
        # Map CVE to title if no title exists
        title = vuln_item.get('cve_id', 'Unknown Vulnerability')

        # Get first reference as external reference
        references = vuln_item.get('references', [])
        external_ref = references[0] if references else None

        vulnerability = Vulnerability(
            application_id=vuln_item['application_id'],
            title=title,
            description=vuln_item.get('description'),
            severity=vuln_item.get('severity', 'medium').lower(),
            cvss_score=vuln_item.get('cvss_score'),
            affected_component=vuln_item.get('package'),
            status=vuln_item.get('status', 'open').lower(),
            external_reference=external_ref
        )
        db.add(vulnerability)

    db.commit()
    print(f"Seeded {len(vulns_data)} vulnerabilities")


def main():
    """Main seeding function."""
    print("Starting database seeding...")

    # Get path to frontend data directory
    frontend_data_dir = Path(__file__).parent.parent.parent / 'frontend' / 'src' / 'data'

    if not frontend_data_dir.exists():
        print(f"Error: Frontend data directory not found at {frontend_data_dir}")
        return

    # Create tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    # Create database session
    db = SessionLocal()

    try:
        # Load JSON data
        teams_data = load_json_file(frontend_data_dir / 'teams.json')
        apps_data = load_json_file(frontend_data_dir / 'applications.json')
        platform_tools_data = load_json_file(frontend_data_dir / 'platformTools.json')
        issues_data = load_json_file(frontend_data_dir / 'knownIssues.json')
        vulns_data = load_json_file(frontend_data_dir / 'vulnerabilities.json')

        # Seed in order (respecting foreign key constraints)
        team_id_map = seed_teams(db, teams_data)

        # Create app ID map for dependency resolution
        app_id_map = {app['name'].lower(): app['id'] for app in apps_data}

        dependency_list = seed_applications(db, apps_data, team_id_map)
        seed_dependencies(db, dependency_list, app_id_map)
        seed_datastores(db, platform_tools_data)
        seed_issues(db, issues_data)
        seed_vulnerabilities(db, vulns_data)

        print("\nDatabase seeding completed successfully!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
