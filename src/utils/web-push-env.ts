/**
 * Deteção de ambiente para Web Push (desktop vs mobile, HTTPS, iOS/PWA).
 * Referência: Service Worker + Push exigem contexto seguro; iOS 16.4+ costuma exigir app na ecrã inicial.
 */

export type WebPushStaticBlockReason =
  | "no_secure_context"
  | "no_service_worker"
  | "no_notification"
  | "ios_needs_pwa"
  | null;

export function isSecureWebContext(): boolean {
  return typeof window !== "undefined" && window.isSecureContext;
}

export function hasNotificationAPI(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function hasServiceWorkerAPI(): boolean {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

export function isIOSLike(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/i.test(ua)) return true;
  const nav = navigator as Navigator & { maxTouchPoints?: number };
  return navigator.platform === "MacIntel" && (nav.maxTouchPoints ?? 0) > 1;
}

export function isAndroidLike(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

export function isRunningAsInstalledPwa(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
  } catch {
    // ignore
  }
  const nav = navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

/** Em iPhone/iPad, Web Push costuma só funcionar com o site aberto pelo ícone (PWA), iOS 16.4+. */
export function needsPwaInstallForIosWebPush(): boolean {
  return isIOSLike() && !isRunningAsInstalledPwa();
}

export function getWebPushStaticBlockReason(): WebPushStaticBlockReason {
  if (!isSecureWebContext()) return "no_secure_context";
  if (!hasServiceWorkerAPI()) return "no_service_worker";
  if (!hasNotificationAPI()) return "no_notification";
  if (needsPwaInstallForIosWebPush()) return "ios_needs_pwa";
  return null;
}

export function isWebPushEnvironmentCapable(): boolean {
  return getWebPushStaticBlockReason() === null;
}

/** Verifica PushManager após o service worker estar pronto (chamar no cliente). */
export async function hasPushManagerAfterSwReady(): Promise<boolean> {
  if (!hasServiceWorkerAPI()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    return "pushManager" in reg && typeof reg.pushManager?.subscribe === "function";
  } catch {
    return false;
  }
}

export function humanMessageForBlockReason(reason: WebPushStaticBlockReason): string {
  switch (reason) {
    case "no_secure_context":
      return "Notificações push precisam de HTTPS (ou localhost). Aceda pelo endereço seguro do site.";
    case "no_service_worker":
      return "Este navegador não suporta service worker; notificações push não estão disponíveis.";
    case "no_notification":
      return "Este navegador não suporta a API de notificações.";
    case "ios_needs_pwa":
      return "No iPhone/iPad, adicione o Protocolo à ecrã inicial: Safari → Partilhar → Adicionar à ecrã principal. Depois abra pelo ícone e ative as notificações aqui.";
    default:
      return "";
  }
}
