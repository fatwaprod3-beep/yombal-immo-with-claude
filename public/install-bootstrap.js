// Capture the browser's one-use install event before React starts.
(() => {
  if (window.yombalInstall) return;
  const state = window.yombalInstall = { event: null, installed: false };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    state.event = event;
    state.installed = false;
  });
  window.addEventListener('appinstalled', () => {
    state.event = null;
    state.installed = true;
  });
  if (window.isSecureContext && 'serviceWorker' in navigator && window.top === window) {
    const register = () => navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {});
    if (document.readyState === 'complete') register();
    else window.addEventListener('load', register, { once: true });
  }
})();
