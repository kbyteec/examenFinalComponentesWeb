console.log('[SW] Archivo custom-sw.js cargado');

self.addEventListener('install', (event) => {
  console.log('[SW] Evento install ejecutado');
  console.log('[SW] Service Worker instalado');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Evento activate ejecutado');
  console.log('[SW] Service Worker activo');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  console.log('[SW] Evento fetch:', event.request.url);
});

self.addEventListener('message', (event) => {
  console.log('[SW] Mensaje recibido:', event.data);
});

importScripts('./ngsw-worker.js');
