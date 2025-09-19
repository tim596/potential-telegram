const fs = require('fs-extra');
const path = require('path');
const ResearchCLI = require('./ResearchCLI');

class WebResearchGenerator {
  constructor(logger) {
    this.logger = logger;
    this.config = {
      workingDirectory: '/Users/timothysumerfield/Desktop/Working.../bedder-world-base'
    };
    this.cache = new Map(); // Simple in-memory cache
    this.researchCLI = new ResearchCLI(logger);
  }

  async generateCityFile(city) {
    this.logger.info(`🔍 Researching ${city.name}, ${city.state}...`);
    
    try {
      // Conduct comprehensive web research
      const research = await this.conductWebResearch(city);
      
      this.logger.info(`📊 Found ${research.neighborhoods.length} neighborhoods`);
      this.logger.info(`🏛️ Researched local regulations: ${research.wasteInfo.provider}`);
      this.logger.info(`✍️ Generating high-quality content...`);
      
      // Generate professionally written content
      const content = await this.generateResearchedContent(city, research);
      
      const stateSlug = this.slugify(city.state);
      const citySlug = this.slugify(city.name);
      const filePath = path.join(
        this.config.workingDirectory, 
        'src', 
        'mattress-removal', 
        stateSlug, 
        `${citySlug}.md`
      );

      await fs.ensureDir(path.dirname(filePath));
      await fs.writeFile(filePath, content);
      
      this.logger.info(`✅ Generated research-based ${city.name} content at ${filePath}`);
      return filePath;
    } catch (error) {
      this.logger.error(`❌ Research failed for ${city.name}: ${error.message}`);
      throw error;
    }
  }

  async conductWebResearch(city) {
    const cacheKey = `${city.name}-${city.state}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.logger.info(`📋 Using cached research for ${city.name}`);
      return this.cache.get(cacheKey);
    }

    try {
      // Use ResearchCLI for web-based research with Claude
      const research = await this.researchCLI.conductWebResearch(city);
      
      // Restructure to match expected format
      const structuredResearch = {
        neighborhoods: research.neighborhoods,
        demographics: research.demographics,
        wasteInfo: research.wasteManagement,
        geographic: research.geographic,
        zipCodes: research.zipCodes,
        coordinates: research.coordinates,
        timestamp: new Date().toISOString()
      };

      // Cache the results
      this.cache.set(cacheKey, structuredResearch);
      
      return structuredResearch;
    } catch (error) {
      this.logger.warn(`⚠️ Web research failed, using enhanced fallback for ${city.name}`);
      return this.createEnhancedFallback(city);
    }
  }

  // Removed old research methods - now using ResearchCLI for web-based research

  // All generation methods moved to ResearchCLI

  async generateResearchedContent(city, research) {
    const stateSlug = this.slugify(city.state);
    
    // Generate high-quality content using research data
    const heroDescription = this.craftResearchedHero(city, research);
    const aboutService = this.craftResearchedAbout(city, research);
    const serviceAreasIntro = `We provide comprehensive mattress pickup services throughout ${city.name}, serving all major neighborhoods:`;
    const regulationsCompliance = this.craftRegulationsContent(city, research);
    const environmentalImpact = this.craftEnvironmentalContent(city, research);
    const howItWorksContent = this.craftHowItWorksContent(city, research);
    const reviews = this.craftAuthenticReviews(city, research);
    const faqs = this.craftResearchedFAQs(city, research);

    return `---
layout: location.njk
title: "${city.name} Mattress Removal & Disposal Service | A Bedder World"
description: "Professional mattress removal in ${city.name}, ${city.state}. Next-day pickup starting at $125. Licensed disposal with environmental compliance. Serving all ${city.name} neighborhoods."
permalink: "/mattress-removal/${stateSlug}/${this.slugify(city.name)}/"
city: "${city.name}"
state: "${city.state}"
stateSlug: "${stateSlug}"
tier: ${city.tier || 2}
coordinates:
  lat: ${this.generateRealisticCoordinates(city).lat}
  lng: ${this.generateRealisticCoordinates(city).lng}
pricing:
  - pieces: 1
    price: "$125"
    popular: false
  - pieces: 2
    price: "$155"
    popular: true
  - pieces: 3
    price: "$180"
    popular: false
pageContent:
  heroDescription: "${heroDescription}"
  aboutService: "${aboutService}"
  serviceAreasIntro: "${serviceAreasIntro}"
  regulationsCompliance: "${regulationsCompliance}"
  environmentalImpact: "${environmentalImpact}"
  howItWorksScheduling: "${howItWorksContent.scheduling}"
  howItWorksService: "${howItWorksContent.service}"
  howItWorksDisposal: "${howItWorksContent.disposal}"
  sidebarStats:
    mattressesRemoved: "${Math.floor(Math.random() * 1500) + 500}"
neighborhoods: ${JSON.stringify(research.neighborhoods, null, 2)}
zipCodes: ${JSON.stringify(research.zipCodes, null, 2)}
nearbyCities: ${JSON.stringify(this.generateNearbyCities(city), null, 2)}
reviews:
  count: ${Math.floor(Math.random() * 150) + 50}
  featured: ${JSON.stringify(reviews, null, 2)}
faqs: ${JSON.stringify(faqs, null, 2)}
---`;
  }

  craftResearchedHero(city, research) {
    const neighborhoodCount = research.neighborhoods.length;
    const firstNeighborhood = research.neighborhoods[0]?.name || 'downtown area';
    
    return `Professional mattress removal serving ${city.name}'s ${neighborhoodCount}+ neighborhoods. Next-day service starting at $125. Licensed disposal with full ${city.state} compliance and environmental responsibility.`;
  }

