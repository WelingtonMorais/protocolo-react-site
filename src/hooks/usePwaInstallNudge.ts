import { useState, useEffect, useCallback } from "react";
import { isAndroidLike, isIOSLike, isRunningAsInstalledPwa, isSecureWebContext } from "@/utils/web-push-env";

const STORAGE_DISMISS_KEY = "protocolo_pwa_install_nudge_dismissed";

/** Evento não padronizado em todas as versões do TypeScript DOM. */
export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export interface UsePwaInstallNudgeResult {
  /** Mostrar cartão de convite (Chrome com install ou iPhone/iPad com instruções). */
  visible: boolean;
  /** Browser oferece diálogo nativo (Chrome, Edge, etc.). */
  canUseNativePrompt: boolean;
  /** Dispositivo Android sem prompt nativo — mostrar instruções manuais. */
  isAndroidManual: boolean;
  busy: boolean;
  promptInstall: () => Promise<void>;
  dismiss: () => void;
}

export function usePwaInstallNudge(): UsePwaInstallNudgeResult {
  const [installed, setInstalled] = useState(() =>
    typeof window !== "undefined" ? isRunningAsInstalledPwa() : false
  );
  const [dismissed, setDismissed] = useState(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem(STORAGE_DISMISS_KEY) === "1";
  });
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onBip = (e: Event): void => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = (): void => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback((): void => {
    try {
      localStorage.setItem(STORAGE_DISMISS_KEY, "1");
    } catch {
      // private mode
    }
    setDismissed(true);
  }, []);

  const promptInstall = useCallback(async (): Promise<void> => {
    if (!deferredPrompt) return;
    setBusy(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {
      // utilizador fechou ou browser recusou
    } finally {
      setDeferredPrompt(null);
      setBusy(false);
    }
  }, [deferredPrompt]);

  const secure = typeof window !== "undefined" && isSecureWebContext();
  const ios = typeof navigator !== "undefined" && isIOSLike();
  const android = typeof navigator !== "undefined" && isAndroidLike();
  const canUseNativePrompt = deferredPrompt !== null;
  const iosManualOnly = ios && !canUseNativePrompt;
  const androidManualOnly = android && !ios && !canUseNativePrompt;
  const visible =
    secure &&
    !installed &&
    !dismissed &&
    (canUseNativePrompt || iosManualOnly || androidManualOnly);

  return {
    visible,
    canUseNativePrompt,
    isAndroidManual: androidManualOnly,
    busy,
    promptInstall,
    dismiss,
  };
}
