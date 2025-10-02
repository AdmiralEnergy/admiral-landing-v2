const crypto = require('crypto');

// Opt-out storage (in production, use proper database)
const optOutStore = new Map();

// Auto-responses for keywords
const KEYWORD_RESPONSES = {
  'QUOTE': "Thanks for your interest! Upload your Duke bill for a personalized quote: {{upload_link}}",
  'REBATE': "Duke PowerPair offers up to $9,000 in rebates + 30% federal tax credit! Get your quote: {{upload_link}}",
  'BOOK': "Ready to schedule? Book your free consultation: {{calendly_link}}",
  'HELP': "Admiral Energy Help: Reply STOP to opt out, QUOTE for pricing, BOOK to schedule. Call (704) 555-0123 for immediate assistance."
};

const STOP_KEYWORDS = ['STOP', 'STOPALL', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'];

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse Twilio webhook payload (application/x-www-form-urlencoded)
    const body = parseFormData(event.body);
    
    const {
      From: from,
      To: to,
      Body: messageBody,
      MessageSid: messageSid,
      AccountSid: accountSid,
      NumMedia: numMedia
    } = body;

    // Log incoming message
    console.log('Inbound SMS received:', {
      from: hashPhone(from),
      to,
      body: messageBody,
      messageSid,
      timestamp: new Date().toISOString()
    });

    // Validate Twilio signature (in production)
    // if (!validateTwilioSignature(event)) {
    //   return { statusCode: 401, body: 'Unauthorized' };
    // }

    const phoneHash = hashPhone(from);
    const messageText = (messageBody || '').trim().toUpperCase();

    // Handle STOP keywords
    if (STOP_KEYWORDS.some(keyword => messageText.includes(keyword))) {
      await handleOptOut(phoneHash, from);
      
      const response = `You've been unsubscribed from Admiral Energy SMS updates. You won't receive further messages. Reply START to opt back in.`;
      
      return twiMLResponse(response);
    }

    // Check if already opted out
    if (isOptedOut(phoneHash)) {
      // Don't respond to opted-out numbers (except START to re-opt-in)
      if (messageText.includes('START')) {
        await handleOptIn(phoneHash, from);
        const response = `Welcome back! You're now opted in to Admiral Energy updates. Reply STOP anytime to opt out.`;
        return twiMLResponse(response);
      }
      
      return twiMLResponse(''); // Silent response for opted-out users
    }

    // Handle keyword auto-responses
    const keywordResponse = getKeywordResponse(messageText);
    if (keywordResponse) {
      return twiMLResponse(keywordResponse);
    }

    // Handle media messages (images of bills, etc.)
    if (numMedia && parseInt(numMedia) > 0) {
      const response = `Thanks for sending your bill! We'll review it and get back to you within 2 hours with your personalized quote. Questions? Reply HELP.`;
      
      // Log media received (in production, process the bill image)
      console.log('Bill image received:', {
        from: phoneHash,
        numMedia,
        messageSid
      });
      
      return twiMLResponse(response);
    }

    // Default response for unrecognized messages
    const defaultResponse = `Thanks for reaching out! For a solar quote, reply QUOTE. To schedule a consultation, reply BOOK. For help, reply HELP. Call (704) 555-0123 for immediate assistance.`;
    
    return twiMLResponse(defaultResponse);

  } catch (error) {
    console.error('Inbound SMS handler error:', error);
    
    // Return empty TwiML to avoid error loops
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/xml' },
      body: '<?xml version="1.0" encoding="UTF-8"?><Response></Response>'
    };
  }
};

// Helper functions
function parseFormData(formData) {
  const params = new URLSearchParams(formData);
  const result = {};
  
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  
  return result;
}

function hashPhone(phone) {
  return crypto.createHash('sha256').update(phone).digest('hex').substring(0, 16);
}

function isOptedOut(phoneHash) {
  return optOutStore.has(phoneHash);
}

async function handleOptOut(phoneHash, phone) {
  optOutStore.set(phoneHash, {
    phone: phone,
    optedOutAt: new Date().toISOString()
  });
  
  // In production, save to database
  console.log('User opted out:', { phoneHash, timestamp: new Date().toISOString() });
}

async function handleOptIn(phoneHash, phone) {
  optOutStore.delete(phoneHash);
  
  // In production, update database
  console.log('User opted back in:', { phoneHash, timestamp: new Date().toISOString() });
}

function getKeywordResponse(messageText) {
  const baseUrl = process.env.APP_BASE_URL || 'https://landing.admiralenergy.ai';
  
  for (const [keyword, template] of Object.entries(KEYWORD_RESPONSES)) {
    if (messageText.includes(keyword)) {
      return template
        .replace('{{upload_link}}', `${baseUrl}/?src=sms&utm_source=sms&utm_campaign=keyword_${keyword.toLowerCase()}`)
        .replace('{{calendly_link}}', 'https://calendly.com/davide-admiralenergy/batterysolar-intro');
    }
  }
  
  return null;
}

function twiMLResponse(message) {
  let twiml = '<?xml version="1.0" encoding="UTF-8"?><Response>';
  
  if (message) {
    // Ensure message is properly escaped for XML
    const escapedMessage = message
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
      
    twiml += `<Message>${escapedMessage}</Message>`;
  }
  
  twiml += '</Response>';
  
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/xml' },
    body: twiml
  };
}

// Twilio signature validation (implement in production)
function validateTwilioSignature(event) {
  // In production, validate the X-Twilio-Signature header
  // using Twilio's webhook signature validation
  return true; // Skip validation for now
}

// Export for testing
module.exports = {
  handler: exports.handler,
  KEYWORD_RESPONSES,
  STOP_KEYWORDS,
  hashPhone,
  parseFormData,
  getKeywordResponse
};