// SMS Campaign Logic and Trigger Handler

const TEMPLATES = {
  WELCOME: "Admiral Energy: got your request. Duke closed 1:1 net metering—rebates can still cut your bill.\nUpload your Duke bill (60s): {{link}}\nSTOP to opt out.",
  
  NUDGE_4H: "Quick nudge—still want the rebate check?\nUpload your bill: {{link}}\nSTOP to opt out.",
  
  CONFIRM_APPT: "You're set for {{datetime}}. Bring a recent Duke bill.\nReschedule: {{calendly_reschedule}}\nSTOP to opt out.",
  
  MISSED: "Missed you. Want a new time or just text questions here?\nRebook: {{link}}\nSTOP to opt out.",
  
  WINBACK_30D: "Duke rates creeping up again. PowerPair + 30% ITC still live.\nWant a quick bill check? {{link}}\nSTOP to opt out."
};

// Track sent messages to prevent duplicates
const sentMessages = new Map();

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
    const { event: eventType, lead_id, phone, utm, calendlyStatus, datetime, firstName } = JSON.parse(event.body);

    // Validate required parameters
    if (!eventType || !lead_id || !phone) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters: event, lead_id, phone' })
      };
    }

    // Generate deduplication key
    const dedupeKey = `${lead_id}_${eventType}`;
    
    // Check for duplicate sends
    if (sentMessages.has(dedupeKey)) {
      console.log(`Duplicate message blocked: ${dedupeKey}`);
      return {
        statusCode: 200,
        body: JSON.stringify({ 
          success: false, 
          message: 'Duplicate message blocked',
          blocked: true 
        })
      };
    }

    // Process the event
    let messageBody = '';
    let templateName = '';
    
    switch (eventType) {
      case 'lead_opted_in':
        messageBody = TEMPLATES.WELCOME;
        templateName = 'WELCOME';
        break;
        
      case 'no_upload_nudge':
        messageBody = TEMPLATES.NUDGE_4H;
        templateName = 'NUDGE_4H';
        break;
        
      case 'appt_booked':
        messageBody = TEMPLATES.CONFIRM_APPT;
        templateName = 'CONFIRM_APPT';
        break;
        
      case 'no_show':
        messageBody = TEMPLATES.MISSED;
        templateName = 'MISSED';
        break;
        
      case 'winback_30d':
        messageBody = TEMPLATES.WINBACK_30D;
        templateName = 'WINBACK_30D';
        break;
        
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Unknown event type' })
        };
    }

    // Generate UTM-enhanced links
    const baseUrl = process.env.APP_BASE_URL || 'https://landing.admiralenergy.ai';
    const utmParams = utm ? `&${Object.entries(utm).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join('&')}` : '';
    const link = `${baseUrl}/?src=sms&utm_source=sms&utm_campaign=${eventType}&lead_id=${lead_id}${utmParams}`;
    const calendlyRescheduleLink = `https://calendly.com/davide-admiralenergy/batterysolar-intro?hide_event_type_details=1&hide_gdpr_banner=1`;

    // Replace template variables
    messageBody = messageBody
      .replace(/\{\{link\}\}/g, link)
      .replace(/\{\{datetime\}\}/g, datetime || 'your scheduled time')
      .replace(/\{\{calendly_reschedule\}\}/g, calendlyRescheduleLink)
      .replace(/\{\{firstName\}\}/g, firstName || '');

    // Send SMS via our SMS send function
    const smsPayload = {
      to: phone,
      body: messageBody,
      leadId: lead_id,
      template: templateName
    };

    console.log('Triggering SMS send:', {
      event: eventType,
      lead_id,
      phone: phone.replace(/./g, '*'), // Mask phone in logs
      template: templateName,
      timestamp: new Date().toISOString()
    });

    // Call our SMS send function
    const functionBaseUrl = process.env.URL || 'http://localhost:8888';
    const smsResponse = await fetch(`${functionBaseUrl}/.netlify/functions/sms-send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsPayload)
    });

    const smsResult = await smsResponse.json();

    if (smsResult.success) {
      // Mark as sent to prevent duplicates
      sentMessages.set(dedupeKey, {
        sentAt: new Date().toISOString(),
        messageSid: smsResult.messageSid,
        event: eventType
      });
      
      // Schedule follow-up events if applicable
      await scheduleFollowUpEvents(eventType, lead_id, phone, utm);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: true,
          event: eventType,
          messageSid: smsResult.messageSid,
          template: templateName,
          sentAt: new Date().toISOString()
        })
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({
          success: false,
          error: 'Failed to send SMS',
          details: smsResult
        })
      };
    }

  } catch (error) {
    console.error('SMS trigger error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to process SMS trigger',
        message: error.message
      })
    };
  }
};

// Schedule follow-up events
async function scheduleFollowUpEvents(eventType, leadId, phone, utm) {
  // In a production environment, this would integrate with a job queue
  // like AWS SQS, Redis Queue, or similar to schedule delayed messages
  
  switch (eventType) {
    case 'lead_opted_in':
      // Schedule 4-hour nudge if no upload
      console.log(`TODO: Schedule no_upload_nudge for ${leadId} in 4 hours`);
      // scheduleDelayedMessage('no_upload_nudge', leadId, phone, utm, '4h');
      break;
      
    case 'appt_booked':
      // Could schedule reminder 1 hour before appointment
      console.log(`TODO: Schedule appointment reminder for ${leadId}`);
      break;
      
    case 'no_show':
      // Could schedule follow-up after 24 hours
      console.log(`TODO: Schedule follow-up for missed appointment ${leadId}`);
      break;
      
    default:
      // No follow-up needed
      break;
  }
}

// Helper function to create short links with UTM parameters
function createTrackingLink(baseUrl, campaign, leadId, utm = {}) {
  const params = new URLSearchParams({
    src: 'sms',
    utm_source: 'sms',
    utm_campaign: campaign,
    lead_id: leadId,
    ...utm
  });
  
  return `${baseUrl}?${params.toString()}`;
}

// Export for testing
module.exports = {
  handler: exports.handler,
  TEMPLATES,
  scheduleFollowUpEvents,
  createTrackingLink
};