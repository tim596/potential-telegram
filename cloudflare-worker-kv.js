// Cloudflare Worker with KV Storage for A Bedder World Redirects
// Handles 45,459+ redirects using Cloudflare KV for storage
// Generated for abedderworld.com

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;

      // Check KV storage for redirect
      let redirectTarget = await env.REDIRECTS.get(pathname);

      // If no exact match, try with trailing slash variations
      if (!redirectTarget) {
        if (pathname.endsWith('/')) {
          // Try without trailing slash
          redirectTarget = await env.REDIRECTS.get(pathname.slice(0, -1));
        } else {
          // Try with trailing slash
          redirectTarget = await env.REDIRECTS.get(pathname + '/');
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

// Note: This worker requires a KV namespace binding named "REDIRECTS"
// The KV store should be populated with your redirect data