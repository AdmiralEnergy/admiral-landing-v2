exports.handler = async (event, context) => {
  // Handle CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const { leadId, email, billAmount, zip, utility } = event.httpMethod === 'POST' 
      ? JSON.parse(event.body)
      : event.queryStringParameters;

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    console.log('Email automation triggered:', { leadId, email, billAmount, zip, utility });

    // Calculate personalized savings estimates
    const monthlyBill = parseInt(billAmount) || 150;
    const annualSavingsMin = Math.round(monthlyBill * 0.3 * 12);
    const annualSavingsMax = Math.round(monthlyBill * 0.55 * 12);
    const systemSizeEstimate = Math.round(monthlyBill * 0.08); // Rough kW estimate
    
    // PowerPair incentive calculation
    const solarRebate = Math.min(3600, systemSizeEstimate * 360); // $0.36/watt up to 10kW
    const batteryRebate = 5400; // Typical 13.5 kWh system
    const federalCredit = Math.round((systemSizeEstimate * 3000) * 0.30); // 30% of system cost
    const totalIncentives = solarRebate + batteryRebate + federalCredit;

    // Email sequence templates
    const emailSequence = [
      {
        delay: '15min',
        subject: `${email.split('@')[0]}, Your Duke PowerPair Solar Assessment is Ready!`,
        template: 'welcome_assessment',
        data: {
          monthlyBill,
          annualSavingsMin,
          annualSavingsMax,
          systemSizeEstimate,
          solarRebate,
          batteryRebate,
          federalCredit,
          totalIncentives,
          isDukeEligible: utility === 'duke'
        }
      },
      {
        delay: '24h',
        subject: `Quick question about your ${monthlyBill}/mo Duke Energy bill`,
        template: 'follow_up_1',
        data: { monthlyBill, annualSavingsMin, annualSavingsMax }
      },
      {
        delay: '3d',
        subject: `⏰ PowerPair capacity update for ${zip}`,
        template: 'urgency_reminder',
        data: { zip, totalIncentives, systemSizeEstimate }
      },
      {
        delay: '7d',
        subject: `Final notice: Federal solar credit expires Dec 31, 2025`,
        template: 'final_reminder',
        data: { federalCredit, monthlyBill }
      }
    ];

    // In production, integrate with email services like:
    // - SendGrid
    // - Mailgun  
    // - AWS SES
    // - ConvertKit/Mailchimp for marketing automation

    // Simulate email automation setup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Email sequence scheduled:', emailSequence);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Email automation sequence initiated',
        data: {
          leadId,
          email,
          sequenceCount: emailSequence.length,
          estimatedSavings: {
            annual: { min: annualSavingsMin, max: annualSavingsMax },
            incentives: totalIncentives,
            systemSize: systemSizeEstimate
          },
          schedule: emailSequence.map(e => ({
            delay: e.delay,
            subject: e.subject,
            template: e.template
          }))
        }
      })
    };
  } catch (error) {
    console.error('Email automation error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        success: false,
        message: 'Failed to setup email automation'
      })
    };
  }
};