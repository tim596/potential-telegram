#!/usr/bin/env python3
"""
Generate redirect rules from CSV mapping files
Supports both 301 redirects and 410 Gone status codes
Usage: python3 scripts/generate-redirects.py [csv_file] [--type redirect|delete]
"""

import csv
import sys
import os
import re
import argparse
from urllib.parse import urlparse

def clean_url_path(url):
    """Extract clean path from URL, removing domain and query params"""
    if url.startswith('http'):
        parsed = urlparse(url)
        path = parsed.path
    else:
        path = url

    # Ensure path starts with /
    if not path.startswith('/'):
        path = '/' + path

    # Remove trailing slash for consistency (except root)
    if path.endswith('/') and path != '/':
        path = path[:-1]

    return path

def generate_netlify_redirects(mappings, file_type="redirect"):
    """Generate Netlify _redirects format"""
    redirects = []

    if file_type == "redirect":
        redirects.append("# Generated 301 redirects from CSV mapping")
        redirects.append("# Format: /old-path /new-path 301")
        redirects.append("")

        for old_url, new_url in mappings:
            old_path = clean_url_path(old_url)
            new_path = clean_url_path(new_url)

            # Add both with and without trailing slash
            redirects.append(f"{old_path} {new_path}/ 301")
            redirects.append(f"{old_path}/ {new_path}/ 301")

    elif file_type == "delete":
        redirects.append("# Generated 410 Gone responses from CSV mapping")
        redirects.append("# Format: /deleted-path /410.html 410")
        redirects.append("")

        for url_entry in mappings:
            # Handle single URL entries for delete type
            if isinstance(url_entry, tuple):
                old_url = url_entry[0]  # Take first element if tuple
            else:
                old_url = url_entry

            old_path = clean_url_path(old_url)

            # Add both with and without trailing slash
            redirects.append(f"{old_path} /410.html 410")
            redirects.append(f"{old_path}/ /410.html 410")

    return "\n".join(redirects)

def generate_apache_redirects(mappings, file_type="redirect"):
    """Generate Apache .htaccess format"""
    redirects = []

    if file_type == "redirect":
        redirects.append("# Generated 301 redirects from CSV mapping")
        redirects.append("")

        for old_url, new_url in mappings:
            old_path = clean_url_path(old_url)
            new_path = clean_url_path(new_url)

            # Remove leading slash for RewriteRule pattern
            pattern = old_path[1:] if old_path.startswith('/') else old_path

            # Escape special regex characters
            pattern = re.escape(pattern)

            redirects.append(f"RewriteRule ^{pattern}/?$ {new_path}/ [R=301,L]")

    elif file_type == "delete":
        redirects.append("# Generated 410 Gone responses from CSV mapping")
        redirects.append("")

        for url_entry in mappings:
            # Handle single URL entries for delete type
            if isinstance(url_entry, tuple):
                old_url = url_entry[0]  # Take first element if tuple
            else:
                old_url = url_entry

            old_path = clean_url_path(old_url)

            # Remove leading slash for RewriteRule pattern
            pattern = old_path[1:] if old_path.startswith('/') else old_path

            # Escape special regex characters
            pattern = re.escape(pattern)

            redirects.append(f"RewriteRule ^{pattern}/?$ /410.html [R=410,L]")

    return "\n".join(redirects)

def auto_detect_csv_type(reader):
    """Auto-detect if CSV is for redirects or deletes"""
    if not reader.fieldnames:
        return "unknown"

    # Check for redirect patterns (two URL columns)
    url_cols = 0
    delete_indicators = ['delete', 'remove', 'gone', '410', 'url']

    for col in reader.fieldnames:
        col_lower = col.lower()
        if 'url' in col_lower or any(word in col_lower for word in ['old', 'new', 'from', 'to', 'source', 'target']):
            url_cols += 1

    # If only one URL-like column or has delete indicators, likely delete file
    if url_cols <= 1 or any(indicator in ' '.join(reader.fieldnames).lower() for indicator in delete_indicators):
        return "delete"
    else:
        return "redirect"

