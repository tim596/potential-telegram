#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Import location data
const locationsData = require('../src/_data/locations.js')();

// Content variation templates to prevent duplicate content
const contentTemplates = {
  serviceIntros: [
    {
      id: 1,
      template: "A Bedder World provides comprehensive mattress removal and recycling services throughout {city} and surrounding areas. With over 13 years serving the {city} community, we've removed thousands of mattresses from homes, apartments, hotels, and businesses across {neighborhoodCount} local neighborhoods.",
      style: "comprehensive"
    },
    {
      id: 2, 
      template: "Professional mattress removal service in {city}, {state} with same-day pickup available. Our licensed team specializes in eco-friendly mattress disposal, serving {neighborhoodCount} neighborhoods throughout the greater {city} area with transparent pricing starting at $125.",
      style: "professional"
    },
    {
      id: 3,
      template: "When you need reliable mattress removal in {city}, choose the area's most trusted service. We've been helping {city} residents responsibly dispose of their old mattresses for over a decade, with service extending to {neighborhoodCount} local neighborhoods.",
      style: "trusted"
    },
    {
      id: 4,
      template: "{city}'s premier mattress removal and recycling service. From downtown high-rises to suburban homes, we provide professional pickup throughout {neighborhoodCount} neighborhoods in the {city} metro area, ensuring 90% of materials are recycled responsibly.",
      style: "premier"
    },
    {
      id: 5,
      template: "Eco-conscious mattress removal serving {city} and surrounding communities. Our experienced team handles everything from pickup to responsible disposal, covering {neighborhoodCount} neighborhoods with a commitment to keeping mattresses out of landfills.",
      style: "eco-conscious"
    }
  ],

  serviceDescriptions: [
    {
      id: 1,
      template: "Our {city} team specializes in navigating the unique challenges of the area, from {localChallenges}. We work with local recycling facilities including {recyclingPartners} to ensure your old mattress is disposed of responsibly and in compliance with {state} environmental regulations.",
      focus: "local-expertise"
    },
    {
      id: 2,
      template: "We understand the specific needs of {city} residents, whether you're dealing with {localChallenges}. Our partnerships with certified facilities like {recyclingPartners} ensure proper disposal while supporting the local economy and environment in {city}.",
      focus: "local-needs"
    },
    {
      id: 3,
      template: "Every {city} pickup is handled with care and attention to local requirements. From {localChallenges}, our team is equipped to handle any situation while maintaining our commitment to environmental responsibility through partnerships with {recyclingPartners}.",
      focus: "local-care"
    },
    {
      id: 4,
      template: "Serving {city} means understanding the community's unique characteristics, including {localChallenges}. Through our established relationships with {recyclingPartners} and other local facilities, we ensure every mattress is processed according to {state} environmental standards.",
      focus: "community-understanding"
    },
    {
      id: 5,
      template: "What sets our {city} service apart is our deep local knowledge and ability to handle {localChallenges}. We've built strong relationships with {recyclingPartners} to provide the most environmentally responsible disposal options available in the {city} area.",
      focus: "local-knowledge"
    }
  ],

  localChallenges: {
    tier1: [
      "high-rise apartment buildings, narrow stairwells, and busy urban traffic patterns",
      "dense downtown areas, limited parking, and multi-story residential buildings",
      "complex building access, elevator restrictions, and coordinating with building management",
      "urban logistics, parking limitations, and varying building regulations",
      "high-density housing, loading dock scheduling, and metropolitan area traffic"
    ],
    tier2: [
      "suburban homes with narrow doorways, basement pickups, and varying property access",
      "residential neighborhoods, garage pickups, and homeowner association requirements", 
      "family homes, attached garages, and local neighborhood parking restrictions",
      "mixed housing types, from condos to single-family homes with unique access needs",
      "suburban logistics, planned communities, and local municipal pickup regulations"
    ],
    tier3: [
      "rural properties with longer driveways, seasonal access issues, and diverse housing types",
      "small-town charm with historic homes, Main Street businesses, and community-focused service",
      "countryside pickups, farm properties, and areas where personal service truly matters",
      "close-knit communities where reputation and reliability are built on every interaction",
      "local character, from historic districts to newer developments, each with unique needs"
    ]
  },

  environmentalPrograms: {
    tier1: [
      "the city's comprehensive sustainability initiative and zero-waste goals",
      "major metropolitan environmental programs and corporate sustainability partnerships",
      "urban green initiatives, including landfill diversion and material recovery programs",
      "city-wide environmental leadership and progressive waste reduction policies",
      "large-scale recycling programs and environmental justice initiatives"
    ],
    tier2: [
      "regional environmental protection programs and community green initiatives", 
      "local sustainability efforts and regional waste reduction programs",
      "county-wide environmental initiatives and community recycling expansion",
      "area environmental organizations and regional conservation efforts",
      "community-driven sustainability programs and local green business partnerships"
    ],
    tier3: [
      "local environmental awareness campaigns and community recycling efforts",
      "grassroots environmental programs and local conservation initiatives",
      "community environmental education and small-town sustainability projects",
      "local environmental stewardship and community-led conservation efforts",
      "neighborhood environmental initiatives and local green living promotion"
    ]
  },

  regulationsSummary: {
    1: "promotes mattress recycling through municipal waste diversion programs and has ordinances requiring proper disposal",
    2: "requires proper mattress disposal and supports statewide recycling initiatives with local enforcement",
    3: "follows state environmental guidelines for mattress disposal and encourages recycling through community programs", 
    4: "has local disposal regulations that prohibit illegal dumping and promote recycling partnerships",
    5: "supports eco-friendly disposal practices and works with certified recycling facilities through local programs"
  }
};

