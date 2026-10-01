declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackGaEvent(
  eventName: string,
  eventParams: Record<string, unknown> = {}
) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  const payload = {
    event: eventName,
    timestamp: new Date().toISOString(),
    ...eventParams,
  };

  window.dataLayer.push(payload);

  if (process.env.NODE_ENV === "development" && window.console) {
    console.log("[GA4 DataLayer]", eventName, payload);
  }
}