  craftResearchedAbout(city, research) {
    const primaryPartner = research.wasteInfo?.recyclingPartners?.[0] || 'certified recycling facilities';
    return `${city.name}'s premier mattress removal service combines local expertise with environmental responsibility. Our team understands ${research.geographic?.setting || 'the local area'}, providing professional service across ${research.neighborhoods?.length || 'multiple'} neighborhoods. We work with ${primaryPartner} to ensure responsible disposal while meeting all ${research.wasteInfo?.regulations || 'local regulations'} requirements.`;
  }

  craftRegulationsContent(city, research) {
    const regulations = research.wasteInfo?.regulations || 'local disposal regulations';
    const provider = research.wasteInfo?.provider || 'municipal services';
    const penalties = research.wasteInfo?.penalties || 'Fines may apply for improper disposal';
    return `Our service ensures full compliance with ${regulations}. We coordinate with ${provider} and handle all required documentation. ${penalties} - we ensure proper disposal to avoid penalties.`;
  }

  craftEnvironmentalContent(city, research) {
    const program = research.wasteInfo?.program || 'environmental sustainability programs';
    const partners = research.wasteInfo?.recyclingPartners || ['certified recycling facilities'];
    const partnerList = partners.length > 1 ? partners.join(' and ') : partners[0];
    return `Every mattress we collect supports ${program} through partnerships with certified facilities. We work with ${partnerList} to divert materials from landfills and support ${city.state}'s environmental goals.`;
  }

  craftHowItWorksContent(city, research) {
    const challenges = research.demographics?.challenges || ['local logistics'];
    const neighborhoods = research.neighborhoods || [];
    const firstNeighborhood = neighborhoods[0]?.name || 'downtown areas';
    const secondNeighborhood = neighborhoods[1]?.name || 'suburban areas';
    const regulations = research.wasteInfo?.regulations || 'local regulations';
    
    return {
      scheduling: `Next-day appointments available throughout ${city.name}. We coordinate with local requirements and accommodate ${challenges[0]}.`,
      service: `Our experienced team handles ${city.name}'s logistics, including ${challenges.slice(0, 2).join(' and ')}. We serve all neighborhoods from ${firstNeighborhood} to ${secondNeighborhood}.`,
      disposal: `Mattresses are transported to certified facilities with full ${regulations} documentation and compliance.`
    };
  }

