#!/usr/bin/env python3

import os
import glob
import re
from pathlib import Path

def remove_title_description_from_state_page(file_path):
    """Remove title and description lines from state page frontmatter while preserving everything else"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if file doesn't have frontmatter
        if not content.startswith('---'):
            print(f"Skipping {file_path} (no frontmatter)")
            return False

        # Split content into frontmatter and body
        parts = content.split('---', 2)
        if len(parts) < 3:
            print(f"Skipping {file_path} (invalid frontmatter)")
            return False

        frontmatter = parts[1]
        body = parts[2]

        # Track if we made changes
        original_frontmatter = frontmatter

        # Remove title line (match various formats)
        frontmatter = re.sub(r'^title:\s*.*$', '', frontmatter, flags=re.MULTILINE)

        # Remove description line (match various formats)
        frontmatter = re.sub(r'^description:\s*.*$', '', frontmatter, flags=re.MULTILINE)

        # Clean up multiple consecutive empty lines
        frontmatter = re.sub(r'\n\s*\n\s*\n', '\n\n', frontmatter)

        # Check if we made changes
        if frontmatter == original_frontmatter:
            print(f"No changes needed for {file_path}")
            return False

        # Reassemble the file
        new_content = f"---{frontmatter}---{body}"

        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f"✅ Updated {file_path}")
        return True

    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    base_path = "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal"

    # Find all state index.md files
    state_files = glob.glob(os.path.join(base_path, "*/index.md"))

    print(f"Found {len(state_files)} state pages to process...")

    updated_count = 0
    for file_path in sorted(state_files):
        if remove_title_description_from_state_page(file_path):
            updated_count += 1

    print(f"\n✅ Processing complete!")
    print(f"📊 Updated {updated_count} out of {len(state_files)} state pages")

if __name__ == "__main__":
    main()