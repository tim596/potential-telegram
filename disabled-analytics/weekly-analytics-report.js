/**
 * Netlify Scheduled Function: Weekly Analytics Report
 * Sends a comprehensive weekly analytics report with full city data
 *
 * Scheduled to run weekly on Mondays at 9:00 AM
 * Schedule: 0 9 * * 1 (cron format)
 */

const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  console.log('Weekly Analytics Report - Starting execution');

  try {
    // Initialize SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // Configure Google Auth
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        project_id: process.env.GOOGLE_PROJECT_ID || 'a-bedder-world-analytics'
      },
      scopes: [
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/analytics.readonly'
      ]
    });

    google.options({ auth });
    const searchconsole = google.searchconsole('v1');

    // Get date range for last week (Monday to Sunday)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 1); // Yesterday
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // 7 days ago

    const endDateStr = endDate.toISOString().split('T')[0];
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get previous week's data for comparison
    const prevWeekEnd = new Date();
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 8); // 8 days ago
    const prevWeekStart = new Date();
    prevWeekStart.setDate(prevWeekStart.getDate() - 14); // 14 days ago

    const prevWeekEndStr = prevWeekEnd.toISOString().split('T')[0];
    const prevWeekStartStr = prevWeekStart.toISOString().split('T')[0];

    // Get current week data
    const siteUrl = 'https://abedderworld.com/';
    const currentWeekResponse = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: startDateStr,
        endDate: endDateStr,
        dimensions: ['page', 'query'],
        rowLimit: 5000,
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            operator: 'contains',
            expression: '/mattress-removal/'
          }]
        }]
      }
    });

    // Get previous week data for comparison
    const previousWeekResponse = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: prevWeekStartStr,
        endDate: prevWeekEndStr,
        dimensions: ['page'],
        rowLimit: 5000,
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            operator: 'contains',
            expression: '/mattress-removal/'
          }]
        }]
      }
    });

    // Process data for weekly report
    const weeklyData = processWeeklyData(
      currentWeekResponse.data.rows || [],
      previousWeekResponse.data.rows || []
    );

    // Generate CSV data
    const csvData = generateCSVData(weeklyData.allCities);

    // Generate and send email report
    await sendWeeklyReport(weeklyData, csvData, startDateStr, endDateStr);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Weekly analytics report sent successfully',
        weekPeriod: `${startDateStr} to ${endDateStr}`,
        citiesProcessed: weeklyData.allCities.length
      })
    };

  } catch (error) {
    console.error('Weekly Analytics Report error:', error);

    // Send error notification email
    await sendErrorNotification('Weekly Report', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Weekly report generation failed',
        message: error.message
      })
    };
  }
};

