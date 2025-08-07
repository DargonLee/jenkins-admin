#!/usr/bin/env python3
"""
Jenkins Authentication Test Script

This script helps you test different authentication methods with Jenkins
before using them in the main application.
"""

import os
import sys
from typing import Dict, Any
import jenkins
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_jenkins_connection() -> Dict[str, Any]:
    """Test Jenkins connection with current configuration"""
    
    # Get configuration from environment
    jenkins_url = os.getenv('JENKINS_URL', 'http://localhost:8080')
    jenkins_username = os.getenv('JENKINS_USERNAME')
    jenkins_api_token = os.getenv('JENKINS_API_TOKEN')
    jenkins_password = os.getenv('JENKINS_PASSWORD')
    
    print("=== Jenkins Authentication Test ===")
    print(f"Jenkins URL: {jenkins_url}")
    print(f"Username: {jenkins_username}")
    
    if not jenkins_username:
        return {
            "success": False,
            "error": "JENKINS_USERNAME not set in environment"
        }
    
    # Determine authentication method
    auth_credential = jenkins_api_token or jenkins_password
    auth_method = "API Token" if jenkins_api_token else "Password"
    
    if not auth_credential:
        return {
            "success": False,
            "error": "Neither JENKINS_API_TOKEN nor JENKINS_PASSWORD is set"
        }
    
    print(f"Auth method: {auth_method}")
    print(f"Credential: {'*' * len(auth_credential[:4]) + auth_credential[:4] if len(auth_credential) > 4 else '****'}")
    
    try:
        # Create Jenkins connection
        server = jenkins.Jenkins(
            jenkins_url,
            username=jenkins_username,
            password=auth_credential
        )
        
        # Test basic operations
        print("\n=== Testing Connection ===")
        
        # Test 1: Get user info
        user_info = server.get_whoami()
        print(f"✓ Authentication successful")
        print(f"  Authenticated as: {user_info.get('fullName', 'Unknown')}")
        print(f"  User ID: {user_info.get('id', 'Unknown')}")
        
        # Test 2: Get version
        version = server.get_version()
        print(f"✓ Jenkins version: {version}")
        
        # Test 3: Get jobs (basic permission test)
        jobs = server.get_jobs()
        print(f"✓ Can access jobs: {len(jobs)} jobs found")
        
        # Test 4: Get server info
        info = server.get_info()
        print(f"✓ Server info accessible")
        print(f"  Mode: {info.get('mode', 'Unknown')}")
        print(f"  Node description: {info.get('nodeDescription', 'Unknown')}")
        
        return {
            "success": True,
            "user_info": user_info,
            "version": version,
            "job_count": len(jobs),
            "auth_method": auth_method
        }
        
    except jenkins.JenkinsException as e:
        error_msg = f"Jenkins API Error: {str(e)}"
        print(f"✗ {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "error_type": "JenkinsException"
        }
    except Exception as e:
        error_msg = f"Connection Error: {str(e)}"
        print(f"✗ {error_msg}")
        return {
            "success": False,
            "error": error_msg,
            "error_type": type(e).__name__
        }

def print_setup_instructions():
    """Print setup instructions for Jenkins authentication"""
    print("\n=== Setup Instructions ===")
    print("1. API Token Method (Recommended):")
    print("   - Go to Jenkins -> User -> Configure")
    print("   - Scroll to 'API Token' section")
    print("   - Click 'Add new Token'")
    print("   - Copy the generated token")
    print("   - Set in .env: JENKINS_API_TOKEN=your_token_here")
    print()
    print("2. Password Method (Development only):")
    print("   - Set in .env: JENKINS_PASSWORD=your_password")
    print()
    print("3. Required environment variables:")
    print("   - JENKINS_URL=http://your-jenkins-server:8080")
    print("   - JENKINS_USERNAME=your_username")
    print("   - JENKINS_API_TOKEN=your_token (or JENKINS_PASSWORD)")

if __name__ == "__main__":
    result = test_jenkins_connection()
    
    if result["success"]:
        print(f"\n🎉 Jenkins authentication test PASSED!")
        print("Your configuration is working correctly.")
    else:
        print(f"\n❌ Jenkins authentication test FAILED!")
        print(f"Error: {result['error']}")
        print_setup_instructions()
        sys.exit(1)