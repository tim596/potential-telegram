#!/usr/bin/env python3
"""
Deduplicate redirects CSV file by removing duplicate source URLs
Prioritizes relative URLs over absolute ones and keeps trailing slash versions
"""

import csv
import json
from collections import defaultdict

def deduplicate_redirects(input_file, output_file):
    """Remove duplicate source URLs, keeping best target for each"""

    print(f"🔍 Analyzing duplicates in {input_file}...")

    # Track all redirects by source URL
    redirects = {}
    duplicates = defaultdict(list)
    total_processed = 0

    # Read and analyze all redirects
    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            source_url = row['source_url']
            target_url = row['target_url']
            total_processed += 1

            # Track for duplicate analysis
            if source_url in redirects:
                duplicates[source_url].append(target_url)
            else:
                duplicates[source_url] = [target_url]

            # Determine best target URL to keep
            if source_url not in redirects:
                redirects[source_url] = target_url
            else:
                current_target = redirects[source_url]

                # Priority rules:
                # 1. Relative URLs over absolute URLs
                # 2. Shorter URLs (less complex)
                # 3. URLs without query parameters

                def score_url(url):
                    score = 0
                    if url.startswith('/'):  # Relative URL
                        score += 100
                    if '?' not in url:  # No query params
                        score += 10
                    score -= len(url)  # Shorter is better
                    return score

                if score_url(target_url) > score_url(current_target):
                    redirects[source_url] = target_url

    # Count duplicates
    duplicate_count = sum(1 for urls in duplicates.values() if len(urls) > 1)
    unique_count = len(redirects)

    print(f"📊 Analysis complete:")
    print(f"   Total entries: {total_processed:,}")
    print(f"   Unique sources: {unique_count:,}")
    print(f"   Duplicate sources: {duplicate_count:,}")
    print(f"   Duplicates removed: {total_processed - unique_count:,}")

    # Show some duplicate examples
    print(f"\n🔍 Sample duplicates found:")
    sample_count = 0
    for source, targets in duplicates.items():
        if len(targets) > 1 and sample_count < 5:
            print(f"   {source} -> {len(targets)} targets:")
            for target in targets[:3]:  # Show first 3
                print(f"     - {target}")
            if len(targets) > 3:
                print(f"     ... and {len(targets) - 3} more")
            sample_count += 1

    # Write clean CSV
    print(f"\n✅ Creating clean file: {output_file}")
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['source_url', 'target_url']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()

        for source_url, target_url in redirects.items():
            writer.writerow({
                'source_url': source_url,
                'target_url': target_url
            })

    print(f"✅ Clean redirects file created: {output_file}")
    print(f"📊 Contains {len(redirects):,} unique redirects")

    return len(redirects)

def create_kv_array_from_clean(input_file, output_file):
    """Create KV array format from clean CSV"""

    kv_array = []

    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            kv_array.append({
                "key": row['source_url'],
                "value": row['target_url']
            })

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(kv_array, f, separators=(',', ':'))

    print(f"✅ KV array format created: {output_file}")
    print(f"📊 Contains {len(kv_array):,} key-value pairs")

def main():
    input_file = "cloudflare-bulk-redirects-fixed.csv"
    clean_file = "cloudflare-bulk-redirects-clean.csv"
    kv_file = "redirects-kv-array-clean.json"

    print("🧹 Deduplicating redirects for complete Cloudflare upload")
    print("=" * 60)

    # Deduplicate
    unique_count = deduplicate_redirects(input_file, clean_file)

    # Create KV format
    create_kv_array_from_clean(clean_file, kv_file)

    print(f"\n📋 Files created:")
    print(f"   📄 {clean_file} - Clean CSV ({unique_count:,} redirects)")
    print(f"   📄 {kv_file} - KV array format for upload")

    print(f"\n🚀 Next steps:")
    print(f"1. Upload clean data: python3 create-kv-upload-script.py (using clean file)")
    print(f"2. Run: ./upload-to-kv.sh")
    print(f"3. All {unique_count:,} redirects will work at Cloudflare edge")

if __name__ == "__main__":
    main()