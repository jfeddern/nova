Below is a complete, clear, and implementation-ready description of your backend API.
This defines all services, endpoints, data flows, and functional + non-functional requirements for your Nova Platform using:

* PostgreSQL (system-of-record)
* Qdrant (vector search)
* Single Backend Application (modular monolith)

✅ 1. High-Level Backend Architecture

Your backend consists of 9 logical modules, all running inside one application:

* Auth & RBAC Module
* Application Registry Module
* Team Management Module
* Dependency Graph Module
* Datastore Module
* Issue Knowledgebase Module
* Vulnerability Module
* Embedding + Search Module (Qdrant)
* AI Chat Module (RAG + LLM Integration)

Each module exposes REST endpoints.

2. Authentication + Authorization (Global Requirement)
Auth Requirements

Must use JWT (Entra ID)

Backend must validate:

* Token signature
* Expiry

Roles / scopes
| Role        | Capabilities                               |
| ----------- | ------------------------------------------ |
| **viewer**  | Read-only access                           |
| **support** | Can view issues, suggestions, dependencies |
| **editor**  | CRUD for applications, teams, dependencies |
| **admin**   | Full access + system settings              |

RBAC enforcement (global)

All endpoints must include:

* role: [viewer|support|editor|admin]
* Deny by default

🏛 3. Application Registry Module

Stores all metadata describing an application.

Requirements
* CRUD operations
* Search & filter support
* Linking to teams
* Linking to dependencies
* Embedding generation for semantic search

Endpoints
GET    /applications
GET    /applications/{id}
POST   /applications
PUT    /applications/{id}
DELETE /applications/{id}

GET    /applications/{id}/dependencies
GET    /applications/{id}/datastores
GET    /applications/{id}/issues
GET    /applications/{id}/vulnerabilities


Data Model

* id
* name
* description
* owner_team_id
* department
* category
* tags
* external_links (list of {title,url})
* version
* created_at
* updated_at

Vector Storage

On create/update → generate embedding
Store in Qdrant collection applications

4. Team Management Module
Requirements

* Manage teams & owners
* Store Slack/Teams channels
* Store team documentation links
* Store operational schedules (optional)

Endpoints
GET    /teams
GET    /teams/{id}
POST   /teams
PUT    /teams/{id}
DELETE /teams/{id}

GET    /teams/{id}/applications

Data Model
* id
* name
* description
* department
* contact_email
* chat_channel (Teams/Slack)
* lead_name
* lead_email
* member_count
* tags
* custom_links

🔗 5. Dependency Graph Module
Requirements

* Store directed relationships between applications
* Support reverse dependency lookup
* Allow service → datastore dependencies
* Allow service → external system dependencies

Endpoints
GET    /dependencies
POST   /dependencies
DELETE /dependencies/{id}

GET    /applications/{id}/dependencies/outbound
GET    /applications/{id}/dependencies/inbound

Data Model

* id
* source_application_id
* target_application_id
* type (HTTP, Kafka, Queue, DB, External API, Event Stream)
* description

6. Datastores Module
   Requirements

* Track databases, queues, buckets, search indices, etc.
* Link them to applications
* Show health, version, region, size (optional)

Endpoints
GET    /datastores
GET    /datastores/{id}
POST   /datastores
PUT    /datastores/{id}
DELETE /datastores/{id}

GET    /datastores/{id}/applications

Data model
* id
* name
* type (postgres, mysql, redis, S3, mongo, etc.)
* version
* region
* storage_size
* endpoint

7. Issue Knowledgebase Module
Used by L1/L2 support and stored per application—critical for the AI chatbot.

Requirements

Each issue must have:
* problem description
* common user symptoms
* known causes
* recommended troubleshooting steps
* severity (info, warning, critical)
* Must support search
* Must embed content into Qdrant

Endpoints
GET    /applications/{id}/issues
GET    /issues/{id}
POST   /issues
PUT    /issues/{id}
DELETE /issues/{id}

Data Model

* id
* application_id
* title
* description
* symptoms
* causes
* troubleshooting_steps
* severity
* tags
* created_at
* updated_at

Vector Storage

* Collection: issues
* On every create/update: generate embedding

8. Vulnerability Module
   Requirements

Store vulnerabilities imported from third-party scanners

* Allow linking to applications
* Allow marking as resolved
* Provide quick filters
* Store CVSS score

Endpoints
GET    /applications/{id}/vulnerabilities
GET    /vulnerabilities
POST   /vulnerabilities
PUT    /vulnerabilities/{id}
DELETE /vulnerabilities/{id}

Data Model

* id
* application_id
* title
* description
* severity (low, medium, high, critical)
* cvss_score
* affected_component
* status (open, acknowledged, fixed)
* updated_at
* external_reference (CVE link)

9. Embedding + Search Module (Qdrant)
Requirements

* Perform semantic search across applications + issues
* Hybrid search (text search + vector search)
* Soft delete support
* Versioning of embeddings

Endpoints
POST /search/semantic
POST /search/hybrid
POST /embeddings/applications/{id}
POST /embeddings/issues/{id}

Workflow

* Extract text fields
* Generate embedding via Bedrock Titan
* Write to Qdrant
* Update PostgreSQL record embedding timestamp

10. AI Chat Module (RAG + LLM)
Purpose
Provides the chatbot functionality in Nova.

Requirements

* Integrate Qdrant search
* Integrate PostgreSQL lookups
* Provide clear answer citations
* Support function-calling (optional)
* Rate limit to prevent misuse
* Log all chats for audit

Endpoints
POST /chat/completions

Chat Flow

* User sends question
* Backend uses Qdrant to pull:
* related applications
* related issues
* related dependencies
* Backend retrieves structured metadata from Postgres
* Backend builds a RAG prompt
* Backend calls LLM
* Return structured answer to UI

11. System & Admin Endpoints

Endpoints
GET    /system/status
GET    /system/metrics
GET    /system/auditlogs
POST   /admin/reindex
POST   /admin/sync-embeddings

Requirements

* Health checks
* Telemetry
* Embedding re-index jobs
* Audit log access only for admin role

12. Non-Functional Requirements
Performance

* API response < 150ms for CRUD
* Semantic search < 600ms

Scalability

* Must support 10–20 users with effortless performance
* Deployable as single Kubernetes deployment

Observability

* All logs include correlation IDs
* Prometheus metrics for monitoring


# Priorization

Don't implement the authentication component 2. requirement until now.
Also don't implement the requirements about the AI chatbot and the systems & admin endpoints and the Embedding + Search Module (Qdrant)