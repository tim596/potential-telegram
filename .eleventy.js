const htmlmin = require("html-minifier");
const CleanCSS = require("clean-css");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const fs = require("fs");
const path = require("path");

module.exports = function(eleventyConfig) {
  // Add navigation plugin
  eleventyConfig.addPlugin(eleventyNavigationPlugin);

  // Copy static assets
  eleventyConfig.addPassthroughCopy("src/images");
  eleventyConfig.addPassthroughCopy("filtered-images");
  eleventyConfig.addPassthroughCopy("src/favicon.png");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");
  eleventyConfig.addPassthroughCopy("src/llms.txt");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/.htaccess");
  eleventyConfig.addPassthroughCopy("functions");
  eleventyConfig.addPassthroughCopy({"src/_data/disposal-directory.json": "disposal-directory.json"});

  // Minify HTML in production
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (process.env.NODE_ENV === "production" && outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyCSS: true,
        minifyJS: false,
        removeAttributeQuotes: true,
        collapseBooleanAttributes: true,
        conservativeCollapse: true,
        preventAttributesEscaping: true
      });
      return minified;
    }
    return content;
  });

  // Enhanced CSS minification with optimization
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({
      level: 2,
      format: false,
      compatibility: 'ie8'
    }).minify(code).styles;
  });

  // Production-only optimizations
  if (process.env.NODE_ENV === "production") {
    // Add cache busting for static assets
    eleventyConfig.addShortcode("cacheBust", function(url) {
      const timestamp = Date.now();
      return `${url}?v=${timestamp}`;
    });

    // Preload critical resources
    eleventyConfig.addShortcode("preloadResource", function(href, as, type = '') {
      const typeAttr = type ? ` type="${type}"` : '';
      return `<link rel="preload" href="${href}" as="${as}"${typeAttr}>`;
    });
  }

  // Date formatting filter
  eleventyConfig.addFilter("dateFormat", function(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  });

  // ISO date filter for sitemaps
  eleventyConfig.addFilter("isoDate", function(date) {
    if (date === "now") {
      return new Date().toISOString().split('T')[0];
    }
    return new Date(date).toISOString().split('T')[0];
  });

  // Slug filter for URLs
  eleventyConfig.addFilter("slug", function(str) {
    if (!str) return "";
    return str.toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  });

  // State name to slug
  eleventyConfig.addFilter("stateSlug", function(stateName) {
    if (!stateName) return "";
    return stateName.toLowerCase().replace(/\s+/g, '-');
  });

  // Collection for all mattress removal location pages
  eleventyConfig.addCollection("mattressRemovalLocations", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/mattress-removal/**/*.md");
  });

  // Collection for state mattress removal pages
  eleventyConfig.addCollection("mattressRemovalStates", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/mattress-removal/*/index.md");
  });

  // Collection for city mattress removal pages
  eleventyConfig.addCollection("mattressRemovalCities", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/mattress-removal/**/*.md")
      .filter(item => !item.inputPath.endsWith('index.md'));
  });

  // Helper to get cities by state
  eleventyConfig.addFilter("citiesByState", function(cities, state) {
    return cities.filter(city => city.data.state === state);
  });

  // Load disposal directory and group by state for static HTML rendering
  const disposalData = require("./src/_data/disposal-directory.json");

  // Add disposal directory as global data
  eleventyConfig.addGlobalData("disposalDirectory", disposalData);

  // Filter to group cities by state
  eleventyConfig.addFilter("groupByState", function(cities) {
    const grouped = {};
    const stateOrder = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    cities.forEach(city => {
      const state = city.state_abbrev || 'Unknown';
      if (!grouped[state]) {
        grouped[state] = [];
      }
      grouped[state].push(city);
    });

    // Sort cities within each state alphabetically
    Object.keys(grouped).forEach(state => {
      grouped[state].sort((a, b) => a.city.localeCompare(b.city));
    });

    // Return as ordered array of [state, cities] pairs
    return stateOrder
      .filter(state => grouped[state])
      .map(state => ({ state, cities: grouped[state] }));
  });

  // Get full state name from abbreviation
  eleventyConfig.addFilter("stateName", function(abbrev) {
    const stateNames = {
      'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
      'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
      'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
      'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
      'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
      'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
      'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
      'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
      'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
      'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
      'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
      'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
      'WI': 'Wisconsin', 'WY': 'Wyoming'
    };
    return stateNames[abbrev] || abbrev;
  });

  // Collection for blog posts
  eleventyConfig.addCollection("blogPosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/blog/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Collection for service posts (for separate listing if needed)
  eleventyConfig.addCollection("servicePosts", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/*.md")
      .filter(item => !item.inputPath.includes('/blog/') && !item.inputPath.includes('/mattress-removal/'))
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Helper for JSON-LD schema
  eleventyConfig.addShortcode("jsonLd", function(data) {
    return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
  });

  // Filter to safely serialize schema data to JSON
  eleventyConfig.addFilter("toJson", function(data) {
    if (typeof data === 'string') {
      // If it's already a string, assume it's already valid JSON
      return data;
    }
    // If it's an object, serialize it
    return JSON.stringify(data, null, 2);
  });

  // Format number with commas
  eleventyConfig.addFilter("numberFormat", function(num) {
    if (!num) return "0";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  });

  // Get random items from array
  eleventyConfig.addFilter("randomItems", function(array, count) {
    if (!array || !array.length) return [];
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  });

  // Array slice filter for internal links
  eleventyConfig.addFilter("slice", function(array, start, end) {
    if (!array || !Array.isArray(array)) return [];
    return array.slice(start, end);
  });

  // Array concatenation filter for internal links
  eleventyConfig.addFilter("concat", function(array1, array2) {
    if (!Array.isArray(array1)) array1 = [];
    if (!Array.isArray(array2)) array2 = [];
    return array1.concat(array2);
  });

  // Filter to exclude specific item from array
  eleventyConfig.addFilter("filterExclude", function(array, excludeItem) {
    if (!Array.isArray(array)) return [];
    return array.filter(item => item !== excludeItem);
  });

  // Get all suburbs for a given metro
  eleventyConfig.addFilter("suburbsForMetro", function(allCities, metroName) {
    if (!Array.isArray(allCities) || !metroName) return [];
    return allCities.filter(city => {
      return city.data && city.data.parentMetro === metroName;
    });
  });

  // Get varied sibling suburbs based on alphabetical proximity
  eleventyConfig.addFilter("getNearestSiblings", function(allCities, currentCity, parentMetro, state, count = 3) {
    if (!Array.isArray(allCities) || !currentCity || !parentMetro) return [];

    // Get all siblings (excluding current city)
    const siblings = allCities.filter(city => {
      return city.data &&
             city.data.parentMetro === parentMetro &&
             city.data.state === state &&
             city.data.city !== currentCity;
    });

    if (siblings.length <= count) return siblings;

    // Sort alphabetically to ensure consistent ordering
    siblings.sort((a, b) => a.data.city.localeCompare(b.data.city));

    // Find current city's position in alphabetical order
    const currentIndex = siblings.findIndex(city => city.data.city > currentCity);
    const insertPosition = currentIndex === -1 ? siblings.length : currentIndex;

    // Select siblings based on proximity to alphabetical position
    const selected = [];

    // Get 1 before, 1 at/after, 1 after that (wrapping around)
    for (let i = 0; i < count; i++) {
      const index = (insertPosition - 1 + i + siblings.length) % siblings.length;
      if (siblings[index]) selected.push(siblings[index]);
    }

    return selected.slice(0, count);
  });

  // Get major metros for a state (tier 1 cities)
  eleventyConfig.addFilter("majorMetrosForState", function(allCities, stateName) {
    if (!Array.isArray(allCities) || !stateName) return [];
    return allCities.filter(city => {
      return city.data && city.data.state === stateName && city.data.tier === 1;
    });
  });

  // Get cities by state
  eleventyConfig.addFilter("citiesInState", function(allCities, stateName) {
    if (!Array.isArray(allCities) || !stateName) return [];
    return allCities.filter(city => {
      return city.data && city.data.state === stateName;
    });
  });

  // Add current year helper
  eleventyConfig.addShortcode("currentYear", () => `${new Date().getFullYear()}`);

  // Add pricing data globally
  eleventyConfig.addGlobalData("pricing", () => ({
    mattressOnly: 125,
    mattressBoxSpring: 155,
    mattressBoxSpringFrame: 180,
    startingPrice: 125,
    
    // Item-specific pricing
    items: {
      twin: 125,
      full: 125,
      queen: 125,
      king: 135,
      californiaKing: 135,
      boxSpring: 30,
      bedFrame: 25,
      futon: 125,
      sleepSofa: 145,
      adjustableBase: 175,
      crib: 95,
      rollaway: 115
    },
    
    // Additional services (add-ons)
    services: {
      stairsPerFlight: 10,
      longCarry: 20,
      rushService: 30,
      weekendSurcharge: 0,
      heavyItem: 25,
      extraMattress: 100
    }
  }));

  // Watch for changes
  eleventyConfig.setWatchThrottleWaitTime(100);

  // Production build optimizations
  if (process.env.NODE_ENV === "production") {
    // Set quiet mode for cleaner build output
    eleventyConfig.setQuietMode(true);

    // Disable template caching for production builds to ensure fresh output
    eleventyConfig.setUseGitIgnore(false);
  }

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data"
    },
    templateFormats: ["md", "njk", "html", "liquid"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};