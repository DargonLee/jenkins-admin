# Technology Stack

## Core Framework
- **FastAPI**: Modern Python web framework with automatic API documentation
- **Uvicorn**: ASGI server for running FastAPI applications
- **Pydantic**: Data validation and settings management using Python type annotations

## Database & ORM
- **PostgreSQL**: Primary database for persistent storage
- **SQLAlchemy 2.0**: Modern Python SQL toolkit and ORM
- **Alembic**: Database migration tool for SQLAlchemy

## Caching & Task Queue
- **Redis**: In-memory data store for caching and message brokering
- **Celery**: Distributed task queue for background job processing

## External Integrations
- **python-jenkins**: Official Jenkins API client library

## Security & Authentication
- **python-jose**: JWT token handling with cryptographic support
- **passlib**: Password hashing with bcrypt
- **python-multipart**: Form data parsing for file uploads

## Configuration & Environment
- **pydantic-settings**: Environment-based configuration management
- **python-dotenv**: Load environment variables from .env files

## Logging & Monitoring
- **structlog**: Structured logging library
- **python-json-logger**: JSON formatted logging output

## Development Tools
- **pytest**: Testing framework with async support
- **black**: Code formatter
- **isort**: Import statement organizer
- **flake8**: Code linting
- **mypy**: Static type checking

## Common Commands

### Development Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Database migrations
alembic revision --autogenerate -m "Migration message"
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Code Quality
```bash
# Format code
black .
isort .

# Lint and type check
flake8
mypy .

# Run tests
pytest
```

### Production Deployment
```bash
# Start production server
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Start Celery worker
celery -A app.celery worker --loglevel=info
```