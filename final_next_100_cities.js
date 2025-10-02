const fs = require('fs');

// State mapping
const stateAbbrev = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
  'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
  'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
  'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
  'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
  'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
  'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
  'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
};

// Read current GSC schedule
const gscData = fs.readFileSync('gsc-submission-schedule.csv', 'utf8');
const gscLines = gscData.split('\n');
const includedCities = new Set();

gscLines.slice(1).forEach(line => {
  if (line.trim()) {
    const parts = line.split(',');
    if (parts.length >= 4) {
      const city = parts[2].trim();
      const state = parts[3].trim();
      includedCities.add(city + ', ' + state);
    }
  }
});

// Read master city list
const masterData = fs.readFileSync('FINAL_STRATEGIC_CITIES_BY_STATE.csv', 'utf8');
const masterLines = masterData.split('\n');
const remainingCities = [];

masterLines.slice(1).forEach(line => {
  if (line.trim()) {
    const parts = line.split(',');
    if (parts.length >= 3) {
      const state = parts[0].trim();
      const city = parts[1].trim();
      const type = parts[2].trim();
      const metro = parts[3] ? parts[3].trim() : '';

      const stateAbb = stateAbbrev[state] || state;
      const key = city + ', ' + stateAbb;

      if (!includedCities.has(key)) {
        remainingCities.push({
          city, state, stateAbb, type, metro, key
        });
      }
    }
  }
});

// Strategic prioritization based on business criteria
function strategicPriority(city) {
  const { city: cityName, state, type, metro } = city;

  // P1: Major metros, high-income areas, existing strong markets (15-20 cities)
  const majorMetros = [
    'New York City', 'Philadelphia', 'Boston', 'Detroit', 'Jacksonville',
    'San Francisco', 'San Jose', 'Oakland', 'Sacramento', 'Long Beach',
    'Minneapolis', 'St. Paul', 'Nashville', 'Memphis', 'Atlanta',
    'Miami', 'Tampa', 'Orlando', 'Virginia Beach', 'Baltimore'
  ];

  const highIncomeSuburbs = [
    'Jersey City', 'Newark', 'Cambridge', 'Newton', 'Brookline',
    'Palo Alto', 'Irvine', 'Fremont', 'Bellevue', 'Naperville'
  ];

  if (majorMetros.includes(cityName) || highIncomeSuburbs.includes(cityName) ||
      (type === 'Major Metro' && ['California', 'New York', 'Massachusetts', 'Washington'].includes(state))) {
    return { priority: 'P1', score: 1 };
  }

  // P2: Mid-size cities, state capitals, important regional centers (35-40 cities)
  const keyRegionalCenters = [
    'El Paso', 'Corpus Christi', 'Lubbock', 'Amarillo', 'Beaumont',
    'Albuquerque', 'Las Cruces', 'Denver', 'Colorado Springs', 'Boulder',
    'Portland', 'Eugene', 'Reno', 'Las Vegas', 'Henderson',
    'Buffalo', 'Rochester', 'Syracuse', 'Albany',
    'Pittsburgh', 'Erie', 'Allentown',
    'Cincinnati', 'Cleveland', 'Columbus', 'Toledo', 'Akron',
    'Grand Rapids', 'Flint', 'Lansing', 'Kalamazoo',
    'Milwaukee', 'Madison', 'Green Bay'
  ];

  if (type === 'State Capital' ||
      keyRegionalCenters.includes(cityName) ||
      (type === 'Major Metro' && !['California', 'New York', 'Massachusetts', 'Washington'].includes(state))) {
    return { priority: 'P2', score: 2 };
  }

  // P3: Smaller cities, university towns, suburban areas (25-30 cities)
  const universityTowns = [
    'Ann Arbor', 'College Station', 'Ames', 'Iowa City', 'State College',
    'Chapel Hill', 'Athens', 'Gainesville', 'Tallahassee', 'Bloomington',
    'Lafayette', 'Manhattan', 'Lawrence', 'Columbia', 'Charlottesville'
  ];

  const keySuburbs = [
    'Mesa', 'Chandler', 'Scottsdale', 'Tempe', 'Glendale',
    'Aurora', 'Thornton', 'Lakewood', 'Arvada',
    'Plano', 'Irving', 'Garland', 'Richardson'  // These might already be included
  ];

  if (type === 'College Town' || universityTowns.includes(cityName) ||
      keySuburbs.includes(cityName) ||
      (type === 'Metro' && ['California', 'Texas', 'Florida', 'Arizona'].includes(state))) {
    return { priority: 'P3', score: 3 };
  }

  // P4: Small towns, rural areas, niche markets (15-20 cities)
  return { priority: 'P4', score: 4 };
}

