/**
 * Local Analytics Storage for Development
 * Browser-based storage for testing analytics without server
 */

class LocalAnalyticsStorage {
  constructor() {
    this.storageKey = 'bedder_analytics_events';
    this.init();
  }

  init() {
    // Ensure storage exists
    if (!localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  // Store an analytics event
  storeEvent(eventData) {
    try {
      const events = this.getEvents();
      const timestamp = new Date().toISOString();

      events.push({
        timestamp,
        ...eventData
      });

      // Keep only last 1000 events to prevent storage overflow
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(events));

      console.log('Analytics event stored locally:', eventData);
      return { success: true, timestamp };
    } catch (error) {
      console.error('Failed to store analytics event:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all events
  getEvents() {
    try {
      const events = localStorage.getItem(this.storageKey);
      return events ? JSON.parse(events) : [];
    } catch (error) {
      console.error('Failed to get analytics events:', error);
      return [];
    }
  }

  // Get events for a specific period
  getEventsForPeriod(days = 30, offsetDays = 0) {
    const events = this.getEvents();
    const now = new Date();
    const startDate = new Date(now.getTime() - ((days + offsetDays) * 24 * 60 * 60 * 1000));
    const endDate = new Date(now.getTime() - (offsetDays * 24 * 60 * 60 * 1000));

    return events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });
  }

  // Get booking funnel data
  getBookingFunnelData(days = 30) {
    const events = this.getEventsForPeriod(days);
    const previousEvents = this.getEventsForPeriod(days, days);

    let bookingAttempts = 0;
    let bookingCompletions = 0;
    let previousAttempts = 0;
    let previousCompletions = 0;

    events.forEach(event => {
      if (event.event === 'booking_attempt') {
        bookingAttempts++;
      } else if (event.event === 'booking_completed') {
        bookingCompletions++;
      }
    });

    previousEvents.forEach(event => {
      if (event.event === 'booking_attempt') {
        previousAttempts++;
      } else if (event.event === 'booking_completed') {
        previousCompletions++;
      }
    });

    const attemptsChange = bookingAttempts - previousAttempts;
    const completionsChange = bookingCompletions - previousCompletions;

    const currentDropOff = bookingAttempts > 0
      ? ((bookingAttempts - bookingCompletions) / bookingAttempts) * 100
      : 0;
    const previousDropOff = previousAttempts > 0
      ? ((previousAttempts - previousCompletions) / previousAttempts) * 100
      : 0;
    const dropOffChange = currentDropOff - previousDropOff;

    return {
      attempts: bookingAttempts,
      completions: bookingCompletions,
      attempts_change: attemptsChange,
      completions_change: completionsChange,
      drop_off_rate: currentDropOff.toFixed(1),
      drop_off_change: dropOffChange.toFixed(1),
      completion_rate: bookingAttempts > 0 ? ((bookingCompletions / bookingAttempts) * 100).toFixed(1) : '0.0'
    };
  }

  // Clear all analytics data
  clearData() {
    localStorage.removeItem(this.storageKey);
    this.init();
    console.log('Analytics data cleared');
  }

  // Get summary statistics
  getSummary(days = 30) {
    const events = this.getEventsForPeriod(days);

    return {
      total_events: events.length,
      booking_attempts: events.filter(e => e.event === 'booking_attempt').length,
      booking_completions: events.filter(e => e.event === 'booking_completed').length,
      phone_calls: events.filter(e => e.event === 'phone_call_attempt').length,
      page_views: events.filter(e => e.event === 'page_view_enhanced').length,
      locations: this.getLocationBreakdown(events)
    };
  }

  // Get location breakdown
  getLocationBreakdown(events) {
    const locations = {};

    events.forEach(event => {
      if (event.data && event.data.location_city && event.data.location_state) {
        // Build location key with suburb support
        let locationKey;
        if (event.data.location_suburb) {
          locationKey = `${event.data.location_suburb}, ${event.data.location_city}, ${event.data.location_state}`;
        } else {
          locationKey = `${event.data.location_city}, ${event.data.location_state}`;
        }

        if (!locations[locationKey]) {
          locations[locationKey] = {
            page_views: 0,
            booking_attempts: 0,
            booking_completions: 0,
            phone_calls: 0
          };
        }

        if (event.event === 'page_view_enhanced') {
          locations[locationKey].page_views++;
        } else if (event.event === 'booking_attempt') {
          locations[locationKey].booking_attempts++;
        } else if (event.event === 'booking_completed') {
          locations[locationKey].booking_completions++;
        } else if (event.event === 'phone_call_attempt') {
          locations[locationKey].phone_calls++;
        }
      }
    });

    return locations;
  }

  // Generate sample data for testing
  generateSampleData() {
    const sampleEvents = [
      // Houston data
      { event: 'page_view_enhanced', data: { location_city: 'houston', location_state: 'texas', full_location: 'Houston, Texas' }},
      { event: 'booking_attempt', data: { location_city: 'houston', location_state: 'texas', full_location: 'Houston, Texas' }},
      { event: 'booking_completed', data: { location_city: 'houston', location_state: 'texas', full_location: 'Houston, Texas' }},

      // Los Angeles data
      { event: 'page_view_enhanced', data: { location_city: 'los-angeles', location_state: 'california', full_location: 'Los Angeles, California' }},
      { event: 'page_view_enhanced', data: { location_city: 'los-angeles', location_state: 'california', full_location: 'Los Angeles, California' }},
      { event: 'booking_attempt', data: { location_city: 'los-angeles', location_state: 'california', full_location: 'Los Angeles, California' }},

      // Chicago data
      { event: 'page_view_enhanced', data: { location_city: 'chicago', location_state: 'illinois', full_location: 'Chicago, Illinois' }},
      { event: 'booking_attempt', data: { location_city: 'chicago', location_state: 'illinois', full_location: 'Chicago, Illinois' }},
      { event: 'booking_completed', data: { location_city: 'chicago', location_state: 'illinois', full_location: 'Chicago, Illinois' }},
      { event: 'phone_call_attempt', data: { location_city: 'chicago', location_state: 'illinois', full_location: 'Chicago, Illinois' }}
    ];

    sampleEvents.forEach(event => this.storeEvent(event));
    console.log('Sample analytics data generated');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocalAnalyticsStorage;
} else {
  window.LocalAnalyticsStorage = LocalAnalyticsStorage;
}