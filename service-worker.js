const CACHE_NAME = "k4hvecii-coffee-terminal-v3.1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./404.html",
  "./offline.html",
  "./privacy.html",
  "./terms.html",
  "./site.webmanifest",
  "./assets/css/main.css?v=3.1.0",
  "./assets/css/404.css",
  "./assets/css/legal.css?v=3.1.0",
  "./assets/js/main.js?v=3.1.0",
  "./assets/icons/favicon.svg",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/images/og-k4-terminal-31.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(async () =>
        (await caches.match(event.request)) || caches.match("./offline.html")
      )
    );
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    const network = fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => null);

    return cached || (await network) || Response.error();
  })());
});
