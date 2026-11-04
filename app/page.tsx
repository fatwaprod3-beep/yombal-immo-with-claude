import { getCurrentUser } from './auth';
import Dashboard from '../components/dashboard';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const user = await getCurrentUser();
  return <Dashboard userName={user?.fullName || ''} userEmail={user?.email || ''} authenticated={!!user} />;
}
