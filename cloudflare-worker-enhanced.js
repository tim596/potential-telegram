// Enhanced Cloudflare Worker with KV Storage for A Bedder World Redirects
// Handles 45,459+ redirects using Cloudflare KV for storage
// Enhanced to handle edge cases like .html/, .html, and various trailing slash patterns
// Generated for abedderworld.com

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Check KV storage for exact match first
      let redirectTarget = await env.REDIRECTS.get(pathname);

      // If no exact match, try various patterns
      if (!redirectTarget) {
        // Create array of patterns to try
        const patternsToTry = [];

        // If path ends with .html/, try removing trailing slash
        if (pathname.endsWith('.html/')) {
          patternsToTry.push(pathname.slice(0, -1)); // Remove trailing slash: .html/ -> .html
          patternsToTry.push(pathname.slice(0, -6) + '/'); // Remove .html/: .html/ -> /
          patternsToTry.push(pathname.slice(0, -6)); // Remove .html/: .html/ -> (no slash)
        }
        // If path ends with .html, try adding/removing trailing slash
        else if (pathname.endsWith('.html')) {
          patternsToTry.push(pathname + '/'); // Add trailing slash: .html -> .html/
          patternsToTry.push(pathname.slice(0, -5) + '/'); // Remove .html: .html -> /
          patternsToTry.push(pathname.slice(0, -5)); // Remove .html: .html -> (no slash)
        }
        // If path ends with /, try without trailing slash
        else if (pathname.endsWith('/') && pathname !== '/') {
          patternsToTry.push(pathname.slice(0, -1)); // Remove trailing slash
          patternsToTry.push(pathname + 'index.html'); // Try index.html
          patternsToTry.push(pathname.slice(0, -1) + '.html'); // Try .html
        }
        // If path doesn't end with /, try with trailing slash
        else {
          patternsToTry.push(pathname + '/'); // Add trailing slash
          patternsToTry.push(pathname + '.html'); // Try .html
          patternsToTry.push(pathname + '/index.html'); // Try /index.html
        }

        // Try each pattern until we find a match
        for (const pattern of patternsToTry) {
          redirectTarget = await env.REDIRECTS.get(pattern);
          if (redirectTarget) {
            break;
          }
        }
      }

      // If redirect found, return redirect response
      if (redirectTarget) {
        const redirectUrl = new URL(redirectTarget, url.origin);
        return Response.redirect(redirectUrl.toString(), 301);
      }

      // No redirect found, pass through to origin (Cloudflare Pages)
      return fetch(request);

    } catch (error) {
      // On any error, pass through to origin
      console.error('Worker error:', error);
      return fetch(request);
    }
  }
};

// Note: This worker requires a KV namespace binding named "REDIRECTS"
// The KV store should be populated with your redirect data
// Enhanced version handles edge cases like:
// - /page.html/ -> /page/
// - /page.html -> /page/
// - /page/ -> /page
// - /page -> /page/