const CACHE = 'vocab-b7b1481682';
const SHELL = ["./", "index.html", "words.json", "articles.json", "talks.json", "manifest.webmanifest", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== 'vocab-audio').map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // word recordings never change: cache first, so they play instantly and offline
  if (new URL(req.url).pathname.includes('/audio/')) { e.respondWith(caches.open('vocab-audio').then(c => c.match(req)).then(r => r || fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open('vocab-audio').then(c => c.put(req, copy)); } return res; }))); return; }
  // network first so new versions arrive; fall back to cache when offline
  e.respondWith(fetch(new Request(req, {cache: 'no-store'})).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
    .catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
});
