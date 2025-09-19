# City Requirements - Quality Standards

## Content Requirements

### Content Quality Standards
- **High-quality, helpful content** focused on user needs (no arbitrary word count requirements)
- **70% unique content** - must be city-specific and valuable to users
- **30% standardized** content - can include templated service information

### Content Structure Requirements
1. **Hero Section (200 words)**
   - H1 with city name and "Mattress Removal" 
   - Local phone number (720) 263-6094
   - Service area mention with neighborhood count
   - Pricing starting at $125

2. **Service Areas Section (350 words)**
   - 15-20 specific neighborhoods listed
   - ZIP codes for each neighborhood
   - Local landmarks and geographic references
   - Travel times or accessibility details

3. **Comprehensive Services Section (450 words)**
   - Memory foam, innerspring, hybrid mattress removal
   - Box spring and bed frame services
   - Bulk pickup capabilities
   - Local market considerations

4. **Environmental Impact Section (400 words)**
   - Local recycling facility partnerships
   - City-specific environmental regulations
   - Materials recovery statistics (80% recyclable)
   - Local landfill diversion data

5. **Pricing Section (300 words)**
   - Current pricing: $125/$155/$180 structure
   - Local service considerations
   - Payment methods and booking process
   - Additional fees clearly stated

6. **Customer Reviews Section (250 words)**
   - 3 authentic local testimonials (MUST sound casual and natural)
   - Neighborhood references in reviews
   - **FOCUS ON SERVICE**: Actual mattress removal experience, timing, professionalism
   - Local names/initials (realistic)
   - **CRITICAL**: Use conversational language, contractions, personal situations
   - **AVOID**: City history, cultural details, architectural descriptions

7. **FAQ Section (350 words)**
   - 8 service-focused questions and answers
   - **CORE TOPICS**: Pricing, scheduling, service area, what's included, licensing/insurance
   - **PRACTICAL QUESTIONS**: "How quickly can you pick up?", "Do you handle upstairs?", "What's included?"
   - **PAYMENT & LOGISTICS**: Pricing details, payment methods, scheduling requirements
   - **AVOID**: Extensive city details, cultural information, historical context
   - **BALANCE**: 1-2 location-specific questions maximum, 6+ service-focused questions

8. **Contact Information (150 words)**
   - Local contact details
   - Service hours and availability
   - Emergency pickup options
   - Response time commitments

### Content Quality Standards
- **Natural keyword integration** - Target 0.5-1.0% density, NEVER exceed 1.5%
- **Local accuracy** - All neighborhood names, ZIP codes, facilities verified
- **Authentic voice** - Testimonials MUST sound casual and conversational
- **Professional tone** - Business-appropriate language throughout
- **Regulatory compliance** - Accurate disposal law references
- **SEO Safety** - Use keyword variations, avoid repetition, write for humans first

## Technical Requirements

### File Structure
- **Location**: `/src/mattress-removal/[state]/[city].md`
- **Permalink Structure** (CRITICAL - Check cities.md hierarchy first):
  - **Major Metro/Metro cities**: `/mattress-removal/[state]/[city]/`
  - **Suburb cities**: `/mattress-removal/[state]/[metro]/[city]/`
- **State index**: Must exist at `/src/mattress-removal/[state]/index.md`

### Template Structure Requirements
**CENTRALIZED TEMPLATE APPROACH**: All city pages MUST use the centralized `location.njk` template located at `/src/_layouts/location.njk`. This template contains all HTML structure, styling, and interactive elements. City files should contain ONLY frontmatter and unique content data.

**Key Benefits**:
- **One file change** updates all location pages instantly
- **Design consistency** guaranteed across all cities  
- **Maintenance simplified**: Edit template once vs hundreds of files
- **True templating**: Leverages Eleventy's full templating capabilities

**Template Structure Provided by location.njk**:
1. **Breadcrumb Navigation** - Auto-generated from city/state data
2. **Hero Section** - Dynamic content from frontmatter
3. **Service Icons Bar** - Standardized across all locations
4. **Two-Column Content Layout** - Main content with sidebar
5. **Customer Reviews Section** - City-specific reviews from frontmatter
6. **FAQ Accordion Section** - Local FAQs with auto-generated functionality
7. **Nearby Cities Section** - Hierarchical linking (metro vs suburbs)
8. **Final CTA Section** - Consistent call-to-action across locations

