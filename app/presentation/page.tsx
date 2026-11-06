import Landing from '../../components/landing';
import { paymentCredentials } from '../../lib/payment-config';
import { sasPayPrices, defaultPrices } from '../../lib/saspay-prices';
export const dynamic = 'force-dynamic';
export const metadata = { title: { absolute: 'Yombal.immo — La gestion locative, enfin simple' }, alternates: { canonical: '/presentation' } };
// Page de présentation, visible par tous (même connecté) : lien à partager.
export default async function Presentation() {
  let prices: Record<string, number> = defaultPrices();
  try { prices = (await sasPayPrices((await paymentCredentials())?.apiKey || null)).prices; } catch {}
  return <Landing prices={prices} />;
}
