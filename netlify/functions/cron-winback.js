// 30-Day Winback Campaign Cron Function
// NOTE: This is a safe placeholder - does not automatically execute

const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Only allow GET requests for manual execution
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    // In production, this would read from your database
    // For now, we'll use a simple JSON file approach
    const eligibleLeadsPath = path.join('/tmp', 'winback-eligible.json');
    
    let eligibleLeads = [];
    
    // Try to read existing eligible leads file
    try {
      const data = await fs.readFile(eligibleLeadsPath, 'utf8');
      eligibleLeads = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid, create sample data
      eligibleLeads = await generateSampleEligibleLeads();
      
      // Save sample data for demonstration
      await fs.writeFile(eligibleLeadsPath, JSON.stringify(eligibleLeads, null, 2));
    }

    console.log(`Processing ${eligibleLeads.length} eligible leads for winback campaign`);

    // Process eligible leads
    const results = [];
    for (const lead of eligibleLeads) {
      try {
        // Check if 30 days have passed since last interaction
        const daysSinceLastInteraction = Math.floor((Date.now() - new Date(lead.lastInteraction).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastInteraction >= 30 && !lead.winbackSent) {
          // Trigger winback SMS
          const triggerPayload = {
            event: 'winback_30d',
            lead_id: lead.leadId,
            phone: lead.phone,
            utm: lead.utm || {}
          };

          console.log(`Triggering winback for lead: ${lead.leadId}`);

          // Call SMS triggers function
          const triggerResponse = await fetch(`${context.functionUrl}/sms-triggers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(triggerPayload)
          });

          const triggerResult = await triggerResponse.json();

          results.push({
            leadId: lead.leadId,
            success: triggerResult.success,
            daysSinceLastInteraction,
            messageSid: triggerResult.messageSid
          });

          // Mark as winback sent
          lead.winbackSent = true;
          lead.winbackSentAt = new Date().toISOString();
        } else {
          results.push({
            leadId: lead.leadId,
            skipped: true,
            reason: daysSinceLastInteraction < 30 ? 'Too recent' : 'Already sent',
            daysSinceLastInteraction
          });
        }
      } catch (error) {
        console.error(`Error processing lead ${lead.leadId}:`, error);
        results.push({
          leadId: lead.leadId,
          error: error.message,
          success: false
        });
      }
    }

    // Update the eligible leads file
    await fs.writeFile(eligibleLeadsPath, JSON.stringify(eligibleLeads, null, 2));

    const summary = {
      totalProcessed: eligibleLeads.length,
      messagesSent: results.filter(r => r.success).length,
      skipped: results.filter(r => r.skipped).length,
      errors: results.filter(r => r.error).length,
      results
    };

    console.log('Winback campaign summary:', summary);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        summary,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Winback cron error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Failed to process winback campaign',
        message: error.message
      })
    };
  }
};

// Generate sample eligible leads for demonstration
async function generateSampleEligibleLeads() {
  const thirtyOneDaysAgo = new Date(Date.now() - (31 * 24 * 60 * 60 * 1000)).toISOString();
  const twentyNineDaysAgo = new Date(Date.now() - (29 * 24 * 60 * 60 * 1000)).toISOString();
  const fifteenDaysAgo = new Date(Date.now() - (15 * 24 * 60 * 60 * 1000)).toISOString();

  return [
    {
      leadId: 'lead_1701234567_abc123',
      phone: '+15551234567',
      firstName: 'John',
      email: 'john@example.com',
      zip: '28203',
      utility: 'duke',
      billAmount: 180,
      lastInteraction: thirtyOneDaysAgo,
      winbackSent: false,
      utm: {
        utm_source: 'google',
        utm_medium: 'cpc',
        utm_campaign: 'solar_keywords'
      }
    },
    {
      leadId: 'lead_1701234568_def456',
      phone: '+15551234568',
      firstName: 'Sarah',
      email: 'sarah@example.com',
      zip: '28205',
      utility: 'duke',
      billAmount: 220,
      lastInteraction: twentyNineDaysAgo,
      winbackSent: false,
      utm: {
        utm_source: 'reddit',
        utm_medium: 'social',
        utm_campaign: 'powerpair_ads'
      }
    },
    {
      leadId: 'lead_1701234569_ghi789',
      phone: '+15551234569',
      firstName: 'Mike',
      email: 'mike@example.com',
      zip: '28209',
      utility: 'duke',
      billAmount: 150,
      lastInteraction: fifteenDaysAgo,
      winbackSent: false,
      utm: {
        utm_source: 'direct',
        utm_medium: 'referral',
        utm_campaign: 'word_of_mouth'
      }
    }
  ];
}

// Export for testing
module.exports = {
  handler: exports.handler,
  generateSampleEligibleLeads
};