**City File Requirements**: Use layout: `location.njk` and provide ONLY:
- Complete frontmatter with all required data fields
- Unique content variables in `content:` section
- NO HTML structure (handled by template)
- NO inline CSS (styling is centralized)

### CSS Styling Requirements
**IMPORTANT**: All location-specific CSS styles are now centralized in the main CSS file. This enables true templating benefits where one CSS change updates all location pages instantly.

1. **Centralized CSS Architecture**: All location-specific styles are included in `/src/_includes/css/main.css`. This includes:
   - Service icons grid layout (4-column responsive grid)
   - Two-column content layout with sidebar
   - Pricing cards styling and hover effects
   - Review cards and FAQ accordion styling
   - Nearby cities grid and responsive design
   - All visual elements and spacing

2. **NO CSS in Individual City Files**: City pages should NOT include any `<style>` blocks. All styling is handled by the base template through the main CSS file.

3. **Automatic Styling**: When using the proper HTML template structure from Denver, all visual styling is automatically applied through the centralized CSS.

4. **Design Change Benefits**: To update the design of ALL location pages, simply edit the location-specific styles in `/src/_includes/css/main.css`. This will instantly update every city page without touching individual files.

**Example File Structure** (NO CSS block required):
```html
</section>
<!-- File ends here - no CSS block needed -->
```

### Frontmatter Requirements
```yaml
layout: base.njk
title: [City] Mattress Removal & Disposal Service - Starting at $125
description: Professional mattress removal in [City], [State]. Next-day pickup starting at $125. Licensed, insured, and eco-friendly. Serving X neighborhoods.
permalink: /mattress-removal/[state]/[city]/
city: [City Name]
state: [State Name]
stateSlug: [state-slug]
tier: [1-3 based on population]
coordinates:
  lat: [latitude]
  lng: [longitude]
pricing:
  startingPrice: 125
  single: 125
  queen: 125
  king: 135
  boxSpring: 30
neighborhoods: [array of 15-20 neighborhoods with ZIP codes]
zipCodes: [array of all ZIP codes served]
recyclingPartners: [array of 2-3 local facilities]
localRegulations: [string describing local disposal requirements]
nearbyCities: [array of 5-6 nearby cities with distances]
reviews: [object with count and 3 featured reviews]
faqs: [array of 5 location-specific questions/answers]
schema: [LocalBusiness JSON-LD structured data]
```

### SEO Requirements
- **H1 tag**: "[City] Mattress Removal & Disposal Service"
- **Title tag**: Under 60 characters with city name and pricing
- **Meta description**: 150-160 characters with local keywords and CTA
- **Header structure**: Proper H1-H3 hierarchy
- **CRITICAL: Breadcrumb navigation**: MUST link back to state page (/mattress-removal/[state]/)
- **Internal linking**: Hierarchical linking structure based on page type (see Hierarchical Linking Rules below)
- **Image optimization**: All images have local alt tags

### Hierarchical Linking Rules
**CRITICAL**: Check cities.md to identify exact page type and all related metro/suburb relationships before creating links.

