const fs = require('fs-extra');
const path = require('path');

class CityGenerator {
  constructor(logger) {
    this.logger = logger;
    this.config = {
      workingDirectory: '/Users/timothysumerfield/Desktop/Working.../bedder-world-base'
    };
  }

  async generateCityFile(city) {
    this.logger.info(`   🏗️  Generating ${city.name} file directly...`);
    
    const stateSlug = this.slugify(city.state);
    const citySlug = this.slugify(city.name);
    const filePath = path.join(
      this.config.workingDirectory, 
      'src', 
      'mattress-removal', 
      stateSlug, 
      `${citySlug}.md`
    );

    // Ensure directory exists
    await fs.ensureDir(path.dirname(filePath));
    
    // Generate city content
    const content = this.generateCityContent(city);
    
    // Write file
    await fs.writeFile(filePath, content);
    
    this.logger.info(`   ✅ Generated ${city.name} file at ${filePath}`);
    return filePath;
  }

  generateCityContent(city) {
    const stateSlug = this.slugify(city.state);
    const citySlug = this.slugify(city.name);
    
    // Determine if city is a suburb and generate proper structure
    const suburbInfo = this.determineSuburbStatus(city);
    const neighborhoods = this.generateNeighborhoods(city);
    const zipCodes = this.extractZipCodes(neighborhoods);
    const reviews = this.generateReviews(city, neighborhoods);
    const faqs = this.generateFAQs(city);
    const extendedContent = this.generateExtendedContent(city, suburbInfo);
    
    return `---
layout: location.njk
title: ${city.name} Mattress Removal & Disposal Service - Starting at $125
description: Professional mattress removal in ${city.name}, ${city.state}. Next-day pickup starting at $125. Licensed, insured, and eco-friendly. Serving neighborhoods across ${city.name}.
permalink: ${suburbInfo.permalink}
city: ${city.name}
state: ${city.state}
stateSlug: ${stateSlug}
tier: 2${suburbInfo.parentMetro ? `\nparentMetro: ${suburbInfo.parentMetro}` : ''}
coordinates:
  lat: ${this.generateCoordinates(city).lat}
  lng: ${this.generateCoordinates(city).lng}
pricing:
  startingPrice: 125
  single: 125
  queen: 125
  king: 135
  boxSpring: 30
pageContent:
  heroDescription: "#1 rated mattress removal service in ${city.name}, ${city.state}. Professional pickup starting at $125. We handle everything from apartments to homes. Serving neighborhoods throughout ${city.name} with full city regulation compliance."
  aboutService: "${extendedContent.aboutService}"
  serviceAreasIntro: "We provide comprehensive mattress pickup services throughout the greater ${city.name} area, covering all major neighborhoods:"
  regulationsCompliance: "${extendedContent.regulationsCompliance}"
  environmentalImpact: "${extendedContent.environmentalImpact}"
  howItWorksScheduling: "Next-day slots available throughout ${city.name}. We'll confirm via text message and coordinate building access."
  howItWorksService: "${extendedContent.howItWorksService}"
  howItWorksDisposal: "${extendedContent.howItWorksDisposal}"
  sidebarStats:
    mattressesRemoved: "1,247"
neighborhoods: ${JSON.stringify(neighborhoods, null, 2)}
zipCodes: ${JSON.stringify(zipCodes, null, 2)}
nearbyCities: [
  {
    "name": "Los Angeles",
    "url": "/mattress-removal/california/los-angeles/",
    "isSuburb": false
  },
  {
    "name": "San Diego", 
    "url": "/mattress-removal/california/san-diego/",
    "isSuburb": false
  }
]
reviews:
  count: ${Math.floor(Math.random() * 200) + 50}
  featured: ${JSON.stringify(reviews, null, 2)}
faqs: ${JSON.stringify(faqs, null, 2)}
---`;
  }

  generateNeighborhoods(city) {
    // Basic neighborhood generation - can be enhanced with real data
    const baseNeighborhoods = [
      'Downtown', 'North ' + city.name, 'South ' + city.name, 
      'East ' + city.name, 'West ' + city.name, 'Old Town'
    ];
    
    return baseNeighborhoods.slice(0, 4).map((name, index) => ({
      name: name,
      zipCodes: [this.generateZipCode(city, index)]
    }));
  }

  generateZipCode(city, index) {
    // Generate realistic ZIP codes based on city name hash
    const hash = city.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const base = Math.abs(hash % 40000) + 10000;
    return (base + index).toString();
  }

  extractZipCodes(neighborhoods) {
    return neighborhoods.flatMap(n => n.zipCodes);
  }

