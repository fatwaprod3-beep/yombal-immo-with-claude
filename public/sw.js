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
  if (event.notification.data?.push) event.waitUntil(fetch('/api/events', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'push_opened', detail: String(event.notification.tag || '').slice(0, 60) }) }).catch(() => {}));
  const path = event.notification.data?.url || '/';
  const destination = new URL(path, self.location.origin);
  if (destination.origin !== self.location.origin) return;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async clients => {
    for (const client of clients) { if ('focus' in client) { await client.navigate(destination.href); return client.focus(); } }
    return self.clients.openWindow(destination.href);
  }));
});
// Notifications Yombal : le message n'est jamais transporté par le réseau de notification ;
// le téléphone le demande à Yombal (session connectée) au moment de l'afficher.
self.addEventListener('push', event => {
  event.waitUntil((async () => {
    let message = { title: 'Yombal', body: 'Vos loyers et vos locataires vous attendent.', url: '/', tag: 'yombal' };
    try {
      const response = await fetch('/api/push/next', { credentials: 'include', cache: 'no-store' });
      if (response.ok) { const data = await response.json(); if (data && data.title) message = data; }
    } catch {}
    await self.registration.showNotification(message.title, { body: message.body, icon: '/icons/yombal-192.png', badge: '/icons/favicon-96.png', tag: message.tag, renotify: false, data: { url: message.url, push: true } });
  })());
});
