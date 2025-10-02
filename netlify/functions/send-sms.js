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
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { leadId, firstName, email, phone } = JSON.parse(event.body);
    
    console.log('SMS request received:', { leadId, firstName, email, phone });

    // In production, integrate with SMS services like:
    // - Twilio
    // - AWS SNS
    // - SendGrid
    
    const welcomeMessage = `Hi ${firstName}! Thanks for your interest in solar + battery with Admiral Energy. Your Duke PowerPair assessment is being prepared. We'll follow up within 24 hours with your personalized report. Reply STOP to opt out.`;
    
    // Simulate SMS API call
    const smsData = {
      leadId,
      phone,
      message: welcomeMessage,
      sentAt: new Date().toISOString(),
      status: 'sent',
      type: 'welcome'
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('Welcome SMS sent:', smsData);

    // Schedule follow-up sequence
    const followUpSequence = [
      { delay: '24h', type: 'assessment_ready', message: `Hi ${firstName}, your Duke PowerPair solar assessment is ready! Check your email for the full report, or reply YES for a quick call to discuss your savings.` },
      { delay: '3d', type: 'reminder', message: `${firstName}, don't miss out on Duke PowerPair rebates (up to $9,000) + 30% federal tax credit expiring Dec 2025. Ready to schedule your site visit?` },
      { delay: '7d', type: 'urgency', message: `Final reminder: PowerPair capacity is filling fast. Secure your spot for up to $15,000+ in solar incentives. Call (704) 555-0123 or reply YES.` }
    ];

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Welcome SMS sent and follow-up sequence scheduled',
        data: {
          sms: smsData,
          followUpSequence
        }
      })
    };
  } catch (error) {
    console.error('SMS send error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to send SMS'
      })
    };
  }
};