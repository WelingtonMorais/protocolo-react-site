import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export interface UsePushNotifications {
  permission: PushPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.ready;
  } catch {
    return null;
  }
}

export function usePushNotifications(): UsePushNotifications {
  const [permission, setPermission] = useState<PushPermission>(() => {
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission as PushPermission;
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check current subscription state on mount
  useEffect(() => {
    if (permission === "unsupported") return;

    void (async () => {
      const reg = await getServiceWorkerRegistration();
      if (!reg) return;
      const existing = await reg.pushManager.getSubscription();
      setIsSubscribed(!!existing);
    })();
  }, [permission]);

  const subscribe = useCallback(async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

    setIsLoading(true);
    try {
      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== "granted") return;

      const reg = await getServiceWorkerRegistration();
      if (!reg) throw new Error("Service worker not available");

      // Fetch VAPID public key
      const { data } = await api.get<{ publicKey: string }>("/notifications/vapid-public-key");
      const applicationServerKey = urlBase64ToUint8Array(data.publicKey);

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      const subJson = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };

      await api.post("/notifications/web-push/subscribe", {
        endpoint: subJson.endpoint,
        keys: subJson.keys,
      });

      setIsSubscribed(true);
    } catch (err) {
      console.error("Erro ao ativar notificações:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setIsLoading(true);
    try {
      const reg = await getServiceWorkerRegistration();
      if (!reg) return;

      const existing = await reg.pushManager.getSubscription();
      if (!existing) {
        setIsSubscribed(false);
        return;
      }

      await api.delete("/notifications/web-push/unsubscribe", {
        data: { endpoint: existing.endpoint },
      });

      await existing.unsubscribe();
      setIsSubscribed(false);
    } catch (err) {
      console.error("Erro ao desativar notificações:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
