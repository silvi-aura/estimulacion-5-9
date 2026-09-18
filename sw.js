/* Service Worker — Silvi-Aura (Crecer acompañados: de 5 a 9 años)
   Habilita la instalación como app (Android/Chrome) y el uso sin conexión.
   Importante: si más adelante actualizás index.html, subí también un cambio
   acá (por ejemplo CACHE_NAME "crecer-acompanados-v2") para que los celulares
   bajen la versión nueva en vez de servir la vieja desde caché. */

const CACHE_NAME = "crecer-acompanados-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Solo controlamos los archivos propios de la app. Todo lo externo
  // (Google Fonts, Hotmart, tu endpoint de verificación, etc.) sigue de largo.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