  generateReviews(city, neighborhoods) {
    const sampleReviews = [
      {
        text: `Great service in ${city.name}! The team was professional and handled our mattress removal perfectly. Arrived on time and pricing was exactly as quoted. Highly recommend for anyone in the area.`,
        author: "Sarah M.",
        neighborhood: neighborhoods[0]?.name || "Downtown"
      },
      {
        text: `Needed next-day mattress pickup in ${city.name} and they delivered. Professional team, fair pricing, and eco-friendly disposal. Much easier than trying to haul it ourselves.`,
        author: "Mike R.",
        neighborhood: neighborhoods[1]?.name || city.name
      },
      {
        text: `Excellent mattress removal service in ${city.name}. Team was courteous, efficient, and handled our old king mattress with care. Great to know it's being recycled properly.`,
        author: "Jennifer L.",
        neighborhood: neighborhoods[2]?.name || city.name
      }
    ];
    
    return sampleReviews;
  }

  generateFAQs(city) {
    return [
      {
        question: `Do you provide mattress removal service in all ${city.name} neighborhoods?`,
        answer: `Yes, we serve all neighborhoods throughout ${city.name} and surrounding areas. We're familiar with the unique access requirements of different building types across the city.`
      },
      {
        question: `How much does mattress removal cost in ${city.name}?`,
        answer: `Our ${city.name} mattress removal starts at $125 for a single mattress. Queen mattresses are $125, king mattresses are $135, and box springs add $30. We provide upfront pricing with no hidden fees. Call 720-263-6094 for a quote.`
      },
      {
        question: `Can you remove mattresses from ${city.name} apartments and condos?`,
        answer: `Absolutely! We regularly service apartments and condos throughout ${city.name}. Our team is experienced with narrow hallways, elevators, and parking restrictions common in residential buildings.`
      },
      {
        question: `Do you recycle mattresses removed in ${city.name}?`,
        answer: `Yes, we partner with certified recycling facilities to ensure 80% of mattress materials are recycled rather than sent to landfills. This includes steel springs, foam, cotton, and wood components.`
      },
      {
        question: `How quickly can you pick up my mattress in ${city.name}?`,
        answer: `We offer next-day mattress pickup throughout ${city.name}. Book online or call 720-263-6094 to schedule. We'll confirm your appointment via text and provide arrival time updates.`
      }
    ];
  }

  generateCoordinates(city) {
    // Generate realistic coordinates based on city name
    // This is a simplified version - real implementation would use geocoding
    const hash = city.name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // California approximate bounds
    const lat = 32 + (Math.abs(hash) % 1000) / 100; // 32-42 range
    const lng = -125 + (Math.abs(hash >> 4) % 1000) / 100; // -125 to -115 range
    
    return {
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000
    };
  }

  determineSuburbStatus(city) {
    // Define major metro areas and their suburbs
    const suburbMap = {
      'California': {
        'Los Angeles': ['Anaheim', 'Costa Mesa', 'Downey', 'El Monte', 'Fullerton', 'Garden Grove', 'Glendale', 'Huntington Beach', 'Inglewood', 'Irvine', 'Lancaster', 'Long Beach', 'Orange', 'Palmdale', 'Pasadena', 'Pomona', 'Santa Ana', 'Santa Clarita', 'Simi Valley', 'Thousand Oaks', 'Torrance'],
        'San Diego': ['Alpine', 'Bonita', 'Cardiff', 'Carlsbad', 'Chula Vista', 'Del Mar', 'El Cajon', 'Escondido', 'Imperial Beach', 'Jamul', 'La Jolla', 'La Mesa', 'Lemon Grove', 'National City', 'Oceanside', 'Poway', 'Ramona', 'San Marcos', 'Santee', 'Vista'],
        'San Francisco': ['Berkeley', 'Concord', 'Daly City', 'Fremont', 'Hayward', 'Mountain View', 'Oakland', 'San Jose', 'San Mateo', 'Santa Clara', 'Sunnyvale', 'Vallejo']
      }
    };

    const state = city.state;
    const cityName = city.name;
    
    if (suburbMap[state]) {
      for (const [metro, suburbs] of Object.entries(suburbMap[state])) {
        if (suburbs.includes(cityName)) {
          return {
            isSuburb: true,
            parentMetro: metro,
            permalink: `/mattress-removal/${this.slugify(state)}/${this.slugify(metro)}/${this.slugify(cityName)}/`
          };
        }
      }
    }
    
    // Not a suburb - standalone city
    return {
      isSuburb: false,
      parentMetro: null,
      permalink: `/mattress-removal/${this.slugify(state)}/${this.slugify(cityName)}/`
    };
  }

