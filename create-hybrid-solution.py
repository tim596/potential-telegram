#!/usr/bin/env python3
"""
Create hybrid redirect solution:
1. Extract most critical redirects for Cloudflare Pages (_redirects file - under 10K limit)
2. Create enhanced Worker for remaining redirects with smart pattern matching
"""

import csv
import re
from collections import defaultdict

def analyze_redirects(file_path):
    """Analyze redirects to identify most critical ones"""

    redirects = {}
    redirect_patterns = defaultdict(list)

    print(f"📊 Analyzing redirects from {file_path}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()

            # Skip empty lines and comments
            if not line or line.startswith('#'):
                continue

            # Parse redirect line
            parts = line.split()
            if len(parts) >= 2:
                source = parts[0]
                target = parts[1]

                # Skip non-301 redirects
                if len(parts) >= 3 and parts[2] not in ['301', '302']:
                    continue

                redirects[source] = target

                # Categorize redirects
                if source.startswith('/blog/') or target.startswith('/blog/'):
                    redirect_patterns['blog'].append((source, target))
                elif source.startswith('/mattress-removal/') or target.startswith('/mattress-removal/'):
                    redirect_patterns['location'].append((source, target))
                elif '.html' in source:
                    redirect_patterns['html_cleanup'].append((source, target))
                else:
                    redirect_patterns['general'].append((source, target))

    return redirects, redirect_patterns

def create_critical_redirects_file(redirect_patterns, output_file, limit=9000):
    """Create critical redirects file for Cloudflare Pages"""

    print(f"📝 Creating critical redirects file: {output_file}")

    critical_redirects = []

    # Priority order: most important first
    priority_order = [
        ('general', 'General site redirects (highest priority)'),
        ('html_cleanup', 'HTML file cleanup redirects'),
        ('blog', 'Blog post redirects'),
        ('location', 'Location page redirects (sample)')
    ]

    total_added = 0

    with open(output_file, 'w', encoding='utf-8') as f:
        # Write header
        f.write("# Critical Redirects for Cloudflare Pages\n")
        f.write("# Most important redirects that must work immediately\n")
        f.write("# Remaining redirects handled by enhanced Worker\n\n")

        for category, description in priority_order:
            if total_added >= limit:
                break

            redirects_in_category = redirect_patterns.get(category, [])

            if redirects_in_category:
                f.write(f"# {description}\n")

                # Add redirects from this category
                for source, target in redirects_in_category[:limit - total_added]:
                    f.write(f"{source} {target} 301\n")
                    total_added += 1

                    if total_added >= limit:
                        break

                f.write("\n")

    print(f"✅ Created critical redirects file with {total_added} redirects")
    return total_added

def create_enhanced_worker(redirect_patterns, output_file):
    """Create enhanced Worker with smart pattern matching"""

    print(f"🔧 Creating enhanced Worker: {output_file}")

    # Get sample patterns for each category
    blog_redirects = redirect_patterns.get('blog', [])[:50]  # Sample for pattern analysis
    location_redirects = redirect_patterns.get('location', [])[:50]
    html_redirects = redirect_patterns.get('html_cleanup', [])[:50]

    worker_code = '''// Enhanced Cloudflare Worker for A Bedder World
// Handles remaining redirects with smart pattern matching
// Works as fallback for redirects not in Cloudflare Pages

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Try exact match from KV first (for any manually added redirects)
      try {
        const exactMatch = await env.REDIRECTS.get(pathname);
        if (exactMatch) {
          return Response.redirect(new URL(exactMatch, url.origin).toString(), 301);
        }
      } catch (e) {
        // KV might not be available or empty, continue with pattern matching
      }

      // Smart pattern matching for different redirect types
      const redirect = findRedirectByPattern(pathname);
      if (redirect) {
        return Response.redirect(new URL(redirect, url.origin).toString(), 301);
      }

      // No redirect found, pass through to Cloudflare Pages
      return fetch(request);

    } catch (error) {
      console.error('Worker error:', error);
      return fetch(request);
    }
  }
};

function findRedirectByPattern(pathname) {
  // Remove trailing slashes for consistent matching
  const cleanPath = pathname.replace(/\\/+$/, '');

  // Pattern 1: HTML file cleanup (.html -> clean URLs)
  if (pathname.endsWith('.html') || pathname.endsWith('.html/')) {
    const basePath = cleanPath.replace(/\\.html\\/?\$/, '');

    // Blog post pattern: /blog-post.html -> /blog/blog-post/
    if (isBlogPost(basePath)) {
      return `/blog${basePath}/`;
    }

    // Location guide pattern: /city-guide.html -> /mattress-removal/location/
    const locationMatch = matchLocationPattern(basePath);
    if (locationMatch) {
      return locationMatch;
    }
  }

  // Pattern 2: Legacy location URLs
  const legacyLocationMatch = matchLegacyLocation(cleanPath);
  if (legacyLocationMatch) {
    return legacyLocationMatch;
  }

  // Pattern 3: City/state patterns (case insensitive)
  const cityStateMatch = matchCityState(cleanPath);
  if (cityStateMatch) {
    return cityStateMatch;
  }

  return null;
}

function isBlogPost(path) {
  // Common blog post patterns'''

    # Add specific blog patterns based on analysis
    blog_patterns = set()
    for source, target in blog_redirects:
        if '/blog/' in target:
            # Extract pattern
            source_name = source.replace('.html', '').replace('/', '')
            target_name = target.replace('/blog/', '').replace('/', '')
            if source_name and target_name:
                blog_patterns.add(source_name)

    worker_code += f'''
  const blogPosts = {list(blog_patterns)[:20]};  // Sample patterns
  return blogPosts.some(post => path.includes(post));
}}

function matchLocationPattern(path) {{
  // Location-specific patterns
'''

    # Add location patterns
    location_map = {}
    for source, target in location_redirects[:20]:  # Sample
        if '/mattress-removal/' in target:
            source_clean = source.replace('/', '').replace('.html', '').lower()
            location_map[source_clean] = target

    worker_code += f'''
  const locationMap = {str(location_map).replace("'", '"')};
  const pathKey = path.toLowerCase().replace(/[^a-z0-9-]/g, '');
  return locationMap[pathKey];
}}

function matchLegacyLocation(path) {{
  // Handle patterns like /denver-co -> /mattress-removal/colorado/denver/
  const cityStatePattern = /^\/([a-z-]+)-([a-z]{{2}})$/i;
  const match = path.match(cityStatePattern);

  if (match) {{
    const [, city, state] = match;
    return `/mattress-removal/${{getStateName(state)}}/${{city}}/`;
  }}

  return null;
}}

function matchCityState(path) {{
  // Handle patterns like /Detroit-MI -> /mattress-removal/michigan/detroit/
  const patterns = [
    /^\/([A-Z][a-z-]+)-([A-Z]{{2}})$/,  // City-ST
    /^\/([a-z-]+)-([a-z]{{2}})$/        // city-st
  ];

  for (const pattern of patterns) {{
    const match = path.match(pattern);
    if (match) {{
      const [, city, state] = match;
      const stateName = getStateName(state.toUpperCase());
      if (stateName) {{
        return `/mattress-removal/${{stateName}}/${{city.toLowerCase()}}/`;
      }}
    }}
  }}

  return null;
}}

function getStateName(abbr) {{
  const stateMap = {{
    'AL': 'alabama', 'AK': 'alaska', 'AZ': 'arizona', 'AR': 'arkansas',
    'CA': 'california', 'CO': 'colorado', 'CT': 'connecticut', 'DE': 'delaware',
    'FL': 'florida', 'GA': 'georgia', 'HI': 'hawaii', 'ID': 'idaho',
    'IL': 'illinois', 'IN': 'indiana', 'IA': 'iowa', 'KS': 'kansas',
    'KY': 'kentucky', 'LA': 'louisiana', 'ME': 'maine', 'MD': 'maryland',
    'MA': 'massachusetts', 'MI': 'michigan', 'MN': 'minnesota', 'MS': 'mississippi',
    'MO': 'missouri', 'MT': 'montana', 'NE': 'nebraska', 'NV': 'nevada',
    'NH': 'new-hampshire', 'NJ': 'new-jersey', 'NM': 'new-mexico', 'NY': 'new-york',
    'NC': 'north-carolina', 'ND': 'north-dakota', 'OH': 'ohio', 'OK': 'oklahoma',
    'OR': 'oregon', 'PA': 'pennsylvania', 'RI': 'rhode-island', 'SC': 'south-carolina',
    'SD': 'south-dakota', 'TN': 'tennessee', 'TX': 'texas', 'UT': 'utah',
    'VT': 'vermont', 'VA': 'virginia', 'WA': 'washington', 'WV': 'west-virginia',
    'WI': 'wisconsin', 'WY': 'wyoming'
  }};
  return stateMap[abbr];
}}'''

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(worker_code)

    print(f"✅ Created enhanced Worker with smart pattern matching")

def main():
    """Main function"""

    redirects_file = "src/_redirects"
    critical_redirects_file = "src/_redirects_critical"
    enhanced_worker_file = "cloudflare-worker-smart.js"

    print("🔧 Creating Hybrid Redirect Solution")
    print("=" * 60)

    # Analyze existing redirects
    redirects, patterns = analyze_redirects(redirects_file)

    print(f"\n📊 Redirect Analysis:")
    for category, redirects_list in patterns.items():
        print(f"   {category}: {len(redirects_list):,} redirects")

    # Create critical redirects file (under Cloudflare Pages limit)
    critical_count = create_critical_redirects_file(patterns, critical_redirects_file)

    # Create enhanced Worker
    create_enhanced_worker(patterns, enhanced_worker_file)

    print(f"\n🎯 Hybrid Solution Created:")
    print(f"   📄 Critical redirects for Pages: {critical_count}")
    print(f"   🔧 Smart Worker for remaining redirects")
    print(f"   📁 Files: {critical_redirects_file}, {enhanced_worker_file}")

    print(f"\n📋 Next Steps:")
    print(f"1. Replace src/_redirects with {critical_redirects_file}")
    print(f"2. Deploy enhanced Worker: wrangler deploy {enhanced_worker_file}")
    print(f"3. Test edge cases to ensure pattern matching works")

if __name__ == "__main__":
    main()