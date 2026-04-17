const ACQUISITION_KEY = "protocolo_acquisition";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type AcquisitionData = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  landing_path?: string;
  referrer?: string;
  captured_at?: string;
};

type StoredAcquisition = {
  expiresAt: number;
  data: AcquisitionData;
};

const TRACKING_KEYS: Array<keyof AcquisitionData> = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
];

function hasAttributionParams(params: URLSearchParams): boolean {
  return TRACKING_KEYS.some((key) => {
    const value = params.get(key);
    return typeof value === "string" && value.trim().length > 0;
  });
}

function readStorage(): StoredAcquisition | null {
  try {
    const raw = localStorage.getItem(ACQUISITION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAcquisition;
    if (!parsed?.expiresAt || !parsed.data) return null;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem(ACQUISITION_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function getAcquisitionData(): AcquisitionData | null {
  if (typeof window === "undefined") return null;
  const stored = readStorage();
  return stored?.data ?? null;
}

export function captureAcquisitionFromUrl(): AcquisitionData | null {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);
  const params = url.searchParams;
  if (!hasAttributionParams(params)) return getAcquisitionData();

  const data: AcquisitionData = {
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_term: params.get("utm_term") ?? undefined,
    utm_content: params.get("utm_content") ?? undefined,
    gclid: params.get("gclid") ?? undefined,
    fbclid: params.get("fbclid") ?? undefined,
    landing_path: `${url.pathname}${url.search}`,
    referrer: document.referrer || undefined,
    captured_at: new Date().toISOString(),
  };

  const payload: StoredAcquisition = {
    expiresAt: Date.now() + TTL_MS,
    data,
  };
  localStorage.setItem(ACQUISITION_KEY, JSON.stringify(payload));
  return data;
}
