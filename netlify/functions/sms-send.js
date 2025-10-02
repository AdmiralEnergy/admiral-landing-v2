const crypto = require('crypto');

// Message templates
const TEMPLATES = {
  WELCOME: "Admiral Energy: got your request. Duke closed 1:1 net metering—rebates can still cut your bill.\nUpload your Duke bill (60s): {{link}}\nSTOP to opt out.",
  
  NUDGE_4H: "Quick nudge—still want the rebate check?\nUpload your bill: {{link}}\nSTOP to opt out.",
  
  CONFIRM_APPT: "You're set for {{datetime}}. Bring a recent Duke bill.\nReschedule: {{calendly_reschedule}}\nSTOP to opt out.",
  
  MISSED: "Missed you. Want a new time or just text questions here?\nRebook: {{link}}\nSTOP to opt out.",
  
  WINBACK_30D: "Duke rates creeping up again. PowerPair + 30% ITC still live.\nWant a quick bill check? {{link}}\nSTOP to opt out."
};

// Rate limiting storage (in production, use Redis or similar)
const rateLimitStore = new Map();

// Opt-out storage (in production, use proper database)
const optOutStore = new Map();

exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { to, body, mediaUrl, leadId, template } = JSON.parse(event.body);

    // Validate required parameters
    if (!to || !body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters: to, body' })
      };
    }

    // Validate Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

    if (!accountSid || !authToken || !messagingServiceSid) {
      console.error('Missing Twilio credentials');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'SMS service not configured' })
      };
    }

    // Normalize phone number to E.164 format
    const normalizedPhone = normalizePhoneNumber(to);
    if (!normalizedPhone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid phone number format' })
      };
    }

    // Check opt-out status
    const phoneHash = hashPhone(normalizedPhone);
    if (isOptedOut(phoneHash)) {
      console.log(`SMS blocked: ${phoneHash} has opted out`);
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: false, 
          message: 'Number has opted out',
          blocked: true 
        })
      };
    }

    // Rate limiting check
    if (!rateLimitCheck(leadId, phoneHash)) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Rate limit exceeded' })
      };
    }

    // Quiet hours check (8am-8pm ET)
    if (!isWithinQuietHours()) {
      console.log('Outside quiet hours, queuing message');
      // In production, implement queue with delayed send
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: true, 
          message: 'Message queued for business hours',
          queued: true,
          sendTime: getNextBusinessHour()
        })
      };
    }

    // Send SMS via Twilio
    const twilio = require('twilio')(accountSid, authToken);
    
    const messageOptions = {
      body: body,
      from: messagingServiceSid, // Use Messaging Service
      to: normalizedPhone
    };

    if (mediaUrl) {
      messageOptions.mediaUrl = [mediaUrl];
    }

    const message = await twilio.messages.create(messageOptions);

    // Log the send (in production, store in database)
    const logData = {
      messageSid: message.sid,
      to: phoneHash, // Store hash, not actual number
      leadId,
      template,
      status: message.status,
      sentAt: new Date().toISOString(),
      direction: 'outbound'
    };
    
    console.log('SMS sent:', JSON.stringify(logData));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        messageSid: message.sid,
        status: message.status,
        sentAt: logData.sentAt
      })
    };

  } catch (error) {
    console.error('SMS send error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to send SMS',
        message: error.message
      })
    };
  }
};

// Helper functions
function normalizePhoneNumber(phone) {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Add country code if missing
  if (digits.length === 10) {
    return '+1' + digits;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return '+' + digits;
  }
  
  return null; // Invalid format
}

function hashPhone(phone) {
  return crypto.createHash('sha256').update(phone).digest('hex').substring(0, 16);
}

function isOptedOut(phoneHash) {
  return optOutStore.has(phoneHash);
}

function rateLimitCheck(leadId, phoneHash) {
  const now = Date.now();
  const key = leadId || phoneHash;
  const lastSent = rateLimitStore.get(key);
  
  // Allow one message per lead per 10 minutes
  if (!lastSent || (now - lastSent) > 10 * 60 * 1000) {
    rateLimitStore.set(key, now);
    return true;
  }
  
  return false;
}

function isWithinQuietHours() {
  const now = new Date();
  const et = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    hour12: false
  });
  
  const etHour = parseInt(et.format(now));
  return etHour >= 8 && etHour < 20; // 8am-8pm ET
}

function getNextBusinessHour() {
  const now = new Date();
  const tomorrow8am = new Date(now);
  tomorrow8am.setDate(tomorrow8am.getDate() + 1);
  tomorrow8am.setHours(8, 0, 0, 0);
  
  // Convert to ET
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(tomorrow8am);
}

// Export for testing
module.exports = {
  handler: exports.handler,
  TEMPLATES,
  normalizePhoneNumber,
  hashPhone,
  isWithinQuietHours
};