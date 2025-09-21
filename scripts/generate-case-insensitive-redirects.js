const fs = require('fs');
const path = require('path');

function generateCaseVariations(url) {
  const variations = new Set();

  // Original URL (likely already exists)
  variations.add(url);

  // Split URL into parts to handle city-state patterns
  const parts = url.split('/').filter(part => part);

  if (parts.length > 0) {
    const lastPart = parts[parts.length - 1];

    // Check if it's a city-state pattern (e.g., "surprise-az")
    const cityStateMatch = lastPart.match(/^([a-z-]+)-([a-z]{2})$/i);

    if (cityStateMatch) {
      const [, city, state] = cityStateMatch;
      const basePath = parts.slice(0, -1).join('/');
      const baseUrl = basePath ? `/${basePath}/` : '/';

      // Generate common case variations
      const variations_to_add = [
        // Title case city, uppercase state
        `${toTitleCase(city)}-${state.toUpperCase()}`,
        // Uppercase city, uppercase state
        `${city.toUpperCase()}-${state.toUpperCase()}`,
        // Lowercase city, uppercase state
        `${city.toLowerCase()}-${state.toUpperCase()}`,
        // Title case city, lowercase state
        `${toTitleCase(city)}-${state.toLowerCase()}`,
        // All uppercase
        `${city.toUpperCase()}-${state.toUpperCase()}`,
        // All lowercase (probably already exists)
        `${city.toLowerCase()}-${state.toLowerCase()}`
      ];

      variations_to_add.forEach(variation => {
        variations.add(`${baseUrl}${variation}/`);
      });
    } else {
      // Handle other URL patterns with title case
      const titleCaseParts = parts.map(part => toTitleCase(part));
      const upperCaseParts = parts.map(part => part.toUpperCase());

      variations.add(`/${titleCaseParts.join('/')}/`);
      variations.add(`/${upperCaseParts.join('/')}/`);
    }
  }

  return Array.from(variations);
}

function toTitleCase(str) {
  return str.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join('-');
}

function extractRedirects() {
  const redirectsPath = path.join(__dirname, '../src/_redirects');
  const content = fs.readFileSync(redirectsPath, 'utf8');

  const redirects = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 2) {
        const [from, to, status = '301'] = parts;
        redirects.push({ from, to, status });
      }
    }
  }

  return redirects;
}

function generateCaseInsensitiveRedirects() {
  console.log('Generating case-insensitive redirects...');

  const existingRedirects = extractRedirects();
  const newRedirects = [];
  const existingFromUrls = new Set(existingRedirects.map(r => r.from));

  // Focus on city-state patterns that are likely to have case issues
  const cityStateRedirects = existingRedirects.filter(redirect =>
    redirect.from.match(/\/[a-z-]+-[a-z]{2}\//i)
  );

  console.log(`Found ${cityStateRedirects.length} city-state redirects to process`);

  for (const redirect of cityStateRedirects) {
    const variations = generateCaseVariations(redirect.from);

    for (const variation of variations) {
      if (!existingFromUrls.has(variation) && variation !== redirect.from) {
        newRedirects.push({
          from: variation,
          to: redirect.to,
          status: redirect.status
        });
        existingFromUrls.add(variation);
      }
    }
  }

  console.log(`Generated ${newRedirects.length} new case-insensitive redirects`);

  // Write new redirects to a separate file
  const outputPath = path.join(__dirname, '../case-insensitive-redirects.txt');
  const content = newRedirects.map(r => `${r.from} ${r.to} ${r.status}`).join('\n');

  fs.writeFileSync(outputPath, content);
  console.log(`Case-insensitive redirects written to: ${outputPath}`);

  // Show a sample of what was generated
  console.log('\nSample generated redirects:');
  newRedirects.slice(0, 10).forEach(r => {
    console.log(`${r.from} -> ${r.to}`);
  });

  return newRedirects;
}

if (require.main === module) {
  generateCaseInsensitiveRedirects();
}

module.exports = { generateCaseInsensitiveRedirects };