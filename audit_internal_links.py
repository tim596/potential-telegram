#!/usr/bin/env python3
"""
Internal Link Audit Script
Extracts all abedderworld.com links from markdown files and generates comprehensive CSV report
"""

import os
import re
import csv
import glob
from urllib.parse import urlparse, urljoin

def extract_links_from_file(filepath):
    """Extract all abedderworld.com links from a markdown file"""
    links = []

    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        for line_num, line in enumerate(lines, 1):
            # Find all abedderworld.com links (multiple patterns)
            patterns = [
                r'https?://(?:www\.)?abedderworld\.com[^\s\)]*',  # Standard URLs
                r'\[([^\]]*)\]\((https?://(?:www\.)?abedderworld\.com[^\)]*)\)',  # Markdown links
                r'href=["\']([^"\']*abedderworld\.com[^"\']*)["\']',  # HTML href
            ]

            for pattern in patterns:
                matches = re.finditer(pattern, line, re.IGNORECASE)
                for match in matches:
                    if 'abedderworld.com' in match.group().lower():
                        # Extract URL and link text
                        if pattern.startswith(r'\['):  # Markdown link pattern
                            link_text = match.group(1)
                            url = match.group(2)
                        elif pattern.startswith('href'):  # HTML href pattern
                            url = match.group(1)
                            link_text = ''
                        else:  # Standard URL pattern
                            url = match.group()
                            link_text = ''

                        # Clean up URL
                        url = url.strip()
                        if url.endswith('/'):
                            url = url[:-1]

                        # Get context (surrounding text)
                        context_start = max(0, match.start() - 50)
                        context_end = min(len(line), match.end() + 50)
                        context = line[context_start:context_end].strip()

                        links.append({
                            'file': filepath,
                            'line_number': line_num,
                            'url': url,
                            'link_text': link_text,
                            'context': context,
                            'line_content': line.strip()
                        })

    except Exception as e:
        print(f"Error processing {filepath}: {e}")

    return links

def categorize_link(url, link_text):
    """Categorize the type of internal link"""
    url_lower = url.lower()

    # City-specific service pages (old format)
    if re.search(r'/[A-Z][a-z]+-[A-Z]{2}/?$', url):
        return 'city_page_old_format'

    # State-specific pages
    if '/mattress-removal/' in url_lower:
        return 'mattress_removal_page'

    # Service pages
    service_pages = ['/commercial/', '/pricing/', '/how-it-works/', '/what-we-take/',
                    '/about/', '/contact/', '/faqs/', '/blog/', '/book-online/']
    for page in service_pages:
        if page in url_lower:
            return 'service_page'

    # Blog posts with .html
    if '.html' in url_lower:
        return 'blog_post_old_format'

    # WordPress-style URLs
    if re.search(r'/[a-z-]+/$', url) and url.count('/') >= 4:
        return 'wordpress_style_url'

    # Product/info pages
    product_keywords = ['mattress', 'bed', 'frame', 'disposal', 'recycling']
    for keyword in product_keywords:
        if keyword in url_lower or keyword in link_text.lower():
            return 'product_info_page'

    return 'other'

def main():
    base_dir = '/Users/timothysumerfield/Desktop/migration test 2/bedder-world-base2'
    os.chdir(base_dir)

    # Find all markdown files
    markdown_files = []
    for pattern in ['src/**/*.md', 'src/*.md']:
        markdown_files.extend(glob.glob(pattern, recursive=True))

    print(f"Found {len(markdown_files)} markdown files to analyze")

    all_links = []
    file_count = 0

    for filepath in markdown_files:
        file_count += 1
        if file_count % 50 == 0:
            print(f"Processed {file_count}/{len(markdown_files)} files...")

        links = extract_links_from_file(filepath)
        for link in links:
            link['category'] = categorize_link(link['url'], link['link_text'])
            link['relative_file'] = os.path.relpath(link['file'], base_dir)
        all_links.extend(links)

    print(f"\nExtracted {len(all_links)} internal links from {file_count} files")

    # Generate CSV report
    csv_filename = 'internal-links-audit.csv'
    with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['file', 'relative_file', 'line_number', 'url', 'link_text',
                     'category', 'context', 'line_content']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for link in all_links:
            writer.writerow(link)

    print(f"Generated comprehensive audit: {csv_filename}")

    # Generate summary statistics
    categories = {}
    for link in all_links:
        cat = link['category']
        categories[cat] = categories.get(cat, 0) + 1

    print(f"\nLink Categories Summary:")
    for category, count in sorted(categories.items()):
        print(f"  {category}: {count} links")

    # Show some examples of potentially broken links
    print(f"\nPotentially Broken Link Examples:")
    problematic_categories = ['city_page_old_format', 'blog_post_old_format', 'wordpress_style_url']

    for category in problematic_categories:
        examples = [link for link in all_links if link['category'] == category][:3]
        if examples:
            print(f"\n{category.replace('_', ' ').title()}:")
            for example in examples:
                print(f"  {example['url']} (in {example['relative_file']}:{example['line_number']})")

if __name__ == "__main__":
    main()