#!/usr/bin/env python3
"""
Split large CSV into 10,000-line chunks for Cloudflare Bulk Redirects
Cloudflare has a 10,000 redirect limit per list
"""

import csv
import math
from pathlib import Path

def split_csv(input_csv, chunk_size=10000):
    """Split CSV into chunks of specified size"""

    print(f"📖 Splitting {input_csv} into chunks of {chunk_size:,} redirects...")

    with open(input_csv, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)  # Read header row

        # Count total rows (excluding header)
        rows = list(reader)
        total_rows = len(rows)
        total_chunks = math.ceil(total_rows / chunk_size)

        print(f"📊 Total redirects: {total_rows:,}")
        print(f"📦 Will create {total_chunks} files of {chunk_size:,} redirects each")

        # Split into chunks
        for chunk_num in range(total_chunks):
            start_idx = chunk_num * chunk_size
            end_idx = min(start_idx + chunk_size, total_rows)
            chunk_rows = rows[start_idx:end_idx]

            # Create output filename
            output_file = f"cloudflare-bulk-redirects-part-{chunk_num + 1:02d}.csv"

            # Write chunk to file
            with open(output_file, 'w', newline='', encoding='utf-8') as chunk_file:
                writer = csv.writer(chunk_file)
                writer.writerow(header)  # Write header
                writer.writerows(chunk_rows)  # Write chunk data

            print(f"   ✅ Created {output_file} ({len(chunk_rows):,} redirects)")

        print(f"\n📋 Upload Instructions:")
        print(f"1. Go to Cloudflare Dashboard → Rules → Bulk Redirects")
        print(f"2. Create {total_chunks} separate lists:")
        for i in range(total_chunks):
            print(f"   - List {i+1}: Upload cloudflare-bulk-redirects-part-{i+1:02d}.csv")
        print(f"3. Each list will handle 10,000 redirects (Cloudflare's limit)")

        return total_chunks

def main():
    input_csv = "cloudflare-bulk-redirects.csv"

    if not Path(input_csv).exists():
        print(f"❌ File not found: {input_csv}")
        return

    print("🎯 Splitting CSV for Cloudflare Bulk Redirects")
    print("=" * 60)

    total_chunks = split_csv(input_csv)

    print(f"\n🎉 Successfully split into {total_chunks} files!")
    print(f"💡 Each file respects Cloudflare's 10,000 redirect limit")

if __name__ == "__main__":
    main()