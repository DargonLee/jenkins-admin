#!/usr/bin/env python3
"""
Check Jenkins Server Status
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv()

def check_jenkins_server():
    jenkins_url = os.getenv('JENKINS_URL', 'http://localhost:8080')
    
    print(f"Checking Jenkins server at: {jenkins_url}")
    
    try:
        # Test basic connectivity
        response = requests.get(jenkins_url, timeout=10)
        print(f"✅ Server is reachable (Status: {response.status_code})")
        
        # Check if it's actually Jenkins
        if 'Jenkins' in response.text or 'jenkins' in response.headers.get('X-Jenkins', ''):
            print("✅ Confirmed this is a Jenkins server")
        else:
            print("⚠️  Server responded but might not be Jenkins")
        
        # Test API endpoint
        api_response = requests.get(f"{jenkins_url}/api/json", timeout=10)
        if api_response.status_code == 401:
            print("✅ Jenkins API is working (requires authentication)")
        elif api_response.status_code == 200:
            print("✅ Jenkins API is accessible without authentication")
        else:
            print(f"⚠️  API endpoint returned status: {api_response.status_code}")
            
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Jenkins server")
        print("Make sure Jenkins is running and accessible at the URL")
        return False
    except requests.exceptions.Timeout:
        print("❌ Connection timeout")
        print("Server might be slow or not responding")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

if __name__ == "__main__":
    if check_jenkins_server():
        print("\n✅ Jenkins server is accessible. The issue is likely authentication.")
        print("Run: python debug_jenkins_auth.py")
    else:
        print("\n❌ Fix server connectivity first, then test authentication.")