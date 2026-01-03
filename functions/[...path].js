// Pages Function Worker for A Bedder World Redirects
// Handles ALL redirects (301, 302, 410, 404) with proper status codes
// Deployed directly to potential-telegram Pages project

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Check KV storage for exact match first
      let redirectData = await env.REDIRECTS.get(pathname);

      // If no exact match, try various patterns
      if (!redirectData) {
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
          redirectData = await env.REDIRECTS.get(pattern);
          if (redirectData) {
            break;
          }
        }
      }

      // If redirect found, parse data and return appropriate response
      if (redirectData) {
        let target, status;

        try {
          // Parse JSON redirect data
          const parsed = JSON.parse(redirectData);
          target = parsed.target;
          status = parseInt(parsed.status) || 301;
        } catch (e) {
          // Fallback for simple string values (legacy data)
          target = redirectData;
          status = 301;
        }

        // Handle different status codes appropriately
        if (status === 410) {
          // 410 Gone - Return gone response with target content
          const goneUrl = new URL(target, url.origin);
          return Response.redirect(goneUrl.toString(), 410);
        } else if (status === 404) {
          // 404 Not Found - Return not found response with target content
          const notFoundUrl = new URL(target, url.origin);
          return Response.redirect(notFoundUrl.toString(), 404);
        } else {
          // Standard redirects (301, 302, etc.)
          const redirectUrl = new URL(target, url.origin);
          return Response.redirect(redirectUrl.toString(), status);
        }
      }

      // No redirect found, pass through to Pages
      return env.ASSETS.fetch(request);

    } catch (error) {
      // On any error, pass through to Pages
      console.error('Worker error:', error);
      return env.ASSETS.fetch(request);
    }
  }
};