#!/usr/bin/env python3
"""
Convert redirects to KV array format expected by wrangler
"""

import csv
import json

def create_kv_array(input_file, output_file):
    """Convert CSV to KV array format"""

    kv_array = []

    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            source_url = row['source_url']
            target_url = row['target_url']

            kv_array.append({
                "key": source_url,
                "value": target_url
            })

    # Write in correct format
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(kv_array, f, separators=(',', ':'))

    print(f"✅ Created KV array format: {output_file}")
    print(f"📊 Contains {len(kv_array):,} key-value pairs")

def main():
    create_kv_array("cloudflare-bulk-redirects-fixed.csv", "redirects-kv-array.json")

if __name__ == "__main__":
    main()