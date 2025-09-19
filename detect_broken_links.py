#!/usr/bin/env python3
"""
Broken Link Detection Script
Analyzes the internal links audit and identifies broken links with fix recommendations
"""

import os
import csv
import json
import glob
import re
from urllib.parse import urlparse

def load_audit_data(csv_filename='internal-links-audit.csv'):
    """Load the internal links audit CSV data"""
    links = []
    with open(csv_filename, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            links.append(row)
    return links

def get_current_site_structure():
    """Get the current site structure from dist folder"""
    dist_pages = set()

    # Get all HTML files in dist
    if os.path.exists('dist'):
        for root, dirs, files in os.walk('dist'):
            for file in files:
                if file.endswith('.html'):
                    # Convert file path to URL path
                    rel_path = os.path.relpath(os.path.join(root, file), 'dist')
                    if file == 'index.html':
                        # index.html becomes the directory path
                        url_path = '/' + os.path.dirname(rel_path).replace('\\', '/')
                        if url_path == '/.':
                            url_path = '/'
                    else:
                        # Regular HTML file
                        url_path = '/' + rel_path.replace('\\', '/').replace('.html', '')

                    dist_pages.add(url_path.replace('//', '/'))

    return dist_pages

def analyze_city_pages():
    """Analyze city page mappings from current site structure"""
    city_mappings = {}

    # Get current mattress-removal city pages
    mattress_removal_pattern = 'src/mattress-removal/**/*.md'
    city_files = glob.glob(mattress_removal_pattern, recursive=True)

    for city_file in city_files:
        # Skip state index files
        if city_file.endswith('/index.md'):
            continue

        # Extract state and city from path
        parts = city_file.replace('src/mattress-removal/', '').replace('.md', '').split('/')
        if len(parts) == 2:
            state, city = parts
            # Create old format URL
            old_url_patterns = [
                f"https://www.abedderworld.com/{city.title()}-{state.upper()}",
                f"https://www.abedderworld.com/{city.replace('-', ' ').title().replace(' ', '')}-{state.upper()}",
                f"https://www.abedderworld.com/{city}-{state.upper()}"
            ]

            new_url = f"/mattress-removal/{state}/{city}/"

            for old_pattern in old_url_patterns:
                city_mappings[old_pattern] = new_url

    return city_mappings

def check_link_status(url, dist_pages, city_mappings):
    """Check if a link is broken and suggest fixes"""
    original_url = url

    # Remove protocol and domain
    if 'abedderworld.com' in url:
        path = url.split('abedderworld.com', 1)[1] if 'abedderworld.com' in url else url
        if not path.startswith('/'):
            path = '/' + path
    else:
        path = url

    # Remove trailing slash for comparison
    clean_path = path.rstrip('/')
    if clean_path == '':
        clean_path = '/'

    status = 'unknown'
    fix_recommendation = ''
    new_url = ''
    priority = 'medium'

    # Check if URL exists in current site
    if clean_path in dist_pages or path in dist_pages:
        status = 'working'
        return status, fix_recommendation, new_url, 'low'

    # Check city page mappings
    for old_city_url, new_city_url in city_mappings.items():
        if original_url.startswith(old_city_url):
            status = 'broken_city_page'
            fix_recommendation = f'Update to new city page format'
            new_url = new_city_url
            priority = 'high'
            return status, fix_recommendation, new_url, priority

    # Check for old blog post format (.html)
    if '.html' in path:
        # Try removing .html and checking if it exists
        html_removed = path.replace('.html', '').rstrip('/')
        if html_removed in dist_pages:
            status = 'broken_html_extension'
            fix_recommendation = 'Remove .html extension'
            new_url = html_removed + '/'
            priority = 'high'
            return status, fix_recommendation, new_url, priority

        # Check if it's a blog post that should be in /blog/
        blog_path = '/blog' + html_removed
        if blog_path in dist_pages:
            status = 'broken_blog_path'
            fix_recommendation = 'Move to /blog/ path and remove .html'
            new_url = blog_path + '/'
            priority = 'high'
            return status, fix_recommendation, new_url, priority

    # Check for pages that should be in blog
    blog_keywords = ['mattress', 'bed', 'disposal', 'recycling', 'how-to']
    if any(keyword in path.lower() for keyword in blog_keywords):
        possible_blog_path = '/blog' + clean_path
        if possible_blog_path in dist_pages:
            status = 'should_be_blog'
            fix_recommendation = 'Update to blog path'
            new_url = possible_blog_path + '/'
            priority = 'medium'
            return status, fix_recommendation, new_url, priority

    # Check common service pages that might have moved
    service_redirects = {
        '/book-online': '/pricing',  # Assuming book online redirects to pricing
        '/commercial': '/commercial',
        '/pricing': '/pricing',
        '/how-it-works': '/how-it-works',
        '/what-we-take': '/what-we-take',
        '/about': '/about',
        '/contact': '/contact',
        '/faqs': '/faqs'
    }

    for old_service, new_service in service_redirects.items():
        if path.startswith(old_service):
            if new_service in dist_pages:
                status = 'working'
                return status, fix_recommendation, new_url, 'low'
            else:
                status = 'broken_service_page'
                fix_recommendation = f'Check if {new_service} exists'
                new_url = new_service + '/'
                priority = 'medium'
                return status, fix_recommendation, new_url, priority

    # If we get here, it's likely a broken link
    status = 'broken'
    fix_recommendation = 'Manual review required - link may be outdated or page may not exist'
    priority = 'medium'

    return status, fix_recommendation, new_url, priority

def main():
    base_dir = '/Users/timothysumerfield/Desktop/migration test 2/bedder-world-base2'
    os.chdir(base_dir)

    print("Loading internal links audit...")
    links = load_audit_data()

    print("Analyzing current site structure...")
    dist_pages = get_current_site_structure()
    print(f"Found {len(dist_pages)} pages in current site")

    print("Building city page mappings...")
    city_mappings = analyze_city_pages()
    print(f"Found {len(city_mappings)} city page mappings")

    print("Checking link status...")
    broken_links = []
    status_counts = {}

    for i, link in enumerate(links):
        if i % 500 == 0:
            print(f"Checked {i}/{len(links)} links...")

        status, fix_rec, new_url, priority = check_link_status(
            link['url'], dist_pages, city_mappings
        )

        status_counts[status] = status_counts.get(status, 0) + 1

        if status != 'working':
            broken_links.append({
                'file': link['relative_file'],
                'line_number': link['line_number'],
                'url': link['url'],
                'link_text': link['link_text'],
                'category': link['category'],
                'status': status,
                'fix_recommendation': fix_rec,
                'suggested_new_url': new_url,
                'priority': priority,
                'context': link['context']
            })

    print(f"\nLink Status Summary:")
    for status, count in sorted(status_counts.items()):
        print(f"  {status}: {count}")

    # Generate broken links report
    csv_filename = 'broken-links-report.csv'
    with open(csv_filename, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['file', 'line_number', 'url', 'link_text', 'category',
                     'status', 'fix_recommendation', 'suggested_new_url',
                     'priority', 'context']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for link in broken_links:
            writer.writerow(link)

    print(f"\nGenerated broken links report: {csv_filename}")
    print(f"Found {len(broken_links)} broken or problematic links")

    # Generate priority breakdown
    priority_counts = {}
    for link in broken_links:
        priority = link['priority']
        priority_counts[priority] = priority_counts.get(priority, 0) + 1

    print(f"\nPriority Breakdown:")
    for priority in ['high', 'medium', 'low']:
        count = priority_counts.get(priority, 0)
        print(f"  {priority}: {count} links")

    # Save city mappings for fix scripts
    with open('city-url-mappings.json', 'w') as f:
        json.dump(city_mappings, f, indent=2)

    print(f"\nSaved city URL mappings to: city-url-mappings.json")

if __name__ == "__main__":
    main()