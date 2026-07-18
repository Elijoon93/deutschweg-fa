const CACHE='deutschweg-x-v9-foundation-1';
const CORE=[
  './','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png',
  './resources.json','./resource-health.json','./config.js',
  './src/bootstrap.js','./src/core/constants.js','./src/core/idb.js','./src/core/data-bridge.js','./src/core/event-bus.js',
  './src/services/resource-service.js','./src/services/integration-hub.js','./src/integrations/catalog.js','./src/gadgets/registry.js'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return r}).catch(()=>caches.match('./index.html')));
    return;
  }
  if(u.origin!==self.location.origin)return;
  e.respondWith(caches.match(e.request).then(hit=>{
    const net=fetch(e.request).then(r=>{if(r&&r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>hit);
    return hit||net;
  }));
});
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING')self.skipWaiting()});
