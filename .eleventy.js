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
  eleventyConfig.addPassthroughCopy("src/favicon.png");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");

  // Minify HTML in production
  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if (process.env.NODE_ENV === "production" && outputPath && outputPath.endsWith(".html")) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyCSS: true,
        minifyJS: true
      });
      return minified;
    }
    return content;
  });

  // Minify CSS filter
  eleventyConfig.addFilter("cssmin", function(code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Date formatting filter
  eleventyConfig.addFilter("dateFormat", function(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
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
    return collectionApi.getFilteredByGlob("src/mattress-removal/*/*.md")
      .filter(item => !item.inputPath.endsWith('index.md'));
  });

  // Helper to get cities by state
  eleventyConfig.addFilter("citiesByState", function(cities, state) {
    return cities.filter(city => city.data.state === state);
  });

  // Helper for JSON-LD schema
  eleventyConfig.addShortcode("jsonLd", function(data) {
    return `<script type="application/ld+json">${JSON.stringify(data, null, 2)}</script>`;
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