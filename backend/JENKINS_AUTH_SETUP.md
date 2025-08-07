# Jenkins Authentication Setup

I've updated your Jenkins service to follow proper authentication practices based on the Jenkins documentation. Here's what changed and how to set it up:

## What Changed

### 1. Removed Hardcoded Credentials
- ❌ Before: Hardcoded username and token in the service
- ✅ Now: Uses environment variables with proper validation

### 2. Improved Authentication Logic
- Prioritizes API tokens over passwords
- Validates credentials during initialization
- Provides detailed logging about authentication method used

### 3. Added Connection Testing
- New `test_connection()` method in JenkinsService
- New `/jenkins/test-connection` API endpoint
- Standalone test script for validation

## Setup Instructions

### Step 1: Configure Environment Variables

Edit your `.env` file:

```bash
# Required
JENKINS_URL=http://your-jenkins-server:8080
JENKINS_USERNAME=your_username

# Choose ONE authentication method:

# Option A: API Token (Recommended)
JENKINS_API_TOKEN=your_api_token_here

# Option B: Password (Development only)
# JENKINS_PASSWORD=your_password
```

### Step 2: Generate API Token (Recommended)

**Manual Method:**
1. Go to Jenkins → Your Username → Configure
2. Scroll to "API Token" section
3. Click "Add new Token"
4. Enter name: "Jenkins Admin Backend"
5. Click "Generate"
6. Copy the token immediately
7. Add to `.env`: `JENKINS_API_TOKEN=your_token_here`

**Programmatic Method:**
```bash
python scripts/generate_jenkins_token.py
```

### Step 3: Test Your Configuration

Run the authentication test:
```bash
python test_jenkins_auth.py
```

This will verify:
- ✅ Connection to Jenkins server
- ✅ Authentication credentials
- ✅ Basic permissions (read jobs, get user info)
- ✅ API access

### Step 4: Test via API

Start your FastAPI server:
```bash
uvicorn app.main:app --reload
```

Test the connection endpoint:
```bash
curl http://localhost:8000/jenkins/test-connection
```

## Security Best Practices

### ✅ Do:
- Use API tokens in production
- Store credentials in environment variables
- Rotate tokens regularly
- Use descriptive token names
- Test connections before deployment

### ❌ Don't:
- Hardcode credentials in source code
- Use passwords in production
- Share tokens in version control
- Use overly permissive Jenkins users

## Troubleshooting

### Common Issues:

**401 Unauthorized**
- Check username and token/password are correct
- Verify token hasn't expired or been revoked

**403 Forbidden**
- User needs proper Jenkins permissions:
  - Overall/Read
  - Job/Build
  - Job/Read
  - Job/Workspace

**Connection Refused**
- Verify JENKINS_URL is correct
- Check if Jenkins server is running
- Verify network connectivity

### Debug Steps:

1. Run `python test_jenkins_auth.py`
2. Check the logs for detailed error messages
3. Verify environment variables are loaded correctly
4. Test with curl to isolate API vs service issues

## Files Created/Modified

- ✅ `app/services/jenkins_service.py` - Updated authentication logic
- ✅ `app/core/config.py` - Removed hardcoded defaults
- ✅ `app/api/endpoints/jenkins.py` - Added test endpoint
- ✅ `.env` - Updated with proper configuration template
- ✅ `docs/jenkins_authentication.md` - Comprehensive guide
- ✅ `test_jenkins_auth.py` - Standalone test script
- ✅ `scripts/generate_jenkins_token.py` - Token generation helper

Your Jenkins service is now properly configured for secure authentication! 🎉