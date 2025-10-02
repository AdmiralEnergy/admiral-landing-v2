# SMS Engagement System - Setup Guide

This document explains how to set up and configure the Twilio SMS engagement system for Admiral Energy.

## Overview

The SMS system provides automated engagement campaigns for Duke PowerPair solar leads with:

- **Welcome message** when users opt-in
- **4-hour nudge** if bill not uploaded
- **Appointment confirmation** when Calendly is booked
- **Missed appointment follow-up**
- **30-day win-back** campaign

## Files Created/Modified

### New Functions
- `netlify/functions/sms-send.js` - Core Twilio SMS sending with rate limiting and quiet hours
- `netlify/functions/sms-inbound.js` - Webhook handler for incoming SMS (STOP/HELP/keywords)
- `netlify/functions/sms-triggers.js` - Campaign logic and event triggers
- `netlify/functions/cron-winback.js` - 30-day win-back campaign (manual trigger)

### Modified Files
- `index.html` - Updated to trigger SMS on opt-in and Calendly booking

## Environment Variables

Add these to your Netlify dashboard under Site Settings > Environment Variables:

```bash
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_MESSAGING_SERVICE_SID=your_messaging_service_sid_here
APP_BASE_URL=https://landing.admiralenergy.ai
```

## Twilio Console Setup

### 1. Create Messaging Service

1. In Twilio Console, go to **Messaging > Services**
2. Click **Create Messaging Service**
3. Name: "Admiral Energy SMS"
4. Use case: "Marketing and promotions"

### 2. Add Phone Number

1. In your Messaging Service, click **Add Senders**
2. Add your verified Twilio phone number
3. Enable **A2P 10DLC Registration** (required for business messaging)

### 3. Configure Inbound Webhook

1. In Messaging Service settings, set webhook URL:
   ```
   https://your-site.netlify.app/.netlify/functions/sms-inbound
   ```
2. Set HTTP method to **POST**
3. Ensure webhook is active

### 4. A2P 10DLC Registration

1. Go to **Messaging > Regulatory Compliance**
2. Complete business verification
3. Register brand and campaign
4. Wait for approval (1-3 business days)

## Message Templates

All templates include "STOP to opt out" for compliance:

```javascript
WELCOME: "Admiral Energy: got your request. Duke closed 1:1 net metering—rebates can still cut your bill.\nUpload your Duke bill (60s): {{link}}\nSTOP to opt out."

NUDGE_4H: "Quick nudge—still want the rebate check?\nUpload your bill: {{link}}\nSTOP to opt out."

CONFIRM_APPT: "You're set for {{datetime}}. Bring a recent Duke bill.\nReschedule: {{calendly_reschedule}}\nSTOP to opt out."

MISSED: "Missed you. Want a new time or just text questions here?\nRebook: {{link}}\nSTOP to opt out."

WINBACK_30D: "Duke rates creeping up again. PowerPair + 30% ITC still live.\nWant a quick bill check? {{link}}\nSTOP to opt out."
```

## Campaign Flow

### 1. Lead Opt-in
- User checks SMS opt-in box on form
- Triggers `lead_opted_in` event
- Sends welcome message with upload link

### 2. Bill Upload Nudge
- **Manual trigger needed**: Check after 4 hours if bill not uploaded
- Call: `POST /.netlify/functions/sms-triggers`
- Body: `{"event": "no_upload_nudge", "lead_id": "...", "phone": "..."}`

### 3. Appointment Flow
- Calendly booking auto-triggers `appt_booked`
- Sends confirmation with reschedule link
- **Manual no-show trigger**: `{"event": "no_show", "lead_id": "...", "phone": "..."}`

### 4. Win-back Campaign
- **Manual execution**: Visit `/.netlify/functions/cron-winback`
- Processes leads 30+ days old
- Sends win-back message

## Compliance Features

### Opt-out Handling
- Recognizes: STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT
- Stores opt-out state by phone hash
- Auto-responds with confirmation

### Quiet Hours
- Only sends 8AM-8PM Eastern Time
- Queues messages outside hours for next business day

### Rate Limiting
- 1 message per lead per 10 minutes
- Prevents spam and duplicate sends

### Keywords
- **QUOTE/REBATE**: Links to upload page
- **BOOK**: Links to Calendly
- **HELP**: Shows available commands

## Testing

### Test SMS Send
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/sms-send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+15551234567",
    "body": "Test message from Admiral Energy",
    "leadId": "test_123"
  }'
```

### Test Campaign Trigger
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/sms-triggers \
  -H "Content-Type: application/json" \
  -d '{
    "event": "lead_opted_in",
    "lead_id": "test_123",
    "phone": "+15551234567",
    "utm": {"utm_source": "test"}
  }'
```

### Test Inbound Webhook
Send "HELP" to your Twilio number and verify auto-response.

## Analytics Integration

### UTM Tracking
All SMS links include:
- `src=sms`
- `utm_source=sms`
- `utm_campaign={event_type}`
- `lead_id={lead_id}`

### GA4 Events
- SMS triggers preserve existing GA4 `generate_lead` events
- Reddit Pixel events continue as normal

### Logging
- All sends logged to Netlify function logs
- Phone numbers hashed for privacy
- Message IDs tracked for delivery status

## Production Checklist

- [ ] Environment variables set in Netlify
- [ ] Twilio Messaging Service created
- [ ] A2P 10DLC registration approved
- [ ] Inbound webhook configured and tested
- [ ] SMS opt-in checkbox working on form
- [ ] Test send/receive flow complete
- [ ] Keywords (STOP, HELP, QUOTE, BOOK) tested
- [ ] Quiet hours compliance verified
- [ ] UTM links generating correctly

## Monitoring KPIs

Track these metrics in your analytics:

- **Reply Rate**: Target 10-20% on Welcome/Nudge
- **Upload Completion**: ≥15% of SMS opt-ins upload bills
- **Show Rate**: ≥70% for booked calls with SMS reminders
- **Unsubscribe Rate**: <3% per campaign
- **Delivery Rate**: >95% message delivery
- **Response Time**: <2 minutes for keyword responses

## Troubleshooting

### Common Issues

**Messages not sending:**
- Check environment variables
- Verify A2P 10DLC approval status
- Confirm phone number format (+1XXXXXXXXXX)

**Inbound webhook not working:**
- Verify webhook URL in Twilio Console
- Check function logs for errors
- Test with curl POST to webhook URL

**Rate limiting too aggressive:**
- Adjust timeout in `sms-send.js` (currently 10 minutes)
- Check for duplicate lead_id values

**Quiet hours not working:**
- Verify timezone calculation in `isWithinQuietHours()`
- Test with different times

### Support

For technical issues:
- Check Netlify function logs
- Review Twilio debugger logs
- Monitor webhook delivery status in Twilio Console

## Future Enhancements

**Planned improvements:**
- Database integration for opt-out persistence
- Automated 4-hour nudge scheduling
- Advanced segmentation by ZIP/utility
- A/B testing for message templates
- MMS support for bill samples
- Two-way conversation handling