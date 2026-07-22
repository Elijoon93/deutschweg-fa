const CACHE = 'deutschweg-x13-7-web-finalization-rc1-v1';
const CORE = [
  './', './index.html', './app-ui.css', './x12-experience.js', './x12-1-planner.js',
  './x12-2-adaptive-planner.js', './x12-3-ui.js', './x13-content-data.js', './x13-universe.js', './x13-universe.css', './x13-four-skills.js', './x13-four-skills.css', './x13-phase1-language-data.js', './x13-phase1-language-core.js', './x13-phase1-language-core.css', './phase1-lexicon.json', './phase1-sentences.json', './lexicon-context-index.json', './x13-lexicon-intelligence.css', './x13-lexicon-intelligence.js', './x13-lexicon-context-data.js', './x13-vocabulary-core-data.js', './x13-vocabulary-core.css', './x13-vocabulary-core.js', './x13-6-entry-categories.css', './x13-6-entry-categories.js', './x13-6-2-navigation.css', './x13-6-2-navigation.js', './x13-7-finalization.css', './x13-7-finalization.js', './content-authenticity-audit.json', './category-registry.json', './vocabulary-core-6000.json', './vocabulary-core-schema.json', './content-universe.json', './version.json', './manifest.webmanifest',
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

  // Code and structured data: network-first prevents mixed HTML/CSS/JS after an update.
  const isVersionedAsset = /\.(?:css|js|json|webmanifest)$/i.test(url.pathname);
  if (isVersionedAsset) {
    event.respondWith((async () => {
      try {
        const response = await fetch(event.request, { cache: 'no-store' });
        if (response && response.ok) {
          const cache = await caches.open(CACHE);
          await cache.put(event.request, response.clone());
        }
        return response;
      } catch (_) {
        return (await caches.match(event.request)) || Response.error();
      }
    })());
    return;
  }

  // Images and other static assets: stale-while-revalidate.
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
