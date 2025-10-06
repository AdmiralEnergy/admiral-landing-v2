export function initAnalytics() {
  const ga = import.meta.env.VITE_GA_ID;
  if (ga && !document.getElementById("ga4-src")) {
    const s = document.createElement("script");
    s.id = "ga4-src";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    document.head.appendChild(s);

    const inline = document.createElement("script");
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', '${ga}', { send_page_view: true });
    `;
    document.head.appendChild(inline);
  }

  const rid = import.meta.env.VITE_REDDIT_PIXEL_ID;
  if (rid && !(window as any).rdt) {
    (function (w, d, s, u, t, ri) {
      if (w.rdt) return;
      t = w.rdt = function () {
        t.sendEvent ? t.sendEvent.apply(t, arguments) : t.callQueue.push(arguments);
      };
      t.callQueue = [];
      ri = d.createElement(s);
      ri.src = u;
      ri.async = true;
      const el = d.getElementsByTagName(s)[0];
      el?.parentNode?.insertBefore(ri, el);
    })(window, document, "script", "https://www.redditstatic.com/ads/pixel.js");
    (window as any).rdt("init", rid);
    (window as any).rdt("track", "PageVisit");
  }
}