// Generate unique content by selecting templates based on city characteristics
function generateUniqueContent(city, cityData) {
  const tier = cityData.tier;
  const cityHash = hashString(city);
  
  // Select templates based on city hash to ensure consistency but uniqueness
  const introTemplate = contentTemplates.serviceIntros[cityHash % contentTemplates.serviceIntros.length];
  const descTemplate = contentTemplates.serviceDescriptions[cityHash % contentTemplates.serviceDescriptions.length];
  const challenges = contentTemplates.localChallenges[`tier${tier}`][cityHash % contentTemplates.localChallenges[`tier${tier}`].length];
  const envPrograms = contentTemplates.environmentalPrograms[`tier${tier}`][cityHash % contentTemplates.environmentalPrograms[`tier${tier}`].length];
  const regSummary = contentTemplates.regulationsSummary[(cityHash % 5) + 1];
  
  return {
    serviceIntro: introTemplate.template
      .replace(/{city}/g, cityData.city)
      .replace(/{state}/g, cityData.state)
      .replace(/{neighborhoodCount}/g, cityData.neighborhoods.length),
    serviceDescription: descTemplate.template
      .replace(/{city}/g, cityData.city)
      .replace(/{state}/g, cityData.state)
      .replace(/{localChallenges}/g, challenges)
      .replace(/{recyclingPartners}/g, cityData.recyclingPartners.slice(0, 2).join(', ')),
    localChallenges: challenges,
    environmentalPrograms: envPrograms,
    regulationsSummary: regSummary,
    templateStyle: introTemplate.style,
    contentFocus: descTemplate.focus
  };
}

// Simple hash function for consistent template selection
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Generate FAQ variations based on city tier and characteristics
function generateLocalFAQs(city, cityData) {
  const tier = cityData.tier;
  const cityHash = hashString(city);
  
  const baseFAQs = [
    {
      question: `How much does mattress removal cost in ${city}?`,
      answer: `Mattress removal in ${city} starts at $125 for a single mattress. Additional items like box springs add $30, and bed frames add $25. We provide upfront pricing with no hidden fees.`
    },
    {
      question: `Do you offer same-day mattress pickup in ${city}?`,
      answer: `Yes! Same-day mattress pickup is available in ${city} when you book before 2 PM. We service ${cityData.neighborhoods.length} neighborhoods throughout the ${city} area.`
    },
    {
      question: `What areas of ${city} do you serve?`,
      answer: `We serve all of ${city} including ${cityData.neighborhoods.slice(0, 3).map(n => n.name).join(', ')}, and ${cityData.neighborhoods.length - 3} other neighborhoods. View our complete service area for specific zip codes.`
    }
  ];

  // Add tier-specific FAQs
  if (tier === 1) {
    baseFAQs.push({
      question: `Do you handle high-rise buildings in ${city}?`,
      answer: `Absolutely! Our ${city} team specializes in high-rise and apartment building pickups. We coordinate with building management and use service elevators when available.`
    });
  } else if (tier === 2) {
    baseFAQs.push({
      question: `Can you pick up from suburban homes in ${city}?`,
      answer: `Yes, we serve all residential areas in ${city}. Our team is equipped to handle suburban pickups including garage removals and items from second-story bedrooms.`
    });
  } else {
    baseFAQs.push({
      question: `Do you travel to all parts of ${city} and surrounding areas?`,
      answer: `Yes! We serve ${city} and the surrounding region. While we're based in larger cities, we're happy to travel to provide the same professional service to smaller communities.`
    });
  }

  baseFAQs.push({
    question: `What happens to my mattress after pickup in ${city}?`,
    answer: `Your mattress is taken to certified recycling facilities like ${cityData.recyclingPartners[0]}. About 90% of materials (steel, foam, cotton) are recycled, keeping them out of ${city} area landfills.`
  });

  return baseFAQs;
}

