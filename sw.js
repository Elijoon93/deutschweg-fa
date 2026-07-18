const CACHE = 'deutschweg-x12-2-adaptive-planner-v1';
const CORE = [
  './', './index.html', './x11-ui.css', './x12-experience.css', './x12-experience.js','./x12-1-planner.css','./x12-1-planner.js','./x12-2-adaptive-planner.css','./x12-2-adaptive-planner.js', './version.json', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './resources.json', './resource-health.json', './config.js', './clean-boot.js',
  './src/bootstrap.js', './src/core/constants.js', './src/core/idb.js', './src/core/data-bridge.js', './src/core/event-bus.js',
  './src/services/resource-service.js', './src/services/integration-hub.js', './src/services/adaptive-engine.js',
  './src/integrations/catalog.js', './src/gadgets/registry.js', './src/gadgets/placement-center.js', './src/gadgets/resource-center.js',
  './src/gadgets/smart-dictionary.js', './src/gadgets/pronunciation-studio.js', './src/gadgets/smart-podcast.js', './src/gadgets/exam-center.js',
  './src/gadgets/writing-lab.js', './src/gadgets/translation-gadget.js', './src/gadgets/ai-coach.js', './src/gadgets/cloud-center.js'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: 'no-store' });
        const cache = await caches.open(CACHE);
        cache.put('./index.html', response.clone());
        return response;
      } catch (_) {
        return (await caches.match('./index.html')) || Response.error();
      }
    })());
    return;
  }

  // Network-first for code/data so releases update immediately; cache fallback for offline use.
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, { cache: 'no-store' });
      if (response && response.ok) {
        const cache = await caches.open(CACHE);
        cache.put(event.request, response.clone());
      }
      return response;
    } catch (_) {
      return (await caches.match(event.request)) || Response.error();
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_APP_CACHE') {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
  }
});
