# City Review Process

## Overview
This checklist ensures every completed city page meets our quality standards before being marked as officially launched. Follow this process to review and verify all requirements are met.

## Pre-Review Setup

### 1. Choose City to Review
- Select a city from tasks/cities.md that needs review
- Ensure the city page has been built and exists in dist/
- Have tasks/city-requirements.md open for reference

### 2. Access City Page
- Navigate to `/dist/mattress-removal/[state]/[city]/index.html`
- Open page in browser for visual inspection
- Open source markdown file for content review

## Content Review Checklist

### Content Quality Verification
- [ ] **High-quality, helpful content focused on user needs**
  - Content provides genuine value to users seeking mattress removal
  - No filler content or arbitrary padding to reach word counts
  - All content serves a clear purpose for the user

- [ ] **70% unique content achieved**
  - Compare key paragraphs to other city pages
  - Verify local references are city-specific
  - Check testimonials are not duplicated

### Content Structure Verification
- [ ] **Hero Section (200 words)**
  - H1 contains city name and "Mattress Removal"
  - Phone number (720) 263-6094 present
  - Neighborhood count mentioned
  - Pricing starting at $125 stated

- [ ] **Service Areas Section (350 words)**
  - 15-20 neighborhoods listed with names
  - ZIP codes provided for each neighborhood
  - Local landmarks referenced
  - Geographic coverage described

- [ ] **Services Section (450 words)**
  - All mattress types covered
  - Box spring and bed frame services
  - Commercial/bulk services mentioned
  - Local market considerations included

- [ ] **Environmental Section (400 words)**
  - Local recycling facilities named
  - Environmental regulations mentioned
  - Materials recovery statistics (80%)
  - Local environmental impact described

- [ ] **Pricing Section (300 words)**
  - $125/$155/$180 pricing structure
  - Additional fees clearly stated
  - Payment methods mentioned
  - Booking process described

- [ ] **Reviews Section (250 words)**
  - 3 unique local testimonials
  - **SERVICE FOCUS**: Reviews focus on mattress removal experience, not city lifestyle
  - Realistic customer names/initials
  - **PRACTICAL DETAILS**: Crew professionalism, timing, equipment, scheduling coordination
  - Neighborhood references (brief and natural)
  - **AVOID**: City tourism language, cultural details, architectural descriptions

- [ ] **FAQ Section (350 words)**
  - 8 service-focused questions
  - **CORE TOPICS**: Pricing, scheduling, service area, what's included, licensing/insurance
  - **PRACTICAL QUESTIONS**: "How quickly can you pick up?", "Do you handle upstairs?", "What's included?"
  - **BALANCE**: 6+ service-focused questions, 1-2 location-specific maximum
  - **AVOID**: Extensive city details, cultural information, historical context

- [ ] **Contact Section (150 words)**
  - Local contact information
  - Service hours stated
  - Response time commitments
  - Emergency availability mentioned

## Technical Review Checklist

### File Structure Verification
- [ ] **Correct file location**
  - File at `/src/mattress-removal/[state]/[city].md`
  - Proper city name in filename (lowercase, hyphens)
  - State directory exists and is correct

- [ ] **State index page exists**
  - `/src/mattress-removal/[state]/index.md` present
  - State page includes link to this city
  - State page updated with current city count

### Template Structure Verification
- [ ] **Centralized template used correctly**
  - Uses layout: location.njk in frontmatter
  - City file contains ONLY frontmatter + content data
  - NO HTML structure in city file (handled by template)
  - NO basic Markdown format used

### CSS Styling Verification
- [ ] **Centralized CSS working correctly**
  - **NO `<style>` blocks in individual city files (CSS is centralized)**
  - Service icons display in 4-column grid (not stacked vertically)
  - Two-column content layout with sidebar functioning
  - Pricing cards properly styled with hover effects
  - Review cards and FAQ accordion properly styled
  - Nearby cities grid layout working
  - Responsive design functioning on mobile
  - **CRITICAL: Page does NOT appear broken or unstyled**
  - All styling comes from main CSS file automatically

### Frontmatter Verification
- [ ] **Complete frontmatter**
  - All required fields present
  - Correct layout: base.njk
  - Proper permalink structure
  - City and state names accurate

- [ ] **Coordinates accurate**
  - Latitude and longitude for city center
  - Coordinates match actual city location
  - Format is correct decimal degrees

- [ ] **Neighborhoods array complete**
  - 15-20 neighborhoods listed
  - ZIP codes for each neighborhood
  - Proper YAML array format

