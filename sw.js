const CACHE = 'deutschweg-x12-3-unified-ui-v1';
const CORE = [
  './', './index.html', './app-ui.css', './x12-experience.js', './x12-1-planner.js',
  './x12-2-adaptive-planner.js', './x12-3-ui.js', './version.json', './manifest.webmanifest',
  './icon-192.png', './icon-512.png', './resources.json', './resource-health.json', './config.js', './clean-boot.js',
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

  // HTML navigation: fresh code first, offline fallback second.
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: 'no-store' });
        const cache = await caches.open(CACHE);
        await cache.put('./index.html', response.clone());
        return response;
      } catch (_) {
        return (await caches.match('./index.html')) || (await caches.match('./')) || Response.error();
      }
    })());
    return;
  }

  // App code/data: stale-while-revalidate for fast startup, while updates replace cache in background.
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    const networkPromise = fetch(event.request).then(async (response) => {
      if (response && response.ok) {
        const cache = await caches.open(CACHE);
        await cache.put(event.request, response.clone());
      }
      return response;
    }).catch(() => null);
    return cached || (await networkPromise) || Response.error();
  })());
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
