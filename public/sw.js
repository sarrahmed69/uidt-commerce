// KayJend PWA Service Worker v2
const CACHE_NAME = "kayjend-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    const title = data.title || "KayJend";
    const options = {
      body: data.body || "Nouvelle notification",
      icon: "/images/kayjend-logo.png",
      badge: "/images/kayjend-logo.png",
      image: data.image,
      vibrate: [200, 100, 200, 100, 200],
      tag: data.tag || "kayjend-notif",
      requireInteraction: true,
      renotify: true,
      silent: false,
      actions: [
        { action: "view", title: "Voir" },
        { action: "close", title: "Fermer" }
      ],
      data: {
        url: data.url || "/",
        timestamp: Date.now()
      }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error("Push error:", err);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  if (event.action === "close") return;
  
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

self.addEventListener("fetch", (event) => {
  // Strategy: Network first, fallback to cache
  if (event.request.method !== "GET") return;
  
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});