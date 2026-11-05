// Service worker minimal : rend la page d'accueil installable et disponible hors connexion.
// Les pages Grist (espace enseignant, Direction) ne sont jamais mises en cache.
const CACHE = "gestion-ccf-v4";
const FICHIERS = ["./accueil_ccf.html", "./manifest.webmanifest", "./icones/icon-192.png", "./icones/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Réseau d'abord (toujours la dernière version), cache seulement si hors connexion
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request).then(rep => {
      const copie = rep.clone();
      caches.open(CACHE).then(c => c.put(e.request, copie));
      return rep;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("./accueil_ccf.html")))
  );
});
