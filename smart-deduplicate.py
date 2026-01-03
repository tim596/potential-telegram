#!/usr/bin/env python3
"""
Smart deduplication that handles trailing slash variants properly
Keeps the version that redirects to a more important target
"""

import csv
import sys
from pathlib import Path

def smart_deduplicate_csv(input_csv, output_csv):
    """Smart deduplication handling trailing slash variants"""

    print(f"📖 Smart deduplicating {input_csv}...")

    redirects = {}  # source_url -> (target_url, status_code, full_row)
    duplicates_removed = 0
    trailing_slash_pairs = 0

    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)  # Read header

        for row in reader:
            source_url = row[0]
            target_url = row[1]

            # Check if we already have this URL or its trailing slash variant
            base_url = source_url.rstrip('/')
            slash_url = base_url + '/'

            existing_base = redirects.get(base_url)
            existing_slash = redirects.get(slash_url)

            if existing_base and existing_slash:
                # We have both versions, skip this one
                duplicates_removed += 1
                continue
            elif existing_base or existing_slash:
                # We have one version, decide which to keep
                existing_key = base_url if existing_base else slash_url
                existing_row = redirects[existing_key]
                existing_target = existing_row[0]

                # Priority rules:
                # 1. Keep redirect to more specific page over general page
                # 2. Keep redirect without trailing slash if targets are similar
                # 3. Keep first one if unsure

                keep_new = False

                # If new target is more specific (longer path), keep it
                if len(target_url.split('/')) > len(existing_target.split('/')):
                    keep_new = True
                # If targets are similar, prefer version without trailing slash
                elif target_url.replace('/', '') == existing_target.replace('/', ''):
                    if not source_url.endswith('/'):
                        keep_new = True

                if keep_new:
                    del redirects[existing_key]
                    redirects[source_url] = (target_url, row[2], row)
                    trailing_slash_pairs += 1
                else:
                    duplicates_removed += 1
                    continue
            else:
                # No conflict, add it
                redirects[source_url] = (target_url, row[2], row)

    # Write deduplicated CSV
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)

        # Sort by source URL for consistent output
        for source_url in sorted(redirects.keys()):
            writer.writerow(redirects[source_url][2])

    unique_redirects = len(redirects)
    print(f"   ✅ {output_csv}: {unique_redirects:,} unique redirects")
    print(f"   🗑️  Removed {duplicates_removed:,} duplicates")
    print(f"   🔀 Resolved {trailing_slash_pairs:,} trailing slash conflicts")

    return unique_redirects

def main():
    """Main function"""

    print("🎯 Smart Deduplicating 301 CSV Files")
    print("=" * 60)

    csv_files = [
        "cloudflare-301-part-01.csv",
        "cloudflare-301-part-02.csv",
        "cloudflare-301-part-03.csv",
        "cloudflare-301-part-04.csv",
        "cloudflare-301-part-05.csv",
        "cloudflare-301-part-06.csv"
    ]

    total_unique = 0

    for csv_file in csv_files:
        if Path(csv_file).exists():
            output_file = csv_file.replace(".csv", "-deduped.csv")
            unique_count = smart_deduplicate_csv(csv_file, output_file)
            total_unique += unique_count
        else:
            print(f"   ⚠️  {csv_file} not found, skipping...")

    print(f"\n📊 Summary:")
    print(f"   Total unique redirects: {total_unique:,}")
    print(f"   Deduplicated files created with '-deduped.csv' suffix")

    print(f"\n📋 Upload these files to Cloudflare Bulk Redirects:")
    for csv_file in csv_files:
        deduped_file = csv_file.replace(".csv", "-deduped.csv")
        if Path(deduped_file).exists():
            print(f"   - {deduped_file}")

    print(f"\n💡 Remaining trailing slash variants will be handled by Worker fallback")

if __name__ == "__main__":
    main()