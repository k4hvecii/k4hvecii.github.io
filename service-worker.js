const CACHE_NAME = "k4hvecii-portfolio-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./404.html",
  "./offline.html",
  "./assets/css/main.css",
  "./assets/css/tokens.css",
  "./assets/css/base.css",
  "./assets/css/layout.css",
  "./assets/css/components.css",
  "./assets/css/modal.css",
  "./assets/css/animations.css",
  "./assets/css/responsive.css",
  "./assets/js/main.js",
  "./assets/js/config.js",
  "./assets/data/projects.json",
  "./assets/data/socials.json",
  "./assets/i18n/languages.json",
  "./assets/i18n/tr.json",
  "./assets/i18n/en.json",
  "./assets/icons/favicon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("./offline.html")));
    return;
  }

  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    const clone = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
    return response;
  })));
});
