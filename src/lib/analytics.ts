type FunnelEventName =
  | "landing_view"
  | "cta_click"
  | "register_start"
  | "register_success"
  | "payment_success";

type EventParams = Record<string, string | number | boolean | null | undefined>;

type DataLayerEvent = {
  event: FunnelEventName;
  [key: string]: string | number | boolean | null | undefined;
};

declare global {
  interface Window {
    dataLayer?: DataLayerEvent[];
    gtag?: (...args: unknown[]) => void;
  }
}

const GA4_ID = (import.meta.env.VITE_GA4_MEASUREMENT_ID ?? "").trim();
/** Google Ads / tag de conversão (formato AW-...). Mesmo loader do gtag do GA4 — sem script duplicado. */
const GOOGLE_ADS_ID = (import.meta.env.VITE_GOOGLE_ADS_ID ?? "").trim();
const GTM_ID = (import.meta.env.VITE_GTM_ID ?? "").trim();

let initialized = false;

function injectScript(src: string): void {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

export function initAnalytics(): void {
  if (initialized || typeof window === "undefined") return;

  window.dataLayer = window.dataLayer ?? [];

  if (GTM_ID) {
    injectScript(`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`);
  }

  // Com GA4 + Ads, carregar gtag/js com AW primeiro: alguns verificadores do Ads só reconhecem `id=AW-...` na URL.
  const gtagSrcId =
    GOOGLE_ADS_ID && GA4_ID ? GOOGLE_ADS_ID : GA4_ID || GOOGLE_ADS_ID;
  if (gtagSrcId) {
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${gtagSrcId}`);
    window.gtag =
      window.gtag ??
      ((...args: unknown[]) => {
        window.dataLayer?.push(args as unknown as DataLayerEvent);
      });
    window.gtag("js", new Date());
    if (GA4_ID) {
      window.gtag("config", GA4_ID);
    }
    if (GOOGLE_ADS_ID && GOOGLE_ADS_ID !== GA4_ID) {
      window.gtag("config", GOOGLE_ADS_ID);
    }
  }

  initialized = true;
}

export function trackEvent(event: FunnelEventName, params: EventParams = {}): void {
  if (typeof window === "undefined") return;

  const payload: DataLayerEvent = { event, ...params };
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(payload);

  if (typeof window.gtag === "function") {
    window.gtag("event", event, params);
  }
}

const ADS_CONVERSION_SEND_TO = (
  import.meta.env.VITE_GOOGLE_ADS_CONVERSION_SEND_TO ?? ""
).trim();

/**
 * Dispara conversão do Google Ads (snippet "event" com send_to).
 * Não colar script extra no HTML — chame só onde a conversão for válida (ex.: pagamento concluído).
 */
export function trackGoogleAdsConversion(options?: {
  value?: number;
  currency?: string;
}): void {
  if (typeof window === "undefined" || !ADS_CONVERSION_SEND_TO) return;
  if (typeof window.gtag !== "function") return;

  window.gtag("event", "conversion", {
    send_to: ADS_CONVERSION_SEND_TO,
    value: options?.value ?? 1.0,
    currency: options?.currency ?? "BRL",
  });
}
