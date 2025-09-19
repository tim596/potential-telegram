#!/usr/bin/env python3
"""
Validate redirect mappings against actual Eleventy site structure
Usage: python3 scripts/validate-redirects.py
"""

import os
import glob
import csv
import sys
from pathlib import Path

def get_eleventy_pages():
    """Get all generated Eleventy pages from dist directory"""
    pages = set()

    # Look for HTML files in dist directory
    dist_dir = "dist"
    if not os.path.exists(dist_dir):
        print("Error: dist directory not found. Run 'npm run build:prod' first.")
        return pages

    for html_file in glob.glob(f"{dist_dir}/**/*.html", recursive=True):
        # Convert file path to URL path
        rel_path = os.path.relpath(html_file, dist_dir)

        # Convert index.html to directory path
        if rel_path.endswith('/index.html'):
            url_path = '/' + rel_path[:-10]  # Remove /index.html
        elif rel_path == 'index.html':
            url_path = '/'
        else:
            url_path = '/' + rel_path[:-5]  # Remove .html

        # Ensure trailing slash for directories
        if url_path != '/' and not url_path.endswith('/'):
            url_path += '/'

        pages.add(url_path)

    return pages

def validate_redirect_file(redirect_file, eleventy_pages):
    """Validate redirects in a file against actual pages"""
    issues = []
    valid_redirects = 0

    if not os.path.exists(redirect_file):
        return [f"Redirect file not found: {redirect_file}"], 0

    with open(redirect_file, 'r') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()

            # Skip comments and empty lines
            if not line or line.startswith('#'):
                continue

            # Parse Netlify format: /old /new 301
            if ' 301' in line or ' 301!' in line:
                parts = line.split()
                if len(parts) >= 3:
                    old_path = parts[0]
                    new_path = parts[1]

                    # Check if new path exists in Eleventy site
                    if new_path not in eleventy_pages:
                        issues.append(f"Line {line_num}: Target page does not exist: {new_path}")
                    else:
                        valid_redirects += 1

    return issues, valid_redirects

def validate_csv_mappings(csv_file, eleventy_pages):
    """Validate CSV mappings against actual pages"""
    issues = []
    valid_mappings = 0

    if not os.path.exists(csv_file):
        return [f"CSV file not found: {csv_file}"], 0

    try:
        with open(csv_file, 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)

            # Find URL columns
            new_url_cols = ['new_url', 'eleventy_url', 'target_url', 'to', 'new']
            new_col = None

            for col in reader.fieldnames:
                col_lower = col.lower()
                if any(new_name in col_lower for new_name in new_url_cols):
                    new_col = col
                    break

            if not new_col:
                return [f"Could not find new URL column in CSV"], 0

            for row_num, row in enumerate(reader, 2):  # Start at 2 (header is row 1)
                new_url = row.get(new_col, '').strip()

                if new_url:
                    # Normalize URL path
                    if new_url.startswith('http'):
                        from urllib.parse import urlparse
                        new_url = urlparse(new_url).path

                    if not new_url.startswith('/'):
                        new_url = '/' + new_url

                    if not new_url.endswith('/') and new_url != '/':
                        new_url += '/'

                    # Check if page exists
                    if new_url not in eleventy_pages:
                        issues.append(f"Row {row_num}: Target page does not exist: {new_url}")
                    else:
                        valid_mappings += 1

        return issues, valid_mappings

    except Exception as e:
        return [f"Error reading CSV: {e}"], 0

def main():
    print("🔍 Validating redirect mappings against Eleventy site structure...")
    print()

    # Get all Eleventy pages
    eleventy_pages = get_eleventy_pages()
    print(f"Found {len(eleventy_pages)} pages in Eleventy site")

    if not eleventy_pages:
        print("❌ No pages found. Make sure to run 'npm run build:prod' first.")
        return

    total_issues = []
    total_valid = 0

    # Validate existing redirect files
    redirect_files = ['src/_redirects', 'src/.htaccess']
    for redirect_file in redirect_files:
        if os.path.exists(redirect_file):
            print(f"\n📋 Validating {redirect_file}...")
            issues, valid = validate_redirect_file(redirect_file, eleventy_pages)
            total_issues.extend([f"{redirect_file}: {issue}" for issue in issues])
            total_valid += valid
            print(f"   ✅ {valid} valid redirects")
            if issues:
                print(f"   ⚠️  {len(issues)} issues found")

    # Validate CSV files in scripts directory
    csv_files = glob.glob("scripts/*.csv")
    for csv_file in csv_files:
        print(f"\n📊 Validating {csv_file}...")
        issues, valid = validate_csv_mappings(csv_file, eleventy_pages)
        total_issues.extend([f"{csv_file}: {issue}" for issue in issues])
        total_valid += valid
        print(f"   ✅ {valid} valid mappings")
        if issues:
            print(f"   ⚠️  {len(issues)} issues found")

    # Summary
    print(f"\n📊 VALIDATION SUMMARY")
    print(f"✅ Total valid redirects/mappings: {total_valid}")
    print(f"⚠️  Total issues found: {len(total_issues)}")

    if total_issues:
        print(f"\n🔍 ISSUES FOUND:")
        for issue in total_issues[:20]:  # Show first 20 issues
            print(f"   • {issue}")

        if len(total_issues) > 20:
            print(f"   ... and {len(total_issues) - 20} more issues")

        print(f"\n💡 RECOMMENDATIONS:")
        print(f"   1. Check if target pages exist in your Eleventy site")
        print(f"   2. Verify URL paths match exactly (including trailing slashes)")
        print(f"   3. Run 'npm run build:prod' to ensure all pages are generated")
    else:
        print(f"\n🎉 All redirect mappings are valid!")

    # Show sample of existing pages for reference
    print(f"\n📋 SAMPLE ELEVENTY PAGES (first 10):")
    for page in sorted(list(eleventy_pages))[:10]:
        print(f"   {page}")

    if len(eleventy_pages) > 10:
        print(f"   ... and {len(eleventy_pages) - 10} more pages")

if __name__ == "__main__":
    main()