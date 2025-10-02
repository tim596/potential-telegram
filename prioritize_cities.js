const fs = require('fs');

// Enhanced city data with median income and demographics (approximate data based on US Census)
const cityData = {
  // High-income cities
  'Palo Alto': { medianIncome: 140000, priority: 'P1' },
  'San Jose': { medianIncome: 120000, priority: 'P1' },
  'San Francisco': { medianIncome: 112000, priority: 'P1' },
  'Boston': { medianIncome: 87000, priority: 'P1' },
  'Seattle': { medianIncome: 92000, priority: 'P1' },
  'Denver': { medianIncome: 78000, priority: 'P1' },

  // Major metros
  'New York City': { medianIncome: 70000, priority: 'P1' },
  'Los Angeles': { medianIncome: 65000, priority: 'P1' },
  'Chicago': { medianIncome: 58000, priority: 'P1' },
  'Philadelphia': { medianIncome: 49000, priority: 'P1' },
  'Detroit': { medianIncome: 36000, priority: 'P2' }
};

// State abbreviation mapping
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

// Read GSC schedule
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
const allCities = [];

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
        allCities.push({
          city, state, stateAbb, type, metro, key
        });
      }
    }
  }
});

// Enhanced prioritization function
function getCityPriority(city) {
  const { city: cityName, state, type } = city;

  // P1: Major metros, high-income tech hubs, existing strong markets
  const p1Cities = [
    'New York City', 'Los Angeles', 'Chicago', 'Philadelphia', 'Detroit', 'San Francisco',
    'Boston', 'Seattle', 'Denver', 'Atlanta', 'Miami', 'San Jose', 'San Diego',
    'Portland', 'Minneapolis', 'St. Paul', 'Sacramento', 'Oakland', 'Long Beach',
    'Virginia Beach', 'Baltimore', 'Milwaukee', 'Nashville', 'Memphis'
  ];

  const p1States = ['California', 'New York', 'Massachusetts', 'Washington', 'Colorado'];
  const techHubs = ['San Jose', 'Austin', 'Raleigh', 'Boulder', 'Bellevue', 'Palo Alto'];

  if (p1Cities.includes(cityName) || techHubs.includes(cityName) ||
      (type === 'Major Metro' && p1States.includes(state))) {
    return 'P1';
  }

  // P2: Mid-size metros, state capitals, important regional centers
  const p2Types = ['State Capital', 'Metro'];
  const importantStates = ['Texas', 'Florida', 'Illinois', 'Pennsylvania', 'Ohio', 'Michigan',
                          'Georgia', 'Virginia', 'North Carolina', 'Arizona'];

  if (p2Types.includes(type) ||
      (type === 'Major Metro' && importantStates.includes(state)) ||
      (type === 'Metro' && importantStates.includes(state))) {
    return 'P2';
  }

  // P3: Smaller cities, university towns, affluent suburbs
  const p3Types = ['College Town'];
  const wealthySuburbs = ['Irvine', 'Plano', 'Naperville', 'Scottsdale', 'Bellevue'];

  if (p3Types.includes(type) || wealthySuburbs.includes(cityName) ||
      (type === 'Suburb' && ['California', 'Texas', 'Illinois', 'Arizona', 'Washington'].includes(state))) {
    return 'P3';
  }

  // P4: Everything else
  return 'P4';
}

// Enhanced note generation
function getNoteForCity(city) {
  const { city: cityName, state, type, metro } = city;

  if (type === 'Major Metro') return `Major metropolitan market`;
  if (type === 'State Capital') return `State capital with government sector jobs`;
  if (type === 'Metro') return `Important regional center and economic hub`;
  if (type === 'College Town') return `University town with student and faculty market`;
  if (type === 'Suburb') return `Affluent suburb of ${metro} metro area`;

  // Custom notes for specific cities
  if (cityName === 'Jersey City') return 'Gateway to NYC, high-rise market';
  if (cityName === 'Newark') return 'Transportation hub near NYC';
  if (cityName === 'Cambridge') return 'Harvard/MIT area, highly educated market';
  if (cityName === 'Boulder') return 'Tech hub with outdoor lifestyle culture';
  if (state === 'Alaska') return 'Isolated market with premium pricing potential';
  if (state === 'Hawaii') return 'Island market with high cost of living';

  return 'Regional market opportunity';
}

// Process and prioritize cities
const processedCities = allCities.map(city => {
  const priority = getCityPriority(city);
  const note = getNoteForCity(city);
  const slug = city.city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const stateSlug = city.state.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const url = `https://abedderworld.com/mattress-removal/${stateSlug}/${slug}/`;

  return {
    ...city,
    priority,
    note,
    slug,
    stateSlug,
    url
  };
});

// Sort by priority, then by strategic importance
const sortedCities = processedCities.sort((a, b) => {
  if (a.priority !== b.priority) {
    return a.priority.localeCompare(b.priority);
  }

  // Within same priority, prioritize by type
  const typeOrder = {
    'Major Metro': 1,
    'State Capital': 2,
    'Metro': 3,
    'College Town': 4,
    'Suburb': 5
  };

  const aOrder = typeOrder[a.type] || 6;
  const bOrder = typeOrder[b.type] || 6;

  if (aOrder !== bOrder) return aOrder - bOrder;

  // Then alphabetically by city name
  return a.city.localeCompare(b.city);
});

// Get next 100 cities
const next100 = sortedCities.slice(0, 100);

console.log('NEXT 100 CITIES FOR GSC SUBMISSION SCHEDULE');
console.log('==========================================');
console.log(`Based on analysis of ${allCities.length} remaining cities from master list\n`);

// Output in CSV-ready format
console.log('City,State,URL,Priority,Notes');
console.log('================================================');
next100.forEach((city, i) => {
  console.log(`${city.city},${city.stateAbb},${city.url},${city.priority},${city.note}`);
});

// Show breakdown by priority
console.log('\n\nPRIORITY BREAKDOWN:');
console.log('==================');
['P1', 'P2', 'P3', 'P4'].forEach(priority => {
  const cities = next100.filter(c => c.priority === priority);
  console.log(`${priority}: ${cities.length} cities`);
  if (cities.length <= 5) {
    cities.forEach(c => console.log(`  - ${c.city}, ${c.stateAbb}`));
  } else {
    console.log(`  Top 5: ${cities.slice(0,5).map(c => c.city + ', ' + c.stateAbb).join('; ')}`);
  }
});

console.log('\n\nSTATE DISTRIBUTION:');
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