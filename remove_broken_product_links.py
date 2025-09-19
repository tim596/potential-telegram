#!/usr/bin/env python3
"""
Remove broken product link markup while keeping the text content
"""

import os
import glob
import re

def remove_broken_links_from_file(filepath):
    """Remove broken product links while keeping text"""

    # List of broken product URLs to remove
    broken_urls = [
        'natural-latex-mattress-toppers.html',
        'metal-adjustable-bed-frame.html',
        'best-three-quarter-mattresses-to-buy-online.html',
        'best-olympic-queen-mattresses.html',
        'cot-mattress.html',
        'best-full-xl-mattresses.html',
        'fold-up-bed.html',
        'bed-slats.html',
        'low-bed-frames.html',
        'wooden-rustic-platform-beds.html',
        'gel-memory-foam-mattress-topper.html',
        'best-extra-firm-mattress.html',
        'hypoallergenic-mattress.html',
        'king-size-memory-foam-mattress.html'
    ]

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes_made = []

    # Pattern to match markdown links with broken URLs
    for broken_url in broken_urls:
        # Match: [text](https://www.abedderworld.com/broken-url/)
        pattern = r'\[([^\]]+)\]\(https://www\.abedderworld\.com/' + re.escape(broken_url) + r'[/]?\)'

        def replace_link(match):
            link_text = match.group(1)
            changes_made.append(f"Removed link: {match.group(0)} -> {link_text}")
            return link_text

        content = re.sub(pattern, replace_link, content)

    # Also handle cases where the link might not have text (just URL)
    for broken_url in broken_urls:
        # Match standalone URLs: https://www.abedderworld.com/broken-url/
        pattern = r'https://www\.abedderworld\.com/' + re.escape(broken_url) + r'[/]?'

        if re.search(pattern, content):
            content = re.sub(pattern, '', content)
            changes_made.append(f"Removed standalone URL: {broken_url}")

    # Clean up any double spaces or malformed text that might result
    content = re.sub(r'\s+', ' ', content)
    content = re.sub(r'\s*\.\s*\.\s*', '. ', content)

    # Write back if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    return changes_made

def main():
    base_dir = '/Users/timothysumerfield/Desktop/migration test 2/bedder-world-base2'
    os.chdir(base_dir)

    # Process all markdown files
    markdown_files = []
    for pattern in ['src/**/*.md', 'src/*.md']:
        markdown_files.extend(glob.glob(pattern, recursive=True))

    print(f"Processing {len(markdown_files)} markdown files...")

    total_changes = 0
    files_changed = 0
    all_changes = []

    for filepath in markdown_files:
        changes = remove_broken_links_from_file(filepath)
        if changes:
            files_changed += 1
            total_changes += len(changes)
            for change in changes:
                all_changes.append({
                    'file': filepath,
                    'change': change
                })

    print(f"\nCompleted removing broken product links:")
    print(f"Files changed: {files_changed}")
    print(f"Total changes: {total_changes}")

    # Show some examples
    if all_changes:
        print(f"\nExample changes:")
        for change in all_changes[:10]:
            print(f"  {change['file']}: {change['change']}")

    # Save detailed log
    if all_changes:
        import csv
        with open('broken_link_removal_log.csv', 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['file', 'change']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for change in all_changes:
                writer.writerow(change)
        print(f"\nDetailed log saved: broken_link_removal_log.csv")

if __name__ == "__main__":
    main()