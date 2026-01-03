// Standalone Worker for A Bedder World Redirects
// Handles ALL redirects (301, 302, 410, 404) with proper status codes
// Falls back to Pages deployment instead of env.ASSETS

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
            // Parse the redirect data to check if it would redirect to itself
            try {
              const parsed = JSON.parse(redirectData);
              const target = parsed.target;
              // Prevent self-redirects by checking if target equals original pathname
              if (target === pathname) {
                redirectData = null; // Skip this redirect to avoid loops
                continue;
              }
            } catch (e) {
              // For non-JSON data, also check for self-redirect
              if (redirectData === pathname) {
                redirectData = null; // Skip this redirect to avoid loops
                continue;
              }
            }
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
          // 410 Gone - Fetch the 410 page content and return with 410 status
          try {
            const gonePageUrl = `https://potential-telegram.pages.dev${target}`;
            const goneResponse = await fetch(gonePageUrl);
            const goneContent = await goneResponse.text();
            return new Response(goneContent, {
              status: 410,
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'public, max-age=86400'
              }
            });
          } catch (e) {
            // Fallback if 410 page fetch fails
            return new Response('410 - Gone', { status: 410 });
          }
        } else if (status === 404) {
          // 404 Not Found - Fetch the 404 page content and return with 404 status
          try {
            const notFoundPageUrl = `https://potential-telegram.pages.dev${target}`;
            const notFoundResponse = await fetch(notFoundPageUrl);
            const notFoundContent = await notFoundResponse.text();
            return new Response(notFoundContent, {
              status: 404,
              headers: {
                'Content-Type': 'text/html',
                'Cache-Control': 'public, max-age=3600'
              }
            });
          } catch (e) {
            // Fallback if 404 page fetch fails
            return new Response('404 - Not Found', { status: 404 });
          }
        } else {
          // Standard redirects (301, 302, etc.)
          const redirectUrl = new URL(target, url.origin);
          return Response.redirect(redirectUrl.toString(), status);
        }
      }

      // No redirect found, fetch from Pages deployment
      const pagesUrl = `https://potential-telegram.pages.dev${pathname}${url.search}`;

      // Forward the request to Pages with all headers
      const pagesRequest = new Request(pagesUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
      });

      return fetch(pagesRequest);

    } catch (error) {
      // On any error, fallback to Pages
      console.error('Worker error:', error);
      const pagesUrl = `https://potential-telegram.pages.dev${pathname}${url.search}`;
      return fetch(pagesUrl);
    }
  }
};