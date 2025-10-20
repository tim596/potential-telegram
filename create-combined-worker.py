#!/usr/bin/env python3
"""
Combine Cloudflare Worker with redirect map for easy deployment
Creates a single file ready to paste into Cloudflare Workers
"""

def create_combined_worker():
    """Combine worker code with redirect map"""

    print("🔧 Creating combined Cloudflare Worker...")

    # Read the redirect map content
    try:
        with open('redirect-map.js', 'r', encoding='utf-8') as f:
            redirect_map_content = f.read()
    except FileNotFoundError:
        print("❌ Error: redirect-map.js not found!")
        return False

    # Extract just the Map definition from redirect-map.js
    start_marker = "const REDIRECT_MAP = new Map(["
    end_marker = "]);"

    start_index = redirect_map_content.find(start_marker)
    end_index = redirect_map_content.find(end_marker) + len(end_marker)

    if start_index == -1 or end_index == -1:
        print("❌ Error: Could not find redirect map in redirect-map.js")
        return False

    redirect_map_definition = redirect_map_content[start_index:end_index]

    # Create the combined worker
    combined_worker = f'''// Cloudflare Worker for A Bedder World Redirects
// Handles 45,459+ redirects efficiently at the edge
// Generated for abedderworld.com

{redirect_map_definition}

export default {{
  async fetch(request, env, ctx) {{
    try {{
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Check for exact redirect match
      let redirectTarget = REDIRECT_MAP.get(pathname);

      // If no exact match, try with trailing slash variations
      if (!redirectTarget) {{
        if (pathname.endsWith('/')) {{
          // Try without trailing slash
          redirectTarget = REDIRECT_MAP.get(pathname.slice(0, -1));
        }} else {{
          // Try with trailing slash
          redirectTarget = REDIRECT_MAP.get(pathname + '/');
        }}
      }}

      // If redirect found, return redirect response
      if (redirectTarget) {{
        const redirectUrl = new URL(redirectTarget, url.origin);
        return Response.redirect(redirectUrl.toString(), 301);
      }}

      // No redirect found, pass through to origin (Netlify)
      return fetch(request);

    }} catch (error) {{
      // On any error, pass through to origin
      console.error('Worker error:', error);
      return fetch(request);
    }}
  }}
}};

// Worker statistics (for monitoring)
const WORKER_STATS = {{
  totalRedirects: REDIRECT_MAP.size,
  version: '1.0',
  generated: 'AUTO-GENERATED',
  site: 'abedderworld.com'
}};'''

    # Write the combined worker file
    output_file = 'cloudflare-worker-complete.js'
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(combined_worker)

    # Calculate file size
    file_size_mb = len(combined_worker) / (1024 * 1024)

    print(f"✅ Combined worker created: {output_file}")
    print(f"📁 File size: {file_size_mb:.1f}MB")
    print(f"🗺️  Contains {45459:,} redirects")

    if file_size_mb > 1:
        print("⚠️  File is large - Cloudflare Workers have a 1MB limit per script")
        print("💡 Consider splitting into multiple workers or using KV storage")
    else:
        print("✅ File size is within Cloudflare Worker limits")

    return True

def main():
    print("🚀 Creating complete Cloudflare Worker")
    print("=" * 50)

    success = create_combined_worker()

    if success:
        print("\n📋 Deployment Instructions:")
        print("1. Go to Cloudflare Dashboard → Workers & Pages")
        print("2. Create New Worker")
        print("3. Copy contents of cloudflare-worker-complete.js")
        print("4. Paste into Worker editor")
        print("5. Deploy and assign to your domain route")
        print("\n⚡ This will handle redirects at edge before hitting Netlify!")
    else:
        print("\n❌ Failed to create combined worker")

if __name__ == "__main__":
    main()