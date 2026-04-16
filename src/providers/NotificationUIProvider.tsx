import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { api } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import type { WebPushStaticBlockReason } from "@/utils/web-push-env";

interface AppNotification {
  id: string;
  title: string;
  body: string;
  status?: string;
  createdAt: string;
}

interface NotificationUIContextValue {
  unreadCount: number;
  hasUnread: boolean;
  notifications: AppNotification[];
  notificationsLoading: boolean;
  needsPushNudge: boolean;
  /** True quando HTTPS, SW, Notification, iOS em PWA (se iOS), e PushManager disponível. */
  pushSupported: boolean;
  pushStaticBlockReason: WebPushStaticBlockReason;
  /** iPhone/iPad sem app na ecrã inicial — Web Push costuma exigir instalar o Protocolo como PWA. */
  needsIosPwaInstallHint: boolean;
  pushPermission: "default" | "granted" | "denied" | "unsupported";
  pushEnabled: boolean;
  pushBusy: boolean;
  refreshUnreadCount: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  enablePush: () => Promise<void>;
  disablePush: () => Promise<void>;
}

const NotificationUIContext = createContext<NotificationUIContextValue | null>(null);

function normalizeNotifications(data: unknown): AppNotification[] {
  if (!Array.isArray(data)) return [];
  const output: AppNotification[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string" || typeof row.title !== "string" || typeof row.body !== "string") {
      continue;
    }
    output.push({
      id: row.id,
      title: row.title,
      body: row.body,
      status: typeof row.status === "string" ? row.status : undefined,
      createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
    });
  }
  return output;
}

export const NotificationUIProvider = ({ children }: { children: ReactNode }): React.JSX.Element => {
  const { user, isAuthenticated } = useAuth();
  const {
    permission,
    isSubscribed,
    isLoading: pushBusy,
    subscribe,
    unsubscribe,
    pushCapable,
    staticBlockReason: pushStaticBlockReason,
  } = usePushNotifications();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const { data } = await api.get<{ count?: number }>("/notifications/unread-count");
      setUnreadCount(typeof data.count === "number" ? data.count : 0);
    } catch {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const refreshNotifications = useCallback(async (): Promise<void> => {
    if (!isAuthenticated) {
      setNotifications([]);
      return;
    }
    setNotificationsLoading(true);
    try {
      const { data } = await api.get<unknown>("/notifications");
      setNotifications(normalizeNotifications(data));
    } catch {
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(
    async (id: string): Promise<void> => {
      await api.patch(`/notifications/${id}/read`);
      await Promise.all([refreshNotifications(), refreshUnreadCount()]);
    },
    [refreshNotifications, refreshUnreadCount]
  );

  const markAllAsRead = useCallback(async (): Promise<void> => {
    await api.patch("/notifications/mark-all-read");
    await Promise.all([refreshNotifications(), refreshUnreadCount()]);
  }, [refreshNotifications, refreshUnreadCount]);

  const enablePush = useCallback(async (): Promise<void> => {
    await subscribe();
  }, [subscribe]);

  const disablePush = useCallback(async (): Promise<void> => {
    await unsubscribe();
  }, [unsubscribe]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshUnreadCount();
    void refreshNotifications();
  }, [isAuthenticated, refreshUnreadCount, refreshNotifications, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const timer = window.setInterval(() => {
      void refreshUnreadCount();
    }, 30000);
    return () => window.clearInterval(timer);
  }, [isAuthenticated, refreshUnreadCount]);

  const value = useMemo<NotificationUIContextValue>(
    () => ({
      unreadCount,
      hasUnread: unreadCount > 0,
      notifications,
      notificationsLoading,
      needsPushNudge: isAuthenticated && pushCapable && !isSubscribed,
      pushSupported: pushCapable,
      pushStaticBlockReason,
      needsIosPwaInstallHint:
        isAuthenticated && pushStaticBlockReason === "ios_needs_pwa" && !isSubscribed,
      pushPermission: permission,
      pushEnabled: isSubscribed,
      pushBusy,
      refreshUnreadCount,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      enablePush,
      disablePush,
    }),
    [
      unreadCount,
      notifications,
      notificationsLoading,
      isAuthenticated,
      permission,
      isSubscribed,
      pushBusy,
      pushCapable,
      pushStaticBlockReason,
      refreshUnreadCount,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      enablePush,
      disablePush,
    ]
  );

  return <NotificationUIContext.Provider value={value}>{children}</NotificationUIContext.Provider>;
};

export const useNotificationUI = (): NotificationUIContextValue => {
  const ctx = useContext(NotificationUIContext);
  if (!ctx) throw new Error("useNotificationUI must be used within NotificationUIProvider");
  return ctx;
};
