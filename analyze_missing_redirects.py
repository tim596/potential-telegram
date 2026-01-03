#!/usr/bin/env python3
"""
Comprehensive Analysis: Missing Redirects
Compare _redirects file with KV storage to find exactly what's missing and why
"""

import requests
import json
import time
import sys
import os
from collections import defaultdict

# Cloudflare API configuration
API_TOKEN = 'rW9wd-Xt2WWk8LU8wwwEvs9u1p05Z_mnGyTcPQbi'
ACCOUNT_ID = '97219140dcc39cab87c330581cd1332f'
KV_NAMESPACE_ID = 'f4695384362148309e43b8455ef1379d'

def get_all_kv_keys():
    """Download complete list of all KV keys"""
    print("📥 Downloading all KV keys...")

    headers = {'Authorization': f'Bearer {API_TOKEN}'}
    base_url = f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/storage/kv/namespaces/{KV_NAMESPACE_ID}/keys'

    all_keys = set()
    cursor = None
    pages = 0

    while True:
        pages += 1
        url = base_url + '?limit=1000'
        if cursor:
            url += f'&cursor={cursor}'

        try:
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    keys = data.get('result', [])
                    for key in keys:
                        all_keys.add(key['name'])

                    if pages % 50 == 0:
                        print(f"   Downloaded {len(all_keys):,} keys so far...")

                    cursor = data.get('result_info', {}).get('cursor')
                    if not cursor:
                        break
                else:
                    print(f"API error: {data.get('errors', 'Unknown')}")
                    return None
            else:
                print(f"HTTP error: {response.status_code}")
                return None
        except Exception as e:
            print(f"Request error: {e}")
            return None

    print(f"✅ Downloaded {len(all_keys):,} KV keys total")
    return all_keys

