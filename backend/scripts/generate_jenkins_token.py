#!/usr/bin/env python3
"""
Jenkins API Token Generator Helper

This script helps you generate Jenkins API tokens programmatically.
Note: This requires initial authentication with username/password.
"""

import os
import sys
import requests
import json
from urllib.parse import urljoin
from dotenv import load_dotenv

load_dotenv()

def generate_api_token(token_name: str = "Jenkins Admin Backend") -> dict:
    """Generate a new Jenkins API token"""
    
    jenkins_url = os.getenv('JENKINS_URL', 'http://localhost:8080')
    jenkins_username = os.getenv('JENKINS_USERNAME')
    jenkins_password = os.getenv('JENKINS_PASSWORD')
    
    if not all([jenkins_url, jenkins_username, jenkins_password]):
        return {
            "success": False,
            "error": "Missing required environment variables: JENKINS_URL, JENKINS_USERNAME, JENKINS_PASSWORD"
        }
    
    try:
        # Jenkins API endpoint for generating tokens
        api_url = urljoin(jenkins_url, f"/user/{jenkins_username}/descriptorByName/jenkins.security.ApiTokenProperty/generateNewToken")
        
        # Prepare the request
        data = {
            "newTokenName": token_name
        }
        
        # Make the request with basic auth
        response = requests.post(
            api_url,
            auth=(jenkins_username, jenkins_password),
            data=data,
            headers={
                "Content-Type": "application/x-www-form-urlencoded"
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            return {
                "success": True,
                "token_name": result.get("tokenName"),
                "token_uuid": result.get("tokenUuid"),
                "token_value": result.get("tokenValue")
            }
        else:
            return {
                "success": False,
                "error": f"HTTP {response.status_code}: {response.text}",
                "status_code": response.status_code
            }
            
    except requests.exceptions.RequestException as e:
        return {
            "success": False,
            "error": f"Request failed: {str(e)}",
            "error_type": "RequestException"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "error_type": type(e).__name__
        }

def main():
    """Main function"""
    print("=== Jenkins API Token Generator ===")
    
    token_name = input("Enter token name (default: 'Jenkins Admin Backend'): ").strip()
    if not token_name:
        token_name = "Jenkins Admin Backend"
    
    print(f"Generating token '{token_name}'...")
    
    result = generate_api_token(token_name)
    
    if result["success"]:
        print("✓ Token generated successfully!")
        print(f"Token Name: {result['token_name']}")
        print(f"Token UUID: {result['token_uuid']}")
        print(f"Token Value: {result['token_value']}")
        print()
        print("Add this to your .env file:")
        print(f"JENKINS_API_TOKEN={result['token_value']}")
        print()
        print("⚠️  IMPORTANT: Save this token now! You won't be able to see it again.")
    else:
        print("❌ Token generation failed!")
        print(f"Error: {result['error']}")
        print()
        print("Manual steps:")
        print("1. Go to your Jenkins instance")
        print("2. Click your username -> Configure")
        print("3. Scroll to 'API Token' section")
        print("4. Click 'Add new Token'")
        print("5. Enter a name and click 'Generate'")
        print("6. Copy the token and add to .env file")

if __name__ == "__main__":
    main()