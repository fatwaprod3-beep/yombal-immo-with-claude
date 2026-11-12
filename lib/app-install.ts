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

export function chromeInstallUrl(origin: string) {
  const target = new URL('/?installer=1', new URL(origin).origin);
  if (!['https:', 'http:'].includes(target.protocol)) throw new Error('Adresse d’installation invalide.');
  return `intent://${target.host}${target.pathname}${target.search}#Intent;scheme=${target.protocol.slice(0, -1)};package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(target.href)};end`;
}
