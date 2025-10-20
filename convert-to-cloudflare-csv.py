#!/usr/bin/env python3
"""
Convert Netlify _redirects file to Cloudflare CSV format
Preserves exact hierarchical routing structure (state/metro/suburb)
"""

import re
import csv
import sys

def convert_redirects_to_csv(input_file, output_file):
    """Convert Netlify _redirects to Cloudflare CSV format"""

    redirects = []
    total_lines = 0
    processed_redirects = 0
    skipped_lines = 0

    print(f"Reading redirects from {input_file}...")

    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            for line_num, line in enumerate(file, 1):
                total_lines += 1

                # Strip whitespace
                line = line.strip()

                # Skip empty lines and comments
                if not line or line.startswith('#'):
                    continue

                # Match redirect pattern: /source /target status
                # Handle both 301 and 302 redirects, but focus on 301s
                redirect_pattern = r'^(/\S+)\s+(/\S+)\s+30[12]$'
                match = re.match(redirect_pattern, line)

                if match:
                    source_url = match.group(1)
                    target_url = match.group(2)
                    status_code = "301"  # Standardize to 301 for Cloudflare

                    # Add to redirects list
                    redirects.append({
                        'source_url': source_url,
                        'target_url': target_url,
                        'status_code': status_code
                    })
                    processed_redirects += 1

                    # Progress indicator for large files
                    if processed_redirects % 5000 == 0:
                        print(f"Processed {processed_redirects:,} redirects...")

                else:
                    # Check if it's a 404 redirect or other format
                    if '404' in line or line.startswith('/wp-'):
                        skipped_lines += 1
                    else:
                        # Log unmatched lines for debugging
                        if processed_redirects < 10:  # Only show first few for debugging
                            print(f"Skipped line {line_num}: {line}")
                        skipped_lines += 1

    except FileNotFoundError:
        print(f"Error: File {input_file} not found!")
        return False
    except Exception as e:
        print(f"Error reading file: {e}")
        return False

    print(f"\nConversion Summary:")
    print(f"Total lines processed: {total_lines:,}")
    print(f"Redirects converted: {processed_redirects:,}")
    print(f"Lines skipped: {skipped_lines:,}")

    # Write CSV file
    print(f"\nWriting CSV to {output_file}...")

    try:
        with open(output_file, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['source_url', 'target_url', 'status_code']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            # Write header
            writer.writeheader()

            # Write all redirects
            for redirect in redirects:
                writer.writerow(redirect)

        print(f"✅ Successfully created {output_file}")
        print(f"📊 Contains {len(redirects):,} redirect rules")
        print(f"📁 File ready for Cloudflare bulk upload")

        return True

    except Exception as e:
        print(f"Error writing CSV: {e}")
        return False

def main():
    input_file = "src/_redirects"
    output_file = "cloudflare-bulk-redirects.csv"

    print("🚀 Converting Netlify redirects to Cloudflare CSV format")
    print("=" * 60)

    success = convert_redirects_to_csv(input_file, output_file)

    if success:
        print("\n✅ Conversion completed successfully!")
        print("\nNext steps:")
        print("1. Go to Cloudflare Dashboard → Rules → Redirect Rules")
        print("2. Click 'Create rule' → 'Bulk Redirects'")
        print(f"3. Upload the file: {output_file}")
        print("4. Enable Cloudflare proxy on your domain")
        print("5. Test a few redirects to confirm they work")
        print("\n⚠️  Note: Keep your original _redirects file as backup!")
    else:
        print("\n❌ Conversion failed!")
        sys.exit(1)

if __name__ == "__main__":
    main()