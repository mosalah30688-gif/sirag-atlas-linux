const CACHE_NAME = 'sirag-atlas-stage-16';
const CORE_ASSETS = [
  './',
  './index.html',
  './version.json',
  './css/styles.css',
  './assets/seal.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-round.png',
  './assets/apple-touch-icon.png',
  './manifest.json',
  './js/audio.js',
  './js/data/seerah-events.js',
  './js/data/hijrah-quiz.js',
  './js/data/battles.js',
  './js/data/sanctuaries.js',
  './js/data/scenarios.js',
  './js/data/companions.js',
  './js/data/lineage.js',
  './js/data/poems-lexicon.js',
  './js/data/guidance.js',
  './js/data/relics.js',
  './js/data/khatmah.js',
  './js/atlas.js',
  './js/hijrah-quiz.js',
  './js/battles.js',
  './js/sanctuaries.js',
  './js/scenarios.js',
  './js/constellation.js',
  './js/lineage.js',
  './js/poems-lexicon.js',
  './js/guidance-search.js',
  './js/museum.js',
  './js/poster.js',
  './js/khatmah-cert.js',
  './js/settings-updater.js',
  './js/app.js',
  './assets/audio/poems/hassan-madh.mp3',
  './assets/audio/poems/kaab-zuhayr.mp3',
  './assets/audio/poems/amir-akwa.mp3',
  './assets/audio/poems/ansar-khandaq.mp3',
  './assets/audio/poems/hassan-fath.mp3'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Always fetch live repository update checks directly from GitHub without SW cache
  const url = event.request.url || '';
  if (url.includes('api.github.com') || url.includes('raw.githubusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
