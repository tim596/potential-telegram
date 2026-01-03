#!/usr/bin/env python3
"""
Upload redirects to Cloudflare KV using direct API calls
More reliable than wrangler bulk upload for large datasets
"""

import requests
import json
import time
import sys
from pathlib import Path

# Cloudflare API configuration
ACCOUNT_ID = "97219140dcc39cab87c330581cd1332f"
KV_NAMESPACE_ID = "f4695384362148309e43b8455ef1379d"
API_TOKEN = None  # Will be set from environment or input

def get_api_token():
    """Get API token from environment or user input"""
    import os

    # Try environment variable first
    token = os.getenv('CLOUDFLARE_API_TOKEN')
    if token:
        return token

    # Ask user for token
    print("🔑 Please provide your Cloudflare API Token")
    print("   You can create one at: https://dash.cloudflare.com/profile/api-tokens")
    print("   Permissions needed: Zone:Read, Account:Read, Zone:Edit")
    token = input("API Token: ").strip()

    if not token:
        print("❌ API token is required")
        sys.exit(1)

    return token

def parse_redirects_file(file_path):
    """Parse the _redirects file and return redirect data"""
    redirects = {}
    processed = 0
    skipped = 0

    print(f"📖 Parsing redirects from {file_path}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()

            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue

            # Parse redirect line: /source /target [status]
            parts = line.split()
            if len(parts) >= 2:
                source = parts[0]
                target = parts[1]
                status = parts[2] if len(parts) >= 3 else "301"

                # Validate source starts with /
                if not source.startswith('/'):
                    skipped += 1
                    continue

                # Store redirect with both target and status
                redirect_data = {
                    "target": target,
                    "status": status
                }

                redirects[source] = redirect_data
                processed += 1

                if processed % 10000 == 0:
                    print(f"   Processed {processed:,} redirects...")

            elif parts:  # Line has content but couldn't parse
                skipped += 1

    print(f"✅ Parsed {processed:,} redirects ({skipped:,} skipped)")
    return redirects

def upload_batch_to_kv(batch_data, api_token, batch_num, total_batches):
    """Upload a batch of redirects to KV using Cloudflare API"""

    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/storage/kv/namespaces/{KV_NAMESPACE_ID}/bulk"

    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }

    # Convert to KV API format
    kv_data = []
    for source, redirect_data in batch_data.items():
        kv_data.append({
            "key": source,
            "value": json.dumps(redirect_data, separators=(',', ':'))
        })

    payload = kv_data

    print(f"📤 Uploading batch {batch_num}/{total_batches} ({len(batch_data)} redirects)...")

    try:
        response = requests.put(url, headers=headers, json=payload, timeout=120)

        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"   ✅ Batch {batch_num} uploaded successfully")
                return True
            else:
                print(f"   ❌ Batch {batch_num} failed: {result.get('errors', 'Unknown error')}")
                return False
        else:
            print(f"   ❌ Batch {batch_num} failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False

    except requests.exceptions.Timeout:
        print(f"   ⏰ Batch {batch_num} timed out")
        return False
    except Exception as e:
        print(f"   💥 Batch {batch_num} error: {e}")
        return False

def upload_redirects_to_kv(redirects, api_token, batch_size=500):
    """Upload all redirects to KV in batches"""

    total_redirects = len(redirects)
    print(f"🚀 Uploading {total_redirects:,} redirects to Cloudflare KV...")
    print(f"📦 Using batch size: {batch_size}")

    # Convert to list of items for batching
    redirect_items = list(redirects.items())
    total_batches = (len(redirect_items) + batch_size - 1) // batch_size

    successful_batches = 0
    failed_batches = 0

    for i in range(0, len(redirect_items), batch_size):
        batch_num = (i // batch_size) + 1
        batch_items = redirect_items[i:i + batch_size]
        batch_dict = dict(batch_items)

        success = upload_batch_to_kv(batch_dict, api_token, batch_num, total_batches)

        if success:
            successful_batches += 1
        else:
            failed_batches += 1

        # Small delay between batches to avoid rate limiting
        time.sleep(0.5)

    print(f"\n📊 Upload Summary:")
    print(f"   Total redirects: {total_redirects:,}")
    print(f"   Total batches: {total_batches}")
    print(f"   Successful batches: {successful_batches}")
    print(f"   Failed batches: {failed_batches}")
    print(f"   Success rate: {(successful_batches/total_batches)*100:.1f}%")

    return failed_batches == 0

def main():
    """Main function"""

    # File paths
    redirects_file = "src/_redirects"

    if not Path(redirects_file).exists():
        print(f"❌ Redirects file not found: {redirects_file}")
        sys.exit(1)

    print("🎯 Cloudflare KV Upload via Direct API")
    print("=" * 60)

    # Get API token
    api_token = get_api_token()

    # Parse redirects from file
    redirects = parse_redirects_file(redirects_file)

    if not redirects:
        print("❌ No redirects found!")
        sys.exit(1)

    # Upload to KV
    success = upload_redirects_to_kv(redirects, api_token)

    if success:
        print(f"\n🎉 All {len(redirects):,} redirects uploaded successfully!")
        print("\n📋 Next steps:")
        print("1. Deploy the Worker: wrangler deploy cloudflare-worker-complete.js")
        print("2. Test redirects on your Cloudflare Pages site")
        print("3. Switch DNS when ready")
    else:
        print(f"\n⚠️  Some batches failed. Check the output above.")
        print("You can re-run this script to retry failed uploads.")

if __name__ == "__main__":
    main()