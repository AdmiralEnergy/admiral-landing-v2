export function track(event: string, payload?: any) {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, payload || {});
    }
  } catch (e) {
    // noop
  }
}

export function redditLead(payload?: any) {
  try {
    if (typeof window !== 'undefined' && (window as any).rdt) {
      (window as any).rdt('track', 'Lead', payload || {});
    }
  } catch (e) {
    // noop
  }
}
