/* SkinGenius service worker — offline-capable PWA shell */
const CACHE = "skingenius-v3";
const ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/favicon.svg",
  "/about.html",
  "/research.html",
  "/careers.html",
  "/docs.html",
  "/privacy.html",
  "/icon-192.png",
  "/icon-512.png",
  "/og-image.png",
  "/manifest.webmanifest"
];

// Pre-cache the app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first for same-origin GETs, with network fallback and offline page
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          req.mode === "navigate" ? caches.match("/index.html") : Response.error()
        );
    })
  );
});
