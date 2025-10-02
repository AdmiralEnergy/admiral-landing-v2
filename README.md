# Tracking Implementation Update - Admiral Energy

## Overview

This update implements standardized Reddit Pixel and GA4 tracking as specified, with UTM persistence, event de-duplication, and proper conversion tracking for the Duke PowerPair solar program.

## Changes Made

### Files Modified

#### `/index.html`
- **Updated Reddit Pixel tracking system** (lines 83-195)
  - Implemented UTM capture and persistence system
  - Added fireReddit() and fireGA4Lead() helper functions with retry logic
  - Replaced complex event mapping with direct standard event calls
  - Added proper de-duplication using sessionStorage

- **Lead Event Tracking** (lines 1090-1099, 1326-1336)
  - Fires Reddit `Lead` event when Duke bill is uploaded (primary conversion)
  - Fires Reddit `Lead` event when lead form is submitted
  - Mirrors to GA4 as `generate_lead` with same lead_id and UTM params
  - Includes de-duplication via lead_id + session storage

- **Custom Event (InitiateCheckout)** (lines 1149-1153, 1206-1213)
  - Fires Reddit `Custom` event with `customEventName: 'InitiateCheckout'` when Calendly popup is opened
  - Reddit only supports specific event types, so InitiateCheckout is wrapped as Custom event
  - Added click handler for any `[data-calendly-open]` or `#bookCall` elements

- **Purchase Event** (lines 1159-1162)
  - Fires when Calendly booking is completed (value: 0, currency: 'USD')
  - Uses Calendly's message API to detect `calendly.event_scheduled`

#### `/thank-you.html` (New File)
- Created thank-you page with proper tracking
- Maintains Reddit base pixel + PageVisit
- UTM persistence and re-hydration
- No duplicate Lead event firing (respects session de-dupe)

### Removed Elements
- **Custom Reddit Events**: No custom "Hero Unmute" or "Explainer unmute" events were found in the codebase. The existing video mute tracking uses standard `ViewContent` events, which are preserved.

## Implementation Details

### 1. UTM Capture & Persistence
- **Function**: `getUtmState()`
- **Storage**: localStorage for cross-session persistence
- **Parameters**: utm_source, utm_medium, utm_campaign, utm_content, utm_term
- **Behavior**: 
  - First page load: reads from URL parameters and saves to localStorage
  - Subsequent pages: re-hydrates from localStorage if not in URL
  - Adds document.referrer to all events

### 2. Event De-duplication
- **Method**: sessionStorage with key pattern `lead_sent_${lead_id}`
- **Scope**: Per browser session
- **Logic**: Check if key exists before firing Lead/GA4 events, set key after successful fire
- **Lead ID generation**: `Date.now() + '-' + Math.random().toString(16).slice(2)` if not available

### 3. Reddit Event Mapping
| Event Type | Reddit Event | Trigger | Includes |
|------------|--------------|---------|----------|
| Page Load | PageVisit | All pages | UTMs |
| Lead Conversion | Lead | Bill upload OR lead form submit | lead_id + UTMs |
| Calendar Open | Custom | Calendly button click | customEventName: 'InitiateCheckout' + UTMs |
| Booking Complete | Purchase | Calendly booking confirmed | value: 0, currency: 'USD' + UTMs |

### 4. GA4 Integration
- **Lead Generation**: `generate_lead` event with lead_id and UTMs
- **GTM Push**: `dataLayer.push({ event: 'lead', lead_id, ...utms })`
- **De-duplication**: Same sessionStorage mechanism as Reddit

### 5. Retry Logic
- **Network failures**: 3 retry attempts with exponential backoff
- **Triggers**: visibilitychange (user returns) and online events
- **Timeout**: 1s, 2s, 3s intervals

## GTM Configuration Required

If using Google Tag Manager, ensure these tags are configured:

### Keep These Tags:
1. **GA4 Config (All Pages)** - Should remain unchanged
2. **GA4 Event - Generate Lead**
   - Trigger: Custom Event `lead`
   - Event Name: `generate_lead`
   - Parameters: `lead_id`, UTM fields from dataLayer

### Remove These Tags (if present):
- Any tags with "Hero Unmute" or "Explainer unmute" events
- Custom Reddit events with `customEventName` containing "unmute"

## QA Testing Steps

### 1. Reddit Pixel Helper Verification
1. Install Reddit Pixel Helper browser extension
2. Visit homepage - confirm **PageVisit** fires
3. Complete lead form - confirm **Lead** event fires with lead_id
4. Click "Book a call" - confirm **Custom event with InitiateCheckout** fires
5. Complete Calendly booking - confirm **Purchase** fires with value: 0

### 2. GA4 DebugView Testing
1. Add `?debug=1` to URL or use GA4 DebugView
2. Complete lead form - confirm `generate_lead` event with lead_id + UTMs
3. Verify UTM parameters are captured and passed correctly

### 3. De-duplication Testing
1. Complete lead form
2. Refresh thank-you page - confirm **no duplicate Lead event**
3. Open new tab, revisit site - Lead should not re-fire in same session
4. Close browser, reopen - Lead should be able to fire again for new leads

### 4. UTM Persistence Testing
1. Visit with UTMs: `?utm_source=google&utm_medium=cpc&utm_campaign=test`
2. Navigate through site - UTMs should persist in localStorage
3. Complete conversion - all events should include original UTMs
4. Check developer tools > Application > Local Storage for utm_* keys

### 5. Cross-Platform Testing
1. **Desktop browsers**: Chrome, Firefox, Safari, Edge
2. **Mobile devices**: iOS Safari, Android Chrome
3. **Incognito/Private**: Ensure tracking works without cookies

### 6. Ads Manager Verification
1. Wait 24-48 hours after testing
2. Check Reddit Ads Manager Events section
3. Confirm Lead, Custom: InitiateCheckout, Purchase events appear
4. Create conversions in Ads Manager:
   - Primary: Lead event for optimization
   - Secondary: Purchase for booking completion tracking

## Technical Notes

### Browser Compatibility
- Uses modern JavaScript (localStorage, URLSearchParams, arrow functions)
- Graceful degradation with try/catch blocks
- Compatible with IE11+ (existing codebase baseline)

### Performance Impact
- UTM functions execute only on page load
- Event firing is asynchronous with minimal blocking
- Retry logic uses efficient event listeners (once: true)

### Privacy Compliance
- Respects existing cookie consent framework
- UTM data stored locally only (no external transmission except to tracking platforms)
- Lead IDs are generated client-side and pseudo-anonymous

## Troubleshooting

### Common Issues
1. **No Lead events**: Check sessionStorage for `lead_sent_*` keys, clear if testing
2. **Missing UTMs**: Verify localStorage has utm_* keys, test with direct URL parameters
3. **Calendly events not firing**: Ensure Calendly widget loads properly, check browser console for errors

### Debug Mode
Add `?debug=1` to URL to enable console logging of all tracking events.

### Contact
For implementation questions or issues, contact the development team or refer to Reddit Pixel and GA4 documentation.