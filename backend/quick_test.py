#!/usr/bin/env python3
"""
Quick Jenkins Test
"""

import jenkins
import requests

# Test basic connectivity first
print("=== Testing Basic Connectivity ===")
try:
    response = requests.get("http://localhost:8080", timeout=5)
    print(f"✅ Jenkins server is reachable (Status: {response.status_code})")
except Exception as e:
    print(f"❌ Cannot reach Jenkins server: {e}")
    exit(1)

# Test authentication
print("\n=== Testing Authentication ===")
try:
    # Try with admin/admin (common default)
    server = jenkins.Jenkins("http://localhost:8080", username="admin", password="admin")
    user = server.get_whoami()
    print(f"✅ Authentication successful with admin/admin")
    print(f"User: {user}")
except Exception as e:
    print(f"❌ admin/admin failed: {e}")
    
    # Try without authentication
    try:
        server = jenkins.Jenkins("http://localhost:8080")
        user = server.get_whoami()
        print(f"✅ No authentication required")
        print(f"User: {user}")
    except Exception as e:
        print(f"❌ No auth also failed: {e}")
        print("\nYou need to:")
        print("1. Check Jenkins admin password")
        print("2. Or create an API token")
        print("3. Or disable Jenkins security (development only)")