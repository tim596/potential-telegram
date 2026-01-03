#!/usr/bin/env python3
"""
Remove duplicate source URLs from CSV files
Cloudflare rejects CSVs with duplicate source URLs
"""

import csv
import sys
from pathlib import Path

def deduplicate_csv(input_csv, output_csv):
    """Remove duplicate source URLs from CSV"""

    print(f"📖 Deduplicating {input_csv}...")

    seen_sources = set()
    unique_rows = []
    duplicates_removed = 0

    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)  # Read header
        unique_rows.append(header)

        for row in reader:
            source_url = row[0]  # First column is source_url

            if source_url not in seen_sources:
                seen_sources.add(source_url)
                unique_rows.append(row)
            else:
                duplicates_removed += 1

    # Write deduplicated CSV
    with open(output_csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(unique_rows)

    unique_redirects = len(unique_rows) - 1  # Subtract header
    print(f"   ✅ {output_csv}: {unique_redirects:,} unique redirects")
    print(f"   🗑️  Removed {duplicates_removed:,} duplicates")

    return unique_redirects

def main():
    """Main function"""

    print("🎯 Deduplicating 301 CSV Files")
    print("=" * 60)

    # Process all 301 CSV files
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
            output_file = csv_file.replace(".csv", "-clean.csv")
            unique_count = deduplicate_csv(csv_file, output_file)
            total_unique += unique_count
        else:
            print(f"   ⚠️  {csv_file} not found, skipping...")

    print(f"\n📊 Summary:")
    print(f"   Total unique redirects: {total_unique:,}")
    print(f"   Clean files created with '-clean.csv' suffix")

    print(f"\n📋 Upload these clean files to Cloudflare:")
    for csv_file in csv_files:
        clean_file = csv_file.replace(".csv", "-clean.csv")
        if Path(clean_file).exists():
            print(f"   - {clean_file}")

if __name__ == "__main__":
    main()