function processWeeklyData(currentWeekRows, previousWeekRows) {
  const currentWeekData = {};
  const previousWeekData = {};

  // Process current week data
  let totalCurrentClicks = 0;
  let totalCurrentImpressions = 0;

  currentWeekRows.forEach(row => {
    const page = row.keys[0];
    const clicks = row.clicks || 0;
    const impressions = row.impressions || 0;
    const position = row.position || 0;

    totalCurrentClicks += clicks;
    totalCurrentImpressions += impressions;

    const locationMatch = page.match(/mattress-removal\/([^\/]+)\/([^\/]+)/);
    if (locationMatch) {
      const state = locationMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const city = locationMatch[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const locationKey = `${city}, ${state}`;

      if (!currentWeekData[locationKey]) {
        currentWeekData[locationKey] = {
          clicks: 0,
          impressions: 0,
          position: 0,
          ctr: 0,
          queries: []
        };
      }

      currentWeekData[locationKey].clicks += clicks;
      currentWeekData[locationKey].impressions += impressions;
      currentWeekData[locationKey].position = position;

      // Add query data if available
      if (row.keys[1]) {
        currentWeekData[locationKey].queries.push({
          query: row.keys[1],
          clicks: clicks,
          impressions: impressions,
          position: position
        });
      }
    }
  });

  // Process previous week data
  previousWeekRows.forEach(row => {
    const page = row.keys[0];
    const clicks = row.clicks || 0;
    const impressions = row.impressions || 0;

    const locationMatch = page.match(/mattress-removal\/([^\/]+)\/([^\/]+)/);
    if (locationMatch) {
      const state = locationMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const city = locationMatch[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const locationKey = `${city}, ${state}`;

      if (!previousWeekData[locationKey]) {
        previousWeekData[locationKey] = {
          clicks: 0,
          impressions: 0
        };
      }

      previousWeekData[locationKey].clicks += clicks;
      previousWeekData[locationKey].impressions += impressions;
    }
  });

  // Calculate CTR for current week
  Object.keys(currentWeekData).forEach(location => {
    const data = currentWeekData[location];
    data.ctr = data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0;
  });

  // Combine and analyze data
  const allCities = Object.entries(currentWeekData).map(([location, current]) => {
    const previous = previousWeekData[location] || { clicks: 0, impressions: 0 };

    return {
      location,
      currentClicks: current.clicks,
      currentImpressions: current.impressions,
      currentPosition: current.position,
      currentCTR: current.ctr,
      previousClicks: previous.clicks,
      previousImpressions: previous.impressions,
      clicksChange: current.clicks - previous.clicks,
      impressionsChange: current.impressions - previous.impressions,
      queries: current.queries.slice(0, 5), // Top 5 queries per city
      score: current.clicks * 2 + (current.impressions * 0.01)
    };
  }).sort((a, b) => b.score - a.score);

  // Get top and bottom performers
  const topPerformers = allCities.slice(0, 25);
  const needsAttention = allCities.slice(-25).reverse();

  // Get biggest movers (by clicks change)
  const biggestGainers = [...allCities].sort((a, b) => b.clicksChange - a.clicksChange).slice(0, 10);
  const biggestLosers = [...allCities].sort((a, b) => a.clicksChange - b.clicksChange).slice(0, 10);

  return {
    totalCities: allCities.length,
    totalCurrentClicks,
    totalCurrentImpressions,
    overallCTR: totalCurrentImpressions > 0 ? (totalCurrentClicks / totalCurrentImpressions * 100).toFixed(2) : '0.00',
    allCities,
    topPerformers,
    needsAttention,
    biggestGainers,
    biggestLosers
  };
}

function generateCSVData(cities) {
  const headers = [
    'Location',
    'Current Clicks',
    'Current Impressions',
    'Current Position',
    'Current CTR (%)',
    'Previous Clicks',
    'Previous Impressions',
    'Clicks Change',
    'Impressions Change',
    'Top Query',
    'Score'
  ];

  const rows = cities.map(city => [
    city.location,
    city.currentClicks,
    city.currentImpressions,
    city.currentPosition.toFixed(1),
    city.currentCTR.toFixed(2),
    city.previousClicks,
    city.previousImpressions,
    city.clicksChange,
    city.impressionsChange,
    city.queries.length > 0 ? city.queries[0].query : '',
    city.score.toFixed(2)
  ]);

  return [headers, ...rows].map(row =>
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n');
}

async function sendWeeklyReport(data, csvData, startDate, endDate) {
  const emailSubject = `A Bedder World Weekly Analytics - Week of ${formatDate(startDate)}`;
  const emailBody = generateWeeklyEmailHTML(data, startDate, endDate);

  try {
    const msg = {
      to: process.env.ANALYTICS_EMAIL_RECIPIENT || 'analytics@abedderworld.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'reports@abedderworld.com',
      subject: emailSubject,
      html: emailBody,
      attachments: [{
        filename: `weekly-analytics-${startDate}.csv`,
        content: Buffer.from(csvData, 'utf8').toString('base64'),
        type: 'text/csv',
        disposition: 'attachment'
      }]
    };

    await sgMail.send(msg);
    console.log('Weekly analytics report sent successfully with CSV attachment');
  } catch (error) {
    console.error('Failed to send weekly report email:', error);
    throw error;
  }
}

function generateWeeklyEmailHTML(data, startDate, endDate) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #a6ce39; }
    .header h1 { color: #a6ce39; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0 0 0; }
    .metrics-grid { display: flex; justify-content: space-around; margin: 25px 0; flex-wrap: wrap; }
    .metric { text-align: center; margin: 10px; }
    .metric-value { font-size: 32px; font-weight: bold; color: #a6ce39; display: block; }
    .metric-label { color: #666; font-size: 14px; text-transform: uppercase; margin-top: 5px; }
    .section { margin: 30px 0; }
    .section h3 { color: #333; margin-bottom: 15px; font-size: 20px; border-bottom: 2px solid #f0f0f0; padding-bottom: 5px; }
    .city-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px; }
    .city-card { background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #a6ce39; }
    .city-name { font-weight: bold; color: #333; font-size: 16px; margin-bottom: 8px; }
    .city-metrics { font-size: 13px; color: #666; line-height: 1.4; }
    .change-positive { color: #10b981; font-weight: bold; }
    .change-negative { color: #ef4444; font-weight: bold; }
    .change-neutral { color: #6b7280; }
    .attachment-notice { background: #e0f2fe; padding: 15px; border-radius: 6px; margin: 20px 0; text-align: center; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>A Bedder World</h1>
      <p>Weekly Analytics Report - ${formatDate(startDate)} to ${formatDate(endDate)}</p>
    </div>

    <div class="metrics-grid">
      <div class="metric">
        <span class="metric-value">${data.totalCities}</span>
        <span class="metric-label">Cities Tracked</span>
      </div>
      <div class="metric">
        <span class="metric-value">${data.totalCurrentClicks}</span>
        <span class="metric-label">Total Clicks</span>
      </div>
      <div class="metric">
        <span class="metric-value">${data.totalCurrentImpressions}</span>
        <span class="metric-label">Total Impressions</span>
      </div>
      <div class="metric">
        <span class="metric-value">${data.overallCTR}%</span>
        <span class="metric-label">Average CTR</span>
      </div>
    </div>

    <div class="attachment-notice">
      📊 <strong>Complete Data Available:</strong> Check the attached CSV file for all ${data.totalCities} cities with full metrics
    </div>

    <div class="section">
      <h3>🏆 Top 10 Performing Cities</h3>
      <div class="city-grid">
        ${data.topPerformers.slice(0, 10).map((city, index) => `
          <div class="city-card">
            <div class="city-name">#${index + 1} ${city.location}</div>
            <div class="city-metrics">
              Clicks: ${city.currentClicks} ${formatChange(city.clicksChange)} •
              Position: ${city.currentPosition.toFixed(1)} •
              CTR: ${city.currentCTR.toFixed(2)}%<br>
              ${city.queries.length > 0 ? `Top Query: "${city.queries[0].query}"` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <h3>📈 Biggest Gainers This Week</h3>
      <div class="city-grid">
        ${data.biggestGainers.slice(0, 8).map(city => `
          <div class="city-card">
            <div class="city-name">${city.location}</div>
            <div class="city-metrics">
              Clicks: ${city.currentClicks} <span class="change-positive">(+${city.clicksChange})</span><br>
              Position: ${city.currentPosition.toFixed(1)} •
              CTR: ${city.currentCTR.toFixed(2)}%
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="section">
      <h3>⚠️ Needs Attention (Bottom 8)</h3>
      <div class="city-grid">
        ${data.needsAttention.slice(0, 8).map(city => `
          <div class="city-card">
            <div class="city-name">${city.location}</div>
            <div class="city-metrics">
              Clicks: ${city.currentClicks} ${formatChange(city.clicksChange)} •
              Position: ${city.currentPosition.toFixed(1)} •
              CTR: ${city.currentCTR.toFixed(2)}%<br>
              <em>Consider content optimization or link building</em>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="footer">
      <p><strong>A Bedder World Analytics</strong> • Generated ${new Date().toLocaleString()}</p>
      <p>Report covers: ${formatDate(startDate)} to ${formatDate(endDate)}</p>
      <p>📎 Full dataset attached as CSV file</p>
    </div>
  </div>
</body>
</html>
  `;
}

function formatChange(change) {
  if (change > 0) {
    return `<span class="change-positive">(+${change})</span>`;
  } else if (change < 0) {
    return `<span class="change-negative">(${change})</span>`;
  } else {
    return `<span class="change-neutral">(0)</span>`;
  }
}

async function sendErrorNotification(reportType, errorMessage) {
  console.error(`${reportType} Error Notification:`, errorMessage);

  try {
    const msg = {
      to: process.env.ANALYTICS_EMAIL_RECIPIENT || 'analytics@abedderworld.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'reports@abedderworld.com',
      subject: `A Bedder World ${reportType} - ERROR`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Analytics Report Error</h2>
          <p><strong>Report Type:</strong> ${reportType}</p>
          <p><strong>Error Message:</strong> ${errorMessage}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p>Please check the function logs for more details.</p>
        </div>
      `
    };

    await sgMail.send(msg);
  } catch (emailError) {
    console.error('Failed to send error notification email:', emailError);
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}