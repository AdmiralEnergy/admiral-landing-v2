export function initAnalytics() {
  const gaId = import.meta.env.VITE_GA_ID;
  if (gaId && !document.getElementById("ga4-src")) {
    const s = document.createElement("script");
    s.id = "ga4-src";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(s);

    const inline = document.createElement("script");
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      (window as any).gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${gaId}', { send_page_view: true });
    `;
    document.head.appendChild(inline);
  }

  const redditId = import.meta.env.VITE_REDDIT_PIXEL_ID;
  if (redditId && !(window as any).rdt) {
    (function (w, d, s, u, t, ri) {
      if (w.rdt) return;
      t = w.rdt = function () {
        t.sendEvent ? t.sendEvent.apply(t, arguments) : t.callQueue.push(arguments);
      };
      // @ts-ignore
      t.callQueue = [];
      ri = d.createElement(s);
      ri.src = u;
      ri.async = true;
      const el = d.getElementsByTagName(s)[0];
      el?.parentNode?.insertBefore(ri, el);
    })(window, document, "script", "https://www.redditstatic.com/ads/pixel.js");
    (window as any).rdt("init", redditId);
    (window as any).rdt("track", "PageVisit");
  }
}
