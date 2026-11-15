export type InstallPromptEvent = Event & {
  prompt: () => Promise<unknown>;
  userChoice: Promise<{ outcome: string }>;
};

declare global {
  interface Window {
    yombalInstall?: { event: InstallPromptEvent | null; installed: boolean };
  }
}

export function isStandalone() {
  return typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

// Navigateurs intégrés (Facebook, Instagram, Messenger, TikTok…) : l'installation y est impossible, il faut ouvrir Chrome ou Safari.
export function inAppBrowser(userAgent: string) {
  return /FBAN|FBAV|FB_IAB|Instagram|Messenger|musical_ly|BytedanceWebview|Snapchat|Line\//i.test(userAgent);
}

export function installationDevice(userAgent: string, touchPoints = 0): 'android' | 'ios' | 'desktop' {
  if (/Android/i.test(userAgent)) return 'android';
  if (/iPhone|iPad|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && touchPoints > 1)) return 'ios';
  return 'desktop';
}

export function chromeInstallUrl(origin: string, path = '/?installer=1') {
  const target = new URL(path, new URL(origin).origin);
  if (!['https:', 'http:'].includes(target.protocol)) throw new Error('Adresse d’installation invalide.');
  return `intent://${target.host}${target.pathname}${target.search}#Intent;scheme=${target.protocol.slice(0, -1)};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(target.href)};end`;
}

/** Ouvre Yombal dans Chrome en gardant la connexion (lien personnel de 3 minutes, à usage unique). */
export async function openInChrome() {
  let path = '/?installer=1';
  try { const r = await fetch('/api/auth/handoff', { method: 'POST', credentials: 'same-origin' }); if (r.ok) path = ((await r.json()) as { path: string }).path; } catch {}
  window.location.href = chromeInstallUrl(window.location.origin, path);
}

/** Navigateur iPhone/iPad : 'safari', 'chrome' (CriOS, bouton Partager en haut), 'inapp' (Facebook, Instagram…) ou 'other'. */
export function iosBrowser(userAgent: string): 'safari' | 'chrome' | 'inapp' | 'other' {
  if (inAppBrowser(userAgent)) return 'inapp';
  if (/CriOS/i.test(userAgent)) return 'chrome';
  if (/FxiOS|EdgiOS|OPiOS/i.test(userAgent)) return 'other';
  return /Safari/i.test(userAgent) ? 'safari' : 'other';
}
export function isIpad(userAgent: string, touchPoints = 0) { return /iPad/i.test(userAgent) || (/Macintosh/i.test(userAgent) && touchPoints > 1); }
/** Lien personnel (3 min, usage unique) pour retrouver sa session dans un autre navigateur. */
export async function handoffLink() {
  try { const r = await fetch('/api/auth/handoff', { method: 'POST', credentials: 'same-origin' }); if (r.ok) return window.location.origin + ((await r.json()) as { path: string }).path; } catch {}
  return window.location.origin + '/';
}

/** iPhone dans Facebook/Instagram : ouvre Safari directement (adresse « x-safari-https:// », iOS 17 et plus), déjà connecté.
 *  Renvoie true si la page a bien été quittée ; sinon (iPhone ancien, Facebook qui bloque) on montre les gestes à faire. */
export async function openInSafari(prefetched?: string): Promise<boolean> {
  // Le lien est préparé à l'avance quand c'est possible : l'ouverture se fait alors directement au toucher.
  const link = prefetched || await handoffLink();
  if (!/^https:\/\//.test(link)) return false;
  let left = false;
  const hidden = () => { if (document.hidden) left = true; };
  document.addEventListener('visibilitychange', hidden);
  window.location.href = 'x-safari-' + link;
  await new Promise(r => setTimeout(r, 1600));
  document.removeEventListener('visibilitychange', hidden);
  return left || document.hidden;
}
