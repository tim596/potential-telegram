// Cloudflare Worker for A Bedder World Redirects
// Handles 45,459+ redirects efficiently at the edge
// Generated for abedderworld.com

// Import the redirect map (you'll need to paste redirect-map.js content here)
// For deployment, copy the REDIRECT_MAP from redirect-map.js and paste below

const REDIRECT_MAP = new Map([
  // PASTE REDIRECT MAP CONTENT HERE FROM redirect-map.js
  // The map will be inserted here during deployment
]);

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Check for exact redirect match
      let redirectTarget = REDIRECT_MAP.get(pathname);

      // If no exact match, try with trailing slash variations
      if (!redirectTarget) {
        if (pathname.endsWith('/')) {
          // Try without trailing slash
          redirectTarget = REDIRECT_MAP.get(pathname.slice(0, -1));
        } else {
          // Try with trailing slash
          redirectTarget = REDIRECT_MAP.get(pathname + '/');
        }
      }

      // If redirect found, return redirect response
      if (redirectTarget) {
        const redirectUrl = new URL(redirectTarget, url.origin);

        return Response.redirect(redirectUrl.toString(), 301);
      }

      // No redirect found, pass through to origin (Netlify)
      return fetch(request);

    } catch (error) {
      // On any error, pass through to origin
      console.error('Worker error:', error);
      return fetch(request);
    }
  }
};

// Worker statistics (for monitoring)
const WORKER_STATS = {
  totalRedirects: REDIRECT_MAP.size,
  version: '1.0',
  generated: new Date().toISOString(),
  site: 'abedderworld.com'
};