def parse_redirects_file():
    """Parse _redirects file with same logic as upload script"""
    print("📖 Parsing _redirects file...")

    expected_redirects = set()
    skipped_redirects = []
    stats = {
        'total_lines': 0,
        'comments_blank': 0,
        'invalid_format': 0,
        'no_leading_slash': 0,
        'valid_redirects': 0
    }

    with open('src/_redirects', 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            stats['total_lines'] += 1
            line = line.strip()

            # Skip comments and blank lines
            if not line or line.startswith('#'):
                stats['comments_blank'] += 1
                continue

            # Parse redirect line
            parts = line.split()
            if len(parts) >= 2:
                source = parts[0]
                target = parts[1]

                # Apply same filtering as upload script
                if not source.startswith('/'):
                    stats['no_leading_slash'] += 1
                    skipped_redirects.append({
                        'line': line_num,
                        'source': source,
                        'reason': 'no_leading_slash'
                    })
                    continue

                expected_redirects.add(source)
                stats['valid_redirects'] += 1

            else:
                stats['invalid_format'] += 1
                skipped_redirects.append({
                    'line': line_num,
                    'source': line,
                    'reason': 'invalid_format'
                })

    print(f"✅ Parsed _redirects file:")
    print(f"   Total lines: {stats['total_lines']:,}")
    print(f"   Comments/blank: {stats['comments_blank']:,}")
    print(f"   Invalid format: {stats['invalid_format']:,}")
    print(f"   No leading slash: {stats['no_leading_slash']:,}")
    print(f"   Valid redirects: {stats['valid_redirects']:,}")

    return expected_redirects, skipped_redirects, stats

def analyze_missing_redirects(expected_redirects, kv_keys):
    """Find and analyze missing redirects"""
    print("🔍 Analyzing missing redirects...")

    missing_redirects = expected_redirects - kv_keys
    found_redirects = expected_redirects & kv_keys

    print(f"📊 Comparison Results:")
    print(f"   Expected redirects: {len(expected_redirects):,}")
    print(f"   Found in KV: {len(found_redirects):,}")
    print(f"   Missing from KV: {len(missing_redirects):,}")

    # Analyze patterns in missing redirects
    patterns = analyze_patterns(missing_redirects)

    return missing_redirects, patterns

def analyze_patterns(missing_redirects):
    """Analyze patterns in missing redirects"""
    print("🎯 Analyzing patterns in missing redirects...")

    patterns = {
        'by_extension': defaultdict(int),
        'by_length': defaultdict(int),
        'by_prefix': defaultdict(int),
        'by_case': defaultdict(int),
        'special_chars': defaultdict(int),
        'examples': {
            'very_long': [],
            'special_chars': [],
            'unusual_patterns': []
        }
    }

    for redirect in missing_redirects:
        # Extension analysis
        if '.' in redirect:
            ext = redirect.split('.')[-1].split('/')[0]
            patterns['by_extension'][ext] += 1
        else:
            patterns['by_extension']['no_extension'] += 1

        # Length analysis
        length_bucket = f"{(len(redirect) // 10) * 10}-{(len(redirect) // 10) * 10 + 9}"
        patterns['by_length'][length_bucket] += 1

        # Prefix analysis
        if len(redirect) > 1:
            prefix = redirect[1:3] if len(redirect) > 2 else redirect[1:]
            patterns['by_prefix'][prefix] += 1

        # Case analysis
        if redirect.isupper():
            patterns['by_case']['all_upper'] += 1
        elif redirect.islower():
            patterns['by_case']['all_lower'] += 1
        else:
            patterns['by_case']['mixed_case'] += 1

        # Special characters
        special_chars = set(redirect) - set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/-.')
        if special_chars:
            for char in special_chars:
                patterns['special_chars'][char] += 1
            if len(patterns['examples']['special_chars']) < 10:
                patterns['examples']['special_chars'].append(redirect)

        # Very long URLs
        if len(redirect) > 100:
            if len(patterns['examples']['very_long']) < 10:
                patterns['examples']['very_long'].append(redirect)

    return patterns

def print_analysis(patterns, missing_redirects):
    """Print detailed analysis results"""
    print("\n" + "="*80)
    print("📈 DETAILED MISSING REDIRECT ANALYSIS")
    print("="*80)

    # Top extensions
    print("\n🔗 Missing by Extension:")
    for ext, count in sorted(patterns['by_extension'].items(), key=lambda x: x[1], reverse=True)[:10]:
        percent = (count / len(missing_redirects)) * 100
        print(f"   .{ext}: {count:,} ({percent:.1f}%)")

    # Length distribution
    print("\n📏 Missing by Length:")
    for length_range, count in sorted(patterns['by_length'].items())[:10]:
        percent = (count / len(missing_redirects)) * 100
        print(f"   {length_range} chars: {count:,} ({percent:.1f}%)")

    # Top prefixes
    print("\n🔤 Missing by Prefix (top 20):")
    for prefix, count in sorted(patterns['by_prefix'].items(), key=lambda x: x[1], reverse=True)[:20]:
        percent = (count / len(missing_redirects)) * 100
        print(f"   /{prefix}*: {count:,} ({percent:.1f}%)")

    # Case analysis
    print("\n📝 Missing by Case:")
    for case_type, count in patterns['by_case'].items():
        percent = (count / len(missing_redirects)) * 100
        print(f"   {case_type}: {count:,} ({percent:.1f}%)")

    # Special characters
    if patterns['special_chars']:
        print("\n🔸 Special Characters in Missing:")
        for char, count in sorted(patterns['special_chars'].items(), key=lambda x: x[1], reverse=True)[:10]:
            percent = (count / len(missing_redirects)) * 100
            print(f"   '{char}': {count:,} ({percent:.1f}%)")

    # Examples
    print("\n📋 Example Missing Redirects:")
    if patterns['examples']['special_chars']:
        print("   With special chars:", patterns['examples']['special_chars'][:5])
    if patterns['examples']['very_long']:
        print("   Very long URLs:", [url[:50] + "..." for url in patterns['examples']['very_long'][:3]])

def save_missing_list(missing_redirects):
    """Save list of missing redirects to file"""
    filename = 'missing_redirects.txt'
    with open(filename, 'w') as f:
        for redirect in sorted(missing_redirects):
            f.write(redirect + '\n')
    print(f"💾 Saved {len(missing_redirects):,} missing redirects to {filename}")

def main():
    """Main analysis function"""
    print("🎯 MISSING REDIRECTS ANALYSIS")
    print("=" * 50)

    # Step 1: Get all KV keys
    kv_keys = get_all_kv_keys()
    if kv_keys is None:
        print("❌ Failed to get KV keys")
        return

    # Step 2: Parse _redirects file
    expected_redirects, skipped_redirects, stats = parse_redirects_file()

    # Step 3: Find missing redirects
    missing_redirects, patterns = analyze_missing_redirects(expected_redirects, kv_keys)

    # Step 4: Detailed analysis
    print_analysis(patterns, missing_redirects)

    # Step 5: Save results
    save_missing_list(missing_redirects)

    # Summary
    print(f"\n🎉 ANALYSIS COMPLETE")
    print(f"   Expected: {len(expected_redirects):,}")
    print(f"   In KV: {len(kv_keys):,}")
    print(f"   Missing: {len(missing_redirects):,}")
    print(f"   Success rate: {(len(kv_keys)/len(expected_redirects))*100:.1f}%")

if __name__ == "__main__":
    main()