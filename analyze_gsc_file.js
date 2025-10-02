const fs = require('fs');

// Read the GSC submission schedule CSV
const csvPath = '/Users/timothysumerfield/Desktop/recent bsackup! still needs link fixes /bedder-world-base2/gsc-submission-schedule.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(line => line.trim());

console.log('Total lines (including header):', lines.length);
console.log('Total city entries:', lines.length - 1);

// Extract all cities
const allCities = [];
for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim()) {
    const columns = line.split(',');
    if (columns.length >= 3) {
      const city = columns[2].trim();
      allCities.push({
        line: i + 1,
        city: city,
        state: columns[3].trim(),
        priority: columns[4].trim()
      });
    }
  }
}

console.log('\nFirst 200 entries (lines 2-201):');
const first200 = allCities.slice(0, 200);
const first200Cities = new Set(first200.map(entry => entry.city));
console.log('Cities in first 200:', first200Cities.size);

if (allCities.length > 200) {
  console.log('\nEntries 201-300 (what should be the NEXT 100):');
  const entries201to300 = allCities.slice(200, 300);

  console.log('Cities 201-300:');
  entries201to300.forEach((entry, index) => {
    const actualLine = 201 + index;
    console.log(`Line ${actualLine}: ${entry.city}, ${entry.state} (${entry.priority})`);
  });

  // Check for duplicates between first 200 and 201-300
  const duplicates = [];
  entries201to300.forEach(entry => {
    if (first200Cities.has(entry.city)) {
      duplicates.push(entry.city);
    }
  });

  console.log('\nDUPLICATE CITIES found in 201-300 that were already in 1-200:');
  console.log(duplicates);
  console.log('Number of duplicates:', duplicates.length);
} else {
  console.log('\nFile only has', allCities.length, 'cities total.');
}

// Show last few entries
console.log('\nLast 10 entries in file:');
allCities.slice(-10).forEach(entry => {
  console.log(`Line ${entry.line}: ${entry.city}, ${entry.state} (${entry.priority})`);
});