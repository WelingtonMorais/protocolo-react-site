/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
// Injected by vite-plugin-pwa (injectManifest strategy)
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json() as {
    title: string;
    body: string;
    data?: { packageId?: string; url?: string };
  };

  const options: NotificationOptions = {
    body: payload.body,
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    data: payload.data ?? {},
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(payload.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data as { packageId?: string; url?: string };
  const targetUrl = data?.url ?? '/';

  event.waitUntil(
    (self.clients as Clients).matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          return (client as WindowClient).focus();
        }
      }
      if ('openWindow' in self.clients) {
        return (self.clients as Clients).openWindow(targetUrl);
      }
    })
  );
});
