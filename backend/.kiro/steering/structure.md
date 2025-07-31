# Project Structure & Organization

## Directory Layout

```
backend/
├── app/                    # Main application package
│   ├── api/               # API layer
│   │   ├── endpoints/     # API route handlers
│   │   ├── deps.py        # Dependency injection
│   │   └── main.py        # API router configuration
│   ├── core/              # Core configuration and settings
│   ├── models/            # SQLAlchemy database models
│   ├── schemas/           # Pydantic request/response schemas
│   ├── services/          # Business logic layer
│   └── utils/             # Utility functions and helpers
├── alembic/               # Database migration files
├── tests/                 # Test files (mirrors app structure)
├── docs/                  # Documentation files
├── requirements.txt       # Python dependencies
└── .env                   # Environment configuration
```

## Architecture Patterns

### Layered Architecture
- **API Layer** (`app/api/`): FastAPI routers and endpoint handlers
- **Service Layer** (`app/services/`): Business logic and external integrations
- **Data Layer** (`app/models/`): Database models and data access
- **Schema Layer** (`app/schemas/`): Request/response validation models

### Dependency Injection
- Use FastAPI's dependency injection system for service instantiation
- Common dependencies defined in `app/api/deps.py`
- Service dependencies injected at the endpoint level

### Configuration Management
- Environment-based configuration using Pydantic Settings
- All configuration centralized in `app/core/`
- Sensitive values loaded from environment variables

## File Naming Conventions

### Python Files
- Use snake_case for all Python files and directories
- Service files: `{domain}_service.py` (e.g., `jenkins_service.py`)
- Model files: `{entity}.py` (e.g., `user.py`, `build_log.py`)
- Schema files: `{entity}.py` (e.g., `user.py`, `build_log.py`)

### API Endpoints
- Group related endpoints in files named after the resource
- Use plural nouns for resource collections (e.g., `users.py`, `projects.py`)
- Router prefix should match the filename

### Database Models
- One model per file when models are complex
- Related models can be grouped in a single file
- Use singular nouns for model class names

## Import Organization

### Import Order (enforced by isort)
1. Standard library imports
2. Third-party library imports
3. Local application imports

### Relative vs Absolute Imports
- Use absolute imports from the app root: `from app.services.jenkins_service import JenkinsService`
- Avoid relative imports except for closely related modules

## Code Organization Principles

### Single Responsibility
- Each service handles one domain area (Jenkins, users, projects, etc.)
- Endpoints should be thin wrappers around service calls
- Business logic belongs in services, not endpoints

### Separation of Concerns
- Database models define data structure only
- Schemas handle serialization/validation
- Services contain business logic
- Endpoints handle HTTP concerns

### Error Handling
- Use FastAPI's HTTPException for API errors
- Custom exceptions defined in `app/utils/exceptions.py`
- Consistent error response format across all endpoints