**Major Metro Pages** (Major Metro):
- **Link UP**: **CRITICAL** - Link back to state-level page (/mattress-removal/[state]/) via breadcrumb navigation
- **Link ACROSS**: Link to ALL other metros in the state (Major Metro, Metro, State Capital, College Town)
- **Link DOWN**: **CRITICAL** - Link to **EVERY SINGLE** suburb listed under this metro in cities.md (use ### [Metro] Suburbs sections) - NO EXCEPTIONS
- **Required: Nearby Areas Section**: Include dedicated section listing **ALL** suburbs served by this metro - **COMPLETE COUNT REQUIRED**
- **Suburb URL Strategy**: When linking to suburbs, use nested suburb URLs (/mattress-removal/[state]/[metro]/[suburb]/)

**Metro Pages** (Metro, State Capital, College Town):
- **Link UP**: **CRITICAL** - Link back to state-level page (/mattress-removal/[state]/) via breadcrumb navigation
- **Link ACROSS**: Link to ALL other metros in the state (Major Metro, Metro, State Capital, College Town)
- **Link DOWN**: **CRITICAL** - Link to **EVERY SINGLE** suburb listed under this metro in cities.md (use ### [Metro] Suburbs sections) - NO EXCEPTIONS
- **Required: Nearby Areas Section**: Include dedicated section listing **ALL** suburbs served by this metro (if any) - **COMPLETE COUNT REQUIRED**
- **Suburb URL Strategy**: When linking to suburbs, use nested suburb URLs (/mattress-removal/[state]/[metro]/[suburb]/)

**Suburb Pages** (cities listed under ### [Metro] Suburbs):
- **Link UP**: Link back to parent metro page (/mattress-removal/[state]/[metro]/)
- **Link ACROSS**: Link to ALL other suburbs within the same metro area using nested URLs (/mattress-removal/[state]/[metro]/[suburb]/)
- **NO direct state links**: Suburbs should not link directly to state page
- **NO suburb-to-metro linking**: Suburbs should not link to other metro areas

**Implementation Examples**:

**Atlanta page** (Major Metro): 
- Links UP to: /mattress-removal/georgia/
- Links ACROSS to: ALL Georgia metros (Albany, Augusta, Columbus, Savannah, Warner Robins, Athens)
- Links DOWN to: ALL Atlanta suburbs (Alpharetta, Brookhaven, Duluth, Johns Creek, Kennesaw, Lawrenceville, Marietta, Roswell, Sandy Springs, Smyrna, Woodstock)

**Houston page** (Major Metro):
- Links UP to: /mattress-removal/texas/
- Links ACROSS to: ALL Texas metros (Austin, Dallas, El Paso, San Antonio, plus all Other Metro Areas)
- Links DOWN to: ALL Houston suburbs (if any are listed in cities.md)

**Alpharetta page** (Atlanta Suburb):
- Links UP to: /mattress-removal/georgia/atlanta/
- Links ACROSS to: ALL other Atlanta suburbs (Brookhaven, Duluth, Johns Creek, Kennesaw, Lawrenceville, Marietta, Roswell, Sandy Springs, Smyrna, Woodstock)

**Augusta page** (Georgia Metro):
- Links UP to: /mattress-removal/georgia/
- Links ACROSS to: ALL Georgia metros (Atlanta, Albany, Columbus, Savannah, Warner Robins, Athens)
- Links DOWN to: No suburbs (none listed in cities.md)

### Schema Markup Requirements
- **@type**: "LocalBusiness"
- **Name**: "A Bedder World [City]"
- **Address**: City, State, Country
- **Coordinates**: Accurate latitude/longitude
- **Phone**: 720-263-6094
- **Price range**: $125-$180
- **Service area**: City name
- **Aggregate rating**: 4.9/5 with realistic review count

## Local Research Requirements

### Demographics Data
- **City population** (current year estimate)
- **Metro area population**
- **Major demographics** (age, income, housing types)
- **Growth trends** and economic factors

### Geographic Data
- **15-20 specific neighborhoods** with accurate names
- **ZIP codes** for each neighborhood (verified)
- **Local landmarks** (parks, hospitals, shopping centers)
- **Geographic boundaries** and accessibility features

### Regulatory Data
- **Municipal disposal regulations** specific to city
- **Waste management requirements** and procedures
- **Environmental compliance** standards
- **Business licensing** requirements if applicable

### Environmental Data
- **2-3 local recycling facilities** with verified names/locations
- **Waste management companies** serving the area
- **Environmental initiatives** or sustainability programs
- **Landfill diversion statistics** if available

### Nearby Cities Data
- **5-6 cities within 20 miles** with accurate distances
- **Major metropolitan areas** in region
- **Interstate/regional connections**
- **Service logistics** considerations

## Quality Assurance Standards

### Content Uniqueness
- **Maximum 30% similarity** to any other location page
- **No duplicate paragraphs** across location pages
- **Unique local references** in every major section
- **Original testimonials** not copied from other pages

### Local Accuracy
- **All neighborhood names** spelled correctly and current
- **ZIP codes verified** through postal service
- **Recycling facilities** confirmed as operational
- **Regulations current** within past 12 months

### SEO Compliance
- **Primary keyword density** 0.5-1.5% for "[City] mattress removal"
- **Related keywords** naturally integrated
- **No over-optimization** or keyword stuffing
- **Internal links functional** and relevant

### Technical Standards
- **Mobile responsive** design verified
- **Page load speed** under 3 seconds
- **All images optimized** and loading properly
- **Schema markup valid** with no errors

### Layout and Visual Standards
- **Content alignment**: All sections properly centered and aligned
- **Text positioning**: No off-center text blocks or misaligned elements
- **Section spacing**: Consistent margins and padding between content sections
- **Responsive layout**: Elements stack properly on mobile devices
- **Visual hierarchy**: Headers, subheaders, and body text properly sized and spaced
- **Button alignment**: All CTA buttons centered and properly positioned
- **Image placement**: Photos and icons aligned correctly within their containers
- **FAQ accordion**: Questions and answers properly formatted and aligned
- **Pricing cards**: Evenly spaced and aligned across all screen sizes
- **Contact sections**: Phone numbers, addresses consistently positioned

### Business Standards
- **Phone number consistent** (720) 263-6094 throughout
- **Pricing accurate** ($125/$155/$180 structure)
- **Service claims realistic** and deliverable
- **Contact information** professional and current

## Success Criteria Checklist

### Research Complete
- [ ] **MANDATORY: cities.md hierarchy checked (Major Metro, Metro, or Suburb)**
- [ ] **CRITICAL: Permalink structure confirmed based on hierarchy**
- [ ] City demographics researched and documented
- [ ] 15-20 neighborhoods identified with ZIP codes
- [ ] 2-3 local recycling facilities verified
- [ ] Municipal regulations researched and accurate
- [ ] 5-6 nearby cities identified with distances

### Content Standards Met
- [ ] High-quality, helpful content focused on user needs (no filler content)
- [ ] 70%+ unique, location-specific content
- [ ] All 8 required sections included
- [ ] 3 authentic local testimonials (service-focused, not city-focused)
- [ ] 8 practical FAQs (6+ service-focused, 1-2 location-specific maximum)

### Technical Implementation
- [ ] Proper file structure and naming
- [ ] Complete frontmatter with all required fields
- [ ] **NON-NEGOTIABLE: Uses location.njk template (layout: location.njk in frontmatter)**
- [ ] **NO CSS blocks in individual city files (styling is centralized)**
- [ ] Valid LocalBusiness schema markup
- [ ] SEO elements optimized (title, description, headers)
- [ ] **CRITICAL: State page linking - breadcrumb MUST link to /mattress-removal/[state]/**
- [ ] **CRITICAL: Hierarchical linking implemented (ALL metros and suburbs per cities.md)**
- [ ] **CRITICAL: Complete suburb count verified (ALL suburbs from cities.md included)**
- [ ] Internal links to nearby cities and state page

### Quality Control
- [ ] All local information verified accurate
- [ ] Content uniqueness verified (under 30% similarity)
- [ ] SEO compliance checked (keyword density, structure)
- [ ] Technical standards met (mobile, speed, images)

### Final Verification
- [ ] Page builds successfully without errors
- [ ] Content displays properly in browser
- [ ] All links functional and relevant
- [ ] Schema markup validates without errors
- [ ] FAQ accordion functionality working (can expand/collapse)
- [ ] **CRITICAL: City marked as completed in tasks/cities.md (both summary AND state sections)**
- [ ] **CRITICAL: Progress counts updated in cities.md**

## Common Issues to Avoid

### Content Issues
- Using generic content without local customization
- Copying testimonials or reviews from other cities
- Inaccurate neighborhood names or ZIP codes
- Overly promotional or salesy language
- Keyword stuffing or unnatural SEO optimization

### Technical Issues
- **Using base.njk layout instead of location.njk template**
- **Pages appearing unstyled due to incorrect template format**
- Missing or incomplete frontmatter
- Broken internal links to nearby cities
- Invalid schema markup structure
- Incorrect file paths or permalinks
- Missing state index page
- FAQ accordion not functioning (clicking doesn't expand answers)
- Including inline JavaScript in city pages instead of using base template

### Research Issues
- Outdated demographic or regulatory information
- Non-existent or closed recycling facilities
- Inaccurate distances to nearby cities
- Missing or incorrect ZIP code assignments
- Unverified local regulations or requirements

### Quality Issues
- Insufficient unique content (under 70%)
- Poor grammar or writing quality
- Inconsistent business information
- Unrealistic service claims or testimonials
- Missing required content sections

These requirements ensure every city page meets professional standards, provides genuine value to users, and achieves optimal SEO performance while maintaining compliance with search engine guidelines.