const CACHE_NAME = "histo-atlas-kompakt-v15";
const APP_SHELL = [
  "./",
  "manifest.webmanifest",
  "atlas/index.json",
  "atlas/001-kolon/uebersicht-hochaufloesend.jpg",
  "atlas/001-kolon/uebersicht-atlas-annotiert.jpg",
  "atlas/001-kolon/atlas/07-auerbach-plexus-annotiert.jpg",
  "atlas/001-kolon/atlas/11-krypte-mit-becherzellen-annotiert.jpg",
  "atlas/001-kolon/atlas/14-perikolisches-fettgewebe-annotiert.jpg",
  "atlas/001-kolon/atlas/15-stratum-longitudinale-annotiert.jpg",
  "atlas/001-kolon/atlas/16-stratum-circulare-annotiert.jpg",
  "atlas/001-kolon/atlas/17-lymphfollikel-annotiert.jpg",
  "atlas/001-kolon/pruefung/07-auerbach-plexus.jpg",
  "atlas/001-kolon/pruefung/11-krypte-mit-becherzellen.jpg",
  "atlas/001-kolon/pruefung/14-perikolisches-fettgewebe.jpg",
  "atlas/001-kolon/pruefung/15-stratum-longitudinale.jpg",
  "atlas/001-kolon/pruefung/16-stratum-circulare.jpg",
  "atlas/001-kolon/pruefung/17-lymphfollikel.jpg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./", copy));
          return response;
        })
        .catch(() => caches.match("./")),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        }),
    ),
  );
});
