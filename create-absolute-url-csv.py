#!/usr/bin/env python3
"""
Convert relative URLs to absolute URLs for Cloudflare Bulk Redirects
Cloudflare might require absolute URLs with domain
"""

import csv

def create_absolute_url_csv(input_file, output_file, domain="https://abedderworld.com"):
    """Convert relative URLs to absolute URLs"""

    absolute_redirects = []

    print(f"Converting to absolute URLs with domain: {domain}")

    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            source_url = row['source_url']
            target_url = row['target_url']
            status_code = row['status_code']

            # Convert to absolute URLs
            if not source_url.startswith('http'):
                source_url = domain + source_url

            if not target_url.startswith('http'):
                target_url = domain + target_url

            absolute_redirects.append({
                'source_url': source_url,
                'target_url': target_url,
                'status_code': status_code
            })

    print(f"Writing absolute URL CSV: {output_file}")

    # Write absolute URL CSV
    with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['source_url', 'target_url', 'status_code']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for redirect in absolute_redirects:
            writer.writerow(redirect)

    print(f"✅ Absolute URL CSV created: {output_file}")
    print(f"📊 Contains {len(absolute_redirects):,} redirect rules")

    return True

def main():
    input_file = "cloudflare-bulk-redirects-fixed.csv"
    output_file = "cloudflare-bulk-redirects-absolute.csv"

    print("🌐 Converting to absolute URLs for Cloudflare")
    print("=" * 50)

    create_absolute_url_csv(input_file, output_file)

    print("\n✅ Absolute URL CSV created!")
    print(f"Try uploading this file to Cloudflare: {output_file}")

if __name__ == "__main__":
    main()