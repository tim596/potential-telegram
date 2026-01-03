#!/usr/bin/env python3
"""
Create CSV with only 301 redirects for Bulk Redirects
Worker will handle 410/404 responses
"""

import csv
import sys
from pathlib import Path

def create_301_only_csv(redirects_file, output_csv):
    """Create CSV with only 301 status redirects"""

    print(f"📖 Processing {redirects_file} for 301 redirects only...")

    redirects_301 = 0
    redirects_skipped = 0

    with open(output_csv, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)

        # Write header
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

                    # Skip invalid sources
                    if not source.startswith('/'):
                        redirects_skipped += 1
                        continue

                    # ONLY include 301 redirects
                    if status == "301":
                        # Convert to full URLs
                        if not source.startswith('http'):
                            source_url = f"https://abedderworld.com{source}"
                        else:
                            source_url = source

                        if not target.startswith('http') and target.startswith('/'):
                            target_url = f"https://abedderworld.com{target}"
                        else:
                            target_url = target

                        # Write CSV row
                        writer.writerow([
                            source_url,
                            target_url,
                            status,
                            'false',  # preserve_query_string
                            'false',  # include_subdomains
                            'false',  # subpath_matching
                            'false'   # preserve_path_suffix
                        ])

                        redirects_301 += 1

                        if redirects_301 % 10000 == 0:
                            print(f"   Processed {redirects_301:,} 301 redirects...")
                    else:
                        redirects_skipped += 1

                else:
                    redirects_skipped += 1

    print(f"✅ 301-only CSV created!")
    print(f"   📄 CSV file: {output_csv}")
    print(f"   📊 301 redirects: {redirects_301:,}")
    print(f"   ⚠️  Other status codes skipped: {redirects_skipped:,}")

    return redirects_301

def main():
    """Main function"""

    redirects_file = "src/_redirects"
    output_csv = "cloudflare-301-only.csv"

    if not Path(redirects_file).exists():
        print(f"❌ Redirects file not found: {redirects_file}")
        sys.exit(1)

    print("🎯 Creating 301-Only CSV for Bulk Redirects")
    print("=" * 60)

    # Convert to CSV
    total_301s = create_301_only_csv(redirects_file, output_csv)

    # Check if we need to split (10K limit)
    if total_301s > 10000:
        chunks_needed = (total_301s + 9999) // 10000
        print(f"\n⚠️  {total_301s:,} redirects exceed 10K limit")
        print(f"📦 Will need {chunks_needed} separate uploads")

        # Split the 301-only CSV
        print(f"\n📝 Splitting into {chunks_needed} files...")

        with open(output_csv, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)
            rows = list(reader)

            for chunk_num in range(chunks_needed):
                start_idx = chunk_num * 10000
                end_idx = min(start_idx + 10000, len(rows))
                chunk_rows = rows[start_idx:end_idx]

                chunk_file = f"cloudflare-301-part-{chunk_num + 1:02d}.csv"

                with open(chunk_file, 'w', newline='', encoding='utf-8') as cf:
                    writer = csv.writer(cf)
                    writer.writerow(header)
                    writer.writerows(chunk_rows)

                print(f"   ✅ Created {chunk_file} ({len(chunk_rows):,} redirects)")

        print(f"\n📋 Upload {chunks_needed} files to Bulk Redirects")
    else:
        print(f"\n📋 Upload single file: {output_csv}")

    print(f"\n💡 Worker will handle 410/404 responses automatically")

if __name__ == "__main__":
    main()