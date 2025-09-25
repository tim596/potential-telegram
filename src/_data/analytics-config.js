/**
 * Analytics Configuration
 * Store API keys and settings for the analytics dashboard
 */

module.exports = {
  // Google Analytics Configuration
  ga4: {
    measurement_id: 'G-6FYBM1399X', // Your existing GA4 ID
    api_secret: process.env.GA4_API_SECRET || null, // For server-side events
    debug_mode: process.env.NODE_ENV === 'development'
  },

  // Google Search Console Configuration
  searchConsole: {
    site_url: 'https://abedderworld.com',
    api_key: process.env.GOOGLE_API_KEY || null,
    client_email: process.env.GOOGLE_CLIENT_EMAIL || null,
    private_key: process.env.GOOGLE_PRIVATE_KEY || null
  },

  // Analytics Dashboard Settings
  dashboard: {
    enabled: true,
    update_interval: 300000, // 5 minutes
    data_retention_days: 90,
    max_locations_displayed: 50
  },

  // Tracking Configuration
  tracking: {
    // Events to track automatically
    auto_events: [
      'page_view',
      'scroll_depth',
      'time_on_page',
      'element_visibility',
      'form_interactions',
      'phone_clicks',
      'booking_attempts',
      'booking_completions'
    ],

    // Conversion events
    conversion_events: [
      'booking_attempt',
      'booking_completed',
      'phone_call_attempt',
      'form_submission',
      'booking_form_viewed'
    ],

    // Custom dimensions for enhanced tracking
    custom_dimensions: {
      location_state: 'custom_parameter_1',
      location_city: 'custom_parameter_2',
      page_type: 'custom_parameter_3',
      user_journey_stage: 'custom_parameter_4'
    }
  },

  // Business Intelligence Settings
  business_intelligence: {
    // Ranking monitoring
    ranking_check_frequency: 'daily', // daily, weekly, monthly
    target_keywords_per_location: [
      'mattress removal {city}',
      'mattress disposal {city}',
      'mattress pickup {city}',
      'get rid of mattress {city}',
      'bed removal {city}'
    ],

    // Performance thresholds
    performance_thresholds: {
      good_avg_position: 5,
      acceptable_avg_position: 10,
      poor_avg_position: 20,
      min_conversion_rate: 2.0,
      good_conversion_rate: 5.0
    },

    // Opportunity identification
    opportunity_criteria: {
      max_position_for_opportunity: 20,
      min_position_for_opportunity: 4,
      min_estimated_traffic_gain: 50
    }
  },

  // Location Data Integration
  locations: {
    data_source: 'eleventy_collections', // How to get location data
    priority_tiers: {
      tier_1: ['houston', 'los-angeles', 'chicago', 'new-york-city', 'phoenix'],
      tier_2: ['dallas', 'san-antonio', 'philadelphia', 'san-diego', 'denver'],
      tier_3: [] // All others
    }
  },

  // Export and Reporting
  reporting: {
    formats: ['json', 'csv', 'pdf'],
    scheduled_reports: {
      weekly_summary: true,
      monthly_detailed: true,
      quarterly_business_review: true
    },
    email_reports: {
      enabled: false, // Set to true when email service is configured
      recipients: ['admin@abedderworld.com'],
      frequency: 'weekly'
    }
  }
};