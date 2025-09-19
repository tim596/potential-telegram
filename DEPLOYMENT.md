# Deployment Guide for A Bedder World Migration

## Phase 1: Pre-Migration Preparation ✅ COMPLETED

- ✅ Created robots.txt with proper SEO directives
- ✅ Generated XML sitemap for 800+ location pages
- ✅ Created custom 404 error page
- ✅ Added production build optimizations
- ✅ Set up redirect infrastructure configuration
- ✅ Created deployment configuration files

## Phase 2: Redirect Implementation

### Step 1: Export WordPress URLs
Use one of these methods to get your current WordPress URLs:
- WordPress Admin → Tools → Export
- Plugin: "Export All URLs"
- Site crawler: Screaming Frog SEO Spider
- Google Search Console → Coverage report

### Step 2: Map Location Pages
You need to map all 800+ location pages from:
```
OLD: /city-stateabbreviation/
NEW: /mattress-removal/state/metro/city/

Examples:
/gilbert-az/ → /mattress-removal/arizona/phoenix/gilbert/
/boulder-co/ → /mattress-removal/colorado/boulder/
```

### Step 3: Update Redirect Files
Add your specific URL mappings to:
- `src/_redirects` (for Netlify hosting)
- `src/.htaccess` (for Apache hosting)

## Phase 3: Hosting Setup

### Option A: Netlify (Recommended)
1. Connect GitHub repository to Netlify
2. Build settings are in `netlify.toml`
3. Redirects handled automatically via `_redirects` file
4. SSL certificate auto-provisioned

### Option B: Vercel
1. Connect GitHub repository to Vercel
2. Build settings are in `vercel.json`
3. Configure custom domain
4. SSL certificate auto-provisioned

### Option C: Traditional Hosting (Apache/Nginx)
1. Upload `dist` folder contents
2. Configure `.htaccess` for redirects
3. Set up SSL certificate
4. Configure custom 404 page

## Phase 4: Go-Live Process

### Pre-Launch Checklist
- [ ] All redirects tested on staging
- [ ] DNS TTL reduced to 300 seconds
- [ ] Backup current WordPress site
- [ ] Google Analytics/Search Console ready
- [ ] Team notified of maintenance window

### Launch Day Steps
1. **Build Production Site**
   ```bash
   npm run build:prod
   ```

2. **Deploy to Hosting**
   - Upload `dist` folder contents
   - Verify redirects working
   - Test critical pages

3. **Update DNS**
   - Point domain to new hosting
   - Monitor for propagation

4. **Post-Launch Verification**
   - Test redirect samples
   - Check Google Analytics tracking
   - Submit new sitemap to search engines

## Phase 5: Post-Migration Monitoring

### Week 1: Critical Monitoring
- Monitor 404 errors in hosting logs
- Track search ranking changes
- Verify redirect functionality
- Check page load speeds

### Week 2-4: SEO Recovery
- Submit updated sitemap to Google/Bing
- Monitor search console for crawl errors
- Track organic traffic recovery
- Fix any broken internal links

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build:prod

# Test build
npm run test:build

# Preview built site
npm run preview
```

## Configuration Files Created

- `netlify.toml` - Netlify deployment config
- `vercel.json` - Vercel deployment config
- `src/_redirects` - Netlify redirect rules
- `src/.htaccess` - Apache redirect rules
- `.env.example` - Environment variables template

## Next Steps

1. **Export your WordPress site URLs**
2. **Create comprehensive redirect mapping**
3. **Test redirects on staging environment**
4. **Choose hosting platform and deploy**
5. **Execute go-live plan**

## Support

For issues during migration:
1. Check deployment logs for build errors
2. Test redirects individually
3. Monitor search console for 404s
4. Verify all environment variables set