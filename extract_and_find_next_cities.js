const fs = require('fs');
const path = require('path');

// Read the GSC submission schedule CSV and extract first 200 cities
const csvPath = '/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/gsc-submission-schedule.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n');

// Extract cities from first 200 entries (lines 2-201, since line 1 is header)
const existingCities = new Set();
for (let i = 1; i <= 200 && i < lines.length; i++) {
  const line = lines[i];
  if (line.trim()) {
    const columns = line.split(',');
    if (columns.length >= 3) {
      const city = columns[2].trim();
      existingCities.add(city);
    }
  }
}

console.log('First 200 cities in GSC schedule:', Array.from(existingCities).sort());
console.log('Total unique cities in first 200:', existingCities.size);

// Read locations data
const locationsPath = '/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/src/_data/locations.js';
delete require.cache[require.resolve(locationsPath)];
const locationsModule = require(locationsPath);
const locations = locationsModule();

// Get all available cities from locations data
const allAvailableCities = [];
const cityData = locations.cities;

for (const citySlug in cityData) {
  const cityInfo = cityData[citySlug];
  allAvailableCities.push({
    name: cityInfo.city,
    state: cityInfo.state,
    slug: citySlug,
    population: cityInfo.population,
    medianIncome: cityInfo.medianIncome,
    tier: cityInfo.tier,
    stateSlug: cityInfo.stateSlug
  });
}

console.log('\nTotal cities in locations data:', allAvailableCities.length);

// Find cities NOT in the first 200
const remainingCities = allAvailableCities.filter(city => !existingCities.has(city.name));
console.log('Cities remaining after first 200:', remainingCities.length);

// Prioritization logic based on market potential
function prioritizeCity(city) {
  const popScore = Math.log(city.population) / Math.log(10); // Log scale for population
  const incomeScore = city.medianIncome / 100000; // Income in $100k units
  const tierScore = city.tier === 1 ? 3 : city.tier === 2 ? 2 : city.tier === 3 ? 1 : 0.5; // Tier weight

  return popScore + incomeScore + tierScore;
}

// Sort remaining cities by market potential
remainingCities.forEach(city => {
  city.marketScore = prioritizeCity(city);
});

remainingCities.sort((a, b) => b.marketScore - a.marketScore);

// Assign priority levels to next 100 cities
const next100Cities = remainingCities.slice(0, 100);

next100Cities.forEach((city, index) => {
  if (index < 25) {
    city.priority = 'P1';
  } else if (index < 50) {
    city.priority = 'P2';
  } else if (index < 75) {
    city.priority = 'P3';
  } else {
    city.priority = 'P4';
  }
});

// Generate CSV entries
console.log('\nNext 100 cities for GSC submission (cities 201-300):');
console.log('Day,URL,City,State,Priority,Notes');

let dayCounter = 16; // Starting from Day 16 since we're at line 201
let cityCounter = 201; // Starting entry number

next100Cities.forEach((city, index) => {
  const url = `https://abedderworld.com/mattress-removal/${city.stateSlug}/${city.slug}/`;
  const notes = `Pop: ${city.population.toLocaleString()}, Income: $${city.medianIncome.toLocaleString()}, Score: ${city.marketScore.toFixed(2)}`;

  // Change day every 7 entries to match the pattern
  if (index > 0 && index % 7 === 0) {
    dayCounter++;
  }

  console.log(`Day ${dayCounter},${url},${city.name},${city.state},${city.priority},${notes}`);
});

// Summary by priority
const priorityCounts = {P1: 0, P2: 0, P3: 0, P4: 0};
next100Cities.forEach(city => priorityCounts[city.priority]++);
console.log('\nPriority distribution:');
console.log(`P1: ${priorityCounts.P1} cities`);
console.log(`P2: ${priorityCounts.P2} cities`);
console.log(`P3: ${priorityCounts.P3} cities`);
console.log(`P4: ${priorityCounts.P4} cities`);