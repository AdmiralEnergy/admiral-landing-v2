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
    const { leadId, phone, firstName, email, billAmount, zip, utility } = JSON.parse(event.body);
    
    console.log('Callback request received:', { 
      leadId, 
      phone, 
      firstName, 
      email, 
      billAmount, 
      zip, 
      utility 
    });

    // Validate required fields
    if (!leadId || !phone) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          success: false,
          message: 'Lead ID and phone number are required'
        })
      };
    }

    // In production, integrate with your call center system or services like:
    // - Twilio for automated calling
    // - CallRail for call tracking
    // - Your CRM's callback API
    // - Salesforce, HubSpot, or other CRM systems
    
    // Enhanced callback data with complete lead information
    const callbackData = {
      leadId,
      phone,
      firstName: firstName || 'Unknown',
      email: email || null,
      billAmount: billAmount || null,
      zip: zip || null,
      utility: utility || null,
      requestedAt: new Date().toISOString(),
      status: 'scheduled',
      priority: 'high', // Instant callbacks are high priority
      callbackWindow: '5-10 minutes',
      source: 'instant_callback_button',
      notes: `Lead requested instant callback. Bill: $${billAmount || 'N/A'}/mo, Utility: ${utility || 'N/A'}, ZIP: ${zip || 'N/A'}`
    };

    // Simulate API call to scheduling system
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Callback scheduled:', callbackData);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Callback scheduled successfully',
        data: callbackData
      })
    };
  } catch (error) {
    console.error('Callback request error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to schedule callback'
      })
    };
  }
};