import PublicShell from '../../components/public-shell';
import HelpCenter from '../../components/help-center';
export const metadata={title:'Aide et guides',description:'Centre d’aide Yombal.immo : démarrer, ajouter des biens et locataires, encaisser les loyers, paiements partiels, factures PDF, abonnement Pro et sécurité.',alternates:{canonical:'/aide'}};
export default function Aide(){return <PublicShell eyebrow="AIDE" title="Tout pour bien utiliser Yombal" intro="Des réponses claires, étape par étape."><HelpCenter/></PublicShell>;}
