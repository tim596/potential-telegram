#!/usr/bin/env python3
"""
Improved KV upload with smaller batches and better retry logic
Much more reliable for large datasets
"""

import requests
import json
import time
import sys
from pathlib import Path

# Cloudflare API configuration
ACCOUNT_ID = "97219140dcc39cab87c330581cd1332f"
KV_NAMESPACE_ID = "f4695384362148309e43b8455ef1379d"

def get_api_token():
    """Get API token from environment or user input"""
    import os

    token = os.getenv('CLOUDFLARE_API_TOKEN')
    if token:
        return token

    print("🔑 Please provide your Cloudflare API Token")
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

            if not line or line.startswith('#'):
                continue

            parts = line.split()
            if len(parts) >= 2:
                source = parts[0]
                target = parts[1]
                status = parts[2] if len(parts) >= 3 else "301"

                if not source.startswith('/'):
                    skipped += 1
                    continue

                redirect_data = {
                    "target": target,
                    "status": status
                }

                redirects[source] = redirect_data
                processed += 1

                if processed % 10000 == 0:
                    print(f"   Parsed {processed:,} redirects...")

            elif parts:
                skipped += 1

    print(f"✅ Parsed {processed:,} redirects ({skipped:,} skipped)")
    return redirects

def upload_batch_with_retry(batch_data, api_token, batch_num, total_batches, max_retries=3):
    """Upload a batch with retry logic"""

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

    for attempt in range(max_retries):
        print(f"📤 Batch {batch_num}/{total_batches} ({len(batch_data)} redirects) - Attempt {attempt + 1}")

        try:
            response = requests.put(url, headers=headers, json=kv_data, timeout=60)

            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"   ✅ Batch {batch_num} uploaded successfully")
                    return True
                else:
                    print(f"   ❌ Batch {batch_num} failed: {result.get('errors', 'Unknown error')}")
            else:
                print(f"   ❌ Batch {batch_num} failed: HTTP {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

        except requests.exceptions.Timeout:
            print(f"   ⏰ Batch {batch_num} timed out on attempt {attempt + 1}")
        except Exception as e:
            print(f"   💥 Batch {batch_num} error on attempt {attempt + 1}: {e}")

        if attempt < max_retries - 1:
            wait_time = (attempt + 1) * 2  # Progressive backoff
            print(f"   ⏳ Retrying in {wait_time} seconds...")
            time.sleep(wait_time)

    print(f"   ❌ Batch {batch_num} failed after {max_retries} attempts")
    return False

def upload_redirects_to_kv(redirects, api_token, batch_size=100):
    """Upload all redirects to KV in small batches with retry logic"""

    total_redirects = len(redirects)
    print(f"🚀 Uploading {total_redirects:,} redirects to Cloudflare KV...")
    print(f"📦 Using smaller batch size: {batch_size} (more reliable)")

    redirect_items = list(redirects.items())
    total_batches = (len(redirect_items) + batch_size - 1) // batch_size

    successful_batches = 0
    failed_batches = 0

    for i in range(0, len(redirect_items), batch_size):
        batch_num = (i // batch_size) + 1
        batch_items = redirect_items[i:i + batch_size]
        batch_dict = dict(batch_items)

        success = upload_batch_with_retry(batch_dict, api_token, batch_num, total_batches)

        if success:
            successful_batches += 1
        else:
            failed_batches += 1

        # Longer delay between batches for reliability
        time.sleep(1)

    print(f"\n📊 Upload Summary:")
    print(f"   Total redirects: {total_redirects:,}")
    print(f"   Total batches: {total_batches}")
    print(f"   Successful batches: {successful_batches}")
    print(f"   Failed batches: {failed_batches}")
    print(f"   Success rate: {(successful_batches/total_batches)*100:.1f}%")

    return failed_batches == 0

def main():
    """Main function"""

    redirects_file = "src/_redirects"

    if not Path(redirects_file).exists():
        print(f"❌ Redirects file not found: {redirects_file}")
        sys.exit(1)

    print("🎯 Cloudflare KV Upload with Improved Reliability")
    print("=" * 60)

    api_token = get_api_token()
    redirects = parse_redirects_file(redirects_file)

    if not redirects:
        print("❌ No redirects found!")
        sys.exit(1)

    success = upload_redirects_to_kv(redirects, api_token)

    if success:
        print(f"\n🎉 All {len(redirects):,} redirects uploaded successfully!")
        print("\n📋 Next steps:")
        print("1. Deploy the Worker: wrangler deploy cloudflare-worker-complete.js")
        print("2. Test redirects on your Cloudflare Pages site")
        print("3. Switch DNS when ready")
    else:
        print(f"\n⚠️  Some batches failed. You can re-run this script to retry.")

if __name__ == "__main__":
    main()