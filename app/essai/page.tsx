import {redirect} from 'next/navigation';
import {getCurrentUser} from '../auth';
import AdLanding from '../../components/ad-landing';
import {googleEnabled} from '../../lib/google-auth';
export const dynamic='force-dynamic';
export const metadata={title:'Essai gratuit — gestion locative au Sénégal',description:'Créez votre compte gratuit : loyers, retards, quittances sur WhatsApp et contrats de bail, depuis votre téléphone.',alternates:{canonical:'/'},robots:{index:false,follow:true}};
export default async function Essai(){
 if(await getCurrentUser())redirect('/');
 return <AdLanding google={googleEnabled()}/>;
}
