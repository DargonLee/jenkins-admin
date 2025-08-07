# Jenkins Authentication Guide

This guide explains how to properly authenticate with Jenkins using the recommended methods.

## Authentication Methods

### 1. API Token (Recommended)

API tokens are the recommended way to authenticate with Jenkins for security reasons:

**Advantages:**
- More secure than passwords
- Can be revoked without changing the user password
- Specific to applications/scripts
- Doesn't expire with password changes

**How to create an API Token:**

1. Log into your Jenkins instance
2. Click on your username in the top-right corner
3. Click "Configure" 
4. Scroll down to the "API Token" section
5. Click "Add new Token"
6. Give it a descriptive name (e.g., "Jenkins Admin Backend")
7. Click "Generate"
8. Copy the generated token immediately (you won't be able to see it again)

**Configuration:**
```bash
# In your .env file
JENKINS_USERNAME=your_username
JENKINS_API_TOKEN=your_generated_token_here
```

### 2. Username/Password (Development Only)

Only use this method in development environments:

```bash
# In your .env file
JENKINS_USERNAME=your_username
JENKINS_PASSWORD=your_password
```

## Security Best Practices

1. **Never hardcode credentials** in your source code
2. **Use API tokens** instead of passwords in production
3. **Rotate tokens regularly** for enhanced security
4. **Use environment variables** to store sensitive information
5. **Limit token scope** if your Jenkins version supports it

## Testing Authentication

The service will automatically test the connection during initialization and log the authentication method used:

```python
# Successful connection log example
logger.info(
    "Jenkins 服务初始化成功", 
    url="http://localhost:8080",
    username="admin",
    authenticated_user="Administrator",
    auth_method="API Token"
)
```

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**: Check username and token/password
2. **403 Forbidden**: User doesn't have sufficient permissions
3. **Connection refused**: Jenkins server is not running or URL is incorrect

### Required Jenkins Permissions:

Your Jenkins user needs the following permissions:
- Overall/Read
- Job/Build
- Job/Read
- Job/Workspace (for console output)

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `JENKINS_URL` | Yes | Jenkins server URL |
| `JENKINS_USERNAME` | Yes | Jenkins username |
| `JENKINS_API_TOKEN` | No* | API token (recommended) |
| `JENKINS_PASSWORD` | No* | User password (development only) |

*Either `JENKINS_API_TOKEN` or `JENKINS_PASSWORD` must be provided.