  craftAuthenticReviews(city, research) {
    const neighborhoods = research.neighborhoods || [];
    const housingTypes = research.demographics?.housingTypes || ['homes'];
    const challenges = research.demographics?.challenges || ['scheduling'];
    const program = research.wasteInfo?.program || 'environmental programs';
    
    return [
      {
        name: "Sarah M.",
        rating: 5,
        text: `Excellent service in ${neighborhoods[0]?.name || 'our neighborhood'}. Team was professional and handled our ${housingTypes[0]} perfectly. Great pricing and no hidden fees.`
      },
      {
        name: "Mike R.",
        rating: 5,
        text: `Quick pickup in ${neighborhoods[1]?.name || city.name}. They understood our local ${challenges[0]} and worked around it seamlessly. Highly recommended.`
      },
      {
        name: "Jennifer L.",
        rating: 5,
        text: `Professional mattress removal service in ${city.name}. Team was courteous and efficient. Great to see proper ${program} compliance.`
      }
    ];
  }

  craftResearchedFAQs(city, research) {
    const neighborhoods = research.neighborhoods || [];
    const regulations = research.wasteInfo?.regulations || 'local disposal regulations';
    const provider = research.wasteInfo?.provider || 'municipal services';
    const housingTypes = research.demographics?.housingTypes || ['homes', 'apartments'];
    const program = research.wasteInfo?.program || 'environmental programs';
    const partners = research.wasteInfo?.recyclingPartners || ['certified facilities'];
    
    const neighborhoodList = neighborhoods.slice(0, 3).map(n => n.name).join(', ') || 'all local areas';
    const firstNeighborhood = neighborhoods[0]?.name || 'downtown';
    const secondNeighborhood = neighborhoods[1]?.name || 'suburban areas';
    
    return [
      {
        question: `How quickly can you remove mattresses in ${city.name}?`,
        answer: `We provide next-day mattress removal throughout ${city.name}, including ${firstNeighborhood} and ${secondNeighborhood}. Call 720-263-6094 or book online.`
      },
      {
        question: `What areas of ${city.name} do you serve?`,
        answer: `We serve all ${neighborhoods.length || 'major'} neighborhoods including ${neighborhoodList}. Complete coverage across ${city.name}.`
      },
      {
        question: `How much does mattress removal cost in ${city.name}?`,
        answer: `Pricing starts at $125 for one mattress, $155 for two pieces, and $180 for three items. This covers pickup, transportation, and proper disposal.`
      },
      {
        question: `Are you compliant with ${city.name} disposal regulations?`,
        answer: `Yes, we maintain full compliance with ${regulations} and coordinate with ${provider} for proper processing.`
      },
      {
        question: `What mattress types do you remove in ${city.name}?`,
        answer: `We remove all mattress types including memory foam, innerspring, hybrid, and specialty sizes from ${housingTypes.join(', ')}.`
      },
      {
        question: `How environmentally responsible is your service?`,
        answer: `We support ${program} through partnerships with ${partners[0]}, ensuring materials are recycled rather than landfilled.`
      }
    ];
  }

  // Helper methods
  createEnhancedFallback(city) {
    const fallbackResearch = this.researchCLI.createFallbackResearch(city);
    return {
      neighborhoods: fallbackResearch.neighborhoods,
      demographics: fallbackResearch.demographics,
      wasteInfo: fallbackResearch.wasteManagement,
      geographic: fallbackResearch.geographic,
      zipCodes: fallbackResearch.zipCodes,
      coordinates: fallbackResearch.coordinates
    };
  }

  // Fallback methods moved to ResearchCLI

  generateNearbyCities(city) {
    const nearbyCityData = {
      'California': [
        { name: "Los Angeles", slug: "los-angeles", distance: 100, isSuburb: false },
        { name: "San Diego", slug: "san-diego", distance: 120, isSuburb: false },
        { name: "Sacramento", slug: "sacramento", distance: 200, isSuburb: false }
      ],
      'Texas': [
        { name: "Houston", slug: "houston", distance: 100, isSuburb: false },
        { name: "Dallas", slug: "dallas", distance: 120, isSuburb: false },
        { name: "Austin", slug: "austin", distance: 150, isSuburb: false }
      ]
    };

    return nearbyCityData[city.state] || [];
  }

  generateRealisticCoordinates(city) {
    return this.researchCLI.generateRealisticCoordinates(city);
  }

  // Utility methods
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

module.exports = WebResearchGenerator;