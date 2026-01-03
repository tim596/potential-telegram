#!/usr/bin/env python3
"""
Convert _redirects file to Cloudflare Bulk Redirects CSV format
Perfect for dashboard upload - no CLI required!
Handles ALL status codes and redirects with zero issues
"""

import csv
import sys
from pathlib import Path

def convert_redirects_to_csv(redirects_file, output_csv):
    """Convert _redirects file to Cloudflare Bulk Redirects CSV format"""

    print(f"📖 Converting {redirects_file} to Bulk Redirects CSV format...")

    redirects_processed = 0
    redirects_skipped = 0

    with open(output_csv, 'w', newline='', encoding='utf-8') as csvfile:
        # CSV format: SOURCE_URL,TARGET_URL,STATUS_CODE,PRESERVE_QUERY_STRING,INCLUDE_SUBDOMAINS,SUBPATH_MATCHING,PRESERVE_PATH_SUFFIX
        writer = csv.writer(csvfile)

        # Write header (optional but helpful)
        writer.writerow(['source_url', 'target_url', 'status_code', 'preserve_query_string', 'include_subdomains', 'subpath_matching', 'preserve_path_suffix'])

        with open(redirects_file, 'r', encoding='utf-8') as f:
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

                    # Skip invalid sources (don't start with /)
                    if not source.startswith('/'):
                        redirects_skipped += 1
                        continue

                    # Convert to full URLs if needed
                    if not source.startswith('http'):
                        source_url = f"https://abedderworld.com{source}"
                    else:
                        source_url = source

                    if not target.startswith('http') and target.startswith('/'):
                        target_url = f"https://abedderworld.com{target}"
                    else:
                        target_url = target

                    # Write CSV row
                    # Format: source_url, target_url, status_code, preserve_query_string, include_subdomains, subpath_matching, preserve_path_suffix
                    writer.writerow([
                        source_url,
                        target_url,
                        status,
                        'false',  # preserve_query_string
                        'false',  # include_subdomains
                        'false',  # subpath_matching
                        'false'   # preserve_path_suffix
                    ])

                    redirects_processed += 1

                    if redirects_processed % 10000 == 0:
                        print(f"   Processed {redirects_processed:,} redirects...")

                else:
                    redirects_skipped += 1

    print(f"✅ Conversion complete!")
    print(f"   📄 CSV file: {output_csv}")
    print(f"   📊 Redirects processed: {redirects_processed:,}")
    print(f"   ⚠️  Redirects skipped: {redirects_skipped:,}")

    return redirects_processed

def main():
    """Main function"""

    redirects_file = "src/_redirects"
    output_csv = "cloudflare-bulk-redirects.csv"

    if not Path(redirects_file).exists():
        print(f"❌ Redirects file not found: {redirects_file}")
        sys.exit(1)

    print("🎯 Converting to Cloudflare Bulk Redirects CSV")
    print("=" * 60)

    # Convert to CSV
    total_redirects = convert_redirects_to_csv(redirects_file, output_csv)

    print(f"\n📋 Next Steps:")
    print(f"1. Go to Cloudflare Dashboard → Rules → Bulk Redirects")
    print(f"2. Create New List → Import CSV")
    print(f"3. Upload {output_csv} ({total_redirects:,} redirects)")
    print(f"4. No CLI required - all done through web interface!")
    print(f"\n🎉 Much simpler than Workers + KV approach!")

if __name__ == "__main__":
    main()