// Generate strategic notes
function getStrategicNote(city) {
  const { city: cityName, state, type, metro } = city;

  if (type === 'Major Metro') {
    if (['New York City', 'Philadelphia', 'Boston'].includes(cityName)) {
      return 'Major East Coast metro with high property values';
    }
    if (['Detroit', 'Milwaukee'].includes(cityName)) {
      return 'Rust Belt revival market with urban renewal';
    }
    if (['Miami', 'Jacksonville'].includes(cityName)) {
      return 'Florida growth market with retirees and tourism';
    }
    return 'Major metropolitan market with strong economic base';
  }

  if (type === 'State Capital') return 'State capital with stable government employment';

  if (type === 'College Town') return 'University market with student housing turnover';

  if (type === 'Metro') {
    if (state === 'California') return 'California regional center with high disposal fees';
    if (state === 'Texas') return 'Texas growth market with new construction';
    if (state === 'Florida') return 'Florida growth market with retiree influx';
    return 'Regional economic center';
  }

  if (type === 'Suburb') {
    if (['Irvine', 'Palo Alto', 'Fremont'].includes(cityName)) return 'Affluent tech corridor suburb';
    if (['Bellevue', 'Kirkland'].includes(cityName)) return 'Seattle tech suburb with high incomes';
    if (['Plano', 'Irving', 'Richardson'].includes(cityName)) return 'Wealthy Dallas suburb';
    return `Affluent suburb of ${metro} with high mattress replacement rates`;
  }

  return 'Regional market opportunity';
}

// Process and prioritize all remaining cities
const processedCities = remainingCities.map(city => {
  const { priority, score } = strategicPriority(city);
  const note = getStrategicNote(city);
  const slug = city.city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const stateSlug = city.state.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const url = `https://abedderworld.com/mattress-removal/${stateSlug}/${slug}/`;

  return {
    ...city,
    priority,
    score,
    note,
    slug,
    stateSlug,
    url
  };
});

// Sort strategically: by priority first, then by business importance
const sortedCities = processedCities.sort((a, b) => {
  if (a.score !== b.score) return a.score - b.score;

  // Within same priority, prefer certain types
  const typeOrder = {
    'Major Metro': 1, 'State Capital': 2, 'Metro': 3, 'College Town': 4, 'Suburb': 5
  };

  const aOrder = typeOrder[a.type] || 6;
  const bOrder = typeOrder[b.type] || 6;

  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.city.localeCompare(b.city);
});

// Select balanced set of 100 cities
const p1Cities = sortedCities.filter(c => c.priority === 'P1').slice(0, 18);
const p2Cities = sortedCities.filter(c => c.priority === 'P2').slice(0, 38);
const p3Cities = sortedCities.filter(c => c.priority === 'P3').slice(0, 27);
const p4Cities = sortedCities.filter(c => c.priority === 'P4').slice(0, 17);

const next100 = [...p1Cities, ...p2Cities, ...p3Cities, ...p4Cities];

console.log('NEXT 100 CITIES FOR GSC SUBMISSION SCHEDULE');
console.log('===========================================');
console.log(`Strategically selected from ${remainingCities.length} remaining cities\n`);

console.log('Day,URL,City,State,Priority,Notes');
console.log('=================================');

// Start from Day 16 since current schedule ends at Day 15
let currentDay = 16;
let citiesPerDay = Math.ceil(next100.length / 10); // Spread over ~10 days

next100.forEach((city, i) => {
  if (i > 0 && i % citiesPerDay === 0) currentDay++;
  console.log(`Day ${currentDay},${city.url},${city.city},${city.stateAbb},${city.priority},${city.note}`);
});

// Analysis
console.log('\n\nSTRATEGIC ANALYSIS:');
console.log('===================');

console.log(`\nP1 - Major metros, high-income areas, existing strong markets: ${p1Cities.length} cities`);
p1Cities.forEach(c => console.log(`  • ${c.city}, ${c.stateAbb} - ${c.note}`));

console.log(`\nP2 - Mid-size cities, state capitals, important regional centers: ${p2Cities.length} cities`);
console.log('  Top 10:');
p2Cities.slice(0, 10).forEach(c => console.log(`  • ${c.city}, ${c.stateAbb} - ${c.note}`));

console.log(`\nP3 - Smaller cities, university towns, suburban areas: ${p3Cities.length} cities`);
console.log('  Top 10:');
p3Cities.slice(0, 10).forEach(c => console.log(`  • ${c.city}, ${c.stateAbb} - ${c.note}`));

console.log(`\nP4 - Small towns, rural areas, niche markets: ${p4Cities.length} cities`);
console.log('  Top 10:');
p4Cities.slice(0, 10).forEach(c => console.log(`  • ${c.city}, ${c.stateAbb} - ${c.note}`));

console.log('\nSTATE DISTRIBUTION:');
console.log('==================');
const stateCount = {};
next100.forEach(city => {
  stateCount[city.state] = (stateCount[city.state] || 0) + 1;
});

Object.entries(stateCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([state, count]) => {
    console.log(`${state}: ${count} cities`);
  });