#!/usr/bin/env python3
"""
Comprehensive test and upload script for 100% reliability
Tests API connection, validates data, then uploads in controlled batches
"""

import requests
import json
import time
import sys
from pathlib import Path

# Cloudflare API configuration
ACCOUNT_ID = "97219140dcc39cab87c330581cd1332f"
KV_NAMESPACE_ID = "f4695384362148309e43b8455ef1379d"

def test_api_connection(api_token):
    """Test API connection and permissions"""
    print("🔬 Testing API Connection...")

    # Test 1: Account access
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}"
    headers = {"Authorization": f"Bearer {api_token}"}

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("   ✅ Account access: OK")
            else:
                print(f"   ❌ Account access failed: {result.get('errors')}")
                return False
        else:
            print(f"   ❌ Account access failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Account access failed: {e}")
        return False

    # Test 2: KV namespace access
    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/storage/kv/namespaces/{KV_NAMESPACE_ID}"

    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("   ✅ KV namespace access: OK")
            else:
                print(f"   ❌ KV namespace access failed: {result.get('errors')}")
                return False
        else:
            print(f"   ❌ KV namespace access failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ KV namespace access failed: {e}")
        return False

    return True

def test_small_upload(api_token):
    """Test with a small batch first"""
    print("🧪 Testing Small Upload...")

    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/storage/kv/namespaces/{KV_NAMESPACE_ID}/bulk"
    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json"
    }

    # Create test data
    test_data = [
        {
            "key": "/test-redirect-1",
            "value": json.dumps({"target": "/mattress-removal/", "status": "301"})
        },
        {
            "key": "/test-redirect-2",
            "value": json.dumps({"target": "/how-it-works/", "status": "301"})
        }
    ]

    try:
        response = requests.put(url, headers=headers, json=test_data, timeout=30)
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("   ✅ Small upload test: PASSED")
                return True
            else:
                print(f"   ❌ Small upload test failed: {result.get('errors')}")
                return False
        else:
            print(f"   ❌ Small upload test failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Small upload test failed: {e}")
        return False

def get_api_token():
    """Get API token from environment"""
    import os

    token = os.getenv('CLOUDFLARE_API_TOKEN')
    if not token:
        print("❌ CLOUDFLARE_API_TOKEN environment variable not set")
        sys.exit(1)

    return token

def parse_redirects_file(file_path, limit=None):
    """Parse redirects file with optional limit for testing"""
    redirects = {}
    processed = 0
    skipped = 0

    print(f"📖 Parsing redirects from {file_path}...")
    if limit:
        print(f"   🔢 Limited to first {limit:,} redirects for testing")

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

                # Stop at limit if specified
                if limit and processed >= limit:
                    break

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
    """Upload all redirects to KV with very small batches for reliability"""

    total_redirects = len(redirects)
    print(f"🚀 Uploading {total_redirects:,} redirects to Cloudflare KV...")
    print(f"📦 Using small batch size: {batch_size} (maximum reliability)")

    redirect_items = list(redirects.items())
    total_batches = (len(redirect_items) + batch_size - 1) // batch_size

    successful_batches = 0
    failed_batches = 0
    failed_batch_numbers = []

    print(f"📊 Will process {total_batches:,} batches")

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
            print(f"📈 Progress: {batch_num:,}/{total_batches:,} batches ({success_rate:.1f}% success rate)")

        # Small delay between batches
        time.sleep(0.5)

    print(f"\n📊 Final Upload Summary:")
    print(f"   Total redirects: {total_redirects:,}")
    print(f"   Total batches: {total_batches:,}")
    print(f"   Successful batches: {successful_batches:,}")
    print(f"   Failed batches: {failed_batches:,}")

    if failed_batches > 0:
        print(f"   Failed batch numbers: {failed_batch_numbers[:10]}...")  # Show first 10

    success_rate = (successful_batches / total_batches) * 100
    print(f"   Success rate: {success_rate:.1f}%")

    return failed_batches == 0

def main():
    """Main function with comprehensive testing"""

    redirects_file = "src/_redirects"

    if not Path(redirects_file).exists():
        print(f"❌ Redirects file not found: {redirects_file}")
        sys.exit(1)

    print("🎯 Comprehensive KV Upload with 100% Reliability Testing")
    print("=" * 70)

    # Step 1: Get API token
    api_token = get_api_token()
    print("✅ API token loaded from environment")

    # Step 2: Test API connection
    if not test_api_connection(api_token):
        print("❌ API connection test failed. Cannot proceed.")
        sys.exit(1)

    # Step 3: Test small upload
    if not test_small_upload(api_token):
        print("❌ Small upload test failed. Cannot proceed.")
        sys.exit(1)

    # Step 4: Ask user if they want to proceed with full upload
    print("\n🚦 All tests passed! Ready for full upload.")
    print(f"   This will upload ALL redirects from {redirects_file}")

    response = input("   Proceed with full upload? (y/N): ").strip().lower()
    if response != 'y':
        print("⏸️  Upload cancelled by user")
        sys.exit(0)

    # Step 5: Parse all redirects
    redirects = parse_redirects_file(redirects_file)

    if not redirects:
        print("❌ No redirects found!")
        sys.exit(1)

    # Step 6: Upload all redirects
    print(f"\n🎯 Starting full upload of {len(redirects):,} redirects...")
    success = upload_redirects_to_kv(redirects, api_token)

    if success:
        print(f"\n🎉 SUCCESS! All {len(redirects):,} redirects uploaded!")
        print("\n📋 Next steps:")
        print("1. Deploy the Worker: wrangler deploy cloudflare-worker-complete.js")
        print("2. Test redirects on your Cloudflare Pages site")
        print("3. Switch DNS when ready")
    else:
        print(f"\n⚠️  Some batches failed. Check the output above for details.")
        print("You can re-run this script to retry failed uploads.")

if __name__ == "__main__":
    main()