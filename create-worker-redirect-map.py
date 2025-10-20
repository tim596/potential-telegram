#!/usr/bin/env python3
"""
Convert CSV redirects to optimized JavaScript Map for Cloudflare Worker
Creates efficient lookup structure for 53K+ redirects
"""

import csv
import json

def create_worker_redirect_map(input_file, output_file):
    """Convert CSV to JavaScript Map format for Cloudflare Worker"""

    redirects = {}
    processed = 0

    print(f"Reading redirects from {input_file}...")

    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            source_url = row['source_url']
            target_url = row['target_url']

            # Convert from absolute URLs back to relative paths for Worker
            if source_url.startswith('https://abedderworld.com'):
                source_url = source_url.replace('https://abedderworld.com', '')
            if target_url.startswith('https://abedderworld.com'):
                target_url = target_url.replace('https://abedderworld.com', '')

            # Store in redirects map
            redirects[source_url] = target_url
            processed += 1

            if processed % 5000 == 0:
                print(f"Processed {processed:,} redirects...")

    print(f"Creating JavaScript file: {output_file}")

    # Create JavaScript file with redirect map
    js_content = f'''// Cloudflare Worker Redirect Map
// Generated from {processed:,} redirects
// Auto-generated - do not edit manually

const REDIRECT_MAP = new Map([
'''

    # Add all redirects as Map entries
    for source, target in redirects.items():
        # Escape any quotes in URLs
        source_escaped = source.replace('"', '\\"')
        target_escaped = target.replace('"', '\\"')
        js_content += f'  ["{source_escaped}", "{target_escaped}"],\n'

    js_content += ''']);

// Export for use in Worker
export { REDIRECT_MAP };
'''

    # Write JavaScript file
    with open(output_file, 'w', encoding='utf-8') as jsfile:
        jsfile.write(js_content)

    print(f"✅ JavaScript redirect map created: {output_file}")
    print(f"📊 Contains {len(redirects):,} redirect mappings")

    # Calculate estimated file size
    estimated_size = len(js_content) / (1024 * 1024)
    print(f"📁 Estimated file size: {estimated_size:.1f}MB")

    return True

def main():
    input_file = "cloudflare-bulk-redirects-fixed.csv"  # Use relative URLs version
    output_file = "redirect-map.js"

    print("🗺️  Creating Cloudflare Worker redirect map")
    print("=" * 60)

    create_worker_redirect_map(input_file, output_file)

    print("\n✅ Redirect map created successfully!")
    print("📋 Next: Create Cloudflare Worker that uses this map")

if __name__ == "__main__":
    main()