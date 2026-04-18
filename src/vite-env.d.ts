/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_GA4_MEASUREMENT_ID?: string;
  readonly VITE_GOOGLE_ADS_ID?: string;
  /** Ex.: AW-xxx/rotuloDaConversao (Google Ads > conversões > snippet) */
  readonly VITE_GOOGLE_ADS_CONVERSION_SEND_TO?: string;
  readonly VITE_GTM_ID?: string;
  /** DDI + DDD + número, só dígitos (ex.: 5519993148395) */
  readonly VITE_WHATSAPP_SUPPORT_PHONE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
