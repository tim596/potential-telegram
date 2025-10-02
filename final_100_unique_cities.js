const fs = require('fs');

// Read existing cities from GSC file
const csvPath = '/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/gsc-submission-schedule.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim());

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

console.log('Cities already in GSC schedule:', existingCities.size);

// Comprehensive database of 200+ US cities
const allUSCities = [
  // TOP TIER - High income tech hubs and affluent suburbs
  { name: "Sunnyvale", state: "CA", stateSlug: "california", population: 155805, medianIncome: 153464, tier: 1 },
  { name: "Frisco", state: "TX", stateSlug: "texas", population: 200509, medianIncome: 125451, tier: 1 },
  { name: "Santa Clara", state: "CA", stateSlug: "california", population: 127134, medianIncome: 124054, tier: 1 },
  { name: "Sugar Land", state: "TX", stateSlug: "texas", population: 111026, medianIncome: 122238, tier: 1 },
  { name: "Johns Creek", state: "GA", stateSlug: "georgia", population: 85139, medianIncome: 116120, tier: 1 },
  { name: "Newton", state: "MA", stateSlug: "massachusetts", population: 88923, medianIncome: 127402, tier: 1 },
  { name: "Cambridge", state: "MA", stateSlug: "massachusetts", population: 118977, medianIncome: 103154, tier: 1 },
  { name: "Allen", state: "TX", stateSlug: "texas", population: 105623, medianIncome: 111730, tier: 1 },
  { name: "Cary", state: "NC", stateSlug: "north-carolina", population: 174721, medianIncome: 103435, tier: 1 },
  { name: "Pearland", state: "TX", stateSlug: "texas", population: 125817, medianIncome: 98543, tier: 1 },

  // SECOND TIER - Large metros and growing suburbs
  { name: "Gilbert", state: "AZ", stateSlug: "arizona", population: 267918, medianIncome: 95400, tier: 2 },
  { name: "McKinney", state: "TX", stateSlug: "texas", population: 207507, medianIncome: 95833, tier: 2 },
  { name: "Chula Vista", state: "CA", stateSlug: "california", population: 275487, medianIncome: 81816, tier: 2 },
  { name: "Chesapeake", state: "VA", stateSlug: "virginia", population: 249422, medianIncome: 78806, tier: 2 },
  { name: "Centennial", state: "CO", stateSlug: "colorado", population: 108418, medianIncome: 96779, tier: 2 },
  { name: "Berkeley", state: "CA", stateSlug: "california", population: 124321, medianIncome: 91888, tier: 2 },
  { name: "Orange", state: "CA", stateSlug: "california", population: 139911, medianIncome: 85449, tier: 2 },
  { name: "Pasadena", state: "CA", stateSlug: "california", population: 138699, medianIncome: 83068, tier: 2 },
  { name: "Torrance", state: "CA", stateSlug: "california", population: 147067, medianIncome: 79002, tier: 2 },
  { name: "Franklin", state: "TN", stateSlug: "tennessee", population: 83454, medianIncome: 103456, tier: 2 },
  { name: "Hayward", state: "CA", stateSlug: "california", population: 162954, medianIncome: 73177, tier: 2 },
  { name: "Coral Springs", state: "FL", stateSlug: "florida", population: 134394, medianIncome: 81065, tier: 2 },
  { name: "Pembroke Pines", state: "FL", stateSlug: "florida", population: 171178, medianIncome: 69890, tier: 2 },
  { name: "Concord", state: "CA", stateSlug: "california", population: 129295, medianIncome: 81463, tier: 2 },
  { name: "Round Rock", state: "TX", stateSlug: "texas", population: 133372, medianIncome: 79816, tier: 2 },
  { name: "Fullerton", state: "CA", stateSlug: "california", population: 143617, medianIncome: 75074, tier: 2 },
  { name: "Richardson", state: "TX", stateSlug: "texas", population: 119469, medianIncome: 82147, tier: 2 },
  { name: "Sandy Springs", state: "GA", stateSlug: "georgia", population: 108080, medianIncome: 86017, tier: 2 },
  { name: "Carrollton", state: "TX", stateSlug: "texas", population: 139248, medianIncome: 74782, tier: 2 },
  { name: "Cedar Park", state: "TX", stateSlug: "texas", population: 77595, medianIncome: 94738, tier: 2 },
  { name: "Roswell", state: "GA", stateSlug: "georgia", population: 94884, medianIncome: 83826, tier: 2 },
  { name: "Somerville", state: "MA", stateSlug: "massachusetts", population: 81045, medianIncome: 90512, tier: 2 },
  { name: "Miramar", state: "FL", stateSlug: "florida", population: 140823, medianIncome: 65590, tier: 2 },
  { name: "Westminster", state: "CO", stateSlug: "colorado", population: 116317, medianIncome: 73599, tier: 2 },
  { name: "Quincy", state: "MA", stateSlug: "massachusetts", population: 101636, medianIncome: 76164, tier: 2 },
  { name: "Boulder", state: "CO", stateSlug: "colorado", population: 108777, medianIncome: 71604, tier: 2 },
  { name: "Ann Arbor", state: "MI", stateSlug: "michigan", population: 123851, medianIncome: 65745, tier: 2 },
  { name: "Huntington Beach", state: "CA", stateSlug: "california", population: 198711, medianIncome: 90421, tier: 2 },
  { name: "Glendale", state: "AZ", stateSlug: "arizona", population: 248325, medianIncome: 55339, tier: 2 },
  { name: "Tempe", state: "AZ", stateSlug: "arizona", population: 195805, medianIncome: 59791, tier: 2 },
  { name: "Peoria", state: "AZ", stateSlug: "arizona", population: 190985, medianIncome: 69012, tier: 2 },
  { name: "Spokane", state: "WA", stateSlug: "washington", population: 228989, medianIncome: 50005, tier: 2 },
  { name: "Tacoma", state: "WA", stateSlug: "washington", population: 219346, medianIncome: 60914, tier: 2 },

  // THIRD TIER - Mid-size cities and opportunities
  { name: "Norfolk", state: "VA", stateSlug: "virginia", population: 238005, medianIncome: 49210, tier: 3 },
  { name: "Escondido", state: "CA", stateSlug: "california", population: 151038, medianIncome: 67231, tier: 3 },
  { name: "Antioch", state: "CA", stateSlug: "california", population: 115291, medianIncome: 76401, tier: 3 },
  { name: "Clarksville", state: "TN", stateSlug: "tennessee", population: 166722, medianIncome: 55384, tier: 3 },
  { name: "Murfreesboro", state: "TN", stateSlug: "tennessee", population: 152769, medianIncome: 58791, tier: 3 },
  { name: "Lewisville", state: "TX", stateSlug: "texas", population: 111822, medianIncome: 69024, tier: 3 },
  { name: "Denton", state: "TX", stateSlug: "texas", population: 148338, medianIncome: 55500, tier: 3 },
  { name: "Pomona", state: "CA", stateSlug: "california", population: 151124, medianIncome: 54234, tier: 3 },
  { name: "Brandon", state: "FL", stateSlug: "florida", population: 114626, medianIncome: 64782, tier: 3 },
  { name: "Everett", state: "WA", stateSlug: "washington", population: 113127, medianIncome: 63988, tier: 3 },
  { name: "West Palm Beach", state: "FL", stateSlug: "florida", population: 117415, medianIncome: 62038, tier: 3 },
  { name: "Livonia", state: "MI", stateSlug: "michigan", population: 93971, medianIncome: 71708, tier: 3 },
  { name: "Concord", state: "NC", stateSlug: "north-carolina", population: 96341, medianIncome: 67788, tier: 3 },
  { name: "Norwalk", state: "CA", stateSlug: "california", population: 102773, medianIncome: 64710, tier: 3 },
  { name: "Palm Bay", state: "FL", stateSlug: "florida", population: 119760, medianIncome: 56104, tier: 3 },
  { name: "Lowell", state: "MA", stateSlug: "massachusetts", population: 115554, medianIncome: 56786, tier: 3 },
  { name: "Dearborn", state: "MI", stateSlug: "michigan", population: 109976, medianIncome: 58934, tier: 3 },
  { name: "Greeley", state: "CO", stateSlug: "colorado", population: 108795, medianIncome: 58194, tier: 3 },
  { name: "Clearwater", state: "FL", stateSlug: "florida", population: 117292, medianIncome: 52099, tier: 3 },
  { name: "Lakeland", state: "FL", stateSlug: "florida", population: 112641, medianIncome: 50183, tier: 3 },
  { name: "Pompano Beach", state: "FL", stateSlug: "florida", population: 112046, medianIncome: 48936, tier: 3 },
  { name: "High Point", state: "NC", stateSlug: "north-carolina", population: 114059, medianIncome: 47073, tier: 3 },
  { name: "Brockton", state: "MA", stateSlug: "massachusetts", population: 105643, medianIncome: 50013, tier: 3 },
  { name: "Kent", state: "WA", stateSlug: "washington", population: 136588, medianIncome: 74916, tier: 3 },
  { name: "Renton", state: "WA", stateSlug: "washington", population: 106785, medianIncome: 80853, tier: 3 },
  { name: "Federal Way", state: "WA", stateSlug: "washington", population: 101030, medianIncome: 67321, tier: 3 },
  { name: "Bellingham", state: "WA", stateSlug: "washington", population: 93896, medianIncome: 53867, tier: 3 },
  { name: "Lakewood", state: "CO", stateSlug: "colorado", population: 155984, medianIncome: 65845, tier: 3 },
  { name: "Thornton", state: "CO", stateSlug: "colorado", population: 141867, medianIncome: 80312, tier: 3 },
  { name: "Arvada", state: "CO", stateSlug: "colorado", population: 124402, medianIncome: 80903, tier: 3 },

  // Additional cities to reach 100+
  { name: "Gainesville", state: "FL", stateSlug: "florida", population: 141085, medianIncome: 47861, tier: 3 },
  { name: "Hollywood", state: "FL", stateSlug: "florida", population: 153067, medianIncome: 52463, tier: 3 },
  { name: "Cheektowaga", state: "NY", stateSlug: "new-york", population: 88226, medianIncome: 57823, tier: 3 },
  { name: "Lynn", state: "MA", stateSlug: "massachusetts", population: 94654, medianIncome: 48224, tier: 3 },
  { name: "Parma", state: "OH", stateSlug: "ohio", population: 79825, medianIncome: 53982, tier: 3 },
  { name: "Warner Robins", state: "GA", stateSlug: "georgia", population: 80308, medianIncome: 51983, tier: 3 },
  { name: "Chapel Hill", state: "NC", stateSlug: "north-carolina", population: 61960, medianIncome: 61826, tier: 3 },
  { name: "Hempstead", state: "NY", stateSlug: "new-york", population: 59169, medianIncome: 62331, tier: 3 },
  { name: "Westland", state: "MI", stateSlug: "michigan", population: 81713, medianIncome: 47721, tier: 3 },
  { name: "Bethlehem", state: "PA", stateSlug: "pennsylvania", population: 75781, medianIncome: 46393, tier: 3 },
  { name: "West Seneca", state: "NY", stateSlug: "new-york", population: 44710, medianIncome: 63543, tier: 3 },

  // Fourth tier and smaller markets
  { name: "Dayton", state: "OH", stateSlug: "ohio", population: 137644, medianIncome: 35174, tier: 4 },
  { name: "Yakima", state: "WA", stateSlug: "washington", population: 96968, medianIncome: 42352, tier: 4 },
  { name: "New Bedford", state: "MA", stateSlug: "massachusetts", population: 101079, medianIncome: 39140, tier: 4 },
  { name: "Gastonia", state: "NC", stateSlug: "north-carolina", population: 80411, medianIncome: 45826, tier: 4 },
  { name: "Scranton", state: "PA", stateSlug: "pennsylvania", population: 76328, medianIncome: 41566, tier: 4 },
  { name: "Reading", state: "PA", stateSlug: "pennsylvania", population: 95112, medianIncome: 30068, tier: 4 },
  { name: "Flint", state: "MI", stateSlug: "michigan", population: 95538, medianIncome: 29207, tier: 4 },
  { name: "Johnson City", state: "TN", stateSlug: "tennessee", population: 71046, medianIncome: 38824, tier: 4 },
  { name: "Canton", state: "OH", stateSlug: "ohio", population: 70872, medianIncome: 35230, tier: 4 },
  { name: "Lorain", state: "OH", stateSlug: "ohio", population: 65211, medianIncome: 37012, tier: 4 },
  { name: "Rocky Mount", state: "NC", stateSlug: "north-carolina", population: 54341, medianIncome: 39123, tier: 4 },
  { name: "Youngstown", state: "OH", stateSlug: "ohio", population: 60068, medianIncome: 30129, tier: 4 },

  // More strategic additions for full coverage
  { name: "Nashua", state: "NH", stateSlug: "new-hampshire", population: 91322, medianIncome: 78996, tier: 2 },
  { name: "Manchester", state: "NH", stateSlug: "new-hampshire", population: 115644, medianIncome: 54506, tier: 3 },
  { name: "Warwick", state: "RI", stateSlug: "rhode-island", population: 82823, medianIncome: 70481, tier: 3 },
  { name: "Cranston", state: "RI", stateSlug: "rhode-island", population: 82934, medianIncome: 67637, tier: 3 },
  { name: "Waterbury", state: "CT", stateSlug: "connecticut", population: 108802, medianIncome: 45364, tier: 4 },
  { name: "New Britain", state: "CT", stateSlug: "connecticut", population: 72543, medianIncome: 48127, tier: 4 },
  { name: "Norwalk", state: "CT", stateSlug: "connecticut", population: 91184, medianIncome: 86215, tier: 2 },
  { name: "Danbury", state: "CT", stateSlug: "connecticut", population: 86518, medianIncome: 77509, tier: 2 },

  { name: "Elizabeth", state: "NJ", stateSlug: "new-jersey", population: 137298, medianIncome: 50847, tier: 3 },
  { name: "Edison", state: "NJ", stateSlug: "new-jersey", population: 107588, medianIncome: 96283, tier: 2 },
  { name: "Paterson", state: "NJ", stateSlug: "new-jersey", population: 159732, medianIncome: 39278, tier: 4 },
  { name: "Woodbridge", state: "NJ", stateSlug: "new-jersey", population: 103639, medianIncome: 89546, tier: 2 },
  { name: "Toms River", state: "NJ", stateSlug: "new-jersey", population: 95438, medianIncome: 75326, tier: 3 },
  { name: "Hamilton", state: "NJ", stateSlug: "new-jersey", population: 88464, medianIncome: 77982, tier: 2 },
  { name: "Trenton", state: "NJ", stateSlug: "new-jersey", population: 90871, medianIncome: 37919, tier: 4 },

  { name: "Wilmington", state: "DE", stateSlug: "delaware", population: 70898, medianIncome: 44503, tier: 4 },
  { name: "Dover", state: "DE", stateSlug: "delaware", population: 38079, medianIncome: 49956, tier: 4 },

  { name: "Virginia Beach", state: "VA", stateSlug: "virginia", population: 459470, medianIncome: 67719, tier: 2 },
  { name: "Newport News", state: "VA", stateSlug: "virginia", population: 186247, medianIncome: 54982, tier: 3 },
  { name: "Hampton", state: "VA", stateSlug: "virginia", population: 137148, medianIncome: 54027, tier: 3 },
  { name: "Portsmouth", state: "VA", stateSlug: "virginia", population: 97915, medianIncome: 48759, tier: 4 },
  { name: "Suffolk", state: "VA", stateSlug: "virginia", population: 94324, medianIncome: 68102, tier: 3 },
  { name: "Lynchburg", state: "VA", stateSlug: "virginia", population: 79009, medianIncome: 44581, tier: 4 },
  { name: "Roanoke", state: "VA", stateSlug: "virginia", population: 99897, medianIncome: 49832, tier: 4 },

  // More Texas cities
  { name: "Mesquite", state: "TX", stateSlug: "texas", population: 150108, medianIncome: 55792, tier: 3 },
  { name: "Grand Prairie", state: "TX", stateSlug: "texas", population: 196100, medianIncome: 58896, tier: 3 },
  { name: "Pasadena", state: "TX", stateSlug: "texas", population: 151227, medianIncome: 47806, tier: 3 },
  { name: "The Woodlands", state: "TX", stateSlug: "texas", population: 116278, medianIncome: 103417, tier: 1 },
  { name: "Flower Mound", state: "TX", stateSlug: "texas", population: 78854, medianIncome: 118926, tier: 1 },
  { name: "League City", state: "TX", stateSlug: "texas", population: 109387, medianIncome: 102938, tier: 1 },
  { name: "Wylie", state: "TX", stateSlug: "texas", population: 57526, medianIncome: 103472, tier: 2 },
  { name: "Grapevine", state: "TX", stateSlug: "texas", population: 54151, medianIncome: 89456, tier: 2 },
  { name: "Keller", state: "TX", stateSlug: "texas", population: 47339, medianIncome: 114583, tier: 2 },
  { name: "Southlake", state: "TX", stateSlug: "texas", population: 31684, medianIncome: 172032, tier: 1 }
];

