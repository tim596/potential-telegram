#!/usr/bin/env python3
"""
Test script on a small sample of files first.
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
    """Test on just a few files first."""
    # Test files
    test_files = [
        "./src/mattress-removal/california/anaheim.md",
        "./src/mattress-removal/texas/dallas.md",
        "./src/mattress-removal/arizona/phoenix.md"
    ]

    print(f"Testing on {len(test_files)} files first...")

    for file_path in test_files:
        if os.path.exists(file_path):
            print(f"\nProcessing: {file_path}")
            process_file(file_path)
        else:
            print(f"SKIP: {file_path} - File not found")

if __name__ == "__main__":
    main()