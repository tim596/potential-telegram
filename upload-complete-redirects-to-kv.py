#!/usr/bin/env python3
"""
Upload COMPLETE redirects from _redirects file to Cloudflare KV
Handles ALL status codes (301, 302, 410, 404, etc.) with zero issues
Stores both target URL and status code for perfect Netlify compatibility
"""

import subprocess
import json
import re
import sys
from pathlib import Path

def parse_complete_redirects_file(file_path):
    """Parse the _redirects file and extract ALL redirect rules with status codes"""

    redirects = {}
    processed = 0
    skipped = 0

    print(f"📖 Parsing ALL redirects from {file_path}...")

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
                status = parts[2] if len(parts) >= 3 else "301"  # Default to 301

                # Validate source starts with /
                if not source.startswith('/'):
                    skipped += 1
                    print(f"   Warning: Skipping line {line_num} - source doesn't start with /: {line}")
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
                print(f"   Warning: Couldn't parse line {line_num}: {line}")
                skipped += 1

    print(f"✅ Parsed {processed:,} redirects ({skipped:,} skipped)")
    return redirects

def upload_complete_redirects_to_kv(redirects, batch_size=500):
    """Upload complete redirect data to Cloudflare KV in batches"""

    total_redirects = len(redirects)
    print(f"🚀 Uploading {total_redirects:,} complete redirects to Cloudflare KV...")
    print(f"📦 Using batch size: {batch_size}")

    # Convert to list of items for batching
    redirect_items = list(redirects.items())
    total_batches = (len(redirect_items) + batch_size - 1) // batch_size

    successful_batches = 0
    failed_batches = 0

    for i in range(0, len(redirect_items), batch_size):
        batch_num = (i // batch_size) + 1
        batch = redirect_items[i:i + batch_size]

        # Convert batch to KV format with JSON data
        kv_batch = []
        for source, redirect_data in batch:
            kv_batch.append({
                "key": source,
                "value": json.dumps(redirect_data, separators=(',', ':'))
            })

        # Create JSON string
        batch_json = json.dumps(kv_batch, separators=(',', ':'))

        print(f"📤 Uploading batch {batch_num}/{total_batches} ({len(batch)} redirects)...")

        try:
            # Write batch to temporary file
            batch_filename = f"complete_batch_{batch_num}.json"
            with open(batch_filename, 'w', encoding='utf-8') as batch_file:
                batch_file.write(batch_json)

            # Upload using wrangler bulk put with filename
            result = subprocess.run([
                'wrangler', 'kv', 'bulk', 'put', batch_filename,
                '--binding', 'REDIRECTS',
                '--remote'
            ], capture_output=True, text=True, timeout=120)

            # Clean up temporary file
            Path(batch_filename).unlink(missing_ok=True)

            if result.returncode == 0:
                successful_batches += 1
                print(f"   ✅ Batch {batch_num} uploaded successfully")
            else:
                failed_batches += 1
                print(f"   ❌ Batch {batch_num} failed: {result.stderr}")

        except subprocess.TimeoutExpired:
            failed_batches += 1
            print(f"   ⏰ Batch {batch_num} timed out")
        except Exception as e:
            failed_batches += 1
            print(f"   💥 Batch {batch_num} error: {e}")

    print(f"\n📊 Upload Summary:")
    print(f"   Total redirects: {total_redirects:,}")
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

    print("🎯 Complete Redirect Upload to Cloudflare KV")
    print("=" * 60)

    # Parse ALL redirects from file
    redirects = parse_complete_redirects_file(redirects_file)

    if not redirects:
        print("❌ No redirects found!")
        sys.exit(1)

    # Upload to KV
    success = upload_complete_redirects_to_kv(redirects)

    if success:
        print(f"\n🎉 All {len(redirects):,} redirects uploaded successfully!")
        print("\n📋 Next steps:")
        print("1. Deploy the updated Worker: wrangler deploy cloudflare-worker-complete.js")
        print("2. Test all failing URLs to confirm they work")
        print("3. Switch DNS back to Cloudflare when ready")
    else:
        print(f"\n⚠️  Some batches failed. Check the output above.")
        print("You may need to retry failed batches manually.")

if __name__ == "__main__":
    main()