/**
 * A Bedder World Analytics API
 * Backend endpoints for storing and retrieving analytics data
 */

const fs = require('fs').promises;
const path = require('path');

class AnalyticsAPI {
  constructor(config = {}) {
    this.dataDir = config.dataDir || path.join(__dirname, '../../_data/analytics');
    this.debug = config.debug || process.env.NODE_ENV === 'development';

    // Ensure data directory exists
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create analytics data directory:', error);
    }
  }

  // Store analytics event
  async storeEvent(eventData) {
    try {
      const timestamp = new Date().toISOString();
      const dateString = timestamp.split('T')[0];
      const filePath = path.join(this.dataDir, `events-${dateString}.json`);

      // Load existing events for the day
      let events = [];
      try {
        const existingData = await fs.readFile(filePath, 'utf8');
        events = JSON.parse(existingData);
      } catch (error) {
        // File doesn't exist or is empty, start fresh
      }

      // Add new event
      events.push({
        timestamp,
        ...eventData
      });

      // Store back to file
      await fs.writeFile(filePath, JSON.stringify(events, null, 2));

      if (this.debug) {
        console.log(`Stored analytics event: ${eventData.event}`);
      }

      return { success: true, timestamp };
    } catch (error) {
      console.error('Failed to store analytics event:', error);
      return { success: false, error: error.message };
    }
  }

  // Store ranking data
  async storeRankingData(rankingData) {
    try {
      const timestamp = new Date().toISOString();
      const dateString = timestamp.split('T')[0];
      const filePath = path.join(this.dataDir, `rankings-${dateString}.json`);

      await fs.writeFile(filePath, JSON.stringify(rankingData, null, 2));

      // Also update the latest rankings file
      const latestPath = path.join(this.dataDir, 'rankings-latest.json');
      await fs.writeFile(latestPath, JSON.stringify(rankingData, null, 2));

      if (this.debug) {
        console.log('Stored ranking data for', rankingData.summary.total_locations, 'locations');
      }

      return { success: true, timestamp };
    } catch (error) {
      console.error('Failed to store ranking data:', error);
      return { success: false, error: error.message };
    }
  }

  // Get analytics summary
  async getAnalyticsSummary(days = 30) {
    try {
      const summary = {
        period: days,
        total_events: 0,
        conversions: 0,
        page_views: 0,
        locations: {},
        top_performing_cities: [],
        keyword_opportunities: []
      };

      // Get events for the specified period
      const events = await this.getEventsForPeriod(days);
      summary.total_events = events.length;

      // Process events
      events.forEach(event => {
        if (event.event === 'page_view_enhanced') {
          summary.page_views++;

          if (event.data.location_city) {
            const locationKey = `${event.data.location_city}, ${event.data.location_state}`;
            if (!summary.locations[locationKey]) {
              summary.locations[locationKey] = {
                page_views: 0,
                conversions: 0,
                phone_calls: 0,
                booking_attempts: 0
              };
            }
            summary.locations[locationKey].page_views++;
          }
        }

        if (event.event.includes('conversion') || event.event === 'booking_attempt') {
          summary.conversions++;

          if (event.data.location_city) {
            const locationKey = `${event.data.location_city}, ${event.data.location_state}`;
            if (summary.locations[locationKey]) {
              summary.locations[locationKey].conversions++;
            }
          }
        }
      });

      // Get latest ranking data
      try {
        const rankingData = await this.getLatestRankingData();
        if (rankingData) {
          summary.avg_position = rankingData.summary.avg_position;
          summary.keyword_opportunities = await this.extractKeywordOpportunities(rankingData);
          summary.top_performing_cities = this.getTopPerformingCities(rankingData, summary.locations);
        }
      } catch (error) {
        console.warn('Could not load ranking data:', error.message);
      }

      return summary;
    } catch (error) {
      console.error('Failed to generate analytics summary:', error);
      throw error;
    }
  }

  // Get events for a specific period
  async getEventsForPeriod(days = 30) {
    const events = [];
    const endDate = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const filePath = path.join(this.dataDir, `events-${dateString}.json`);

      try {
        const dayEvents = await fs.readFile(filePath, 'utf8');
        events.push(...JSON.parse(dayEvents));
      } catch (error) {
        // File doesn't exist for this day, continue
      }
    }

    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // Get latest ranking data
  async getLatestRankingData() {
    try {
      const filePath = path.join(this.dataDir, 'rankings-latest.json');
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  // Extract keyword opportunities
  extractKeywordOpportunities(rankingData, maxPosition = 20) {
    const opportunities = [];

    for (const locationKey in rankingData.locations) {
      const location = rankingData.locations[locationKey];

      for (const keyword in location.keywords) {
        const ranking = location.keywords[keyword];
        if (ranking.position && ranking.position <= maxPosition && ranking.position > 3) {
          opportunities.push({
            location: `${location.location.city}, ${location.location.state}`,
            keyword: keyword,
            current_position: ranking.position,
            potential_improvement: Math.max(1, ranking.position - 3),
            estimated_traffic_gain: Math.floor((maxPosition - ranking.position) * 10)
          });
        }
      }
    }

    return opportunities
      .sort((a, b) => a.current_position - b.current_position)
      .slice(0, 20);
  }

  // Get top performing cities
  getTopPerformingCities(rankingData, analyticsData, limit = 10) {
    const cityPerformance = [];

    for (const locationKey in rankingData.locations) {
      const location = rankingData.locations[locationKey];
      const locationName = `${location.location.city}, ${location.location.state}`;

      // Get ranking performance
      const positions = Object.values(location.keywords)
        .filter(k => k.position)
        .map(k => k.position);

      const avgPosition = positions.length > 0
        ? positions.reduce((a, b) => a + b, 0) / positions.length
        : 999;

      // Get analytics performance
      const analytics = analyticsData[locationName] || { page_views: 0, conversions: 0 };
      const conversionRate = analytics.page_views > 0
        ? (analytics.conversions / analytics.page_views) * 100
        : 0;

      cityPerformance.push({
        location: locationName,
        avg_position: avgPosition,
        page_views: analytics.page_views,
        conversions: analytics.conversions,
        conversion_rate: conversionRate,
        performance_score: this.calculatePerformanceScore(avgPosition, conversionRate, analytics.page_views)
      });
    }

    return cityPerformance
      .sort((a, b) => b.performance_score - a.performance_score)
      .slice(0, limit);
  }

  // Calculate performance score
  calculatePerformanceScore(avgPosition, conversionRate, pageViews) {
    const positionScore = avgPosition > 0 ? Math.max(0, 50 - avgPosition) : 0;
    const conversionScore = Math.min(conversionRate * 2, 30);
    const trafficScore = Math.min(pageViews / 10, 20);

    return positionScore + conversionScore + trafficScore;
  }

  // Get location-specific analytics
  async getLocationAnalytics(state, city, days = 30) {
    try {
      const events = await this.getEventsForPeriod(days);
      const locationEvents = events.filter(event =>
        event.data.location_state === state && event.data.location_city === city
      );

      const analytics = {
        location: `${city}, ${state}`,
        period: days,
        total_events: locationEvents.length,
        page_views: 0,
        conversions: 0,
        bounce_rate: 0,
        avg_time_on_page: 0,
        top_keywords: [],
        conversion_funnel: {
          page_views: 0,
          booking_form_views: 0,
          booking_attempts: 0,
          booking_completions: 0,
          phone_calls: 0,
          form_submissions: 0
        }
      };

      // Process events
      let timeOnPageTotal = 0;
      let timeOnPageCount = 0;

      locationEvents.forEach(event => {
        switch (event.event) {
          case 'page_view_enhanced':
            analytics.page_views++;
            analytics.conversion_funnel.page_views++;
            break;
          case 'booking_form_viewed':
            analytics.conversion_funnel.booking_form_views++;
            break;
          case 'booking_attempt':
            analytics.conversions++;
            analytics.conversion_funnel.booking_attempts++;
            break;
          case 'booking_completed':
            analytics.conversions++;
            analytics.conversion_funnel.booking_completions++;
            break;
          case 'phone_call_attempt':
            analytics.conversions++;
            analytics.conversion_funnel.phone_calls++;
            break;
          case 'form_submission':
            analytics.conversions++;
            analytics.conversion_funnel.form_submissions++;
            break;
          case 'time_on_page':
            if (event.data.value) {
              timeOnPageTotal += event.data.value;
              timeOnPageCount++;
            }
            break;
        }
      });

      // Calculate derived metrics
      analytics.conversion_rate = analytics.page_views > 0
        ? (analytics.conversions / analytics.page_views) * 100
        : 0;

      analytics.avg_time_on_page = timeOnPageCount > 0
        ? Math.round(timeOnPageTotal / timeOnPageCount)
        : 0;

      // Get ranking data for this location
      const rankingData = await this.getLatestRankingData();
      if (rankingData && rankingData.locations) {
        const locationRankings = Object.values(rankingData.locations)
          .find(loc =>
            loc.location.city.toLowerCase() === city.toLowerCase() &&
            loc.location.state.toLowerCase() === state.toLowerCase()
          );

        if (locationRankings) {
          analytics.current_rankings = locationRankings.keywords;

          // Extract top keywords
          analytics.top_keywords = Object.entries(locationRankings.keywords)
            .filter(([, data]) => data.position && data.position <= 10)
            .sort((a, b) => a[1].position - b[1].position)
            .slice(0, 5)
            .map(([keyword, data]) => ({ keyword, position: data.position }));
        }
      }

      return analytics;
    } catch (error) {
      console.error('Failed to get location analytics:', error);
      throw error;
    }
  }

  // Export data to CSV
  async exportToCSV(type = 'events', days = 30) {
    try {
      let data = '';
      let headers = '';

      if (type === 'events') {
        const events = await this.getEventsForPeriod(days);
        headers = 'Timestamp,Event,Location,State,City,Page Type,Additional Data\n';

        data = events.map(event => [
          event.timestamp,
          event.event,
          event.data.full_location || '',
          event.data.location_state || '',
          event.data.location_city || '',
          event.data.page_type || '',
          JSON.stringify(event.data).replace(/,/g, ';')
        ].join(',')).join('\n');

      } else if (type === 'rankings') {
        const rankingData = await this.getLatestRankingData();
        if (rankingData) {
          headers = 'Location,State,City,Keyword,Position,Impressions,Clicks,CTR\n';

          const rows = [];
          for (const locationKey in rankingData.locations) {
            const location = rankingData.locations[locationKey];
            for (const keyword in location.keywords) {
              const ranking = location.keywords[keyword];
              rows.push([
                `${location.location.city}, ${location.location.state}`,
                location.location.state,
                location.location.city,
                keyword,
                ranking.position || '',
                ranking.impressions || '',
                ranking.clicks || '',
                ranking.ctr || ''
              ].join(','));
            }
          }
          data = rows.join('\n');
        }
      }

      return headers + data;
    } catch (error) {
      console.error('Failed to export data to CSV:', error);
      throw error;
    }
  }

  // Get booking funnel data for dashboard
  async getBookingFunnelData(days = 30) {
    try {
      const events = await this.getEventsForPeriod(days);

      let bookingAttempts = 0;
      let bookingCompletions = 0;
      let previousPeriodAttempts = 0;
      let previousPeriodCompletions = 0;

      // Current period
      events.forEach(event => {
        if (event.event === 'booking_attempt') {
          bookingAttempts++;
        } else if (event.event === 'booking_completed') {
          bookingCompletions++;
        }
      });

      // Previous period for comparison
      const previousEvents = await this.getEventsForPeriod(days, days);
      previousEvents.forEach(event => {
        if (event.event === 'booking_attempt') {
          previousPeriodAttempts++;
        } else if (event.event === 'booking_completed') {
          previousPeriodCompletions++;
        }
      });

      // Calculate changes
      const attemptsChange = bookingAttempts - previousPeriodAttempts;
      const completionsChange = bookingCompletions - previousPeriodCompletions;

      const currentDropOff = bookingAttempts > 0
        ? ((bookingAttempts - bookingCompletions) / bookingAttempts) * 100
        : 0;
      const previousDropOff = previousPeriodAttempts > 0
        ? ((previousPeriodAttempts - previousPeriodCompletions) / previousPeriodAttempts) * 100
        : 0;
      const dropOffChange = currentDropOff - previousDropOff;

      return {
        attempts: bookingAttempts,
        completions: bookingCompletions,
        attempts_change: attemptsChange,
        completions_change: completionsChange,
        drop_off_rate: currentDropOff.toFixed(1),
        drop_off_change: dropOffChange.toFixed(1),
        completion_rate: bookingAttempts > 0 ? ((bookingCompletions / bookingAttempts) * 100).toFixed(1) : '0.0',
        period_days: days
      };
    } catch (error) {
      console.error('Failed to get booking funnel data:', error);
      throw error;
    }
  }

  // Get events for a specific period with offset
  async getEventsForPeriod(days = 30, offsetDays = 0) {
    const events = [];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - offsetDays);

    for (let i = 0; i < days; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      const filePath = path.join(this.dataDir, `events-${dateString}.json`);

      try {
        const dayEvents = await fs.readFile(filePath, 'utf8');
        events.push(...JSON.parse(dayEvents));
      } catch (error) {
        // File doesn't exist for this day, continue
      }
    }

    return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
}

module.exports = AnalyticsAPI;