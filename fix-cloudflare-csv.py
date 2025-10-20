#!/usr/bin/env python3
"""
Fix Cloudflare CSV to ensure all URLs are valid
- Add trailing slashes where missing
- Ensure proper URL formatting
"""

import csv
import re

def fix_cloudflare_csv(input_file, output_file):
    """Fix URLs in Cloudflare CSV to ensure they're valid"""

    fixed_redirects = []
    errors_fixed = 0

    print(f"Reading and fixing CSV: {input_file}")

    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            source_url = row['source_url']
            target_url = row['target_url']
            status_code = row['status_code']

            # Fix target URLs that don't end with /
            if not target_url.endswith('/'):
                target_url = target_url + '/'
                errors_fixed += 1

            # Ensure source URLs start with /
            if not source_url.startswith('/'):
                source_url = '/' + source_url
                errors_fixed += 1

            fixed_redirects.append({
                'source_url': source_url,
                'target_url': target_url,
                'status_code': status_code
            })

    print(f"Fixed {errors_fixed:,} URL formatting issues")
    print(f"Writing fixed CSV: {output_file}")

    # Write fixed CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['source_url', 'target_url', 'status_code']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for redirect in fixed_redirects:
            writer.writerow(redirect)

    print(f"✅ Fixed CSV created: {output_file}")
    print(f"📊 Contains {len(fixed_redirects):,} redirect rules")

    return True

def main():
    input_file = "cloudflare-bulk-redirects.csv"
    output_file = "cloudflare-bulk-redirects-fixed.csv"

    print("🔧 Fixing Cloudflare CSV format issues")
    print("=" * 50)

    fix_cloudflare_csv(input_file, output_file)

    print("\n✅ CSV format fixed!")
    print(f"Upload this file to Cloudflare: {output_file}")

if __name__ == "__main__":
    main()