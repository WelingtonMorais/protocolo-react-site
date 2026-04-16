import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { api } from "@/services/api";
import {
  getWebPushStaticBlockReason,
  hasPushManagerAfterSwReady,
  humanMessageForBlockReason,
  needsPwaInstallForIosWebPush,
  type WebPushStaticBlockReason,
} from "@/utils/web-push-env";

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export interface UsePushNotifications {
  permission: PushPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  /** Ambiente apto a subscrever (HTTPS, SW, Notification, iOS em PWA se aplicável, PushManager após SW). */
  pushCapable: boolean;
  staticBlockReason: WebPushStaticBlockReason;
  needsPwaInstallForPush: boolean;
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

function messageFromSubscribeError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const msg = (err.response?.data as { message?: string } | undefined)?.message;
    if (typeof msg === "string" && msg.length > 0) return msg;
    if (err.message) return err.message;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Não foi possível ativar as notificações. Tente de novo ou use outro navegador.";
}

export function usePushNotifications(): UsePushNotifications {
  const staticBlockReason = useMemo(() => getWebPushStaticBlockReason(), []);
  const needsPwaInstallForPush = useMemo(() => needsPwaInstallForIosWebPush(), []);

  const [permission, setPermission] = useState<PushPermission>(() => {
    if (staticBlockReason !== null) return "unsupported";
    if (!("Notification" in window)) return "unsupported";
    return Notification.permission as PushPermission;
  });
  const [pushManagerOk, setPushManagerOk] = useState<boolean | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pushCapable = useMemo(() => {
    if (staticBlockReason !== null) return false;
    if (pushManagerOk === false) return false;
    if (pushManagerOk === null) return false;
    return true;
  }, [staticBlockReason, pushManagerOk]);

  useEffect(() => {
    if (staticBlockReason !== null) {
      setPushManagerOk(false);
      return;
    }
    void (async () => {
      const ok = await hasPushManagerAfterSwReady();
      setPushManagerOk(ok);
    })();
  }, [staticBlockReason]);

  // Check current subscription state on mount / when capability known
  useEffect(() => {
    if (permission === "unsupported" || !pushCapable) return;

    void (async () => {
      const reg = await getServiceWorkerRegistration();
      if (!reg) return;
      const existing = await reg.pushManager.getSubscription();
      setIsSubscribed(!!existing);
    })();
  }, [permission, pushCapable]);

  const subscribe = useCallback(async () => {
    if (staticBlockReason !== null) {
      throw new Error(humanMessageForBlockReason(staticBlockReason));
    }
    if (!pushManagerOk) {
      throw new Error(
        pushManagerOk === false
          ? "Service worker ou PushManager indisponível. Recarregue a página ou use Chrome/Safari atualizado."
          : "Ainda a preparar o serviço de notificações. Espere um momento e tente de novo."
      );
    }
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      throw new Error("Este ambiente não suporta notificações push.");
    }

    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm !== "granted") {
        throw new Error(
          perm === "denied"
            ? "Permissão negada. Ative notificações nas definições do navegador ou do sistema."
            : "Permissão de notificações não concedida."
        );
      }

      const reg = await getServiceWorkerRegistration();
      if (!reg) throw new Error("Service worker não disponível. Recarregue a página.");

      const { data } = await api.get<{ publicKey: string }>("/notifications/vapid-public-key");
      if (!data?.publicKey) throw new Error("Chave do servidor indisponível. Tente mais tarde.");

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
      throw new Error(messageFromSubscribeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [staticBlockReason, pushManagerOk]);

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

  return {
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    pushCapable,
    staticBlockReason,
    needsPwaInstallForPush,
  };
}
