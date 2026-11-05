import {redirect} from 'next/navigation';
import {getCurrentUser,signInPath} from '../auth';
import CheckoutRedirect from '../../components/checkout-redirect';
export const dynamic='force-dynamic';
export const metadata={title:'Paiement sécurisé — Yombal.immo'};
// Ouverte dans un nouvel onglet : prépare la session SasPay puis redirige le client.
export default async function Paiement({searchParams}:{searchParams:Promise<{offre?:string}>}){
 const {offre}=await searchParams;const plan=typeof offre==='string'&&/^(monthly|quarterly|annual|test)$/.test(offre)?offre:'monthly';
 if(!await getCurrentUser())redirect(signInPath('/paiement?offre='+plan));
 return <CheckoutRedirect planId={plan}/>;
}