- [ ] **Nearby cities accurate**
  - 5-6 cities within 20 miles
  - Accurate distances listed
  - Proper linking structure

### SEO Elements Verification
- [ ] **Title tag optimized**
  - Under 60 characters
  - Includes city name and pricing
  - Format: "[City] Mattress Removal & Disposal Service - Starting at $125"

- [ ] **Meta description optimized**
  - 150-160 characters
  - Includes local keywords
  - Call-to-action present
  - Neighborhood count mentioned

- [ ] **Header structure proper**
  - Single H1 tag with city name
  - H2 and H3 tags logically structured
  - Keywords naturally integrated
  - No over-optimization

### Hierarchical Linking Verification
**First, determine page type**: Check cities.md to identify if city is Major Metro, Metro, or Suburb

- [ ] **Metro-Level Page Linking** (if Major Metro, Metro, State Capital, or College Town):
  - Links UP to state-level page (/mattress-removal/[state]/)
  - Links ACROSS to ALL other metros in the state (Major Metro, Metro, State Capital, College Town)
  - Links DOWN to **EVERY SINGLE** suburb listed under this metro in cities.md (use ### [Metro] Suburbs sections) - NO EXCEPTIONS
  - **CRITICAL: Complete suburb count verified** - Count all suburbs in cities.md and ensure ALL are included
  - Includes dedicated "Nearby Areas" section listing **ALL** suburbs served - **COMPLETE COUNT REQUIRED**
  - Uses correct nested suburb URLs (/mattress-removal/[state]/[metro]/[suburb]/)
  - Does NOT link to suburbs outside its metro area

- [ ] **Suburb-Level Page Linking** (if marked as "Suburb" in cities.md):
  - Links UP to parent metro page (/mattress-removal/[state]/[metro]/)
  - Links ACROSS to 2-3 other suburbs using nested URLs (/mattress-removal/[state]/[metro]/[suburb]/)
  - Does NOT link directly to state page
  - Does NOT link to other metro areas
  - Does NOT link to suburbs outside its metro area

- [ ] **Link hierarchy and URL structure validated**:
  - All internal links follow proper UP/ACROSS/DOWN structure
  - Suburb links use nested URL format (/mattress-removal/[state]/[metro]/[suburb]/)
  - No cross-metro suburb linking
  - No direct suburb-to-state linking
  - Metro pages include all their suburbs with correct nested URLs
  - Link text is descriptive and includes city names

### Schema Markup Verification
- [ ] **LocalBusiness schema complete**
  - Correct business name format
  - Accurate address information
  - Phone number: 720-263-6094
  - Price range: $125-$180

- [ ] **Geographic data accurate**
  - Coordinates match frontmatter
  - Area served correctly defined
  - Service coverage appropriate

- [ ] **Rating information realistic**
  - 4.9/5 rating maintained
  - Review count realistic for city size
  - Aggregate rating properly formatted

## Local Accuracy Verification

### Geographic Information
- [ ] **Neighborhood names verified**
  - All neighborhoods exist and are current
  - Spellings are correct
  - No defunct or renamed areas

- [ ] **ZIP codes verified**
  - All ZIP codes serve actual neighborhoods
  - No incorrect or non-existent codes
  - Coverage appropriate for city size

- [ ] **Landmarks accurate**
  - Referenced landmarks exist and are notable
  - No closed or demolished locations
  - Geographic references are current

### Facility Information
- [ ] **Recycling facilities verified**
  - 2-3 facilities listed are operational
  - Names and locations are accurate
  - Contact information current if provided

- [ ] **Regulations current**
  - Local disposal laws accurate
  - Municipal requirements correct
  - Environmental compliance up-to-date

### Distance Information
- [ ] **Nearby cities accurate**
  - Distances calculated correctly
  - All cities within 20-mile radius
  - Travel routes realistic

## Quality Assessment

### Content Quality
- [ ] **Writing quality high**
  - Grammar and spelling correct
  - Professional tone maintained
  - Natural flow and readability

- [ ] **Local relevance strong**
  - Content feels authentic to city
  - Local characteristics addressed
  - Regional considerations included

- [ ] **SEO optimization natural**
  - Keywords integrated organically
  - No keyword stuffing detected
  - Content provides user value

### Technical Quality
- [ ] **Page loads correctly**
  - No build errors or warnings
  - All sections display properly
  - Images load successfully

- [ ] **Links functional**
  - Internal links work correctly
  - Nearby city links appropriate
  - No broken or missing links

- [ ] **Mobile responsive**
  - Page displays well on mobile
  - All content accessible
  - User experience optimized

- [ ] **Layout and visual alignment verified**
  - All sections properly centered and aligned
  - No off-center text blocks or misaligned elements
  - Consistent margins and padding between content sections
  - Headers, subheaders, and body text properly sized and spaced
  - CTA buttons centered and properly positioned
  - Images and icons aligned correctly within containers
  - Pricing cards evenly spaced and aligned across screen sizes
  - Contact sections (phone, address) consistently positioned
  - Elements stack properly on mobile devices
  - No visual layout issues or broken formatting

- [ ] **FAQ functionality working**
  - All FAQ questions are clickable
  - Clicking expands answer content (shows text)
  - Clicking again collapses answer (hides text)
  - Toggle icon changes from + to − when expanded
  - No JavaScript errors in browser console

## Performance Verification

### Build Process
- [ ] **Site builds successfully**
  - Run `npm run build` without errors
  - City page appears in dist/ folder
  - All assets generated correctly

- [ ] **Page accessibility**
  - Navigate to page URL successfully
  - All content renders properly
  - No console errors in browser

### SEO Tools Check
- [ ] **Basic SEO verification**
  - Title and description display correctly
  - Headers structured appropriately
  - Schema markup validates

## Final Review Actions

### Issue Resolution
If any checklist items fail:
1. **Document specific issues found**
2. **Update source files to fix problems**
3. **Rebuild site to verify fixes**
4. **Re-run review process until all items pass**

### Completion Steps
When all checks pass:
- [ ] **Mark city as reviewed**
  - Add review date to internal tracking
  - Document any notes or special considerations
  - Confirm city is ready for production

- [ ] **Update city status**
  - Ensure city remains marked completed in tasks/cities.md
  - Add to state index page if not already present
  - Update any internal linking structures

## Review Documentation

### Review Notes Template
```markdown
## [City Name], [State] - Review Date: [Date]

### Content Quality: [Pass/Fail]
- Word count: [actual count]
- Unique content: [percentage]
- Local accuracy: [verified/issues found]

### Technical Quality: [Pass/Fail]
- Build status: [success/errors]
- SEO elements: [optimized/needs work]
- Schema markup: [valid/invalid]

### Issues Found:
- [List any issues discovered]

### Resolution Required:
- [List actions needed before approval]

### Final Status: [Approved/Needs Revision]
```

### Common Review Issues

**Content Issues:**
- Low-quality content with filler or padding instead of helpful information
- Duplicate content from other cities
- Inaccurate neighborhood or ZIP code information
- Generic content lacking local specifics

**Technical Issues:**
- **Using base.njk layout instead of location.njk template**
- **Including HTML structure in city files (should be template-only)**
- **Including CSS blocks in individual city files (CSS should be centralized)**
- **Pages appearing unstyled with stacked elements (check main CSS file)**
- Missing or incomplete frontmatter
- **Missing content: section with required content variables**
- Broken internal links to nearby cities
- **Incomplete suburb linking - Metro page missing some suburbs from cities.md**
- **Wrong suburb count - Not linking to ALL suburbs listed under metro in cities.md**
- Incorrect hierarchical linking (suburb linking to state, metro missing suburbs, etc.)
- Wrong suburb URL format (not using /mattress-removal/[state]/[metro]/[suburb]/)
- Invalid schema markup structure
- SEO elements not optimized
- FAQ accordion not functional (JavaScript issues)
- Inline JavaScript found in city pages instead of base template
- Layout and alignment issues (off-center content, misaligned elements)
- Visual formatting problems (inconsistent spacing, broken responsive design)
- **Service icons stacking vertically instead of displaying in 4-column grid**
- **Missing responsive design due to incomplete CSS**

**Quality Issues:**
- Poor grammar or spelling errors
- Unnatural keyword integration
- Unrealistic testimonials or claims
- Inconsistent business information

## Success Criteria

A city page passes review when:
- All checklist items are marked complete
- No critical issues remain unresolved
- Content meets professional quality standards
- Technical implementation is flawless
- Local information is verified accurate
- Hierarchical linking structure is correct (metro vs suburb rules followed)
- Suburb URLs use proper nested format (/mattress-removal/[state]/[metro]/[suburb]/)
- Layout and visual alignment meets standards (no off-center or misaligned content)

This thorough review process ensures every city page meets our high standards and provides maximum value to users while achieving optimal SEO performance.