// Generate customer reviews based on city characteristics
function generateLocalReviews(city, cityData) {
  const tier = cityData.tier;
  const cityHash = hashString(city);
  
  const reviewTemplates = [
    {
      text: "Excellent service! They removed our king mattress from our {neighborhoodType} in {city}. Professional, on-time, and great price at $125.",
      author: "Sarah M.",
      neighborhood: cityData.neighborhoods[0].name
    },
    {
      text: "Best mattress removal service in {city}! They handled our {challengeType} with no issues. Highly recommend for anyone in the {city} area.",
      author: "Mike T.", 
      neighborhood: cityData.neighborhoods[Math.min(1, cityData.neighborhoods.length - 1)].name
    },
    {
      text: "Quick and professional. Removed our old mattress and box spring from {neighborhood}. The team was courteous and cleaned up after themselves.",
      author: "Jennifer R.",
      neighborhood: cityData.neighborhoods[Math.min(2, cityData.neighborhoods.length - 1)].name
    }
  ];

  const neighborhoodTypes = tier === 1 ? 'high-rise apartment' : tier === 2 ? 'suburban home' : 'house';
  const challengeTypes = tier === 1 ? 'downtown pickup' : tier === 2 ? 'garage removal' : 'rural pickup';

  return reviewTemplates.map((template, index) => ({
    text: template.text
      .replace(/{city}/g, city)
      .replace(/{neighborhoodType}/g, neighborhoodTypes)
      .replace(/{challengeType}/g, challengeTypes)
      .replace(/{neighborhood}/g, template.neighborhood),
    author: template.author,
    neighborhood: template.neighborhood
  }));
}

// Create state directory pages
function createStatePage(stateSlug, stateData) {
  const statePageContent = `---
layout: base.njk
title: Mattress Removal in ${stateData.name} - Professional Pickup Service
description: Professional mattress removal service in ${stateData.name}. Next-day pickup available in ${stateData.totalCities}+ cities. Starting at $125 with eco-friendly disposal.
permalink: /mattress-removal/${stateSlug}/
schema: |
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Mattress Removal in ${stateData.name}",
    "provider": {
      "@type": "Organization", 
      "name": "A Bedder World"
    },
    "areaServed": {
      "@type": "State",
      "name": "${stateData.name}"
    },
    "priceRange": "$125-$180"
  }
---

<!-- Breadcrumbs -->
<div class="breadcrumbs">
    <div class="container">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/mattress-removal/">Mattress Removal</a>
        <span>›</span>
        <span>${stateData.name}</span>
    </div>
</div>

<!-- Hero Section -->
<section class="hero">
    <div class="container">
        <h1 class="hero-title">Mattress Removal in ${stateData.name}</h1>
        <p class="hero-subtitle">Professional pickup service in ${stateData.totalCities}+ cities starting at $125</p>
        <p class="hero-description">
            A Bedder World provides comprehensive mattress removal and recycling services 
            throughout ${stateData.name}. From ${stateData.majorCities[0]} to ${stateData.majorCities[stateData.majorCities.length-1]}, 
            we offer next-day pickup with eco-friendly disposal.
        </p>
        <div class="hero-actions">
            <a href="#" class="btn btn-primary btn-xl zenbooker-inline-button" onclick="Zenbooker.showPopupWidget('https://widget.zenbooker.com/book/1607719749466x229623059118359230?embed=true');return false;">
                Schedule Pickup →
            </a>
            <a href="tel:7202636094" class="btn btn-secondary btn-xl">Call (720) 263-6094</a>
        </div>
    </div>
</section>

<!-- Cities Grid -->
<section class="section">
    <div class="container">
        <h2 class="section-title">Cities We Serve in ${stateData.name}</h2>
        <div class="cities-grid-state">
            ${stateData.majorCities.map(city => {
              const citySlug = city.toLowerCase().replace(/\s+/g, '-');
              return `<a href="/mattress-removal/${stateSlug}/${citySlug}/" class="city-link">
                <strong>${city}</strong>
                <span>Starting at $125</span>
              </a>`;
            }).join('\n            ')}
        </div>
    </div>
</section>

<!-- State Info -->
<section class="section" style="background-color: var(--gray-50);">
    <div class="container">
        <h2>Mattress Disposal Regulations in ${stateData.name}</h2>
        <p>${stateData.recyclingLaw}</p>
        <p>${stateData.disposalNote}</p>
        
        <div class="state-stats">
            <div class="stat-item">
                <strong>${stateData.totalCities}+</strong>
                <span>Cities Served</span>
            </div>
            <div class="stat-item">
                <strong>${(stateData.population / 1000000).toFixed(1)}M</strong>
                <span>Population</span>
            </div>
            <div class="stat-item">
                <strong>4.9★</strong>
                <span>Average Rating</span>
            </div>
        </div>
    </div>
</section>

<style>
.cities-grid-state {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
    margin-top: 32px;
}

.city-link {
    display: flex;
    flex-direction: column;
    padding: 20px;
    background: var(--white);
    border: 2px solid var(--gray-200);
    border-radius: var(--border-radius);
    text-decoration: none;
    transition: var(--transition);
}

.city-link:hover {
    border-color: var(--primary-green);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.city-link strong {
    color: var(--gray-900);
    font-size: 1.125rem;
    margin-bottom: 4px;
}

.city-link span {
    color: var(--primary-green);
    font-weight: 600;
}

.state-stats {
    display: flex;
    justify-content: center;
    gap: 48px;
    margin-top: 32px;
    flex-wrap: wrap;
}

.stat-item {
    text-align: center;
    display: flex;
    flex-direction: column;
}

.stat-item strong {
    font-size: 2rem;
    color: var(--primary-green);
    font-weight: 800;
}

.stat-item span {
    color: var(--gray-600);
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}
</style>`;

  return statePageContent;
}

