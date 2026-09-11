// Paid content, API responses and Next.js build assets are never cached.
const CACHE = 'dawg-course-static-v1'
const ASSETS = ['/course-icon-192.png', '/course-icon-512.png']
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)))
})
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('dawg-course-static-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()))
})
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => new Response('<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Dawg Strength — Offline</title><style>body{margin:0;background:#101111;color:#f3f1ea;font:18px system-ui;min-height:100vh;display:grid;place-content:center;padding:32px}h1{max-width:500px}a{color:#ff9350}</style><main><p>DAWG STRENGTH</p><h1>Your course will be here when you reconnect.</h1><p>Videos and resources need an internet connection.</p><a href="/learn/">Try again</a></main></html>', {status:503,headers:{'Content-Type':'text/html','Cache-Control':'no-store'}})))
  } else if (ASSETS.includes(url.pathname)) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)))
  }
})
