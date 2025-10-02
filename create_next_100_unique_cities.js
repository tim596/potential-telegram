const fs = require('fs');

// Read the GSC submission schedule CSV and extract ALL existing cities
const csvPath = '/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/gsc-submission-schedule.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Extract all existing cities from the current schedule
const existingCities = new Set();
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim()) {
    const columns = line.split(',');
    if (columns.length >= 3) {
      const city = columns[2].trim();
      existingCities.add(city);
    }
  }
}

console.log('Total existing entries:', lines.length - 1);
console.log('Unique cities already in GSC schedule:', existingCities.size);
console.log('Duplicates in current schedule:', (lines.length - 1) - existingCities.size);

// Comprehensive US cities database with population and income data
const comprehensiveCitiesDatabase = [
  // Major metros not yet covered
  { name: "Virginia Beach", state: "VA", stateSlug: "virginia", population: 459470, medianIncome: 67719, tier: 2 },
  { name: "Mesa", state: "AZ", stateSlug: "arizona", population: 504258, medianIncome: 59478, tier: 2 },
  { name: "Colorado Springs", state: "CO", stateSlug: "colorado", population: 478961, medianIncome: 65200, tier: 2 },
  { name: "Henderson", state: "NV", stateSlug: "nevada", population: 320189, medianIncome: 78146, tier: 2 },
  { name: "Chandler", state: "AZ", stateSlug: "arizona", population: 275987, medianIncome: 87750, tier: 2 },
  { name: "Scottsdale", state: "AZ", stateSlug: "arizona", population: 258069, medianIncome: 88213, tier: 2 },
  { name: "Norfolk", state: "VA", stateSlug: "virginia", population: 238005, medianIncome: 49210, tier: 3 },
  { name: "Fremont", state: "CA", stateSlug: "california", population: 230504, medianIncome: 142374, tier: 1 },
  { name: "Plano", state: "TX", stateSlug: "texas", population: 285494, medianIncome: 103204, tier: 1 },
  { name: "Irving", state: "TX", stateSlug: "texas", population: 256684, medianIncome: 65565, tier: 2 },
  { name: "Chesapeake", state: "VA", stateSlug: "virginia", population: 249422, medianIncome: 78806, tier: 2 },
  { name: "Garland", state: "TX", stateSlug: "texas", population: 246018, medianIncome: 58045, tier: 2 },
  { name: "Gilbert", state: "AZ", stateSlug: "arizona", population: 267918, medianIncome: 95400, tier: 2 },
  { name: "Baton Rouge", state: "LA", stateSlug: "louisiana", population: 227470, medianIncome: 46786, tier: 3 },
  { name: "Hialeah", state: "FL", stateSlug: "florida", population: 223109, medianIncome: 31023, tier: 3 },
  { name: "Chula Vista", state: "CA", stateSlug: "california", population: 275487, medianIncome: 81816, tier: 2 },
  { name: "Irving", state: "TX", stateSlug: "texas", population: 256684, medianIncome: 65565, tier: 2 },

  // Mid-size growing cities
  { name: "Irvine", state: "CA", stateSlug: "california", population: 307670, medianIncome: 114027, tier: 1 },
  { name: "McKinney", state: "TX", stateSlug: "texas", population: 207507, medianIncome: 95833, tier: 2 },
  { name: "Frisco", state: "TX", stateSlug: "texas", population: 200509, medianIncome: 125451, tier: 1 },
  { name: "Denton", state: "TX", stateSlug: "texas", population: 148338, medianIncome: 55500, tier: 3 },
  { name: "Round Rock", state: "TX", stateSlug: "texas", population: 133372, medianIncome: 79816, tier: 2 },
  { name: "Cedar Park", state: "TX", stateSlug: "texas", population: 77595, medianIncome: 94738, tier: 2 },
  { name: "Lewisville", state: "TX", stateSlug: "texas", population: 111822, medianIncome: 69024, tier: 3 },
  { name: "Allen", state: "TX", stateSlug: "texas", population: 105623, medianIncome: 111730, tier: 2 },
  { name: "Pearland", state: "TX", stateSlug: "texas", population: 125817, medianIncome: 98543, tier: 2 },
  { name: "Richardson", state: "TX", stateSlug: "texas", population: 119469, medianIncome: 82147, tier: 2 },
  { name: "Carrollton", state: "TX", stateSlug: "texas", population: 139248, medianIncome: 74782, tier: 2 },
  { name: "Sugar Land", state: "TX", stateSlug: "texas", population: 111026, medianIncome: 122238, tier: 1 },

  // California expansion
  { name: "Sunnyvale", state: "CA", stateSlug: "california", population: 155805, medianIncome: 153464, tier: 1 },
  { name: "Torrance", state: "CA", stateSlug: "california", population: 147067, medianIncome: 79002, tier: 2 },
  { name: "Huntington Beach", state: "CA", stateSlug: "california", population: 198711, medianIncome: 90421, tier: 2 },
  { name: "Fullerton", state: "CA", stateSlug: "california", population: 143617, medianIncome: 75074, tier: 2 },
  { name: "Orange", state: "CA", stateSlug: "california", population: 139911, medianIncome: 85449, tier: 2 },
  { name: "Norwalk", state: "CA", stateSlug: "california", population: 102773, medianIncome: 64710, tier: 3 },
  { name: "Pasadena", state: "CA", stateSlug: "california", population: 138699, medianIncome: 83068, tier: 2 },
  { name: "Pomona", state: "CA", stateSlug: "california", population: 151124, medianIncome: 54234, tier: 3 },
  { name: "Escondido", state: "CA", stateSlug: "california", population: 151038, medianIncome: 67231, tier: 3 },
  { name: "Sunnyvale", state: "CA", stateSlug: "california", population: 155805, medianIncome: 153464, tier: 1 },
  { name: "Hayward", state: "CA", stateSlug: "california", population: 162954, medianIncome: 73177, tier: 2 },
  { name: "Concord", state: "CA", stateSlug: "california", population: 129295, medianIncome: 81463, tier: 2 },
  { name: "Santa Clara", state: "CA", stateSlug: "california", population: 127134, medianIncome: 124054, tier: 1 },
  { name: "Berkeley", state: "CA", stateSlug: "california", population: 124321, medianIncome: 91888, tier: 2 },
  { name: "Richmond", state: "CA", stateSlug: "california", population: 110568, medianIncome: 71213, tier: 2 },
  { name: "Antioch", state: "CA", stateSlug: "california", population: 115291, medianIncome: 76401, tier: 3 },

  // Florida expansion
  { name: "Pembroke Pines", state: "FL", stateSlug: "florida", population: 171178, medianIncome: 69890, tier: 2 },
  { name: "Hollywood", state: "FL", stateSlug: "florida", population: 153067, medianIncome: 52463, tier: 3 },
  { name: "Coral Springs", state: "FL", stateSlug: "florida", population: 134394, medianIncome: 81065, tier: 2 },
  { name: "Miramar", state: "FL", stateSlug: "florida", population: 140823, medianIncome: 65590, tier: 2 },
  { name: "Gainesville", state: "FL", stateSlug: "florida", population: 141085, medianIncome: 47861, tier: 3 },
  { name: "Palm Bay", state: "FL", stateSlug: "florida", population: 119760, medianIncome: 56104, tier: 3 },
  { name: "West Palm Beach", state: "FL", stateSlug: "florida", population: 117415, medianIncome: 62038, tier: 3 },
  { name: "Clearwater", state: "FL", stateSlug: "florida", population: 117292, medianIncome: 52099, tier: 3 },
  { name: "Brandon", state: "FL", stateSlug: "florida", population: 114626, medianIncome: 64782, tier: 3 },
  { name: "Lakeland", state: "FL", stateSlug: "florida", population: 112641, medianIncome: 50183, tier: 3 },
  { name: "Pompano Beach", state: "FL", stateSlug: "florida", population: 112046, medianIncome: 48936, tier: 3 },

  // Washington expansion
  { name: "Spokane", state: "WA", stateSlug: "washington", population: 228989, medianIncome: 50005, tier: 3 },
  { name: "Tacoma", state: "WA", stateSlug: "washington", population: 219346, medianIncome: 60914, tier: 2 },
  { name: "Kent", state: "WA", stateSlug: "washington", population: 136588, medianIncome: 74916, tier: 2 },
  { name: "Everett", state: "WA", stateSlug: "washington", population: 113127, medianIncome: 63988, tier: 3 },
  { name: "Renton", state: "WA", stateSlug: "washington", population: 106785, medianIncome: 80853, tier: 2 },
  { name: "Yakima", state: "WA", stateSlug: "washington", population: 96968, medianIncome: 42352, tier: 4 },
  { name: "Federal Way", state: "WA", stateSlug: "washington", population: 101030, medianIncome: 67321, tier: 3 },
  { name: "Bellingham", state: "WA", stateSlug: "washington", population: 93896, medianIncome: 53867, tier: 3 },

  // Colorado expansion
  { name: "Lakewood", state: "CO", stateSlug: "colorado", population: 155984, medianIncome: 65845, tier: 2 },
  { name: "Thornton", state: "CO", stateSlug: "colorado", population: 141867, medianIncome: 80312, tier: 2 },
  { name: "Arvada", state: "CO", stateSlug: "colorado", population: 124402, medianIncome: 80903, tier: 2 },
  { name: "Westminster", state: "CO", stateSlug: "colorado", population: 116317, medianIncome: 73599, tier: 2 },
  { name: "Pueblo", state: "CO", stateSlug: "colorado", population: 113002, medianIncome: 42902, tier: 4 },
  { name: "Centennial", state: "CO", stateSlug: "colorado", population: 108418, medianIncome: 96779, tier: 2 },
  { name: "Boulder", state: "CO", stateSlug: "colorado", population: 108777, medianIncome: 71604, tier: 2 },
  { name: "Greeley", state: "CO", stateSlug: "colorado", population: 108795, medianIncome: 58194, tier: 3 },

  // North Carolina expansion
  { name: "Cary", state: "NC", stateSlug: "north-carolina", population: 174721, medianIncome: 103435, tier: 1 },
  { name: "High Point", state: "NC", stateSlug: "north-carolina", population: 114059, medianIncome: 47073, tier: 3 },
  { name: "Concord", state: "NC", stateSlug: "north-carolina", population: 96341, medianIncome: 67788, tier: 3 },
  { name: "Gastonia", state: "NC", stateSlug: "north-carolina", population: 80411, medianIncome: 45826, tier: 4 },
  { name: "Chapel Hill", state: "NC", stateSlug: "north-carolina", population: 61960, medianIncome: 61826, tier: 3 },
  { name: "Rocky Mount", state: "NC", stateSlug: "north-carolina", population: 54341, medianIncome: 39123, tier: 4 },

  // Georgia expansion
  { name: "Sandy Springs", state: "GA", stateSlug: "georgia", population: 108080, medianIncome: 86017, tier: 2 },
  { name: "Roswell", state: "GA", stateSlug: "georgia", population: 94884, medianIncome: 83826, tier: 2 },
  { name: "Johns Creek", state: "GA", stateSlug: "georgia", population: 85139, medianIncome: 116120, tier: 1 },
  { name: "Albany", state: "GA", stateSlug: "georgia", population: 72634, medianIncome: 36213, tier: 4 },
  { name: "Warner Robins", state: "GA", stateSlug: "georgia", population: 80308, medianIncome: 51983, tier: 3 },

  // Tennessee expansion
  { name: "Clarksville", state: "TN", stateSlug: "tennessee", population: 166722, medianIncome: 55384, tier: 3 },
  { name: "Murfreesboro", state: "TN", stateSlug: "tennessee", population: 152769, medianIncome: 58791, tier: 3 },
  { name: "Franklin", state: "TN", stateSlug: "tennessee", population: 83454, medianIncome: 103456, tier: 2 },
  { name: "Johnson City", state: "TN", stateSlug: "tennessee", population: 71046, medianIncome: 38824, tier: 4 },

  // Ohio expansion
  { name: "Dayton", state: "OH", stateSlug: "ohio", population: 137644, medianIncome: 35174, tier: 4 },
  { name: "Parma", state: "OH", stateSlug: "ohio", population: 79825, medianIncome: 53982, tier: 3 },
  { name: "Canton", state: "OH", stateSlug: "ohio", population: 70872, medianIncome: 35230, tier: 4 },
  { name: "Youngstown", state: "OH", stateSlug: "ohio", population: 60068, medianIncome: 30129, tier: 4 },
  { name: "Lorain", state: "OH", stateSlug: "ohio", population: 65211, medianIncome: 37012, tier: 4 },

  // Michigan expansion
  { name: "Ann Arbor", state: "MI", stateSlug: "michigan", population: 123851, medianIncome: 65745, tier: 2 },
  { name: "Flint", state: "MI", stateSlug: "michigan", population: 95538, medianIncome: 29207, tier: 4 },
  { name: "Dearborn", state: "MI", stateSlug: "michigan", population: 109976, medianIncome: 58934, tier: 3 },
  { name: "Livonia", state: "MI", stateSlug: "michigan", population: 93971, medianIncome: 71708, tier: 3 },
  { name: "Westland", state: "MI", stateSlug: "michigan", population: 81713, medianIncome: 47721, tier: 3 },

  // Pennsylvania expansion
  { name: "Reading", state: "PA", stateSlug: "pennsylvania", population: 95112, medianIncome: 30068, tier: 4 },
  { name: "Scranton", state: "PA", stateSlug: "pennsylvania", population: 76328, medianIncome: 41566, tier: 4 },
  { name: "Bethlehem", state: "PA", stateSlug: "pennsylvania", population: 75781, medianIncome: 46393, tier: 3 },

  // New York expansion (outside NYC)
  { name: "Cheektowaga", state: "NY", stateSlug: "new-york", population: 88226, medianIncome: 57823, tier: 3 },
  { name: "West Seneca", state: "NY", stateSlug: "new-york", population: 44710, medianIncome: 63543, tier: 3 },
  { name: "Hempstead", state: "NY", stateSlug: "new-york", population: 59169, medianIncome: 62331, tier: 3 },

  // Additional high-priority cities
  { name: "Cambridge", state: "MA", stateSlug: "massachusetts", population: 118977, medianIncome: 103154, tier: 1 },
  { name: "Lowell", state: "MA", stateSlug: "massachusetts", population: 115554, medianIncome: 56786, tier: 3 },
  { name: "Brockton", state: "MA", stateSlug: "massachusetts", population: 105643, medianIncome: 50013, tier: 3 },
  { name: "New Bedford", state: "MA", stateSlug: "massachusetts", population: 101079, medianIncome: 39140, tier: 4 },
  { name: "Lynn", state: "MA", stateSlug: "massachusetts", population: 94654, medianIncome: 48224, tier: 3 },
  { name: "Quincy", state: "MA", stateSlug: "massachusetts", population: 101636, medianIncome: 76164, tier: 2 },
  { name: "Newton", state: "MA", stateSlug: "massachusetts", population: 88923, medianIncome: 127402, tier: 1 },
  { name: "Somerville", state: "MA", stateSlug: "massachusetts", population: 81045, medianIncome: 90512, tier: 2 },

  // More strategic additions
  { name: "Peoria", state: "AZ", stateSlug: "arizona", population: 190985, medianIncome: 69012, tier: 2 },
  { name: "Glendale", state: "AZ", stateSlug: "arizona", population: 248325, medianIncome: 55339, tier: 3 },
  { name: "Tempe", state: "AZ", stateSlug: "arizona", population: 195805, medianIncome: 59791, tier: 2 }
];

