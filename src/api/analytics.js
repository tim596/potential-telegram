/**
 * Analytics API Endpoint for A Bedder World
 * Stores booking events and provides dashboard data
 */

const fs = require('fs').promises;
const path = require('path');

// Path to analytics data directory
const ANALYTICS_DATA_DIR = path.join(__dirname, '../../_data/analytics');

// Ensure data directory exists
async function ensureDataDirectory() {
  try {
    await fs.mkdir(ANALYTICS_DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create analytics data directory:', error);
  }
}

// Store analytics event
async function storeEvent(eventData) {
  await ensureDataDirectory();

  const timestamp = new Date().toISOString();
  const dateString = timestamp.split('T')[0];
  const filePath = path.join(ANALYTICS_DATA_DIR, `events-${dateString}.json`);

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

  return { success: true, timestamp };
}

// Get booking funnel data
async function getBookingFunnelData(days = 30) {
  const events = await getEventsForPeriod(days);

  let bookingAttempts = 0;
  let bookingCompletions = 0;

  events.forEach(event => {
    if (event.event === 'booking_attempt') {
      bookingAttempts++;
    } else if (event.event === 'booking_completed') {
      bookingCompletions++;
    }
  });

  // Previous period for comparison
  const previousEvents = await getEventsForPeriod(days, days);
  let previousAttempts = 0;
  let previousCompletions = 0;

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

// Get events for a specific period with offset
async function getEventsForPeriod(days = 30, offsetDays = 0) {
  const events = [];
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - offsetDays);

  for (let i = 0; i < days; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const filePath = path.join(ANALYTICS_DATA_DIR, `events-${dateString}.json`);

    try {
      const dayEvents = await fs.readFile(filePath, 'utf8');
      events.push(...JSON.parse(dayEvents));
    } catch (error) {
      // File doesn't exist for this day, continue
    }
  }

  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// Main handler function
async function handler(event, context) {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod === 'POST') {
      // Store analytics event
      const eventData = JSON.parse(event.body);
      const result = await storeEvent(eventData);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    }
    else if (event.httpMethod === 'GET') {
      const path = event.path || '';

      if (path.includes('/booking-funnel')) {
        // Get booking funnel data
        const days = parseInt(event.queryStringParameters?.days) || 30;
        const funnelData = await getBookingFunnelData(days);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(funnelData)
        };
      } else {
        // Default analytics summary
        const events = await getEventsForPeriod(30);
        const summary = {
          total_events: events.length,
          booking_attempts: events.filter(e => e.event === 'booking_attempt').length,
          booking_completions: events.filter(e => e.event === 'booking_completed').length,
          phone_calls: events.filter(e => e.event === 'phone_call_attempt').length
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(summary)
        };
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Analytics API error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}

// For local development
if (require.main === module) {
  // Simple local server for testing
  const http = require('http');

  const server = http.createServer(async (req, res) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      const event = {
        httpMethod: req.method,
        path: req.url,
        body: body,
        queryStringParameters: {}
      };

      const result = await handler(event, {});

      res.writeHead(result.statusCode, result.headers);
      res.end(result.body);
    });
  });

  server.listen(3001, () => {
    console.log('Analytics API running on http://localhost:3001');
  });
}

module.exports = { handler };