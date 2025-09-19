#!/usr/bin/env python3

import os
import glob
import re
from pathlib import Path

def remove_title_metadescription_from_page(file_path):
    """Remove title and metaDescription lines from page frontmatter while preserving everything else"""
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

        # Remove metaDescription line (match various formats)
        frontmatter = re.sub(r'^metaDescription:\s*.*$', '', frontmatter, flags=re.MULTILINE)

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
    # Files that need title/metaDescription removed (from grep output)
    files_to_clean = [
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/washington-dc/ashburn.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/nevada/las-vegas.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/nevada/sparks.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/nevada/carson-city.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/oregon/grants-pass.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/oregon/albany.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/new-jersey/lakewood.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/new-jersey/jersey-city.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/new-jersey/toms-river.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/new-jersey/newark.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/tennessee/memphis.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/nebraska/omaha.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/nebraska/lincoln.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/pennsylvania/pittsburgh.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/pennsylvania/state-college.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/pennsylvania/york.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/pennsylvania/lancaster.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/pennsylvania/scranton.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/pennsylvania/altoona.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/montana/butte.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/montana/helena.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/montana/missoula.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/montana/bozeman.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/montana/billings.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/south-carolina/greenville.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/south-carolina/anderson.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/south-dakota/pierre.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/rhode-island/east-providence.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/rhode-island/woonsocket.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/new-hampshire/manchester.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/new-hampshire/rochester.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/new-hampshire/concord.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/new-york/rochester.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/new-york/new-york-city.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/mississippi/tupelo.md",
        "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal/mississippi/hattiesburg.md"
    ]

    # Since the list was truncated, let me find all files dynamically
    base_path = "/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/mattress-removal"
    all_files = []

    # Use glob to find all .md files
    for root, dirs, files in os.walk(base_path):
        for file in files:
            if file.endswith('.md') and file != 'index.md':  # Skip state index files
                full_path = os.path.join(root, file)

                # Check if this file has title or metaDescription
                try:
                    with open(full_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if re.search(r'^(title|metaDescription):', content, re.MULTILINE):
                            all_files.append(full_path)
                except:
                    continue

    print(f"Found {len(all_files)} files with title/metaDescription to clean...")

    updated_count = 0
    for file_path in sorted(all_files):
        if remove_title_metadescription_from_page(file_path):
            updated_count += 1

    print(f"\n✅ Processing complete!")
    print(f"📊 Updated {updated_count} out of {len(all_files)} location pages")

if __name__ == "__main__":
    main()