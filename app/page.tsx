import { getCurrentUser } from './auth';
import Dashboard from '../components/dashboard';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await getCurrentUser();
  // YOMBAL_TEST_MODE=1 (variable Vercel) : utilisation sans connexion, données gardées dans le navigateur.
  const localMode = process.env.YOMBAL_TEST_MODE === '1';
  return <Dashboard userName={user?.fullName || ''} userEmail={user?.email || ''} authenticated={!!user} localMode={localMode} />;
}