  generateExtendedContent(city, suburbInfo) {
    let aboutService, regulationsCompliance, environmentalImpact, howItWorksService, howItWorksDisposal;
    
    if (suburbInfo.isSuburb) {
      aboutService = `${city.name}'s premier mattress removal and recycling service, serving this vibrant ${suburbInfo.parentMetro} area community with over 8 years of professional experience. Located within the greater ${suburbInfo.parentMetro} metropolitan area, ${city.name} presents unique challenges and opportunities for mattress removal services. Our experienced team understands the local geography, building codes, zoning regulations, and homeowner association requirements that make ${city.name} distinct from other ${suburbInfo.parentMetro} communities. We provide expert mattress pickup throughout all ${city.name} neighborhoods, ensuring 80% of materials are recycled responsibly while maintaining full compliance with both ${city.name} municipal regulations and ${suburbInfo.parentMetro} metropolitan area environmental standards. Our ${city.name} service area includes navigating local traffic patterns, residential access requirements, and seasonal considerations that our team handles with expertise developed through years of serving this unique ${suburbInfo.parentMetro} area community. We work closely with local ${city.name} waste management facilities and coordinate with ${suburbInfo.parentMetro} area recycling programs to ensure your old mattress is disposed of in the most environmentally responsible manner possible. Whether you're in a ${city.name} apartment complex, single-family home, or condominium, our team understands the specific access challenges and logistics requirements that make ${city.name} mattress removal services unique within the ${suburbInfo.parentMetro} metropolitan region.`;
      
      regulationsCompliance = `Our ${city.name} mattress removal service ensures full compliance with all local, county, and state regulations. As part of the ${suburbInfo.parentMetro} metropolitan area, we navigate complex multi-jurisdictional requirements that include ${city.name} municipal codes, ${suburbInfo.parentMetro} county regulations, and California state environmental standards. We provide complete disposal documentation for your records, handle all required preparation steps including proper wrapping and labeling, and coordinate with local authorities when necessary. Our team stays current with evolving regulations in the ${suburbInfo.parentMetro} area, ensuring your mattress disposal meets all legal requirements and environmental standards.`;
      
      environmentalImpact = `Every mattress we collect in ${city.name} supports environmental sustainability and waste reduction throughout the ${suburbInfo.parentMetro} metropolitan area. Through our partnerships with certified recycling facilities serving the greater ${suburbInfo.parentMetro} region, we've diverted thousands of mattresses from California landfills. Materials recovered include steel springs, foam, cotton, and wood components - all processed locally when possible to reduce transportation emissions and support ${city.name}'s commitment to environmental responsibility. Our ${city.name} operations contribute to the broader ${suburbInfo.parentMetro} area sustainability goals, helping reduce landfill burden while recovering valuable materials for reuse in manufacturing.`;
      
      howItWorksService = `Our licensed and insured team removes your mattress from anywhere on your ${city.name} property, handles all city-required wrapping and preparation, and navigates the unique building challenges common in ${suburbInfo.parentMetro} area communities. We understand ${city.name}'s specific requirements including HOA regulations, building access protocols, and local traffic patterns that affect service delivery.`;
      
      howItWorksDisposal = `Your ${city.name} mattress is transported to certified recycling facilities serving the ${suburbInfo.parentMetro} metropolitan area for responsible material recovery. We coordinate with regional processing centers to ensure maximum material recovery while meeting all ${city.name} and ${suburbInfo.parentMetro} area environmental compliance requirements.`;
    } else {
      aboutService = `${city.name}'s premier mattress removal and recycling service, serving this major ${city.state} metropolitan area with over 10 years of professional experience. As a significant urban center in ${city.state}, ${city.name} presents diverse challenges for mattress removal services, from high-rise downtown apartments to suburban neighborhoods and everything in between. Our experienced team understands the complex urban logistics, varied building types, municipal regulations, and environmental requirements that make ${city.name} a unique service area. We provide expert mattress pickup throughout the greater ${city.name} metropolitan area, ensuring 80% of materials are recycled responsibly while maintaining full compliance with ${city.name} city regulations and ${city.state} state environmental standards. Our ${city.name} operations include navigating dense urban traffic, coordinating with building management companies, handling diverse residential and commercial properties, and working within the city's comprehensive waste management framework. We partner with local ${city.name} recycling facilities and coordinate with regional ${city.state} environmental programs to ensure your old mattress contributes to the city's sustainability goals while meeting all regulatory requirements for responsible disposal.`;
      
      regulationsCompliance = `Our ${city.name} mattress removal service ensures full compliance with all local and state regulations. We provide complete disposal documentation for your records, handle all required preparation steps, and maintain current licensing for waste removal services in ${city.name}. Our team stays updated with evolving ${city.state} environmental regulations and ${city.name} municipal codes to ensure every aspect of your mattress disposal meets legal requirements.`;
      
      environmentalImpact = `Every mattress we collect in ${city.name} supports the city's commitment to environmental sustainability and waste reduction. Through our partnerships with local recycling facilities and regional ${city.state} environmental programs, we've diverted thousands of mattresses from landfills. Materials recovered include steel springs, foam, cotton, and wood - all processed responsibly to support ${city.name}'s green city initiatives and contribute to broader ${city.state} sustainability goals.`;
      
      howItWorksService = `Our licensed and insured team removes your mattress from anywhere on your ${city.name} property, handles all city-required wrapping and preparation, and navigates the unique urban challenges of ${city.name} including traffic, parking restrictions, and diverse building types from high-rises to single-family homes.`;
      
      howItWorksDisposal = `Your ${city.name} mattress is processed through certified recycling facilities for responsible material recovery, with full documentation provided to meet ${city.name} regulatory requirements and support the city's environmental compliance standards.`;
    }

    return {
      aboutService,
      regulationsCompliance,
      environmentalImpact,
      howItWorksService,
      howItWorksDisposal
    };
  }

  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

module.exports = CityGenerator;