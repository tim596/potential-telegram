#!/usr/bin/env python3
"""
Automatic upload script (non-interactive version)
All tests passed, proceed with full upload automatically
"""

import requests
import json
import time
import sys
from pathlib import Path

# Cloudflare API configuration
ACCOUNT_ID = "97219140dcc39cab87c330581cd1332f"
KV_NAMESPACE_ID = "58c39faa2cfa4a2897b9b0bbf5f1b50c"  # potential-telegram live project namespace

def get_api_token():
    """Get API token from environment"""
    import os

    token = os.getenv('CLOUDFLARE_API_TOKEN')
    if not token:
        print("❌ CLOUDFLARE_API_TOKEN environment variable not set")
        sys.exit(1)

    return token

def parse_redirects_file(file_path):
    """Parse redirects file"""
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
    """Upload a batch with comprehensive retry logic"""

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
        print(f"📤 Batch {batch_num:,}/{total_batches:,} ({len(batch_data)} redirects) - Attempt {attempt + 1}/{max_retries}")

        try:
            response = requests.put(url, headers=headers, json=kv_data, timeout=60)

            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"   ✅ Batch {batch_num:,} uploaded successfully")
                    return True
                else:
                    error_msg = result.get('errors', 'Unknown error')
                    print(f"   ❌ Batch {batch_num:,} API error: {error_msg}")
            else:
                print(f"   ❌ Batch {batch_num:,} HTTP error: {response.status_code}")
                if response.text:
                    print(f"   Response: {response.text[:200]}...")

        except requests.exceptions.Timeout:
            print(f"   ⏰ Batch {batch_num:,} timed out on attempt {attempt + 1}")
        except requests.exceptions.ConnectionError:
            print(f"   🔌 Batch {batch_num:,} connection error on attempt {attempt + 1}")
        except Exception as e:
            print(f"   💥 Batch {batch_num:,} unexpected error on attempt {attempt + 1}: {e}")

        if attempt < max_retries - 1:
            wait_time = (attempt + 1) * 2  # Progressive backoff: 2s, 4s, 6s
            print(f"   ⏳ Waiting {wait_time}s before retry...")
            time.sleep(wait_time)

    print(f"   ❌ Batch {batch_num:,} FAILED after {max_retries} attempts")
    return False

def upload_redirects_to_kv(redirects, api_token, batch_size=50):
    """Upload all redirects to KV with small batches for maximum reliability"""

    total_redirects = len(redirects)
    print(f"🚀 Uploading {total_redirects:,} redirects to Cloudflare KV...")
    print(f"📦 Using small batch size: {batch_size} (maximum reliability)")

    redirect_items = list(redirects.items())
    total_batches = (len(redirect_items) + batch_size - 1) // batch_size

    successful_batches = 0
    failed_batches = 0
    failed_batch_numbers = []

    print(f"📊 Will process {total_batches:,} batches")
    start_time = time.time()

    for i in range(0, len(redirect_items), batch_size):
        batch_num = (i // batch_size) + 1
        batch_items = redirect_items[i:i + batch_size]
        batch_dict = dict(batch_items)

        success = upload_batch_with_retry(batch_dict, api_token, batch_num, total_batches)

        if success:
            successful_batches += 1
        else:
            failed_batches += 1
            failed_batch_numbers.append(batch_num)

        # Progress update every 100 batches
        if batch_num % 100 == 0:
            success_rate = (successful_batches / batch_num) * 100
            elapsed = time.time() - start_time
            batches_per_minute = batch_num / (elapsed / 60)
            remaining_batches = total_batches - batch_num
            eta_minutes = remaining_batches / batches_per_minute if batches_per_minute > 0 else 0

            print(f"📈 Progress: {batch_num:,}/{total_batches:,} batches ({success_rate:.1f}% success) - ETA: {eta_minutes:.1f} min")

        # Small delay between batches
        time.sleep(0.5)

    elapsed_total = time.time() - start_time

    print(f"\n📊 Final Upload Summary:")
    print(f"   Total redirects: {total_redirects:,}")
    print(f"   Total batches: {total_batches:,}")
    print(f"   Successful batches: {successful_batches:,}")
    print(f"   Failed batches: {failed_batches:,}")
    print(f"   Total time: {elapsed_total/60:.1f} minutes")

    if failed_batches > 0:
        print(f"   Failed batch numbers: {failed_batch_numbers[:10]}...")

    success_rate = (successful_batches / total_batches) * 100
    print(f"   Success rate: {success_rate:.1f}%")

    return failed_batches == 0

def main():
    """Main function - auto-proceed since tests passed"""

    redirects_file = "src/_redirects"

    if not Path(redirects_file).exists():
        print(f"❌ Redirects file not found: {redirects_file}")
        sys.exit(1)

    print("🎯 Full KV Upload (Tests Already Passed)")
    print("=" * 70)

    # Get API token
    api_token = get_api_token()
    print("✅ API token loaded from environment")

    # Parse all redirects
    redirects = parse_redirects_file(redirects_file)

    if not redirects:
        print("❌ No redirects found!")
        sys.exit(1)

    # Upload all redirects
    print(f"\n🎯 Starting upload of {len(redirects):,} redirects...")
    success = upload_redirects_to_kv(redirects, api_token)

    if success:
        print(f"\n🎉 SUCCESS! All {len(redirects):,} redirects uploaded!")
        print("\n📋 Next steps:")
        print("1. Deploy the Worker: wrangler deploy cloudflare-worker-complete.js")
        print("2. Test redirects on your Cloudflare Pages site")
        print("3. Switch DNS when ready")
    else:
        print(f"\n⚠️  Some batches failed. You can re-run this script to retry.")

if __name__ == "__main__":
    main()