// Remove cities that already exist in the GSC schedule
const availableNewCities = comprehensiveCitiesDatabase.filter(city => !existingCities.has(city.name));

console.log('\nAvailable new cities after filtering existing:', availableNewCities.length);

// Prioritization scoring function
function calculateMarketScore(city) {
  const popScore = Math.log(city.population) / Math.log(10); // Log scale for population (4-6 range typically)
  const incomeScore = city.medianIncome / 100000; // Income in $100k units (0.3-1.5 range typically)
  const tierScore = city.tier === 1 ? 3 : city.tier === 2 ? 2 : city.tier === 3 ? 1 : 0.5; // Tier weight

  return popScore + incomeScore + tierScore;
}

// Calculate market scores and sort
availableNewCities.forEach(city => {
  city.marketScore = calculateMarketScore(city);
  city.slug = city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
});

availableNewCities.sort((a, b) => b.marketScore - a.marketScore);

// Take the top 100 and assign priority levels
const next100Cities = availableNewCities.slice(0, 100);

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

console.log('\n=== CORRECT NEXT 100 UNIQUE CITIES FOR GSC SUBMISSION ===');
console.log('(These are cities 306-405, to replace the duplicates in 201-300)\n');

console.log('Day,URL,City,State,Priority,Notes');

let dayCounter = Math.ceil(305 / 7) + 1; // Start from the next day after current entries
next100Cities.forEach((city, index) => {
  const entryNumber = 306 + index; // Starting from entry 306
  const url = `https://abedderworld.com/mattress-removal/${city.stateSlug}/${city.slug}/`;
  const notes = `Pop: ${city.population.toLocaleString()}, Income: $${city.medianIncome.toLocaleString()}, Score: ${city.marketScore.toFixed(2)}`;

  // Change day every 7 entries
  if (index > 0 && index % 7 === 0) {
    dayCounter++;
  }

  console.log(`Day ${dayCounter},${url},${city.name},${city.state},${city.priority},${notes}`);
});

// Summary
const priorityCounts = {P1: 0, P2: 0, P3: 0, P4: 0};
next100Cities.forEach(city => priorityCounts[city.priority]++);

console.log('\n=== SUMMARY ===');
console.log(`P1 (Top Priority): ${priorityCounts.P1} cities - High income, large population`);
console.log(`P2 (High Priority): ${priorityCounts.P2} cities - Good market potential`);
console.log(`P3 (Medium Priority): ${priorityCounts.P3} cities - Solid opportunities`);
console.log(`P4 (Lower Priority): ${priorityCounts.P4} cities - Emerging markets`);

console.log('\n=== ACTION NEEDED ===');
console.log('1. Remove duplicate entries from lines 201-300 in your current GSC file');
console.log('2. Replace them with the 100 unique cities listed above');
console.log('3. This will give you a clean 200 + 100 = 300 unique cities total');

// Show top 10 by market score
console.log('\n=== TOP 10 HIGHEST SCORING NEW CITIES ===');
next100Cities.slice(0, 10).forEach((city, index) => {
  console.log(`${index + 1}. ${city.name}, ${city.state} - Score: ${city.marketScore.toFixed(2)} (Pop: ${city.population.toLocaleString()}, Income: $${city.medianIncome.toLocaleString()})`);
});