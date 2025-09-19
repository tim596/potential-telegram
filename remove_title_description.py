#!/usr/bin/env python3
"""
Safely remove title and description from city location page frontmatter
while preserving all other fields and content.
"""

import os
import re
import glob

def process_file(file_path):
    """Process a single markdown file to remove title and description from frontmatter."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Split content into frontmatter and body
        if not content.startswith('---'):
            print(f"SKIP: {file_path} - No frontmatter found")
            return False

        parts = content.split('---', 2)
        if len(parts) < 3:
            print(f"SKIP: {file_path} - Invalid frontmatter structure")
            return False

        frontmatter = parts[1]
        body = parts[2]

        # Remove title and description lines while preserving other fields
        lines = frontmatter.split('\n')
        filtered_lines = []

        for line in lines:
            # Skip lines that start with 'title:' or 'description:'
            if line.strip().startswith('title:') or line.strip().startswith('description:'):
                print(f"REMOVING: {line.strip()}")
                continue
            filtered_lines.append(line)

        # Reconstruct the file
        new_frontmatter = '\n'.join(filtered_lines)
        new_content = f"---{new_frontmatter}---{body}"

        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"SUCCESS: {file_path}")
        return True

    except Exception as e:
        print(f"ERROR: {file_path} - {str(e)}")
        return False

def main():
    """Main function to process all city location files."""
    # Find all city location files in mattress-removal subdirectories
    base_dir = "./src/mattress-removal"
    pattern = f"{base_dir}/*/*.md"

    files = glob.glob(pattern)
    print(f"Found {len(files)} potential city files to process")

    # Filter out index.md files (state pages)
    city_files = [f for f in files if not f.endswith('/index.md')]
    print(f"Processing {len(city_files)} city files")

    success_count = 0
    error_count = 0

    for file_path in city_files:
        print(f"\nProcessing: {file_path}")
        if process_file(file_path):
            success_count += 1
        else:
            error_count += 1

    print(f"\n=== SUMMARY ===")
    print(f"Total files processed: {len(city_files)}")
    print(f"Successful: {success_count}")
    print(f"Errors: {error_count}")

if __name__ == "__main__":
    main()