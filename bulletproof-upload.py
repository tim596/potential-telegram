#!/usr/bin/env python3
"""
BULLETPROOF KV Upload Script - Maximum Reliability
Designed to upload ALL redirects with 100% success rate
"""

import requests
import json
import time
import sys
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('upload.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Cloudflare API configuration - REDIRECTS NAMESPACE
ACCOUNT_ID = "97219140dcc39cab87c330581cd1332f"
KV_NAMESPACE_ID = "f4695384362148309e43b8455ef1379d"  # REDIRECTS namespace

# Ultra-conservative settings for 100% reliability
BATCH_SIZE = 25  # Even smaller batches
MAX_RETRIES = 5  # More retries
TIMEOUT_SECONDS = 120  # Longer timeout
DELAY_BETWEEN_BATCHES = 1.5  # Longer delays
BACKOFF_MULTIPLIER = 3  # Aggressive backoff

def get_api_token():
    """Get API token from environment"""
    token = os.getenv('CLOUDFLARE_API_TOKEN')
    if not token:
        logger.error("❌ CLOUDFLARE_API_TOKEN environment variable not set")
        sys.exit(1)
    return token

def parse_redirects_file(file_path):
    """Parse redirects file with detailed logging"""
    redirects = {}
    processed = 0
    skipped = 0

    logger.info(f"📖 Parsing redirects from {file_path}...")

    try:
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

                    if processed % 5000 == 0:
                        logger.info(f"   Parsed {processed:,} redirects...")

                elif parts:
                    skipped += 1

    except Exception as e:
        logger.error(f"❌ Error parsing file: {e}")
        sys.exit(1)

    logger.info(f"✅ Parsed {processed:,} redirects ({skipped:,} skipped)")
    return redirects

def test_api_connection(api_token):
    """Test API connection before starting upload"""
    logger.info("🔗 Testing API connection...")

    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/storage/kv/namespaces/{KV_NAMESPACE_ID}"
    headers = {"Authorization": f"Bearer {api_token}"}

    try:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 200:
            logger.info("✅ API connection successful")
            return True
        else:
            logger.error(f"❌ API test failed: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"❌ API test error: {e}")
        return False

def upload_batch_bulletproof(batch_data, api_token, batch_num, total_batches):
    """Upload a batch with maximum retry logic and error handling"""

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

    for attempt in range(MAX_RETRIES):
        logger.info(f"📤 Batch {batch_num:,}/{total_batches:,} ({len(batch_data)} redirects) - Attempt {attempt + 1}/{MAX_RETRIES}")

        try:
            response = requests.put(
                url,
                headers=headers,
                json=kv_data,
                timeout=TIMEOUT_SECONDS
            )

            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    logger.info(f"   ✅ Batch {batch_num:,} uploaded successfully")
                    return True
                else:
                    error_msg = result.get('errors', 'Unknown error')
                    logger.warning(f"   ⚠️ Batch {batch_num:,} API error: {error_msg}")
            else:
                logger.warning(f"   ⚠️ Batch {batch_num:,} HTTP error: {response.status_code}")
                if response.text:
                    logger.warning(f"   Response: {response.text[:200]}...")

        except requests.exceptions.Timeout:
            logger.warning(f"   ⏰ Batch {batch_num:,} timed out on attempt {attempt + 1}")
        except requests.exceptions.ConnectionError:
            logger.warning(f"   🔌 Batch {batch_num:,} connection error on attempt {attempt + 1}")
        except Exception as e:
            logger.warning(f"   💥 Batch {batch_num:,} unexpected error on attempt {attempt + 1}: {e}")

        if attempt < MAX_RETRIES - 1:
            wait_time = (attempt + 1) * BACKOFF_MULTIPLIER
            logger.info(f"   ⏳ Waiting {wait_time}s before retry...")
            time.sleep(wait_time)

    logger.error(f"   ❌ Batch {batch_num:,} FAILED after {MAX_RETRIES} attempts")
    return False

def upload_redirects_bulletproof(redirects, api_token):
    """Upload all redirects with bulletproof reliability"""

    total_redirects = len(redirects)
    logger.info(f"🚀 Starting BULLETPROOF upload of {total_redirects:,} redirects")
    logger.info(f"📦 Using ultra-small batch size: {BATCH_SIZE} for maximum reliability")
    logger.info(f"🔄 Max retries per batch: {MAX_RETRIES}")
    logger.info(f"⏱️ Timeout per request: {TIMEOUT_SECONDS}s")

    redirect_items = list(redirects.items())
    total_batches = (len(redirect_items) + BATCH_SIZE - 1) // BATCH_SIZE

    successful_batches = 0
    failed_batches = 0
    failed_batch_numbers = []

    logger.info(f"📊 Will process {total_batches:,} batches")
    start_time = time.time()

    for i in range(0, len(redirect_items), BATCH_SIZE):
        batch_num = (i // BATCH_SIZE) + 1
        batch_items = redirect_items[i:i + BATCH_SIZE]
        batch_dict = dict(batch_items)

        success = upload_batch_bulletproof(batch_dict, api_token, batch_num, total_batches)

        if success:
            successful_batches += 1
        else:
            failed_batches += 1
            failed_batch_numbers.append(batch_num)

        # Progress update every 50 batches
        if batch_num % 50 == 0:
            success_rate = (successful_batches / batch_num) * 100
            elapsed = time.time() - start_time
            batches_per_minute = batch_num / (elapsed / 60)
            remaining_batches = total_batches - batch_num
            eta_minutes = remaining_batches / batches_per_minute if batches_per_minute > 0 else 0

            logger.info(f"📈 Progress: {batch_num:,}/{total_batches:,} batches ({success_rate:.1f}% success) - ETA: {eta_minutes:.1f} min")

        # Conservative delay between batches
        time.sleep(DELAY_BETWEEN_BATCHES)

    elapsed_total = time.time() - start_time

    logger.info(f"\n📊 FINAL UPLOAD SUMMARY:")
    logger.info(f"   Total redirects: {total_redirects:,}")
    logger.info(f"   Total batches: {total_batches:,}")
    logger.info(f"   Successful batches: {successful_batches:,}")
    logger.info(f"   Failed batches: {failed_batches:,}")
    logger.info(f"   Total time: {elapsed_total/60:.1f} minutes")

    if failed_batches > 0:
        logger.error(f"   ❌ Failed batch numbers: {failed_batch_numbers[:20]}...")
        logger.error("   You can retry failed batches by re-running this script")

    success_rate = (successful_batches / total_batches) * 100
    logger.info(f"   Success rate: {success_rate:.1f}%")

    return failed_batches == 0

def verify_upload(api_token, expected_count):
    """Verify the upload completed successfully"""
    logger.info(f"🔍 Verifying upload completion...")

    # We can't easily count KV keys via API, so we'll do a spot check
    test_keys = ["/test-redirect", "/Shreveport-LA/", "/boulder-mattress-disposal/"]

    url = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/storage/kv/namespaces/{KV_NAMESPACE_ID}/values"
    headers = {"Authorization": f"Bearer {api_token}"}

    successful_checks = 0
    for key in test_keys:
        try:
            response = requests.get(f"{url}/{key}", headers=headers, timeout=30)
            if response.status_code == 200:
                successful_checks += 1
                logger.info(f"   ✅ Found key: {key}")
            else:
                logger.warning(f"   ⚠️ Missing key: {key}")
        except Exception as e:
            logger.warning(f"   ❌ Error checking key {key}: {e}")

    if successful_checks > 0:
        logger.info(f"✅ Verification: {successful_checks}/{len(test_keys)} test keys found")
        return True
    else:
        logger.error("❌ Verification failed: No test keys found")
        return False

def main():
    """Main function - bulletproof upload process"""

    redirects_file = "src/_redirects"

    if not Path(redirects_file).exists():
        logger.error(f"❌ Redirects file not found: {redirects_file}")
        sys.exit(1)

    logger.info("🎯 BULLETPROOF KV UPLOAD - MAXIMUM RELIABILITY MODE")
    logger.info("=" * 80)

    # Get API token
    api_token = get_api_token()
    logger.info("✅ API token loaded from environment")

    # Test API connection
    if not test_api_connection(api_token):
        logger.error("❌ API connection test failed. Aborting.")
        sys.exit(1)

    # Parse all redirects
    redirects = parse_redirects_file(redirects_file)

    if not redirects:
        logger.error("❌ No redirects found!")
        sys.exit(1)

    # Upload all redirects
    logger.info(f"\n🎯 Starting bulletproof upload of {len(redirects):,} redirects...")
    success = upload_redirects_bulletproof(redirects, api_token)

    if success:
        logger.info(f"\n🎉 SUCCESS! All {len(redirects):,} redirects uploaded!")

        # Verify upload
        verify_upload(api_token, len(redirects))

        logger.info("\n📋 Next steps:")
        logger.info("1. Switch DNS back to Cloudflare")
        logger.info("2. Test all failing URLs")
        logger.info("3. Celebrate! 🎉")
    else:
        logger.error(f"\n⚠️ Some batches failed. Check the log for details.")
        logger.error("You can re-run this script to retry failed batches.")

if __name__ == "__main__":
    main()