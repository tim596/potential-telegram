#!/usr/bin/env python3
"""Check community partner URLs for broken links."""

import os
import re
import sys
from pathlib import Path
from urllib.parse import urlparse
import urllib.request
import urllib.error
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed

# Path to mattress-removal directory
BASE_DIR = Path(__file__).parent.parent / "src" / "mattress-removal"

def extract_urls_from_file(filepath):
    """Extract communityPartner URLs from a markdown file."""
    urls = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find all URLs in communityPartners section
        url_pattern = r'url:\s*(https?://[^\s\n]+)'
        matches = re.findall(url_pattern, content)
        for url in matches:
            urls.append((url.strip(), str(filepath)))
    except Exception as e:
        print(f"Error reading {filepath}: {e}")

    return urls

def check_url(url, timeout=10):
    """Check if a URL is accessible. Returns (url, status_code, error_message)."""
    try:
        # Create SSL context that doesn't verify (some sites have cert issues)
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'},
            method='HEAD'
        )

        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as response:
            return (url, response.getcode(), None)
    except urllib.error.HTTPError as e:
        return (url, e.code, str(e.reason))
    except urllib.error.URLError as e:
        return (url, None, str(e.reason))
    except Exception as e:
        return (url, None, str(e))

def main():
    print("Scanning for URLs in community partner files...")

    # Collect all URLs
    all_urls = []
    for md_file in BASE_DIR.rglob("*.md"):
        if md_file.name == "index.md":
            continue
        urls = extract_urls_from_file(md_file)
        all_urls.extend(urls)

    print(f"Found {len(all_urls)} total URLs")

    # Get unique URLs and track which files contain them
    url_to_files = {}
    for url, filepath in all_urls:
        if url not in url_to_files:
            url_to_files[url] = []
        url_to_files[url].append(filepath)

    unique_urls = list(url_to_files.keys())
    print(f"Found {len(unique_urls)} unique URLs to check")
    print()

    # Check URLs with thread pool
    broken_urls = []
    checked = 0

    print("Checking URLs (this may take a few minutes)...")

    with ThreadPoolExecutor(max_workers=20) as executor:
        future_to_url = {executor.submit(check_url, url): url for url in unique_urls}

        for future in as_completed(future_to_url):
            url = future_to_url[future]
            checked += 1

            try:
                url, status, error = future.result()

                if status is None or status >= 400:
                    broken_urls.append((url, status, error, url_to_files[url]))
                    print(f"[BROKEN] {url} - {error or status}")

                if checked % 50 == 0:
                    print(f"Progress: {checked}/{len(unique_urls)} checked...")

            except Exception as e:
                broken_urls.append((url, None, str(e), url_to_files[url]))

    print()
    print("=" * 60)
    print(f"RESULTS: {len(broken_urls)} broken URLs found out of {len(unique_urls)} unique URLs")
    print("=" * 60)

    if broken_urls:
        print("\nBROKEN URLS:")
        for url, status, error, files in sorted(broken_urls):
            print(f"\n  URL: {url}")
            print(f"  Status: {status or 'N/A'}")
            print(f"  Error: {error}")
            print(f"  Files ({len(files)}):")
            for f in files[:5]:  # Show first 5 files
                print(f"    - {f}")
            if len(files) > 5:
                print(f"    ... and {len(files) - 5} more")
    else:
        print("\nNo broken URLs found!")

    return len(broken_urls)

if __name__ == "__main__":
    sys.exit(main())
