const VERSION='x14-8-0-rc1';
const STATIC_CACHE=`deutschweg-static-${VERSION}`;
const RUNTIME_CACHE=`deutschweg-runtime-${VERSION}`;
const APP_SHELL=['./','./index.html','./offline.html','./privacy.html','./x148.css','./app-config.js','./manifest.webmanifest','./version.json','./assets/icon-192.png','./assets/icon-512.png','./assets/icon-maskable-192.png','./assets/icon-maskable-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(STATIC_CACHE).then(cache=>cache.addAll(APP_SHELL)));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![STATIC_CACHE,RUNTIME_CACHE].includes(k)).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting()});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const req=event.request,url=new URL(req.url);
  if(req.mode==='navigate'){
    event.respondWith(fetch(req).then(async response=>{if(response?.ok){const cache=await caches.open(RUNTIME_CACHE);cache.put('./index.html',response.clone())}return response}).catch(async()=>await caches.match('./index.html')||await caches.match('./offline.html','./privacy.html')));
    return;
  }
  if(url.origin===self.location.origin){
    event.respondWith(caches.match(req).then(cached=>{const network=fetch(req).then(async response=>{if(response?.ok){const cache=await caches.open(RUNTIME_CACHE);cache.put(req,response.clone())}return response}).catch(()=>cached);return cached||network}));
  }
});
