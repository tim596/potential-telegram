/**
 * A Bedder World Analytics - Enhanced GA4 Tracking
 * Tracks location-specific conversions, user behavior, and business intelligence
 */

class BedderWorldAnalytics {
  constructor() {
    this.debug = window.location.hostname === 'localhost';
    this.locationData = this.extractLocationData();
    this.init();
  }

  init() {
    // Initialize GA4 if not already loaded
    if (typeof gtag === 'undefined') {
      console.warn('Google Analytics not loaded');
      return;
    }

    // Set up custom dimensions for location tracking
    this.setupCustomDimensions();

    // Track page view with location data
    this.trackLocationPageView();

    // Set up event listeners for conversions
    this.setupConversionTracking();

    // Set up user behavior tracking
    this.setupBehaviorTracking();

    // Track scroll depth and engagement
    this.setupEngagementTracking();
  }

  extractLocationData() {
    const path = window.location.pathname;
    const locationMatch = path.match(/mattress-removal\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/);

    if (!locationMatch) {
      return {
        page_type: 'general',
        state: null,
        city: null,
        suburb: null,
        page_level: 'general',
        full_location: null,
        page_path: path,
        page_title: document.title
      };
    }

    const state = locationMatch[1];
    const city = locationMatch[2];
    const suburb = locationMatch[3] || null;
    const page_level = suburb ? 'suburb' : 'city';

    // Build full location string
    let full_location;
    if (suburb) {
      full_location = `${suburb}, ${city}, ${state}`;
    } else {
      full_location = `${city}, ${state}`;
    }

    return {
      page_type: 'location',
      state: state,
      city: city,
      suburb: suburb,
      page_level: page_level,
      full_location: full_location,
      page_path: path,
      page_title: document.title
    };
  }

  setupCustomDimensions() {
    // Set custom dimensions for enhanced reporting
    gtag('config', 'GA_MEASUREMENT_ID', {
      custom_map: {
        'custom_parameter_1': 'location_state',
        'custom_parameter_2': 'location_city',
        'custom_parameter_3': 'location_suburb',
        'custom_parameter_4': 'page_level'
      }
    });
  }

  trackLocationPageView() {
    const eventData = {
      page_title: this.locationData.page_title,
      page_location: window.location.href,
      location_state: this.locationData.state,
      location_city: this.locationData.city,
      location_suburb: this.locationData.suburb,
      page_level: this.locationData.page_level,
      page_type: this.locationData.page_type
    };

    gtag('event', 'page_view_enhanced', eventData);

    if (this.debug) {
      console.log('Location Page View Tracked:', eventData);
    }
  }

