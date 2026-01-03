#!/usr/bin/env python3
"""
Upload single redirect update for Marquette WI to KV storage
"""

import requests
import json
import os

# Cloudflare API configuration
ACCOUNT_ID = "97219140dcc39cab87c330581cd1332f"
KV_NAMESPACE_ID = "f4695384362148309e43b8455ef1379d"  # REDIRECTS namespace
API_TOKEN = os.getenv('CLOUDFLARE_API_TOKEN', 'rW9wd-Xt2WWk8LU8wwwEvs9u1p05Z_mnGyTcPQbi')

def upload_marquette_redirects():
    """Upload updated Marquette WI redirects"""

    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/storage/kv/namespaces/{KV_NAMESPACE_ID}/bulk"
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    # Updated Marquette redirects - now point to Green Bay instead of 410
    redirect_updates = [
        {
            "key": "/marquette-wi",
            "value": json.dumps({"target": "/mattress-removal/wisconsin/green-bay/", "status": "301"})
        },
        {
            "key": "/marquette-wi/",
            "value": json.dumps({"target": "/mattress-removal/wisconsin/green-bay/", "status": "301"})
        },
        {
            "key": "/Marquette-WI/",
            "value": json.dumps({"target": "/mattress-removal/wisconsin/green-bay/", "status": "301"})
        },
        {
            "key": "/MARQUETTE-WI/",
            "value": json.dumps({"target": "/mattress-removal/wisconsin/green-bay/", "status": "301"})
        },
        {
            "key": "/marquette-WI/",
            "value": json.dumps({"target": "/mattress-removal/wisconsin/green-bay/", "status": "301"})
        },
        {
            "key": "/Marquette-wi/",
            "value": json.dumps({"target": "/mattress-removal/wisconsin/green-bay/", "status": "301"})
        }
    ]

    print(f"🔄 Uploading {len(redirect_updates)} Marquette WI redirect updates...")

    try:
        response = requests.put(url, headers=headers, json=redirect_updates, timeout=30)

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ Marquette WI redirects updated successfully!")
                print("   All variations now redirect to Green Bay instead of 410")
                return True
            else:
                print(f"❌ API error: {result.get('errors', 'Unknown error')}")
                return False
        else:
            print(f"❌ HTTP error: {response.status_code}")
            return False

    except Exception as e:
        print(f"❌ Upload error: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Marquette WI Redirect Update")
    print("=" * 40)
    success = upload_marquette_redirects()

    if success:
        print("\n🎉 Update complete!")
        print("💡 /marquette-wi/ now redirects to Green Bay, WI")
        print("   Much better for users than 410 Gone!")
    else:
        print("\n⚠️ Update failed")