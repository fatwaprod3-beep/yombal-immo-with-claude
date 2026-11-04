/** Bounded requests: a lost connection must never leave a form locked forever. */
export async function apiFetch(input: string, init: RequestInit = {}, timeout = 25000): Promise<Response> {
  const controller = new AbortController();
  const cancel = () => controller.abort(init.signal?.reason);
  if (init.signal?.aborted) cancel();
  else init.signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => controller.abort(new Error('timeout')), timeout);
  try {
    const response = await fetch(input, { ...init, credentials: 'same-origin', signal: controller.signal });
    const bytes = await response.arrayBuffer();
    return new Response([204,205,304].includes(response.status) ? null : bytes, {
      status: response.status, statusText: response.statusText, headers: response.headers,
    });
  } catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error(controller.signal.aborted
      ? 'La connexion prend trop de temps. Vérifiez le résultat dans votre espace avant de réessayer.'
      : 'Connexion interrompue. Vos informations restent dans le formulaire ; vérifiez votre connexion et réessayez.');
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener('abort', cancel);
  }
}

export async function privateImageData(url: string, signal?: AbortSignal): Promise<string> {
  if (!url.startsWith('/api/files?key=')) return url;
  const response = await apiFetch(url + '&format=data', { signal, cache: 'no-store' });
  const data = await response.json() as { dataUrl?: string; error?: string };
  if (!response.ok || !data.dataUrl) throw new Error(data.error || 'Image indisponible.');
  if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data.dataUrl)) throw new Error('Image invalide.');
  return data.dataUrl;
}
