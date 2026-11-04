import {redirect} from 'next/navigation';
import {getCurrentUser,safeRelativeReturnPath} from '../auth';
import AuthForm from '../../components/auth-form';
export const dynamic='force-dynamic';
export const metadata={title:'Connexion — Yombal.immo'};
export default async function Connexion({searchParams}:{searchParams:Promise<{return_to?:string;mode?:string}>}){
 const params=await searchParams;const returnTo=safeRelativeReturnPath(params.return_to||'/');
 if(await getCurrentUser())redirect(returnTo);
 return <AuthForm returnTo={returnTo} initialMode={params.mode==='inscription'?'register':'login'}/>;
}