// Create city pages with unique content
function createCityPage(citySlug, cityData, stateSlug) {
  const uniqueContent = generateUniqueContent(cityData.city, cityData);
  const localFAQs = generateLocalFAQs(cityData.city, cityData);
  const localReviews = generateLocalReviews(cityData.city, cityData);

  const cityPageContent = `---
layout: base.njk
title: ${cityData.city} Mattress Removal & Disposal Service - Starting at $125
description: Professional mattress removal in ${cityData.city}, ${cityData.state}. Same-day pickup starting at $125. Licensed, insured, and eco-friendly. Serving ${cityData.neighborhoods.length} neighborhoods.
permalink: /mattress-removal/${stateSlug}/${citySlug}/
city: ${cityData.city}
state: ${cityData.state}
stateSlug: ${stateSlug}
tier: ${cityData.tier}
coordinates: 
  lat: ${cityData.coordinates.lat}
  lng: ${cityData.coordinates.lng}
pricing:
  startingPrice: 125
  single: 125
  queen: 125
  king: 135
  boxSpring: 30
neighborhoods: ${JSON.stringify(cityData.neighborhoods, null, 2)}
zipCodes: ${JSON.stringify(cityData.zipCodes, null, 2)}
recyclingPartners: ${JSON.stringify(cityData.recyclingPartners, null, 2)}
localRegulations: "${cityData.localRegulations}"
nearbyCities: ${JSON.stringify(cityData.nearbyCities || [], null, 2)}
reviews:
  count: ${Math.floor(Math.random() * 200) + 50}
  featured: ${JSON.stringify(localReviews, null, 2)}
faqs: ${JSON.stringify(localFAQs, null, 2)}
schema: |
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "A Bedder World ${cityData.city}",
    "description": "Professional mattress removal and recycling service in ${cityData.city}, ${cityData.state}",
    "url": "https://abedderworld.com/mattress-removal/${stateSlug}/${citySlug}/",
    "telephone": "(855) 555-1234",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "${cityData.city}",
      "addressRegion": "${cityData.state}",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "${cityData.coordinates.lat}",
      "longitude": "${cityData.coordinates.lng}"
    },
    "areaServed": {
      "@type": "City",
      "name": "${cityData.city}"
    },
    "priceRange": "$125-$180",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "${Math.floor(Math.random() * 200) + 50}"
    }
  }
---

<!-- Breadcrumbs -->
<div class="breadcrumbs">
    <div class="container">
        <a href="/">Home</a>
        <span>›</span>
        <a href="/mattress-removal/">Mattress Removal</a>
        <span>›</span>
        <a href="/mattress-removal/${stateSlug}/">${cityData.state}</a>
        <span>›</span>
        <span>${cityData.city}</span>
    </div>
</div>

<!-- Hero Section -->
<section class="hero hero-with-image" style="background-image: url('/images/lifestyle/mattress-removal-${(hashString(cityData.city) % 4) + 1}.png')">
    <div class="container">
        <div class="hero-content">
            <div class="hero-text">
                <h1 class="hero-title">${cityData.city} Mattress Removal & Disposal Service</h1>
                <p class="hero-subtitle">Same-Day Pickup • Starting at $125 • Eco-Friendly Recycling • Licensed & Insured</p>
                <p class="hero-description">
                    #1 rated mattress removal service in ${cityData.city}, ${cityData.state}. Professional pickup starting at $125. 
                    We handle everything from curbside to ${cityData.tier === 1 ? 'high-rise apartment' : cityData.tier === 2 ? 'multi-story home' : 'residential property'} pickups. 
                    Serving ${cityData.neighborhoods.length} neighborhoods throughout the ${cityData.city} ${cityData.tier === 1 ? 'metro area' : 'area'}.
                </p>
                
                <!-- Primary Booking CTA -->
                <div class="hero-primary-cta">
                    <div class="hero-actions">
                        <button type="button" class="btn btn-primary btn-xl zenbooker-inline-button" onclick="Zenbooker.showPopupWidget('https://widget.zenbooker.com/book/1607719749466x229623059118359230?embed=true');return false;">
                            Book a Pickup →
                        </button>
                        <a href="tel:8555551234" class="hero-phone-link">
                            Or call: (855) 555-1234
                        </a>
                    </div>
                    
                    <div class="hero-pricing-info">
                        <span class="pricing-text">Starting at $125</span>
                        <span class="booking-speed">• Book online in 60 seconds</span>
                    </div>
                </div>
                
                <div class="hero-location-features">
                    <div class="hero-location-feature">
                        <img src="/images/icons/check-mark-icon.png" alt="Check" width="20" height="20" loading="eager">
                        <span>Same Day Service Available</span>
                    </div>
                    <div class="hero-location-feature">
                        <img src="/images/icons/recycle-mattress-icon-1.png" alt="Recycle" width="20" height="20" loading="eager">
                        <span>90% Materials Recycled</span>
                    </div>
                    <div class="hero-location-feature">
                        <img src="/images/icons/trusted-service-icon.png" alt="Trusted" width="20" height="20" loading="eager">
                        <span>Licensed & Insured</span>
                    </div>
                </div>
                
                <div class="hero-bottom-trust">
                    <div class="hero-location-trust">
                        <span class="rating">★★★★★ 4.9/5</span>
                        <span class="reviews">(${Math.floor(Math.random() * 200) + 50} ${cityData.city} Reviews)</span>
                    </div>
                    
                    <div class="hero-guarantees">
                        <span>✓ No Hidden Fees</span>
                        <span>✓ Best Price Guarantee</span>
                        <span>✓ Licensed & Insured</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Service Icons Bar -->
<section class="service-icons-bar">
    <div class="container">
        <div class="service-icons-grid">
            <div class="service-icon-item">
                <img src="/images/icons/removal-icon.png" alt="Removal" width="48" height="48" loading="lazy">
                <h4>Professional Removal</h4>
                <p>Trained & insured team</p>
            </div>
            <div class="service-icon-item">
                <img src="/images/icons/recycle-mattress-icon-2.png" alt="Eco-Friendly" width="48" height="48" loading="lazy">
                <h4>Eco-Friendly Disposal</h4>
                <p>90% materials recycled</p>
            </div>
            <div class="service-icon-item">
                <img src="/images/icons/trusted-service-icon.png" alt="Same Day" width="48" height="48" loading="lazy">
                <h4>Same Day Service</h4>
                <p>Quick scheduling available</p>
            </div>
            <div class="service-icon-item">
                <img src="/images/icons/5-star-rating-icon.png" alt="Rated" width="48" height="48" loading="lazy">
                <h4>Top Rated Service</h4>
                <p>4.9/5 customer rating</p>
            </div>
        </div>
    </div>
</section>

<!-- Main Content -->
<section class="location-content">
    <div class="container">
        <div class="content-grid">
            <div class="main-content">
                <!-- About Service in City -->
                <h2>Professional Mattress Removal in ${cityData.city}, ${cityData.state}</h2>
                <p>${uniqueContent.serviceIntro}</p>
                <p>${uniqueContent.serviceDescription}</p>
                
                <!-- Service Areas -->
                <h3>${cityData.city} Service Areas & Neighborhoods</h3>
                <p>We provide mattress pickup services throughout the greater ${cityData.city} area, including:</p>
                <div class="neighborhoods-grid">
                    ${cityData.neighborhoods.map(neighborhood => `
                    <div class="neighborhood-item">
                        <strong>${neighborhood.name}</strong>
                        ${neighborhood.zipCodes ? `<span class="zip-codes">(${neighborhood.zipCodes.join(', ')})</span>` : ''}
                    </div>`).join('')}
                </div>
                
                <!-- Local Regulations -->
                <h3>${cityData.city} Mattress Disposal Regulations</h3>
                <p>${cityData.localRegulations}</p>
                <p>Our service ensures full compliance with all local and state regulations, providing you with disposal documentation for your records.</p>
                
                <!-- Environmental Impact -->
                <h3>Environmental Impact in ${cityData.city}</h3>
                <p>
                    Every mattress we collect in ${cityData.city} supports ${uniqueContent.environmentalPrograms}. Through our partnerships with local recycling facilities, 
                    we've diverted thousands of tons of mattress materials from ${cityData.city} area landfills. 
                    Materials recovered include steel springs, foam, cotton, and wood - all processed locally when possible to reduce transportation emissions.
                </p>
                
                <!-- Transparent Pricing Section -->
                <h2>Transparent Pricing in ${cityData.city}</h2>
                <p class="pricing-subtitle">No hidden fees. No surprises. 100% upfront pricing starting at $125.</p>
                
                <div class="transparent-pricing-grid">
                    <div class="transparent-pricing-card">
                        <h3 class="pricing-card-title">Single Mattress</h3>
                        <div class="pricing-card-price">$125</div>
                        <div class="pricing-card-subtitle">Any size mattress</div>
                        <ul class="pricing-card-features">
                            <li>✓ Curbside pickup</li>
                            <li>✓ Eco-friendly recycling</li>
                            <li>✓ No need to be home</li>
                        </ul>
                    </div>
                    
                    <div class="transparent-pricing-card pricing-featured">
                        <h3 class="pricing-card-title">Mattress + Box Spring</h3>
                        <div class="pricing-card-price">$155</div>
                        <div class="pricing-card-subtitle">Complete set removal</div>
                        <ul class="pricing-card-features">
                            <li>✓ Curbside pickup</li>
                            <li>✓ Eco-friendly recycling</li>
                            <li>✓ Box spring included</li>
                        </ul>
                    </div>
                    
                    <div class="transparent-pricing-card">
                        <h3 class="pricing-card-title">Full Bedroom Set</h3>
                        <div class="pricing-card-price">$180</div>
                        <div class="pricing-card-subtitle">Mattress, box spring & frame</div>
                        <ul class="pricing-card-features">
                            <li>✓ Curbside pickup</li>
                            <li>✓ Eco-friendly recycling</li>
                            <li>✓ Heavy item handling</li>
                        </ul>
                    </div>
                </div>
                
                <div class="pricing-cta">
                    <button class="btn btn-primary btn-lg zenbooker-inline-button" onclick="Zenbooker.showPopupWidget('https://widget.zenbooker.com/book/1607719749466x229623059118359230?embed=true');return false;">
                        Book Online Now →
                    </button>
                </div>
                
                <p class="pricing-bottom-note">
                    All prices include pickup, transportation, and eco-friendly disposal. Additional charges may apply for stairs ($10/flight) or long carry distances over 75 feet.
                </p>
                
                <!-- How It Works -->
                <h3>How Mattress Removal Works in ${cityData.city}</h3>
                <ol class="how-it-works-list">
                    <li>
                        <strong>Book Online or Call</strong>
                        <p>Schedule your ${cityData.city} pickup online in 60 seconds or call our team at (855) 555-1234.</p>
                    </li>
                    <li>
                        <strong>Choose Your Pickup Time</strong>
                        <p>Same-day and next-day slots available throughout ${cityData.city}. We'll confirm via text message.</p>
                    </li>
                    <li>
                        <strong>We Handle Everything</strong>
                        <p>Our licensed and insured team removes your mattress from anywhere on your property.</p>
                    </li>
                    <li>
                        <strong>Eco-Friendly Disposal</strong>
                        <p>Your mattress is taken to ${cityData.recyclingPartners[0]} for responsible recycling.</p>
                    </li>
                </ol>
            </div>
            
            <!-- Sidebar -->
            <aside class="sidebar">
                <!-- Quick Booking CTA -->
                <div class="sidebar-cta">
                    <h3>Ready to Book?</h3>
                    <p>Get your old mattress removed today!</p>
                    <button class="btn btn-primary btn-lg zenbooker-inline-button" onclick="Zenbooker.showPopupWidget('https://widget.zenbooker.com/book/1607719749466x229623059118359230?embed=true');return false;">
                        Book Pickup Now
                    </button>
                    <p class="cta-phone">Or call: <a href="tel:8555551234">(855) 555-1234</a></p>
                </div>
                
                <!-- Local Stats -->
                <div class="sidebar-stats">
                    <h4>${cityData.city} Service Stats</h4>
                    <ul>
                        <li><strong>${Math.floor(Math.random() * 5000) + 1000}+</strong> Mattresses Removed</li>
                        <li><strong>${cityData.neighborhoods.length}</strong> Neighborhoods Served</li>
                        <li><strong>4.9/5</strong> Average Rating</li>
                        <li><strong>24hr</strong> Response Time</li>
                    </ul>
                </div>
                
                <!-- Service Area ZIP Codes -->
                <div class="sidebar-zip-codes">
                    <h4>ZIP Codes We Serve</h4>
                    <div class="zip-codes-list">
                        ${cityData.zipCodes.slice(0, 12).map(zip => `<span class="zip-code">${zip}</span>`).join('')}
                        ${cityData.zipCodes.length > 12 ? '<span class="zip-more">+more</span>' : ''}
                    </div>
                </div>
            </aside>
        </div>
    </div>
</section>

<!-- Customer Reviews -->
<section class="reviews-section">
    <div class="container">
        <h2>What ${cityData.city} Customers Are Saying</h2>
        <div class="reviews-grid">
            ${localReviews.map(review => `
            <div class="review-card">
                <div class="review-stars">★★★★★</div>
                <p class="review-text">"${review.text}"</p>
                <div class="review-author">
                    <strong>${review.author}</strong>
                    <span>${review.neighborhood}, ${cityData.city}</span>
                </div>
            </div>`).join('')}
        </div>
    </div>
</section>

<!-- FAQ Section -->
<section class="faq-section">
    <div class="container">
        <h2>Frequently Asked Questions - ${cityData.city} Mattress Removal</h2>
        <div class="faq-accordion">
            ${localFAQs.map((faq, index) => `
            <div class="faq-item">
                <button class="faq-question" onclick="toggleFaq(this)">
                    ${faq.question}
                    <span class="faq-toggle">+</span>
                </button>
                <div class="faq-answer">
                    <p>${faq.answer}</p>
                </div>
            </div>`).join('')}
        </div>
        
        <script>
        function toggleFaq(button) {
            const faqItem = button.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const toggle = button.querySelector('.faq-toggle');
            
            faqItem.classList.toggle('active');
            
            if (faqItem.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
                toggle.textContent = '−';
            } else {
                answer.style.maxHeight = '0';
                toggle.textContent = '+';
            }
        }
        </script>
    </div>
</section>

${cityData.nearbyCities && cityData.nearbyCities.length > 0 ? `
<!-- Nearby Cities -->
<section class="nearby-cities">
    <div class="container">
        <h2>Also Serving Nearby Cities</h2>
        <div class="nearby-cities-grid">
            ${cityData.nearbyCities.map(nearbyCity => `
            <a href="/mattress-removal/${stateSlug}/${nearbyCity.slug}/" class="nearby-city-link">
                <strong>${nearbyCity.name}</strong>
                <span>${nearbyCity.distance} miles from ${cityData.city}</span>
            </a>`).join('')}
        </div>
    </div>
</section>` : ''}

<!-- Final CTA -->
<section class="final-cta">
    <div class="container">
        <div class="cta-content">
            <h2>Ready to Get Rid of Your Old Mattress in ${cityData.city}?</h2>
            <p>Professional removal service starting at $125 with same-day availability. Eco-friendly disposal guaranteed.</p>
            <div class="cta-actions">
                <button class="btn btn-primary btn-lg zenbooker-inline-button" onclick="Zenbooker.showPopupWidget('https://widget.zenbooker.com/book/1607719749466x229623059118359230?embed=true');return false;">
                    Schedule Pickup Now
                </button>
                <a href="tel:8555551234" class="btn btn-secondary btn-lg">
                    Call (855) 555-1234
                </a>
            </div>
        </div>
    </div>
</section>

<style>
/* Location-specific styles */
.hero-location {
    background: linear-gradient(135deg, var(--primary-green) 0%, var(--primary-green-dark) 100%);
    color: var(--white);
    padding: 100px 0;
    position: relative;
}

.hero-location-content {
    max-width: 800px;
}

.hero-location-title {
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 16px;
    color: var(--white);
}

.hero-location-subtitle {
    font-size: 1.125rem;
    margin-bottom: 20px;
    color: rgba(255, 255, 255, 0.95);
    font-weight: 600;
}

.hero-location-description {
    font-size: 1rem;
    margin-bottom: 32px;
    color: rgba(255, 255, 255, 0.9);
    line-height: 1.7;
}

.hero-primary-cta {
    margin-bottom: 32px;
}

.hero-pricing-info {
    display: flex;
    gap: 8px;
    margin-top: 16px;
    color: rgba(255, 255, 255, 0.9);
    font-size: 15px;
}

.pricing-text {
    font-weight: 600;
}

.hero-location-features {
    display: flex;
    gap: 24px;
    margin-bottom: 24px;
    flex-wrap: wrap;
}

.hero-location-feature {
    display: flex;
    align-items: center;
    gap: 8px;
    color: rgba(255, 255, 255, 0.95);
    font-size: 14px;
    font-weight: 500;
}

.hero-bottom-trust {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.hero-location-trust {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.hero-guarantees {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
    font-size: 14px;
}

.service-icons-bar {
    background: var(--gray-50);
    padding: 60px 0;
}

.service-icons-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 32px;
}

.service-icon-item {
    text-align: center;
    padding: 24px;
    background: var(--white);
    border-radius: var(--border-radius);
    border: 1px solid var(--gray-200);
}

.location-content {
    padding: 80px 0;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 60px;
}

.neighborhoods-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin: 24px 0;
}

.neighborhood-item {
    padding: 16px;
    background: var(--gray-50);
    border-radius: var(--border-radius);
    border: 1px solid var(--gray-200);
}

.zip-codes {
    display: block;
    color: var(--gray-600);
    font-size: 13px;
    margin-top: 4px;
}

.transparent-pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
    margin: 32px 0;
}

.transparent-pricing-card {
    background: var(--white);
    border: 2px solid var(--gray-200);
    border-radius: var(--border-radius-lg);
    padding: 24px;
    text-align: center;
    transition: var(--transition);
}

.transparent-pricing-card:hover {
    border-color: var(--primary-green);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

.pricing-card-title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 12px;
}

.pricing-card-price {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--primary-green);
    margin-bottom: 8px;
}

.pricing-card-subtitle {
    color: var(--gray-600);
    margin-bottom: 20px;
}

.pricing-card-features {
    list-style: none;
    padding: 0;
}

.pricing-card-features li {
    padding: 6px 0;
    color: var(--gray-700);
    font-size: 14px;
    border-bottom: 1px solid var(--gray-100);
}

.how-it-works-list {
    margin: 24px 0;
    padding-left: 0;
    list-style: none;
}

.how-it-works-list li {
    margin: 20px 0;
    padding: 20px;
    background: var(--gray-50);
    border-radius: var(--border-radius);
    border-left: 4px solid var(--primary-green);
}

.sidebar {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.sidebar-cta {
    background: var(--primary-green);
    color: var(--white);
    padding: 32px;
    border-radius: var(--border-radius-lg);
    text-align: center;
}

.sidebar-stats {
    background: var(--gray-50);
    padding: 24px;
    border-radius: var(--border-radius);
    border: 1px solid var(--gray-200);
}

.sidebar-stats ul {
    list-style: none;
    padding: 0;
    margin: 16px 0 0 0;
}

.sidebar-stats li {
    padding: 8px 0;
    border-bottom: 1px solid var(--gray-200);
    display: flex;
    justify-content: space-between;
}

.sidebar-zip-codes {
    background: var(--gray-50);
    padding: 24px;
    border-radius: var(--border-radius);
    border: 1px solid var(--gray-200);
}

.zip-codes-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
}

.zip-code {
    background: var(--white);
    border: 1px solid var(--gray-300);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
}

.zip-more {
    color: var(--gray-500);
    font-size: 12px;
    padding: 4px 8px;
}

.reviews-section {
    background: var(--gray-50);
    padding: 80px 0;
}

.reviews-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 32px;
    margin-top: 48px;
}

.review-card {
    background: var(--white);
    padding: 32px;
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--gray-200);
    box-shadow: var(--shadow-sm);
}

.review-stars {
    color: #ffb400;
    font-size: 18px;
    margin-bottom: 16px;
}

.review-author {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--gray-200);
}

.review-author span {
    display: block;
    color: var(--gray-600);
    font-size: 14px;
    margin-top: 4px;
}

.faq-section {
    padding: 80px 0;
}

.faq-accordion {
    margin-top: 48px;
}

.faq-item {
    border-bottom: 1px solid var(--gray-200);
}

.faq-question {
    width: 100%;
    padding: 24px 0;
    background: none;
    border: none;
    text-align: left;
    font-size: 1.125rem;
    font-weight: 600;
    color: var(--gray-900);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.faq-answer {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.faq-answer p {
    padding: 0 0 24px 0;
    color: var(--gray-700);
    line-height: 1.6;
}

.nearby-cities {
    background: var(--gray-50);
    padding: 80px 0;
}

.nearby-cities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-top: 32px;
}

.nearby-city-link {
    display: flex;
    flex-direction: column;
    padding: 16px;
    background: var(--white);
    border: 1px solid var(--gray-200);
    border-radius: var(--border-radius);
    text-decoration: none;
    transition: var(--transition);
}

.nearby-city-link:hover {
    border-color: var(--primary-green);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
}

.nearby-city-link strong {
    color: var(--gray-900);
    margin-bottom: 4px;
}

.nearby-city-link span {
    color: var(--gray-600);
    font-size: 14px;
}

.final-cta {
    background: var(--primary-green);
    color: var(--white);
    padding: 80px 0;
}

.cta-content {
    text-align: center;
}

.cta-content h2 {
    color: var(--white);
    margin-bottom: 16px;
}

.cta-content p {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.125rem;
    margin-bottom: 32px;
}

.cta-actions {
    display: flex;
    gap: 16px;
    justify-content: center;
    flex-wrap: wrap;
}

@media (max-width: 1024px) {
    .content-grid {
        grid-template-columns: 1fr;
        gap: 40px;
    }
}

@media (max-width: 768px) {
    .hero-location-title {
        font-size: 2rem;
    }
    
    .hero-location-features {
        flex-direction: column;
        gap: 16px;
    }
    
    .transparent-pricing-grid {
        grid-template-columns: 1fr;
    }
    
    .cta-actions {
        flex-direction: column;
        align-items: center;
    }
}
</style>`;

  return cityPageContent;
}

