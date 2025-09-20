# Google Sheets 404/410 Tracking Setup

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet named "A Bedder World - Error Tracking"
3. Create two tabs:
   - **404 Errors**
   - **410 Gone**

## Step 2: Set up Headers

In both tabs, add these headers in row 1:
- A1: Timestamp
- B1: URL
- C1: Referrer
- D1: User Agent
- E1: Error Type

## Step 3: Create Google Apps Script

1. In your Google Sheet, go to **Extensions > Apps Script**
2. Replace the default code with this:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet();

    // Determine which tab to use based on error type
    const sheetName = data.errorType === '404' ? '404 Errors' : '410 Gone';
    const targetSheet = sheet.getSheetByName(sheetName);

    if (!targetSheet) {
      throw new Error(`Sheet ${sheetName} not found`);
    }

    // Add new row with data
    targetSheet.appendRow([
      data.timestamp,
      data.url,
      data.referrer,
      data.userAgent,
      data.errorType
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.error('Error:', error);
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({status: 'GET request received'}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Step 4: Deploy the Script

1. Click **Deploy > New deployment**
2. Choose **Web app** as the type
3. Set **Execute as**: Me
4. Set **Who has access**: Anyone
5. Click **Deploy**
6. Copy the **Web app URL** (it looks like: `https://script.google.com/macros/s/SCRIPT_ID/exec`)

## Step 5: Update Website Code

Replace `YOUR_SCRIPT_ID` in both 404.njk and 410.njk files with your actual script URL:

```javascript
const sheetWebhookUrl = 'https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec';
```

## Step 6: Test the System

1. Visit a non-existent URL on your site (e.g., `/test-404`)
2. Check the browser console for debug messages
3. Check your Google Sheet - you should see a new row added
4. Test 410 page by visiting `/410.html`

## What You'll Track

**404 Errors Tab:**
- Every broken URL people try to access
- Where they came from (referrer)
- When it happened
- Browser information

**410 Gone Tab:**
- URLs that hit permanently removed content
- Same detailed tracking as 404s

## Using the Data

1. **Weekly Review**: Check new entries to identify patterns
2. **Redirect Creation**: Use broken URLs to create new redirects
3. **Link Fixing**: Use referrer data to find pages with broken links
4. **SEO Monitoring**: Track which external sites link to broken pages

## Troubleshooting

- If data isn't appearing, check browser console for errors
- Verify the script URL is correct in both 404.njk and 410.njk
- Make sure Google Apps Script permissions are set correctly
- Test the script URL directly in a browser - you should see a JSON response

## Fallback System

If Google Sheets fails, data is automatically stored in browser localStorage:
- 404 errors: `localStorage.getItem('404-errors')`
- 410 errors: `localStorage.getItem('410-errors')`

You can export this data manually if needed.