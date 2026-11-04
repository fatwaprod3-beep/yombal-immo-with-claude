self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
// Network first. Never store pages, tenant records or private files offline.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).catch(() => new Response(
    '<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Yombal · Connexion nécessaire</title><style>body{margin:0;background:#f8f7f4;color:#302c36;font:16px/1.6 system-ui;min-height:100vh;display:grid;place-items:center}main{max-width:340px;padding:28px}h1{font-size:24px}a{display:inline-block;padding:12px 20px;border-radius:10px;background:#281b34;color:white;text-decoration:none}</style><main><p>Yombal.immo</p><h1>Retrouvons la connexion</h1><p>Connectez votre téléphone à Internet pour ouvrir votre espace et retrouver vos informations à jour.</p><a href="/">Réessayer</a></main></html>',
    { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
  )));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const path = event.notification.data?.url || '/';
  const destination = new URL(path, self.location.origin);
  if (destination.origin !== self.location.origin) return;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
    for (const client of clients) { if ('focus' in client) { await client.navigate(destination.href); return client.focus(); } }
    return self.clients.openWindow(destination.href);
  }));
});
