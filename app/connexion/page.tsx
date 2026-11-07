import {redirect} from 'next/navigation';
import {getCurrentUser,safeRelativeReturnPath} from '../auth';
import AuthForm from '../../components/auth-form';
import {googleEnabled} from '../../lib/google-auth';
export const dynamic='force-dynamic';
export const metadata={title:'Connexion — Yombal.immo'};
const googleErrors:Record<string,string>={'google-indisponible':'La connexion avec Google n’est pas encore activée. Utilisez votre e-mail.','google-annule':'Connexion Google annulée.','google-session':'La session Google a expiré. Réessayez.','google-echec':'Connexion Google impossible pour le moment. Réessayez ou utilisez votre e-mail.','suspendu':'Votre compte est temporairement bloqué pour une vérification de sécurité. Écrivez-nous via yombal-immo.pro/contact.','inscriptions-fermees':'Les inscriptions sont momentanément fermées. Réessayez plus tard.'};
export default async function Connexion({searchParams}:{searchParams:Promise<{return_to?:string;mode?:string;erreur?:string}>}){
 const params=await searchParams;const returnTo=safeRelativeReturnPath(params.return_to||'/');
 if(await getCurrentUser())redirect(returnTo);
 return <AuthForm returnTo={returnTo} initialMode={params.mode==='inscription'?'register':'login'} google={googleEnabled()} initialError={googleErrors[params.erreur||'']||''}/>;
}