// Main generation function
function generateAllPages() {
  console.log('Starting location page generation...');
  
  const baseDir = path.join(__dirname, '../src');
  const mattressRemovalDir = path.join(baseDir, 'mattress-removal');
  
  // Create directories
  if (!fs.existsSync(mattressRemovalDir)) {
    fs.mkdirSync(mattressRemovalDir, { recursive: true });
  }

  let pagesGenerated = 0;

  // Generate state pages first
  for (const [stateSlug, stateData] of Object.entries(locationsData.states)) {
    const stateDir = path.join(mattressRemovalDir, stateSlug);
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    
    const statePageContent = createStatePage(stateSlug, stateData);
    fs.writeFileSync(path.join(stateDir, 'index.md'), statePageContent);
    pagesGenerated++;
    console.log(`Generated state page: ${stateSlug}`);
  }

  // Generate city pages
  for (const [citySlug, cityData] of Object.entries(locationsData.cities)) {
    const stateSlug = cityData.stateSlug;
    const stateDir = path.join(mattressRemovalDir, stateSlug);
    
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }
    
    const cityPageContent = createCityPage(citySlug, cityData, stateSlug);
    fs.writeFileSync(path.join(stateDir, `${citySlug}.md`), cityPageContent);
    pagesGenerated++;
    console.log(`Generated city page: ${stateSlug}/${citySlug}`);
  }

  console.log(`\nGeneration complete! Created ${pagesGenerated} pages:`);
  console.log(`- ${Object.keys(locationsData.states).length} state pages`);
  console.log(`- ${Object.keys(locationsData.cities).length} city pages`);
  console.log(`\nTotal unique location pages: ${pagesGenerated}`);
  
  return pagesGenerated;
}

// Run the generator
if (require.main === module) {
  try {
    generateAllPages();
  } catch (error) {
    console.error('Error generating pages:', error);
    process.exit(1);
  }
}

module.exports = { generateAllPages };