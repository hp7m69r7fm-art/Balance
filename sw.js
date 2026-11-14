// Личный баланс: офлайн-кэш. Поменяйте VERSION при обновлении файлов.
const VERSION='balans-v2';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  const font=/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if(url.origin!==location.origin&&!font)return;
  if(req.mode==='navigate'){
    // сеть в приоритете, чтобы обновления подхватывались; без сети — из кэша
    e.respondWith(fetch(req).then(r=>{const c=r.clone();caches.open(VERSION).then(x=>x.put('index.html',c));return r}).catch(()=>caches.match('index.html')));
    return}
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque')){const c=r.clone();caches.open(VERSION).then(x=>x.put(req,c))}return r}).catch(()=>hit);
    return hit||net}));
});