  setupConversionTracking() {
    // Track booking form views (when user opens Zenbooker)
    this.trackElementVisibility('.zenbooker-inline-button', 'booking_form_viewed');

    // Track book online button clicks
    document.querySelectorAll('[href*="book"], [href*="zenbooker"], .book-button, .cta-button').forEach(button => {
      button.addEventListener('click', (e) => {
        this.trackConversion('booking_attempt', {
          button_text: button.textContent.trim(),
          button_location: this.getElementLocation(button)
        });
      });
    });

    // Track phone number clicks
    document.querySelectorAll('[href^="tel:"]').forEach(phoneLink => {
      phoneLink.addEventListener('click', (e) => {
        this.trackConversion('phone_call_attempt', {
          phone_number: phoneLink.href.replace('tel:', ''),
          click_location: this.getElementLocation(phoneLink)
        });
      });
    });

    // Track form submissions
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        this.trackConversion('form_submission', {
          form_id: form.id || 'unknown',
          form_location: this.getElementLocation(form)
        });
      });
    });
  }

  trackConversion(event_name, additional_data = {}) {
    const eventData = {
      event_category: 'conversion',
      event_label: this.locationData.full_location || 'general',
      location_state: this.locationData.state,
      location_city: this.locationData.city,
      location_suburb: this.locationData.suburb,
      page_level: this.locationData.page_level,
      page_type: this.locationData.page_type,
      timestamp: new Date().toISOString(),
      ...additional_data
    };

    gtag('event', event_name, eventData);

    // Also send to our custom analytics endpoint
    this.sendToCustomAnalytics(event_name, eventData);

    if (this.debug) {
      console.log(`Conversion Tracked: ${event_name}`, eventData);
    }
  }

  setupBehaviorTracking() {
    let timeOnPage = 0;
    const startTime = Date.now();

    // Track time on page every 15 seconds
    setInterval(() => {
      timeOnPage = Math.round((Date.now() - startTime) / 1000);

      if (timeOnPage % 15 === 0 && timeOnPage > 0) {
        gtag('event', 'time_on_page', {
          event_category: 'engagement',
          event_label: `${timeOnPage}s`,
          value: timeOnPage,
          location_state: this.locationData.state,
          location_city: this.locationData.city,
          location_suburb: this.locationData.suburb,
          page_level: this.locationData.page_level
        });
      }
    }, 1000);

    // Track page abandonment
    window.addEventListener('beforeunload', () => {
      const finalTimeOnPage = Math.round((Date.now() - startTime) / 1000);
      gtag('event', 'page_exit', {
        event_category: 'engagement',
        time_on_page: finalTimeOnPage,
        location_state: this.locationData.state,
        location_city: this.locationData.city,
        location_suburb: this.locationData.suburb,
        page_level: this.locationData.page_level
      });
    });
  }

  setupEngagementTracking() {
    // Track scroll depth
    let maxScrollPercent = 0;
    const scrollThresholds = [25, 50, 75, 90, 100];
    const thresholdsReached = [];

    window.addEventListener('scroll', () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      );

      if (scrollPercent > maxScrollPercent) {
        maxScrollPercent = scrollPercent;

        scrollThresholds.forEach(threshold => {
          if (scrollPercent >= threshold && !thresholdsReached.includes(threshold)) {
            thresholdsReached.push(threshold);

            gtag('event', 'scroll_depth', {
              event_category: 'engagement',
              event_label: `${threshold}%`,
              value: threshold,
              location_state: this.locationData.state,
              location_city: this.locationData.city,
              location_suburb: this.locationData.suburb,
              page_level: this.locationData.page_level
            });
          }
        });
      }
    });

    // Track service area section views
    this.trackElementVisibility('.service-areas', 'service_areas_viewed');
    this.trackElementVisibility('.neighborhoods', 'neighborhoods_viewed');
    this.trackElementVisibility('.faqs', 'faqs_viewed');
    this.trackElementVisibility('.reviews', 'reviews_viewed');
  }

  trackElementVisibility(selector, event_name) {
    const element = document.querySelector(selector);
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gtag('event', event_name, {
            event_category: 'content_interaction',
            location_state: this.locationData.state,
            location_city: this.locationData.city,
            location_suburb: this.locationData.suburb,
            page_level: this.locationData.page_level
          });
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(element);
  }

  getElementLocation(element) {
    const rect = element.getBoundingClientRect();
    return `x:${Math.round(rect.left)},y:${Math.round(rect.top)}`;
  }

  sendToCustomAnalytics(event_name, data) {
    try {
      // Try local storage first for development
      if (typeof LocalAnalyticsStorage !== 'undefined') {
        if (!window.localAnalyticsStorage) {
          window.localAnalyticsStorage = new LocalAnalyticsStorage();
        }
        window.localAnalyticsStorage.storeEvent({
          event: event_name,
          data: data,
          user_agent: navigator.userAgent,
          referrer: document.referrer
        });
      }

      // Also try to send to API endpoint
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event: event_name,
          data: data,
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          referrer: document.referrer
        })
      }).catch(error => {
        if (this.debug) {
          console.log('Custom analytics endpoint not available, using local storage:', error);
        }
      });
    } catch (error) {
      if (this.debug) {
        console.log('Analytics storage failed:', error);
      }
    }
  }

  // Public method to track custom events
  track(event_name, data = {}) {
    this.trackConversion(event_name, data);
  }

  // Get location performance data
  getLocationData() {
    return this.locationData;
  }
}

// Initialize analytics when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.BedderAnalytics = new BedderWorldAnalytics();
});

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BedderWorldAnalytics;
}