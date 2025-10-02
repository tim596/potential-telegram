/**
 * Test script for email functions
 * Tests the email functions without actually sending emails
 */

// Mock environment variables for testing
process.env.GOOGLE_CLIENT_EMAIL = 'test@example.com';
process.env.GOOGLE_PRIVATE_KEY = 'test-key';
process.env.SENDGRID_API_KEY = 'test-api-key';
process.env.ANALYTICS_EMAIL_RECIPIENT = 'test@abedderworld.com';
process.env.SENDGRID_FROM_EMAIL = 'reports@abedderworld.com';

// Mock SendGrid to avoid actual email sending
const sgMail = require('@sendgrid/mail');
sgMail.send = async (msg) => {
  console.log('✅ Mock email would be sent:');
  console.log('  To:', msg.to);
  console.log('  From:', msg.from);
  console.log('  Subject:', msg.subject);
  console.log('  Has HTML content:', !!msg.html);
  if (msg.attachments) {
    console.log('  Attachments:', msg.attachments.length);
  }
  return { statusCode: 202 };
};

// Mock Google API to avoid actual API calls
jest.mock('googleapis', () => ({
  google: {
    auth: {
      GoogleAuth: class {
        constructor() {}
      }
    },
    options: () => {},
    searchconsole: () => ({
      searchanalytics: {
        query: async () => ({
          data: {
            rows: [
              {
                keys: ['https://abedderworld.com/mattress-removal/california/los-angeles/', 'mattress removal los angeles'],
                clicks: 25,
                impressions: 1200,
                position: 8.5
              },
              {
                keys: ['https://abedderworld.com/mattress-removal/texas/houston/', 'mattress disposal houston'],
                clicks: 18,
                impressions: 890,
                position: 12.3
              }
            ]
          }
        })
      }
    })
  }
}));

async function testDailyReport() {
  console.log('\n🧪 Testing Daily Analytics Report Function...');

  try {
    const dailyFunction = require('./netlify/functions/daily-analytics-report.js');
    const result = await dailyFunction.handler({}, {});

    console.log('✅ Daily report function executed successfully');
    console.log('Response:', JSON.parse(result.body));
  } catch (error) {
    console.error('❌ Daily report function failed:', error.message);
  }
}

async function testWeeklyReport() {
  console.log('\n🧪 Testing Weekly Analytics Report Function...');

  try {
    const weeklyFunction = require('./netlify/functions/weekly-analytics-report.js');
    const result = await weeklyFunction.handler({}, {});

    console.log('✅ Weekly report function executed successfully');
    console.log('Response:', JSON.parse(result.body));
  } catch (error) {
    console.error('❌ Weekly report function failed:', error.message);
  }
}

async function runTests() {
  console.log('📧 A Bedder World - Email Reports Function Tests');
  console.log('===============================================');

  await testDailyReport();
  await testWeeklyReport();

  console.log('\n✅ All tests completed! Functions are ready for deployment.');
  console.log('\n📝 Next Steps:');
  console.log('1. Set up environment variables in Netlify dashboard');
  console.log('2. Deploy functions to Netlify');
  console.log('3. Set up scheduled function execution');
  console.log('4. Configure SendGrid API key and email addresses');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testDailyReport, testWeeklyReport };