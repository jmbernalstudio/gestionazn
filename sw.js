// Guarda la app en el móvil para que abra rápido y sin cobertura en el campo.
const CACHE = 'cd-aznalcollar-v157';
const FILES = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/familias.js', 'js/instalar.js', 'js/datos.js', 'js/config.js', 'js/servidor.js', 'js/vendor/supabase.js', 'manifest.webmanifest', 'manifest-familias.webmanifest', 'icons/escudo-160.png', 'icons/escudo.png', 'icons/escudo-clasico-160.png', 'icons/escudo-clasico.png', 'icons/icono-180.png', 'icons/icono-192.png', 'icons/icono-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primero la red (para tener siempre la última versión); si no hay, lo guardado.
self.addEventListener('fetch', e => {
  // Solo los archivos de la app; las llamadas al servidor del club van siempre directas.
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        if (res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});

// Notificaciones al móvil: avisos de la junta, peticiones nuevas y cambios de estado.
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(Promise.all([
    self.registration.showNotification(d.title || 'C.D. Aznalcóllar Fútbol Base', {
      body: d.body || '', icon: 'icons/icono-192.png', badge: 'icons/escudo-160.png', tag: d.tab || 'club', renotify: true, data: { tab: d.tab || 'home' }
    }),
    // Si la app está abierta, que traiga lo nuevo al momento
    self.clients.matchAll({ type: 'window' }).then(cs => cs.forEach(c => c.postMessage({ refrescar: true })))
  ]));
});

// Al tocar la notificación se abre la app en la pantalla que toca
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const tab = (e.notification.data || {}).tab || 'home';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
    const c = cs[0];
    if (c) { c.postMessage({ refrescar: true, tab }); return c.focus(); }
    return self.clients.openWindow(`./?tab=${tab}`);
  }));
});
