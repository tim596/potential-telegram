# Analytics Email Reports Setup

## Overview

This system replaces the web-based analytics dashboard with automated email reports to solve performance issues. Two Netlify scheduled functions send daily and weekly analytics reports via SendGrid.

## Environment Variables Required

Set these in your Netlify dashboard under Site Settings > Environment Variables:

### Google Search Console API
```
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
GOOGLE_PROJECT_ID=a-bedder-world-analytics
```

### SendGrid Email Service
```
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=reports@abedderworld.com
ANALYTICS_EMAIL_RECIPIENT=your-email@domain.com
```

## Report Schedule

- **Daily Report**: Every day at 8:00 AM (0 8 * * *)
  - Top 10 performing cities from yesterday
  - Cities needing attention
  - Daily metrics summary

- **Weekly Report**: Every Monday at 9:00 AM (0 9 * * 1)
  - All 789+ cities with full analytics
  - Week-over-week comparisons
  - CSV attachment with complete data
  - Top performers and biggest movers

## Functions

1. `daily-analytics-report.js` - Sends concise daily summary
2. `weekly-analytics-report.js` - Sends comprehensive weekly report with CSV

## Testing Functions Locally

```bash
# Install dependencies
npm install

# Test daily report (requires env vars)
netlify functions:invoke daily-analytics-report

# Test weekly report (requires env vars)
netlify functions:invoke weekly-analytics-report
```

## Email Templates

Both functions include responsive HTML email templates with:
- A Bedder World branding (#a6ce39 green)
- Performance metrics and city rankings
- Error handling with notification emails
- Professional styling for business use

## Error Handling

- All failures send error notification emails
- Detailed logging for troubleshooting
- Graceful fallbacks for missing data
- Separate error notifications per report type