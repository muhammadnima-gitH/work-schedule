const CACHE = 'work-schedule-v2';
const ASSETS = [
  '/work-schedule/',
  '/work-schedule/index.html',
  '/work-schedule/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // Never intercept API calls - let them go directly to network
  if (url.includes('anthropic.com') || url.includes('supabase.co')) {
    e.respondWith(fetch(e.request));
    return;
  }
  
  // For app assets, try network first, fall back to cache
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
