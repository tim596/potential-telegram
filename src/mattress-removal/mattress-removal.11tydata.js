module.exports = {
  eleventyComputed: {
    pageMetaTitle: (data) => {
      // Handle city location pages (those with city and stateSlug)
      if (data.city && data.stateSlug) {
        const stateAbbreviations = data.stateAbbreviations;
        const stateAbbrev = stateAbbreviations[data.stateSlug];

        if (stateAbbrev) {
          return `Mattress Removal & Recycling in ${data.city}, ${stateAbbrev}`;
        }
      }

      // Handle state hub pages (those with permalink like /mattress-removal/[state]/)
      if (data.permalink && data.permalink.match(/^\/mattress-removal\/([^\/]+)\/$/) && !data.city) {
        const stateSlug = data.permalink.match(/^\/mattress-removal\/([^\/]+)\/$/)[1];

        // Convert state slug to proper state name
        const stateNames = {
          'alabama': 'Alabama',
          'alaska': 'Alaska',
          'arizona': 'Arizona',
          'arkansas': 'Arkansas',
          'california': 'California',
          'colorado': 'Colorado',
          'connecticut': 'Connecticut',
          'delaware': 'Delaware',
          'florida': 'Florida',
          'georgia': 'Georgia',
          'hawaii': 'Hawaii',
          'idaho': 'Idaho',
          'illinois': 'Illinois',
          'indiana': 'Indiana',
          'iowa': 'Iowa',
          'kansas': 'Kansas',
          'kentucky': 'Kentucky',
          'louisiana': 'Louisiana',
          'maine': 'Maine',
          'maryland': 'Maryland',
          'massachusetts': 'Massachusetts',
          'michigan': 'Michigan',
          'minnesota': 'Minnesota',
          'mississippi': 'Mississippi',
          'missouri': 'Missouri',
          'montana': 'Montana',
          'nebraska': 'Nebraska',
          'nevada': 'Nevada',
          'new-hampshire': 'New Hampshire',
          'new-jersey': 'New Jersey',
          'new-mexico': 'New Mexico',
          'new-york': 'New York',
          'north-carolina': 'North Carolina',
          'north-dakota': 'North Dakota',
          'ohio': 'Ohio',
          'oklahoma': 'Oklahoma',
          'oregon': 'Oregon',
          'pennsylvania': 'Pennsylvania',
          'rhode-island': 'Rhode Island',
          'south-carolina': 'South Carolina',
          'south-dakota': 'South Dakota',
          'tennessee': 'Tennessee',
          'texas': 'Texas',
          'utah': 'Utah',
          'vermont': 'Vermont',
          'virginia': 'Virginia',
          'washington': 'Washington',
          'washington-dc': 'Washington DC',
          'west-virginia': 'West Virginia',
          'wisconsin': 'Wisconsin',
          'wyoming': 'Wyoming'
        };

        const stateName = stateNames[stateSlug];
        if (stateName) {
          return `Mattress Removal & Recycling in ${stateName} | A Bedder World`;
        }
      }

      return null;
    },

    pageMetaDescription: (data) => {
      // Handle city location pages (those with city)
      if (data.city) {
        if (data.city.length <= 15) {
          return `Join 1M+ customers who've recycled with us. We pick up mattresses throughout ${data.city}. Book online in 60 seconds. Next-day service. Eco-certified.`;
        } else {
          return `Join 1M+ customers who've recycled with us. Serving all ${data.city}. Book online in 60 seconds. Next-day pickup. Eco-certified.`;
        }
      }

      // Handle state hub pages (those with permalink like /mattress-removal/[state]/)
      if (data.permalink && data.permalink.match(/^\/mattress-removal\/([^\/]+)\/$/) && !data.city) {
        const stateSlug = data.permalink.match(/^\/mattress-removal\/([^\/]+)\/$/)[1];

        const stateNames = {
          'alabama': 'Alabama',
          'alaska': 'Alaska',
          'arizona': 'Arizona',
          'arkansas': 'Arkansas',
          'california': 'California',
          'colorado': 'Colorado',
          'connecticut': 'Connecticut',
          'delaware': 'Delaware',
          'florida': 'Florida',
          'georgia': 'Georgia',
          'hawaii': 'Hawaii',
          'idaho': 'Idaho',
          'illinois': 'Illinois',
          'indiana': 'Indiana',
          'iowa': 'Iowa',
          'kansas': 'Kansas',
          'kentucky': 'Kentucky',
          'louisiana': 'Louisiana',
          'maine': 'Maine',
          'maryland': 'Maryland',
          'massachusetts': 'Massachusetts',
          'michigan': 'Michigan',
          'minnesota': 'Minnesota',
          'mississippi': 'Mississippi',
          'missouri': 'Missouri',
          'montana': 'Montana',
          'nebraska': 'Nebraska',
          'nevada': 'Nevada',
          'new-hampshire': 'New Hampshire',
          'new-jersey': 'New Jersey',
          'new-mexico': 'New Mexico',
          'new-york': 'New York',
          'north-carolina': 'North Carolina',
          'north-dakota': 'North Dakota',
          'ohio': 'Ohio',
          'oklahoma': 'Oklahoma',
          'oregon': 'Oregon',
          'pennsylvania': 'Pennsylvania',
          'rhode-island': 'Rhode Island',
          'south-carolina': 'South Carolina',
          'south-dakota': 'South Dakota',
          'tennessee': 'Tennessee',
          'texas': 'Texas',
          'utah': 'Utah',
          'vermont': 'Vermont',
          'virginia': 'Virginia',
          'washington': 'Washington',
          'washington-dc': 'Washington DC',
          'west-virginia': 'West Virginia',
          'wisconsin': 'Wisconsin',
          'wyoming': 'Wyoming'
        };

        const stateName = stateNames[stateSlug];
        if (stateName) {
          return `Eco-friendly mattress removal across ${stateName}. Next-day pickup in major cities. Licensed service with 1M+ mattresses recycled nationwide.`;
        }
      }

      return null;
    }
  }
};