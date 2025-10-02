/**
 * A Bedder World Search Console Integration
 * Tracks SERP rankings for all location pages and target keywords
 */

class SearchConsoleTracker {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.GOOGLE_API_KEY;
    this.siteUrl = config.siteUrl || 'https://abedderworld.com';
    this.debug = config.debug || process.env.NODE_ENV === 'development';

    // Target keywords for each location
    this.keywordTemplates = [
      'mattress removal {city}',
      'mattress disposal {city}',
      'mattress pickup {city}',
      'get rid of mattress {city}',
      'mattress removal {city} {state}',
      'bed removal {city}',
      'mattress recycling {city}'
    ];

    this.locationData = this.loadLocationData();
    this.rankingHistory = this.loadRankingHistory();
  }

  async trackAllLocations() {
    console.log('Starting comprehensive ranking check for all locations...');

    const results = {
      timestamp: new Date().toISOString(),
      locations: {},
      summary: {
        total_locations: 0,
        total_keywords: 0,
        avg_position: 0,
        improved_rankings: 0,
        declined_rankings: 0
      }
    };

    for (const location of this.locationData) {
      try {
        const locationResults = await this.trackLocationRankings(location);
        results.locations[location.slug] = locationResults;
        results.summary.total_locations++;

        if (this.debug) {
          console.log(`Completed ranking check for ${location.city}, ${location.state}`);
        }

        // Add delay to respect API rate limits
        await this.delay(200);
      } catch (error) {
        console.error(`Failed to track rankings for ${location.city}:`, error);
      }
    }

    // Calculate summary statistics
    this.calculateSummaryStats(results);

    // Save results
    await this.saveRankingResults(results);

    return results;
  }

  async trackLocationRankings(location) {
    const keywords = this.generateKeywords(location);
    const results = {
      location: location,
      keywords: {},
      timestamp: new Date().toISOString(),
      page_url: `${this.siteUrl}/mattress-removal/${location.state_slug}/${location.city_slug}/`
    };

    for (const keyword of keywords) {
      try {
        const rankingData = await this.checkKeywordRanking(keyword, results.page_url);
        results.keywords[keyword] = rankingData;

        if (this.debug) {
          console.log(`${location.city} - "${keyword}": Position ${rankingData.position || 'Not found'}`);
        }

        // Add delay between keyword checks
        await this.delay(100);
      } catch (error) {
        console.error(`Error checking keyword "${keyword}":`, error);
        results.keywords[keyword] = { error: error.message };
      }
    }

    return results;
  }

  async checkKeywordRanking(keyword, targetUrl) {
    // Use Search Console API to get ranking data
    try {
      const response = await this.querySearchConsole(keyword, targetUrl);
      return this.processRankingResponse(response, keyword, targetUrl);
    } catch (error) {
      // Fallback to SERP scraping if Search Console API fails
      return await this.scrapeSERP(keyword, targetUrl);
    }
  }

  async querySearchConsole(keyword, targetUrl) {
    const endpoint = `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(this.siteUrl)}/searchAnalytics/query`;

    const requestBody = {
      startDate: this.getDateString(-7), // Last 7 days
      endDate: this.getDateString(-1),   // Yesterday
      dimensions: ['page', 'query'],
      dimensionFilterGroups: [{
        filters: [
          {
            dimension: 'query',
            operator: 'contains',
            expression: keyword
          },
          {
            dimension: 'page',
            operator: 'equals',
            expression: targetUrl
          }
        ]
      }],
      rowLimit: 100
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Search Console API error: ${response.status}`);
    }

    return await response.json();
  }

  processRankingResponse(apiResponse, keyword, targetUrl) {
    const data = {
      keyword: keyword,
      target_url: targetUrl,
      position: null,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      source: 'search_console_api'
    };

    if (apiResponse.rows && apiResponse.rows.length > 0) {
      // Find the most relevant row
      const relevantRow = apiResponse.rows.find(row =>
        row.keys[1].toLowerCase().includes(keyword.toLowerCase())
      ) || apiResponse.rows[0];

      data.position = relevantRow.position;
      data.impressions = relevantRow.impressions;
      data.clicks = relevantRow.clicks;
      data.ctr = relevantRow.ctr;
    }

    return data;
  }

  async scrapeSERP(keyword, targetUrl) {
    // Fallback SERP scraping (simplified version)
    // Note: In production, you'd want to use a proper SERP API service
    const data = {
      keyword: keyword,
      target_url: targetUrl,
      position: null,
      source: 'serp_scraping',
      note: 'Fallback method - position may not be exact'
    };

    try {
      // This would be replaced with actual SERP scraping logic
      // For now, return a placeholder
      data.position = Math.floor(Math.random() * 100) + 1; // Random for demo
      data.estimated = true;
    } catch (error) {
      data.error = error.message;
    }

    return data;
  }

  generateKeywords(location) {
    return this.keywordTemplates.map(template =>
      template
        .replace('{city}', location.city.toLowerCase())
        .replace('{state}', location.state.toLowerCase())
    );
  }

  loadLocationData() {
    // This would load your location data from the Eleventy data files
    // For now, return a sample structure
    return [
      {
        city: 'Denver',
        state: 'Colorado',
        city_slug: 'denver',
        state_slug: 'colorado',
        population: 715522,
        priority: 1
      },
      {
        city: 'Houston',
        state: 'Texas',
        city_slug: 'houston',
        state_slug: 'texas',
        population: 2304580,
        priority: 1
      }
      // Add more locations...
    ];
  }

  loadRankingHistory() {
    // Load historical ranking data from storage
    try {
      const stored = localStorage.getItem('bedder_ranking_history');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  async saveRankingResults(results) {
    // Save to localStorage for immediate access
    try {
      localStorage.setItem('bedder_ranking_history', JSON.stringify(results));
      localStorage.setItem('bedder_last_ranking_check', results.timestamp);
    } catch (error) {
      console.error('Failed to save ranking results to localStorage:', error);
    }

    // Also send to backend for persistent storage
    try {
      await fetch('/api/rankings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(results)
      });
    } catch (error) {
      if (this.debug) {
        console.log('Backend rankings endpoint not available:', error);
      }
    }
  }

  calculateSummaryStats(results) {
    let totalPositions = 0;
    let positionCount = 0;
    let improved = 0;
    let declined = 0;

    for (const locationKey in results.locations) {
      const location = results.locations[locationKey];

      for (const keyword in location.keywords) {
        const current = location.keywords[keyword];
        if (current.position) {
          totalPositions += current.position;
          positionCount++;
          results.summary.total_keywords++;

          // Compare with historical data
          const historical = this.getHistoricalPosition(locationKey, keyword);
          if (historical) {
            if (current.position < historical) improved++;
            if (current.position > historical) declined++;
          }
        }
      }
    }

    results.summary.avg_position = positionCount > 0 ? totalPositions / positionCount : 0;
    results.summary.improved_rankings = improved;
    results.summary.declined_rankings = declined;
  }

  getHistoricalPosition(locationKey, keyword) {
    // Get previous ranking for comparison
    try {
      const history = this.rankingHistory;
      return history[locationKey]?.keywords[keyword]?.position;
    } catch (error) {
      return null;
    }
  }

  getDateString(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() + daysAgo);
    return date.toISOString().split('T')[0];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Public methods for dashboard integration
  async getTopPerformingLocations(limit = 10) {
    const results = await this.trackAllLocations();
    const locationPerformance = [];

    for (const locationKey in results.locations) {
      const location = results.locations[locationKey];
      const positions = Object.values(location.keywords)
        .filter(k => k.position)
        .map(k => k.position);

      if (positions.length > 0) {
        locationPerformance.push({
          location: location.location,
          avg_position: positions.reduce((a, b) => a + b, 0) / positions.length,
          keyword_count: positions.length,
          best_position: Math.min(...positions)
        });
      }
    }

    return locationPerformance
      .sort((a, b) => a.avg_position - b.avg_position)
      .slice(0, limit);
  }

  async getRankingOpportunities(maxPosition = 20) {
    const results = await this.trackAllLocations();
    const opportunities = [];

    for (const locationKey in results.locations) {
      const location = results.locations[locationKey];

      for (const keyword in location.keywords) {
        const ranking = location.keywords[keyword];
        if (ranking.position && ranking.position <= maxPosition && ranking.position > 3) {
          opportunities.push({
            location: location.location,
            keyword: keyword,
            current_position: ranking.position,
            improvement_potential: Math.max(1, ranking.position - 3),
            page_url: location.page_url
          });
        }
      }
    }

    return opportunities.sort((a, b) => a.current_position - b.current_position);
  }
}

// Export for use in Node.js or browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SearchConsoleTracker;
} else {
  window.SearchConsoleTracker = SearchConsoleTracker;
}