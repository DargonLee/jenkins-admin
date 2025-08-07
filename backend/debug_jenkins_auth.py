#!/usr/bin/env python3
"""
Debug Jenkins Authentication
Quick script to test different auth methods
"""

import jenkins
import os
from dotenv import load_dotenv

load_dotenv()

def test_auth_methods():
    jenkins_url = os.getenv('JENKINS_URL', 'http://localhost:8080')
    jenkins_username = os.getenv('JENKINS_USERNAME', 'admin')
    jenkins_api_token = os.getenv('JENKINS_API_TOKEN')
    
    print(f"Testing Jenkins connection to: {jenkins_url}")
    print(f"Username: {jenkins_username}")
    print(f"API Token: {jenkins_api_token[:8]}..." if jenkins_api_token else "No API token")
    
    # Test 1: Current API token
    if jenkins_api_token:
        print("\n=== Testing with API Token ===")
        try:
            server = jenkins.Jenkins(jenkins_url, username=jenkins_username, password=jenkins_api_token)
            user = server.get_whoami()
            print(f"✅ API Token works! User: {user.get('fullName', 'Unknown')}")
            return True
        except Exception as e:
            print(f"❌ API Token failed: {str(e)}")
    
    # Test 2: Try with common default passwords
    print("\n=== Testing with common passwords ===")
    common_passwords = ['admin', 'password', '123456', 'jenkins']
    
    for pwd in common_passwords:
        try:
            print(f"Trying password: {pwd}")
            server = jenkins.Jenkins(jenkins_url, username=jenkins_username, password=pwd)
            user = server.get_whoami()
            print(f"✅ Password '{pwd}' works! User: {user.get('fullName', 'Unknown')}")
            print(f"Update your .env with: JENKINS_PASSWORD={pwd}")
            return True
        except Exception as e:
            print(f"❌ Password '{pwd}' failed")
    
    print("\n=== Manual Setup Required ===")
    print("None of the automatic tests worked. You need to:")
    print("1. Check if Jenkins is running at http://localhost:8080")
    print("2. Find the correct admin password")
    print("3. Or create a new API token")
    
    return False

if __name__ == "__main__":
    test_auth_methods()