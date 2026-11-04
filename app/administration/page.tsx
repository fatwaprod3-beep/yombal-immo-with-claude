import {getCurrentUser,signInPath} from '../auth';
import {isDevelopmentAdmin} from '../../lib/development-admin';
import {hasAdminAccess} from '../../lib/admin-access';
import AdminLogin from '../../components/admin-login';
export const dynamic='force-dynamic';
export default async function Administration(){const user=await getCurrentUser();if(!user)return <main className="admin-shell"><section className="admin-card"><h1>Administration Yombal</h1><p>Connectez-vous avec le compte propriétaire pour continuer.</p><a className="button primary" href={signInPath('/administration')} target="_top">Se connecter</a></section></main>;if(!await isDevelopmentAdmin(user.userId))return <main className="admin-shell"><section className="admin-card"><h1>Accès réservé</h1><p>Cette page est réservée au compte propriétaire de Yombal.</p><a href="/">Retour à Yombal</a></section></main>;return <AdminLogin email={user.email} active={await hasAdminAccess(user.userId)}/>;}
