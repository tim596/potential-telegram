/**
 * Netlify Scheduled Function: Daily Analytics Report
 * Sends a daily summary email with key metrics and insights
 *
 * Scheduled to run daily at 8:00 AM
 * Schedule: 0 8 * * * (cron format)
 */

const { google } = require('googleapis');
const sgMail = require('@sendgrid/mail');

exports.handler = async (event, context) => {
  console.log('Daily Analytics Report - Starting execution');

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

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get Search Console data for yesterday
    const siteUrl = 'https://abedderworld.com/';
    const response = await searchconsole.searchanalytics.query({
      siteUrl: siteUrl,
      requestBody: {
        startDate: yesterdayStr,
        endDate: yesterdayStr,
        dimensions: ['page'],
        rowLimit: 1000,
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'page',
            operator: 'contains',
            expression: '/mattress-removal/'
          }]
        }]
      }
    });

    // Process data for daily report
    const dailyData = processDailyData(response.data.rows || []);

    // Generate and send email report
    await sendDailyReport(dailyData, yesterdayStr);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Daily analytics report sent successfully',
        date: yesterdayStr,
        citiesProcessed: dailyData.totalCities
      })
    };

  } catch (error) {
    console.error('Daily Analytics Report error:', error);

    // Send error notification email
    await sendErrorNotification('Daily Report', error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Daily report generation failed',
        message: error.message
      })
    };
  }
};

function processDailyData(rows) {
  const locationData = {};
  let totalClicks = 0;
  let totalImpressions = 0;

  rows.forEach(row => {
    const page = row.keys[0];
    const clicks = row.clicks || 0;
    const impressions = row.impressions || 0;
    const position = row.position || 0;

    totalClicks += clicks;
    totalImpressions += impressions;

    // Extract location from URL
    const locationMatch = page.match(/mattress-removal\/([^\/]+)\/([^\/]+)/);
    if (locationMatch) {
      const state = locationMatch[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const city = locationMatch[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const locationKey = `${city}, ${state}`;

      if (!locationData[locationKey]) {
        locationData[locationKey] = {
          clicks: 0,
          impressions: 0,
          position: 0,
          ctr: 0
        };
      }

      locationData[locationKey].clicks += clicks;
      locationData[locationKey].impressions += impressions;
      locationData[locationKey].position = position;
      locationData[locationKey].ctr = impressions > 0 ? (clicks / impressions * 100) : 0;
    }
  });

  // Sort locations by performance (clicks + impression weight)
  const sortedLocations = Object.entries(locationData)
    .map(([location, data]) => ({
      location,
      ...data,
      score: data.clicks * 2 + (data.impressions * 0.01) // Weight clicks more heavily
    }))
    .sort((a, b) => b.score - a.score);

  return {
    totalCities: Object.keys(locationData).length,
    totalClicks,
    totalImpressions,
    topPerformers: sortedLocations.slice(0, 10),
    needsAttention: sortedLocations.slice(-5).reverse(), // Bottom 5, but reversed for better readability
    overallCTR: totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0.00'
  };
}

async function sendDailyReport(data, date) {
  const emailSubject = `A Bedder World Daily Analytics - ${formatDate(date)}`;
  const emailBody = generateDailyEmailHTML(data, date);

  try {
    const msg = {
      to: process.env.ANALYTICS_EMAIL_RECIPIENT || 'analytics@abedderworld.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'reports@abedderworld.com',
      subject: emailSubject,
      html: emailBody
    };

    await sgMail.send(msg);
    console.log('Daily analytics report sent successfully');
  } catch (error) {
    console.error('Failed to send daily report email:', error);
    throw error;
  }
}

function generateDailyEmailHTML(data, date) {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #a6ce39; }
    .header h1 { color: #a6ce39; margin: 0; font-size: 24px; }
    .header p { color: #666; margin: 5px 0 0 0; }
    .metric { display: inline-block; text-align: center; margin: 10px 15px; }
    .metric-value { font-size: 24px; font-weight: bold; color: #a6ce39; display: block; }
    .metric-label { color: #666; font-size: 12px; text-transform: uppercase; }
    .section { margin: 25px 0; }
    .section h3 { color: #333; margin-bottom: 15px; font-size: 18px; }
    .city-list { background: #f9f9f9; padding: 15px; border-radius: 6px; }
    .city-item { margin: 8px 0; padding: 8px; background: white; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; }
    .city-name { font-weight: bold; color: #333; }
    .city-metrics { font-size: 12px; color: #666; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>A Bedder World</h1>
      <p>Daily Analytics Summary - ${formatDate(date)}</p>
    </div>

    <div class="section">
      <div style="text-align: center; margin-bottom: 20px;">
        <div class="metric">
          <span class="metric-value">${data.totalCities}</span>
          <span class="metric-label">Cities Tracked</span>
        </div>
        <div class="metric">
          <span class="metric-value">${data.totalClicks}</span>
          <span class="metric-label">Total Clicks</span>
        </div>
        <div class="metric">
          <span class="metric-value">${data.totalImpressions}</span>
          <span class="metric-label">Total Impressions</span>
        </div>
        <div class="metric">
          <span class="metric-value">${data.overallCTR}%</span>
          <span class="metric-label">Average CTR</span>
        </div>
      </div>
    </div>

    <div class="section">
      <h3>🏆 Top Performers Yesterday</h3>
      <div class="city-list">
        ${data.topPerformers.map((city, index) => `
          <div class="city-item">
            <span class="city-name">#${index + 1} ${city.location}</span>
            <span class="city-metrics">${city.clicks} clicks, ${city.impressions} impressions, Pos: ${city.position.toFixed(1)}</span>
          </div>
        `).join('')}
      </div>
    </div>

    ${data.needsAttention.length > 0 ? `
    <div class="section">
      <h3>⚠️ Needs Attention</h3>
      <div class="city-list">
        ${data.needsAttention.map(city => `
          <div class="city-item">
            <span class="city-name">${city.location}</span>
            <span class="city-metrics">${city.clicks} clicks, ${city.impressions} impressions, Pos: ${city.position.toFixed(1)}</span>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p>A Bedder World Analytics • Generated ${new Date().toLocaleString()}</p>
      <p>This report covers data from ${formatDate(date)}</p>
    </div>
  </div>
</body>
</html>
  `;
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}