def process_csv_file(csv_file_path, file_type=None):
    """Process CSV file and extract URL mappings or delete URLs"""
    mappings = []

    try:
        with open(csv_file_path, 'r', newline='', encoding='utf-8') as file:
            # Try to detect delimiter
            sample = file.read(1024)
            file.seek(0)
            sniffer = csv.Sniffer()
            delimiter = sniffer.sniff(sample).delimiter

            reader = csv.DictReader(file, delimiter=delimiter)

            # Print available columns for user reference
            print(f"Available columns in CSV: {list(reader.fieldnames)}")

            # Auto-detect file type if not specified
            if not file_type:
                file_type = auto_detect_csv_type(reader)
                print(f"Auto-detected file type: {file_type}")

            if file_type == "redirect":
                # Handle redirect CSV (old_url -> new_url)
                old_url_cols = ['old_url', 'wordpress_url', 'source_url', 'from', 'old']
                new_url_cols = ['new_url', 'eleventy_url', 'target_url', 'to', 'new']

                old_col = None
                new_col = None

                for col in reader.fieldnames:
                    col_lower = col.lower()
                    if any(old_name in col_lower for old_name in old_url_cols):
                        old_col = col
                    if any(new_name in col_lower for new_name in new_url_cols):
                        new_col = col

                if not old_col or not new_col:
                    print(f"Could not auto-detect URL columns. Please specify:")
                    print(f"Available columns: {list(reader.fieldnames)}")
                    old_col = input("Enter old URL column name: ").strip()
                    new_col = input("Enter new URL column name: ").strip()

                print(f"Using redirect columns: '{old_col}' -> '{new_col}'")

                for row in reader:
                    old_url = row.get(old_col, '').strip()
                    new_url = row.get(new_col, '').strip()

                    if old_url and new_url:
                        mappings.append((old_url, new_url))

            elif file_type == "delete":
                # Handle delete CSV (just URLs to mark as 410)
                url_cols = ['url', 'delete_url', 'remove_url', 'old_url', 'path']
                url_col = None

                for col in reader.fieldnames:
                    col_lower = col.lower()
                    if any(url_name in col_lower for url_name in url_cols):
                        url_col = col
                        break

                # If no specific URL column found, use first column
                if not url_col:
                    url_col = reader.fieldnames[0]
                    print(f"No URL column detected, using first column: '{url_col}'")
                else:
                    print(f"Using delete URL column: '{url_col}'")

                for row in reader:
                    url = row.get(url_col, '').strip()
                    if url:
                        mappings.append(url)  # Just the URL, not a tuple

        print(f"Processed {len(mappings)} entries from {csv_file_path} (type: {file_type})")
        return mappings, file_type

    except Exception as e:
        print(f"Error processing CSV file: {e}")
        return [], file_type or "unknown"

def main():
    parser = argparse.ArgumentParser(description='Generate redirect rules from CSV files')
    parser.add_argument('csv_file', help='Path to CSV file')
    parser.add_argument('--type', choices=['redirect', 'delete'],
                       help='Type of CSV file (auto-detected if not specified)')
    parser.add_argument('--output-dir', default='scripts/output',
                       help='Output directory for generated files')

    args = parser.parse_args()

    if not os.path.exists(args.csv_file):
        print(f"Error: CSV file '{args.csv_file}' not found")
        return

    # Process CSV file
    mappings, detected_type = process_csv_file(args.csv_file, args.type)

    if not mappings:
        print("No valid entries found in CSV file")
        return

    # Generate redirect files
    netlify_content = generate_netlify_redirects(mappings, detected_type)
    apache_content = generate_apache_redirects(mappings, detected_type)

    # Write to output files
    output_dir = args.output_dir
    os.makedirs(output_dir, exist_ok=True)

    # Use different filenames based on type
    type_suffix = detected_type
    netlify_file = os.path.join(output_dir, f"netlify_{type_suffix}.txt")
    apache_file = os.path.join(output_dir, f"apache_{type_suffix}.txt")

    with open(netlify_file, 'w', encoding='utf-8') as f:
        f.write(netlify_content)

    with open(apache_file, 'w', encoding='utf-8') as f:
        f.write(apache_content)

    print(f"\n✅ Generated {detected_type} files:")
    print(f"- Netlify format: {netlify_file}")
    print(f"- Apache format: {apache_file}")
    print(f"- Processed {len(mappings)} entries")

    if detected_type == "redirect":
        print(f"\n📋 Next steps for REDIRECTS:")
        print(f"1. Review the generated redirect files")
        print(f"2. Add content to src/_redirects (Netlify)")
        print(f"3. Add content to src/.htaccess (Apache)")
        print(f"4. Test redirects on staging environment")
    elif detected_type == "delete":
        print(f"\n📋 Next steps for 410 GONE pages:")
        print(f"1. Review the generated 410 files")
        print(f"2. Add content to src/_redirects (Netlify)")
        print(f"3. Add content to src/.htaccess (Apache)")
        print(f"4. These URLs will return 410 Gone to search engines")
        print(f"5. Google will remove them from search results")

    print(f"\n💡 Usage examples:")
    print(f"# Append to redirect files:")
    print(f"cat {netlify_file} >> src/_redirects")
    print(f"cat {apache_file} >> src/.htaccess")

if __name__ == "__main__":
    main()