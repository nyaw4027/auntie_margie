const CACHE_NAME = "auntie-margie-v1";

/* IMPORTANT: use correct base path for Firebase hosting */
const BASE = "";

/* Precache ONLY real static files */
const PRECACHE_ASSETS = [
  `${BASE}/index.html`,
  `${BASE}/manifest.json`,
  `${BASE}/icons/icon-192.png`,
  `${BASE}/icons/icon-512.png`,
  `${BASE}/icons/icon-192-maskable.png`,
  `${BASE}/icons/icon-512-maskable.png`,
  `${BASE}/icons/apple-touch-icon.png`
];

/* INSTALL */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

/* ACTIVATE */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* FETCH (safe offline fallback) */
self.addEventListener("fetch", event => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  /* only handle same-origin */
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(req, copy);
        });

        return res;
      })
      .catch(() => {
        return caches.match(req).then(res => {
          return res || caches.match("/index.html");
        });
      })
  );
});