#!/usr/bin/env python3
"""
Create script to upload redirects to Cloudflare KV storage
Generates wrangler commands to populate KV with redirect data
"""

import csv
import json

def create_kv_upload_script(input_file, output_file):
    """Create script to upload redirects to Cloudflare KV"""

    print(f"Creating KV upload script from {input_file}...")

    redirects = {}
    processed = 0

    # Read CSV file
    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            source_url = row['source_url']
            target_url = row['target_url']

            # Store in redirects dict
            redirects[source_url] = target_url
            processed += 1

            if processed % 5000 == 0:
                print(f"Processed {processed:,} redirects...")

    print(f"Creating upload script: {output_file}")

    # Create bash script with wrangler commands
    script_content = f'''#!/bin/bash
# Cloudflare KV Upload Script for A Bedder World Redirects
# Uploads {len(redirects):,} redirects to Cloudflare KV storage
#
# Prerequisites:
# 1. Install wrangler: npm install -g wrangler
# 2. Login to Cloudflare: wrangler login
# 3. Create KV namespace: wrangler kv:namespace create "REDIRECTS"
# 4. Update wrangler.toml with the namespace binding

echo "🚀 Uploading {len(redirects):,} redirects to Cloudflare KV..."
echo "This may take several minutes..."

'''

    # Add wrangler commands for each redirect
    batch_size = 100
    batch_count = 0
    current_batch = []

    for source, target in redirects.items():
        current_batch.append({'key': source, 'value': target})

        if len(current_batch) >= batch_size:
            batch_count += 1
            batch_json = json.dumps(current_batch, separators=(',', ':'))

            # Escape quotes for bash
            batch_json_escaped = batch_json.replace('"', '\\"')

            script_content += f'echo "Uploading batch {batch_count}..."\n'
            script_content += f'wrangler kv:bulk put --binding REDIRECTS "{batch_json_escaped}"\n\n'

            current_batch = []

    # Handle remaining redirects
    if current_batch:
        batch_count += 1
        batch_json = json.dumps(current_batch, separators=(',', ':'))
        batch_json_escaped = batch_json.replace('"', '\\"')

        script_content += f'echo "Uploading final batch {batch_count}..."\n'
        script_content += f'wrangler kv:bulk put --binding REDIRECTS "{batch_json_escaped}"\n\n'

    script_content += f'''echo "✅ Upload complete! {len(redirects):,} redirects uploaded to KV."
echo "Next steps:"
echo "1. Deploy your Cloudflare Worker"
echo "2. Bind the REDIRECTS KV namespace to your worker"
echo "3. Set up routing to your domain"
'''

    # Write script file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(script_content)

    # Make script executable
    import os
    os.chmod(output_file, 0o755)

    print(f"✅ KV upload script created: {output_file}")
    print(f"📊 Will upload {len(redirects):,} redirects in {batch_count} batches")

    return True

def create_json_file(input_file, output_file):
    """Also create a JSON file for manual upload if needed"""

    redirects = {}
    with open(input_file, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            redirects[row['source_url']] = row['target_url']

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(redirects, f, separators=(',', ':'))

    print(f"✅ JSON file created: {output_file} ({len(redirects):,} redirects)")

def main():
    input_file = "cloudflare-bulk-redirects-clean.csv"
    script_file = "upload-to-kv-clean.sh"
    json_file = "redirects-clean.json"

    print("📦 Creating Cloudflare KV upload resources")
    print("=" * 60)

    create_kv_upload_script(input_file, script_file)
    create_json_file(input_file, json_file)

    print("\n📋 Next Steps:")
    print("1. Install wrangler: npm install -g wrangler")
    print("2. Login: wrangler login")
    print("3. Create KV namespace: wrangler kv:namespace create 'REDIRECTS'")
    print("4. Run upload script: ./upload-to-kv.sh")
    print("5. Deploy cloudflare-worker-kv.js")

if __name__ == "__main__":
    main()