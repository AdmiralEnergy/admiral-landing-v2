export function saveUtmFromUrl() {
  const p = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((k) => {
    const v = p.get(k);
    if (v) utm[k] = v;
  });
  if (Object.keys(utm).length) {
    localStorage.setItem("utm", JSON.stringify(utm));
  }
}

export function getSavedUtm(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("utm") || "{}");
  } catch {
    return {};
  }
}
