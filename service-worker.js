const CACHE_NAME = "k4hvecii-portfolio-v2.1-checkup";
const APP_SHELL = [
  "./",
  "./index.html",
  "./404.html",
  "./offline.html",
  "./site.webmanifest",
  "./assets/css/404.css",
  "./assets/css/animations.css",
  "./assets/css/base.css",
  "./assets/css/components.css",
  "./assets/css/layout.css",
  "./assets/css/main.css",
  "./assets/css/modal.css",
  "./assets/css/responsive.css",
  "./assets/css/tokens.css",
  "./assets/js/config.js",
  "./assets/js/core/github.js",
  "./assets/js/core/i18n.js",
  "./assets/js/main.js",
  "./assets/js/modules/github-card.js",
  "./assets/js/modules/language-picker.js",
  "./assets/js/modules/navigation.js",
  "./assets/js/modules/parallax.js",
  "./assets/js/modules/project-modal.js",
  "./assets/js/modules/projects.js",
  "./assets/js/modules/pwa.js",
  "./assets/js/modules/scroll-effects.js",
  "./assets/js/modules/social-links.js",
  "./assets/js/modules/theme.js",
  "./assets/data/projects.json",
  "./assets/data/socials.json",
  "./assets/i18n/languages.json",
  "./assets/i18n/tr.json",
  "./assets/i18n/en.json",
  "./assets/icons/favicon.svg",
  "./assets/icons/apple-touch-icon.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request, { cache: "no-cache" });

    if (response?.ok) {
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    return cache.match(request);
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-cache" }).catch(() =>
        caches.match("./offline.html")
      )
    );
    return;
  }

  event.respondWith(
    networkFirst(event.request).then((response) =>
      response || Response.error()
    )
  );
});
