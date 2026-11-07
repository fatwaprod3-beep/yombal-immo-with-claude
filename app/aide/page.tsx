import PublicShell from '../../components/public-shell';
import HelpCenter from '../../components/help-center';
import {helpTopics} from '../../lib/help-faq';
export const metadata={title:'Aide et guides',description:'Centre d’aide Yombal.immo : démarrer, ajouter des biens et locataires, encaisser les loyers, paiements partiels, factures PDF, abonnement Pro et sécurité.',alternates:{canonical:'/aide'}};
export default function Aide(){const ld={'@context':'https://schema.org','@type':'FAQPage',mainEntity:helpTopics.flatMap(t=>t.items).map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))};
 return <PublicShell eyebrow="AIDE" title="Tout pour bien utiliser Yombal" intro="Des réponses claires, étape par étape."><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/><HelpCenter/></PublicShell>;}
