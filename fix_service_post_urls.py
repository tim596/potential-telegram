#!/usr/bin/env python3
"""
Fix Service Post URLs to include .html extensions
"""

import os
import glob
import re

def add_permalink_to_service_post(filepath):
    """Add permalink with .html extension to a service post"""

    # Extract filename without path and extension for permalink
    filename = os.path.basename(filepath).replace('.md', '')
    permalink = f"/{filename}.html"

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if permalink already exists
    if 'permalink:' in content:
        print(f"Permalink already exists in {filepath}")
        return False

    # Find the frontmatter section
    lines = content.split('\n')
    frontmatter_end = -1

    for i, line in enumerate(lines):
        if i > 0 and line.strip() == '---':
            frontmatter_end = i
            break

    if frontmatter_end == -1:
        print(f"No frontmatter found in {filepath}")
        return False

    # Add permalink before the closing ---
    lines.insert(frontmatter_end, f"permalink: {permalink}")

    # Write back the file
    new_content = '\n'.join(lines)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"Added permalink {permalink} to {filepath}")
    return True

def main():
    base_dir = '/Users/timothysumerfield/Desktop/migration test 2/bedder-world-base2'
    os.chdir(base_dir)

    # Get all service posts (root level .md files)
    service_files = glob.glob('src/*.md')

    print(f"Found {len(service_files)} service post files to update")

    updated_count = 0
    for filepath in service_files:
        if add_permalink_to_service_post(filepath):
            updated_count += 1

    print(f"\nUpdated {updated_count} service post files with .html permalinks")

if __name__ == "__main__":
    main()