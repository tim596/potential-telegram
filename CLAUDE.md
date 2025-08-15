# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Important - the user is always running the dev server, you do not need to. Run npm run typecheck and npm run build to validate things. Look in the dist folder if you need to check actual output.

## Common Development Commands

### Build & Development
- `npm run dev` - Start development server with hot reload on port 8081
- `npm run build` - Build static site for production
- `npm run build:prod` - Production build with NODE_ENV=production
- `npm start` - Start production server on port 8081
- `npm run clean` - Remove dist directory

### Location Pages
- `npm run generate:locations` - Generate location-specific pages using locations data
- `node scripts/generate-locations.js` - Run location generator directly

## Architecture Overview

This is an **Eleventy (11ty) static site** for A Bedder World, a mattress removal service company. The architecture is designed for SEO-optimized local service pages.

### Key Structure
- **Framework**: Eleventy v3.1.2 static site generator
- **Templates**: Nunjucks (.njk files) 
- **Styling**: Custom CSS with CSS custom properties (no framework)
- **Content**: Markdown for location pages, Nunjucks for main pages
- **Build Output**: `dist/` directory

### Core Directories
```
src/
├── _layouts/base.njk          # Main site template (header, nav, footer)
├── _includes/css/main.css     # All styling (single CSS file)
├── _data/locations.js         # Location data for dynamic page generation
├── mattress-removal/          # Auto-generated city/state pages
├── images/                    # Static assets (lifestyle photos, icons)
└── [page].njk                 # Main site pages
```

### Template System
- **Base Layout**: `_layouts/base.njk` provides the consistent site structure
- **Includes**: CSS is in `_includes/css/main.css` and processed through Eleventy
- **Data**: Global pricing data and location data drive dynamic content

## Location Page Generation

The site uses a sophisticated location page generator (`scripts/generate-locations.js`) that:

1. **Reads** location data from `src/_data/locations.js`
2. **Generates** unique SEO content using content templates to avoid duplicate content
3. **Creates** state index pages (`/mattress-removal/[state]/`) and city pages (`/mattress-removal/[state]/[city]/`)
4. **Includes** local pricing, neighborhoods, ZIP codes, reviews, and FAQs

### Content Uniqueness Strategy
- Multiple content templates selected based on city characteristics
- Hash-based template selection ensures consistency but variety
- City tier system (1=major metro, 2=mid-size, 3=smaller) drives content variations
- Local data integration (neighborhoods, recycling partners, regulations)

## Key Features

### Pricing System
- Global pricing data in `.eleventy.js` configuration
- Three-tier pricing structure: $125/$155/$180 for 1/2/3 pieces
- "MOST POPULAR" badge system on pricing cards

### Business Information
- Phone: 720-263-6094 (consistent across site)
- Service: "Next-day" pickup (not same-day)
- Brand color: #a6ce39 (primary green)
- Zenbooker integration for online booking

### SEO Optimizations
- Unique content generation for each location page
- JSON-LD structured data for local business
- City-specific meta descriptions and titles
- Location-based reviews and FAQs

## Development Notes

### CSS System
- Single CSS file with CSS custom properties for theming
- Responsive design with mobile-first approach
- Component-based styling (pricing cards, service icons, etc.)
- Color palette uses CSS variables (--primary-green, --gray-50 to --gray-900)

### Eleventy Configuration
- HTML minification in production
- CSS minification filter
- Custom filters for slugs, dates, and data formatting
- Multiple collections for location pages (states, cities, all locations)
- Static asset passthrough for images, favicons, robots.txt

### Image Assets
- Lifestyle photos in `images/lifestyle/` for hero sections
- Service icons in `images/icons/` (consistent branding)
- Logo variations and facility photos
- All images optimized and properly named

## Important Conventions

### File Naming
- State directories use lowercase slugs (`california`, `texas`)
- City files use kebab-case (`new-york-city.md`, `san-francisco.md`)
- Template files use descriptive names (`mattress-removal.njk`, `how-it-works.njk`)

### Content Standards
- Phone number must be 720-263-6094 throughout site
- Service timing is "next-day" not "same-day"
- Brand color #a6ce39 for consistency
- "MOST POPULAR" badge on middle pricing tier
- White buttons on green backgrounds for visibility

### Template Data
- Location pages include comprehensive frontmatter with pricing, coordinates, neighborhoods
- Reviews and FAQs are dynamically generated per location
- State and city data drives navigation and nearby city links