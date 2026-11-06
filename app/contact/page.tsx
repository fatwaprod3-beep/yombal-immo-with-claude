import PublicShell from '../../components/public-shell';
import PublicContact from '../../components/public-contact';
export const metadata={title:'Contact',description:'Contactez l’équipe Yombal.immo : question, problème technique, facturation ou suggestion.',alternates:{canonical:'/contact'}};
export default function Contact(){return <PublicShell eyebrow="CONTACT" title="Parlons de votre gestion" intro="Une question, un souci ou une idée ? Nous vous répondons rapidement."><PublicContact/></PublicShell>;}
