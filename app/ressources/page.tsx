import PublicShell from '../../components/public-shell';
import {seoArticles} from '../../lib/seo-articles';
export const metadata={title:'Ressources : guides de gestion locative au Sénégal',description:'Guides gratuits pour propriétaires et agences au Sénégal : gestion locative, modèle de contrat de bail, caution et avance de loyer, quittance de loyer, logiciel de gestion.',alternates:{canonical:'/ressources'}};
export default function Ressources(){
 const ld={'@context':'https://schema.org','@type':'CollectionPage',name:'Ressources Yombal.immo',url:'https://yombal-immo.pro/ressources',hasPart:seoArticles.map(a=>({'@type':'Article',headline:a.h1,url:'https://yombal-immo.pro/ressources/'+a.slug}))};
 return <PublicShell eyebrow="RESSOURCES" title="Guides pour bien gérer vos locations" intro="Règles, modèles et conseils pratiques pour les propriétaires et les agences au Sénégal.">
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <div className="ra-grid">{seoArticles.map(a=><a key={a.slug} className="ra-card" href={'/ressources/'+a.slug}><span className="lp-eyebrow">{a.eyebrow}</span><h2>{a.h1}</h2><p>{a.description}</p><small>{a.minutes} min de lecture →</small></a>)}</div>
 </PublicShell>;
}
