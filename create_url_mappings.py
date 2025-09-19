#!/usr/bin/env python3
"""
Create comprehensive URL mappings for fixing broken links
"""

import json
import glob
import os
import re

def create_city_mappings():
    """Create mappings from old city URLs to new mattress-removal URLs"""
    mappings = {}

    # Get all current city pages
    city_files = glob.glob('src/mattress-removal/**/*.md', recursive=True)

    for city_file in city_files:
        # Skip state index files
        if city_file.endswith('/index.md'):
            continue

        # Extract state and city from path
        parts = city_file.replace('src/mattress-removal/', '').replace('.md', '').split('/')
        if len(parts) == 2:
            state, city = parts

            # City name variations for mapping
            city_clean = city.replace('-', ' ')
            city_title = city_clean.title().replace(' ', '')
            city_title_with_spaces = city_clean.title()

            # State abbreviation mapping
            state_abbrev_map = {
                'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
                'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
                'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
                'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
                'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
                'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
                'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
                'new-hampshire': 'NH', 'new-jersey': 'NJ', 'new-mexico': 'NM', 'new-york': 'NY',
                'north-carolina': 'NC', 'north-dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
                'oregon': 'OR', 'pennsylvania': 'PA', 'rhode-island': 'RI', 'south-carolina': 'SC',
                'south-dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
                'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west-virginia': 'WV',
                'wisconsin': 'WI', 'wyoming': 'WY'
            }

            state_abbrev = state_abbrev_map.get(state, state.upper()[:2])
            new_url = f"/mattress-removal/{state}/{city}/"

            # Create various old URL patterns that might exist
            old_patterns = [
                f"https://www.abedderworld.com/{city_title}-{state_abbrev}",
                f"https://www.abedderworld.com/{city_title_with_spaces.replace(' ', '')}-{state_abbrev}",
                f"https://www.abedderworld.com/{city.replace('-', '')}-{state_abbrev}",
                f"https://www.abedderworld.com/{city}-{state_abbrev}",
                f"https://www.abedderworld.com/{city_title_with_spaces.replace(' ', '-')}-{state_abbrev}"
            ]

            for pattern in old_patterns:
                mappings[pattern] = new_url
                # Also add versions with trailing slash
                mappings[pattern + "/"] = new_url

    return mappings

def create_blog_mappings():
    """Create mappings for blog posts that moved to /blog/"""
    mappings = {}

    # Get all current blog posts
    blog_files = glob.glob('src/blog/*.md', recursive=True)

    for blog_file in blog_files:
        # Extract filename without extension
        filename = os.path.basename(blog_file).replace('.md', '')
        new_url = f"/blog/{filename}/"

        # Old WordPress-style URLs that should map to blog
        old_patterns = [
            f"https://www.abedderworld.com/{filename}.html",
            f"https://www.abedderworld.com/{filename}.html/",
            f"https://www.abedderworld.com/{filename}/",
            f"https://www.abedderworld.com/{filename}"
        ]

        for pattern in old_patterns:
            mappings[pattern] = new_url

    return mappings

def create_service_mappings():
    """Create mappings for service posts that stayed in root"""
    mappings = {}

    # Get all service posts (root level .md files except blog)
    service_files = glob.glob('src/*.md')

    for service_file in service_files:
        filename = os.path.basename(service_file).replace('.md', '')
        new_url = f"/{filename}/"

        # Old URLs that should map to root service posts
        old_patterns = [
            f"https://www.abedderworld.com/{filename}.html",
            f"https://www.abedderworld.com/{filename}.html/",
            f"https://www.abedderworld.com/{filename}/",
            f"https://www.abedderworld.com/{filename}"
        ]

        for pattern in old_patterns:
            mappings[pattern] = new_url

    return mappings

def create_special_mappings():
    """Create mappings for special pages and common redirects"""
    mappings = {
        # Booking links
        "https://www.abedderworld.com/book-online/": "/pricing/",
        "https://www.abedderworld.com/book-online": "/pricing/",

        # Service pages
        "https://www.abedderworld.com/commercial/": "/commercial/",
        "https://www.abedderworld.com/commercial": "/commercial/",
        "https://www.abedderworld.com/pricing/": "/pricing/",
        "https://www.abedderworld.com/pricing": "/pricing/",
        "https://www.abedderworld.com/how-it-works/": "/how-it-works/",
        "https://www.abedderworld.com/how-it-works": "/how-it-works/",
        "https://www.abedderworld.com/what-we-take/": "/what-we-take/",
        "https://www.abedderworld.com/what-we-take": "/what-we-take/",
        "https://www.abedderworld.com/about/": "/about/",
        "https://www.abedderworld.com/about": "/about/",
        "https://www.abedderworld.com/contact/": "/contact/",
        "https://www.abedderworld.com/contact": "/contact/",
        "https://www.abedderworld.com/faqs/": "/faqs/",
        "https://www.abedderworld.com/faqs": "/faqs/",
        "https://www.abedderworld.com/blog/": "/blog/",
        "https://www.abedderworld.com/blog": "/blog/",

        # Product pages that might be in disposal-talk
        "https://www.abedderworld.com/disposal-talk/": "/disposal-talk/",
        "https://www.abedderworld.com/disposal-talk": "/disposal-talk/",
    }

    return mappings

def main():
    base_dir = '/Users/timothysumerfield/Desktop/migration test 2/bedder-world-base2'
    os.chdir(base_dir)

    print("Creating comprehensive URL mappings...")

    # Create all mapping categories
    city_mappings = create_city_mappings()
    blog_mappings = create_blog_mappings()
    service_mappings = create_service_mappings()
    special_mappings = create_special_mappings()

    print(f"City mappings: {len(city_mappings)}")
    print(f"Blog mappings: {len(blog_mappings)}")
    print(f"Service mappings: {len(service_mappings)}")
    print(f"Special mappings: {len(special_mappings)}")

    # Combine all mappings
    all_mappings = {}
    all_mappings.update(special_mappings)  # Highest priority
    all_mappings.update(service_mappings)
    all_mappings.update(blog_mappings)
    all_mappings.update(city_mappings)

    print(f"Total mappings: {len(all_mappings)}")

    # Save comprehensive mappings
    with open('url-mappings.json', 'w') as f:
        json.dump(all_mappings, f, indent=2, sort_keys=True)

    print("Saved comprehensive URL mappings to: url-mappings.json")

    # Save individual mapping files for analysis
    mapping_files = {
        'city-mappings.json': city_mappings,
        'blog-mappings.json': blog_mappings,
        'service-mappings.json': service_mappings,
        'special-mappings.json': special_mappings
    }

    for filename, mappings in mapping_files.items():
        with open(filename, 'w') as f:
            json.dump(mappings, f, indent=2, sort_keys=True)

    print("Also saved individual mapping files for reference")

    # Show some examples
    print("\nExample mappings:")
    example_keys = list(all_mappings.keys())[:10]
    for key in example_keys:
        print(f"  {key} -> {all_mappings[key]}")

if __name__ == "__main__":
    main()