const fs = require('fs');

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
      const key = city + ', ' + state;
      includedCities.add(key);
    }
  }
});

// Read master city list
const cityData = fs.readFileSync('FINAL_STRATEGIC_CITIES_BY_STATE.csv', 'utf8');
const cityLines = cityData.split('\n');
const allCities = [];

cityLines.slice(1).forEach(line => {
  if (line.trim()) {
    const parts = line.split(',');
    if (parts.length >= 3) {
      const state = parts[0].trim();
      const city = parts[1].trim();
      const type = parts[2].trim();
      const metro = parts[3] ? parts[3].trim() : '';

      const stateAbb = stateAbbrev[state] || state;
      const key = city + ', ' + stateAbb;

      const entry = {
        city: city,
        state: state,
        stateAbb: stateAbb,
        type: type,
        metro: metro,
        key: key,
        included: includedCities.has(key)
      };
      allCities.push(entry);
    }
  }
});

// Filter not included cities
const notIncluded = allCities.filter(c => !c.included);

console.log('ANALYSIS RESULTS:');
console.log('=================');
console.log('Total cities in master list:', allCities.length);
console.log('Cities in GSC schedule:', includedCities.size);
console.log('Cities NOT yet included:', notIncluded.length);

// Prioritize cities according to criteria
function getCityPriority(city) {
  const { type, city: cityName, state, stateAbb } = city;

  // Major metros with high income/population (P1)
  const majorMetros = ['New York City', 'Los Angeles', 'Chicago', 'Houston', 'Philadelphia',
                      'San Francisco', 'Boston', 'Detroit', 'Seattle', 'Denver', 'Atlanta'];

  const techHubs = ['San Jose', 'Austin', 'Raleigh', 'Portland', 'Boulder'];
  const wealthySuburbs = ['Irvine', 'Palo Alto', 'Plano', 'Naperville', 'Bellevue'];

  if (type === 'Major Metro' || majorMetros.includes(cityName) ||
      techHubs.includes(cityName) || wealthySuburbs.includes(cityName)) {
    return 'P1';
  }

  // State capitals and important regional centers (P2)
  if (type === 'State Capital' || type === 'Metro') {
    return 'P2';
  }

  // Suburbs of major metros and college towns (P3)
  if (type === 'Suburb' || type === 'College Town') {
    return 'P3';
  }

  // Everything else (P4)
  return 'P4';
}

// Add priority and create URL pattern
const prioritizedCities = notIncluded.map(city => {
  const priority = getCityPriority(city);
  const slug = city.city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const stateSlug = city.state.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const url = `https://abedderworld.com/mattress-removal/${stateSlug}/${slug}/`;

  return {
    ...city,
    priority,
    slug,
    stateSlug,
    url
  };
});

// Sort by priority then by population/importance
const sortedCities = prioritizedCities.sort((a, b) => {
  if (a.priority !== b.priority) {
    return a.priority.localeCompare(b.priority);
  }
  // Within same priority, sort by type importance
  const typeOrder = { 'Major Metro': 1, 'State Capital': 2, 'Metro': 3, 'College Town': 4, 'Suburb': 5 };
  return (typeOrder[a.type] || 6) - (typeOrder[b.type] || 6);
});

// Get next 100 cities
const next100 = sortedCities.slice(0, 100);

console.log('\nNEXT 100 CITIES FOR GSC SUBMISSION:');
console.log('===================================');

next100.forEach((city, i) => {
  let note = '';
  if (city.type === 'Major Metro') note = 'Major metropolitan market';
  else if (city.type === 'State Capital') note = 'State capital with government jobs';
  else if (city.type === 'Metro') note = 'Important regional center';
  else if (city.type === 'College Town') note = 'University town with student market';
  else if (city.type === 'Suburb') note = `Affluent suburb of ${city.metro}`;
  else note = 'Regional market opportunity';

  console.log(`${i+1}. ${city.city}, ${city.stateAbb} | ${city.url} | ${city.priority} | ${note}`);
});

// Show breakdown by priority
console.log('\nPRIORITY BREAKDOWN:');
console.log('==================');
['P1', 'P2', 'P3', 'P4'].forEach(priority => {
  const count = next100.filter(c => c.priority === priority).length;
  console.log(`${priority}: ${count} cities`);
});