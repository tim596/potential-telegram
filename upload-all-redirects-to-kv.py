#!/usr/bin/env python3
"""
Upload ALL redirects from _redirects file to Cloudflare KV
Handles the complete 172K+ redirects that Cloudflare Pages can't handle
"""

import subprocess
import json
import re
import sys
from pathlib import Path

def parse_redirects_file(file_path):
    """Parse the _redirects file and extract all redirect rules"""

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

                # Include ALL redirect/response rules (301, 302, 410, 404, etc.)
                # Only skip if status code is clearly not a valid HTTP status
                if len(parts) >= 3:
                    status = parts[2]
                    # Accept all numeric HTTP status codes
                    if not status.isdigit() or len(status) != 3:
                        skipped += 1
                        continue

                # Store the redirect
                redirects[source] = target
                processed += 1

                if processed % 10000 == 0:
                    print(f"   Processed {processed:,} redirects...")

            elif parts:  # Line has content but couldn't parse
                print(f"   Warning: Couldn't parse line {line_num}: {line}")

    print(f"✅ Parsed {processed:,} redirects ({skipped:,} skipped)")
    return redirects

def upload_to_kv_in_batches(redirects, batch_size=500):
    """Upload redirects to Cloudflare KV in batches"""

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
        batch = redirect_items[i:i + batch_size]

        # Convert batch to KV format
        kv_batch = []
        for source, target in batch:
            kv_batch.append({
                "key": source,
                "value": target
            })

        # Create JSON string
        batch_json = json.dumps(kv_batch, separators=(',', ':'))

        print(f"📤 Uploading batch {batch_num}/{total_batches} ({len(batch)} redirects)...")

        try:
            # Write batch to temporary file
            batch_filename = f"batch_{batch_num}.json"
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

    # Parse redirects from file
    redirects = parse_redirects_file(redirects_file)

    if not redirects:
        print("❌ No redirects found!")
        sys.exit(1)

    # Upload to KV
    success = upload_to_kv_in_batches(redirects)

    if success:
        print(f"\n🎉 All {len(redirects):,} redirects uploaded successfully!")
        print("\n📋 Next steps:")
        print("1. Deploy the enhanced Worker: wrangler deploy cloudflare-worker-enhanced.js")
        print("2. Test failing URLs to confirm they work")
        print("3. Switch DNS back to Cloudflare when ready")
    else:
        print(f"\n⚠️  Some batches failed. Check the output above.")
        print("You may need to retry failed batches manually.")

if __name__ == "__main__":
    main()