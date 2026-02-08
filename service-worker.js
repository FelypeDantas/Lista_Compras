const CACHE_NAME = "lista-compras-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./main.js",
    "./assets/style.css"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .catch(err => console.error("Erro ao cachear:", err))
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
