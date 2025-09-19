#!/usr/bin/env python3
"""
Automated Internal Link Fix Script
Uses URL mappings to fix broken internal links in bulk
"""

import os
import json
import re
import glob
import shutil
from datetime import datetime

def load_url_mappings(filename='url-mappings.json'):
    """Load URL mappings from JSON file"""
    with open(filename, 'r') as f:
        return json.load(f)

def create_backup():
    """Create backup of src directory before making changes"""
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = f'src_backup_{timestamp}'

    print(f"Creating backup: {backup_dir}")
    shutil.copytree('src', backup_dir)
    return backup_dir

def fix_links_in_file(filepath, url_mappings):
    """Fix all internal links in a single file"""
    changes_made = []

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Sort mappings by length (longest first) to avoid partial replacements
        sorted_mappings = sorted(url_mappings.items(), key=lambda x: len(x[0]), reverse=True)

        for old_url, new_url in sorted_mappings:
            # Escape special regex characters in the old URL
            escaped_old_url = re.escape(old_url)

            # Replace exact matches
            pattern = r'\b' + escaped_old_url + r'\b'
            if re.search(pattern, content):
                content = re.sub(pattern, new_url, content)
                changes_made.append((old_url, new_url))

        # Handle some special cases with more flexible patterns
        # City page patterns that might have variations
        city_pattern = r'https://www\.abedderworld\.com/([A-Z][a-z]+(?:[A-Z][a-z]+)*)-([A-Z]{2})\b'
        def city_replacer(match):
            city_name = match.group(1)
            state_abbrev = match.group(2)

            # Try to find a mapping for this city
            original_url = match.group(0)
            if original_url in url_mappings:
                return url_mappings[original_url]

            # If no direct mapping, try some variations
            variations = [
                f"https://www.abedderworld.com/{city_name}-{state_abbrev}",
                f"https://www.abedderworld.com/{city_name.lower()}-{state_abbrev}",
                f"https://www.abedderworld.com/{city_name}-{state_abbrev}/"
            ]

            for variation in variations:
                if variation in url_mappings:
                    changes_made.append((original_url, url_mappings[variation]))
                    return url_mappings[variation]

            # If still no mapping found, return original
            return original_url

        content = re.sub(city_pattern, city_replacer, content)

        # Write back if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

    except Exception as e:
        print(f"Error processing {filepath}: {e}")

    return changes_made

def main():
    base_dir = '/Users/timothysumerfield/Desktop/migration test 2/bedder-world-base2'
    os.chdir(base_dir)

    print("Loading URL mappings...")
    url_mappings = load_url_mappings()
    print(f"Loaded {len(url_mappings)} URL mappings")

    print("Creating backup before making changes...")
    backup_dir = create_backup()

    # Find all markdown files
    markdown_files = []
    for pattern in ['src/**/*.md', 'src/*.md']:
        markdown_files.extend(glob.glob(pattern, recursive=True))

    print(f"Found {len(markdown_files)} markdown files to process")

    total_changes = 0
    files_changed = 0
    detailed_changes = []

    for i, filepath in enumerate(markdown_files):
        if i % 100 == 0:
            print(f"Processing {i}/{len(markdown_files)} files...")

        changes = fix_links_in_file(filepath, url_mappings)
        if changes:
            files_changed += 1
            total_changes += len(changes)
            for old_url, new_url in changes:
                detailed_changes.append({
                    'file': filepath,
                    'old_url': old_url,
                    'new_url': new_url
                })

    print(f"\nLink fixing complete!")
    print(f"Files changed: {files_changed}")
    print(f"Total link changes: {total_changes}")
    print(f"Backup created: {backup_dir}")

    # Save detailed change log
    if detailed_changes:
        import csv

        with open('link_changes_log.csv', 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['file', 'old_url', 'new_url']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for change in detailed_changes:
                writer.writerow(change)

        print(f"Detailed change log saved: link_changes_log.csv")

    # Show summary of most common changes
    if detailed_changes:
        change_counts = {}
        for change in detailed_changes:
            key = f"{change['old_url']} -> {change['new_url']}"
            change_counts[key] = change_counts.get(key, 0) + 1

        print(f"\nMost common changes:")
        sorted_changes = sorted(change_counts.items(), key=lambda x: x[1], reverse=True)
        for change, count in sorted_changes[:10]:
            print(f"  {count}x: {change}")

if __name__ == "__main__":
    main()