// Filter out cities that already exist
const newCities = allUSCities.filter(city => !existingCities.has(city.name));

console.log('Total new cities available:', newCities.length);

// Scoring and prioritization
function calculateMarketScore(city) {
  const popScore = Math.log(city.population) / Math.log(10);
  const incomeScore = city.medianIncome / 100000;
  const tierScore = city.tier === 1 ? 3 : city.tier === 2 ? 2 : city.tier === 3 ? 1 : 0.5;
  return popScore + incomeScore + tierScore;
}

newCities.forEach(city => {
  city.marketScore = calculateMarketScore(city);
  city.slug = city.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
});

newCities.sort((a, b) => b.marketScore - a.marketScore);

// Take top 100 and assign priorities
const finalNext100 = newCities.slice(0, 100);

finalNext100.forEach((city, index) => {
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

console.log('\n=== FINAL NEXT 100 UNIQUE CITIES FOR GSC SUBMISSION ===');
console.log('Day,URL,City,State,Priority,Notes');

let dayCounter = 45; // Starting from Day 45 based on 304 entries / 7 per day
finalNext100.forEach((city, index) => {
  const url = `https://abedderworld.com/mattress-removal/${city.stateSlug}/${city.slug}/`;
  const notes = `Pop: ${city.population.toLocaleString()}, Income: $${city.medianIncome.toLocaleString()}, Score: ${city.marketScore.toFixed(2)}`;

  if (index > 0 && index % 7 === 0) {
    dayCounter++;
  }

  console.log(`Day ${dayCounter},${url},${city.name},${city.state},${city.priority},${notes}`);
});

// Summary
const priorityCounts = {P1: 0, P2: 0, P3: 0, P4: 0};
finalNext100.forEach(city => priorityCounts[city.priority]++);

console.log('\n=== PRIORITY BREAKDOWN ===');
console.log(`P1: ${priorityCounts.P1} cities (Highest market potential)`);
console.log(`P2: ${priorityCounts.P2} cities (Strong market potential)`);
console.log(`P3: ${priorityCounts.P3} cities (Good opportunities)`);
console.log(`P4: ${priorityCounts.P4} cities (Emerging markets)`);

console.log('\n=== TOP 15 HIGHEST-SCORING NEW CITIES ===');
finalNext100.slice(0, 15).forEach((city, index) => {
  console.log(`${index + 1}. ${city.name}, ${city.state} - Score: ${city.marketScore.toFixed(2)} (Pop: ${city.population.toLocaleString()}, Income: $${city.medianIncome.toLocaleString()})`);
});

// Create CSV file
const csvOutput = ['Day,URL,City,State,Priority,Notes'];
dayCounter = 45;
finalNext100.forEach((city, index) => {
  const url = `https://abedderworld.com/mattress-removal/${city.stateSlug}/${city.slug}/`;
  const notes = `Pop: ${city.population.toLocaleString()}, Income: $${city.medianIncome.toLocaleString()}, Score: ${city.marketScore.toFixed(2)}`;

  if (index > 0 && index % 7 === 0) {
    dayCounter++;
  }

  csvOutput.push(`Day ${dayCounter},${url},${city.name},${city.state},${city.priority},${notes}`);
});

fs.writeFileSync('/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/next_100_unique_cities.csv', csvOutput.join('\n'));

console.log('\n=== CSV FILE CREATED ===');
console.log('File saved as: next_100_unique_cities.csv');
console.log('\nThis file contains the correct next 100 unique cities to replace the duplicates in your GSC schedule.');