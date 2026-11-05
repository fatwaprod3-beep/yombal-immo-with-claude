import { getCurrentUser } from './auth';
import Dashboard from '../components/dashboard';
import { flags } from '../lib/app-settings';
import { isDevelopmentAdmin } from '../lib/development-admin';
import Landing from '../components/landing';
import { paymentCredentials } from '../lib/payment-config';
import { sasPayPrices, defaultPrices } from '../lib/saspay-prices';
export const dynamic = 'force-dynamic';
export default async function Home({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const user = await getCurrentUser();
  // Mode maintenance activé depuis l'administration : seul le compte propriétaire garde l'accès.
  if ((await flags()).maintenance && !(user && await isDevelopmentAdmin(user.userId))) {
    return <main className="admin-shell"><section className="admin-card"><span className="admin-symbol">🛠</span><h1>Yombal revient très vite</h1><p>Une opération de maintenance est en cours pour améliorer et protéger votre espace. Vos données sont en sécurité. Merci de réessayer dans quelques instants.</p></section></main>;
  }
  // YOMBAL_TEST_MODE=1 (variable Vercel) : utilisation sans connexion, données gardées dans le navigateur.
  const localMode = process.env.YOMBAL_TEST_MODE === '1';
  // Visiteur non connecté : page de présentation (la démo reste accessible via ?demo=1).
  if (!user && !localMode && (await searchParams).demo !== '1') {
    let prices: Record<string, number> = defaultPrices();
    try { prices = (await sasPayPrices((await paymentCredentials())?.apiKey || null)).prices; } catch {}
    return <Landing prices={prices} />;
  }
  return <Dashboard userName={user?.fullName || ''} userEmail={user?.email || ''} authenticated={!!user} localMode={localMode} />;
}
