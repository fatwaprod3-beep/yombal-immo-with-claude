import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import PublicShell from '../../../components/public-shell';
import {seoArticles,articleBySlug} from '../../../lib/seo-articles';
import {defaultClauses,parseArticles,contractTokens} from '../../../lib/contract-templates';

export function generateStaticParams(){return seoArticles.map(a=>({slug:a.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const a=articleBySlug((await params).slug);if(!a)return {};const url='/ressources/'+a.slug;return {title:{absolute:a.title+' · Yombal.immo'},description:a.description,alternates:{canonical:url},openGraph:{type:'article',url,title:a.title,description:a.description,locale:'fr_SN',siteName:'Yombal.immo',images:[{url:'/og-yombal.jpg',width:1200,height:630,alt:a.h1}],publishedTime:a.updated,modifiedTime:a.updated},twitter:{card:'summary_large_image',title:a.title,description:a.description,images:['/og-yombal.jpg']}};}

const labels=Object.fromEntries(contractTokens.map(([k,l])=>[k,l.replace(/ \(.*\)/,'').toLowerCase()]));
const placeholder=(t:string)=>t.replace(/\{\{\s*([a-z_]+)\s*\}\}/g,(_,k:string)=>'['+(labels[k]||k)+']');
const slugify=(t:string)=>t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
function Body({text}:{text:string}){const lines=text.split('\n').map(l=>l.trim()).filter(Boolean);const out:ReactNode[]=[];let list:string[]=[];const flush=()=>{if(list.length){out.push(<ul key={'u'+out.length}>{list.map((l,i)=><li key={i}>{l}</li>)}</ul>);list=[];}};for(const l of lines){if(/^[-•]\s+/.test(l)){list.push(l.replace(/^[-•]\s+/,''));continue;}flush();out.push(<p key={'p'+out.length}>{l}</p>);}flush();return <>{out}</>;}

export default async function Article({params}:{params:Promise<{slug:string}>}){
 const a=articleBySlug((await params).slug);if(!a)notFound();
 const url='https://yombal-immo.pro/ressources/'+a.slug;
 const ld=[{'@context':'https://schema.org','@type':'Article',headline:a.h1,description:a.description,inLanguage:'fr',datePublished:a.updated,dateModified:a.updated,mainEntityOfPage:url,image:'https://yombal-immo.pro/og-yombal.jpg',author:{'@type':'Organization',name:'Yombal.immo',url:'https://yombal-immo.pro'},publisher:{'@type':'Organization',name:'Yombal.immo',logo:{'@type':'ImageObject',url:'https://yombal-immo.pro/icons/yombal-512.png'}}},
  {'@context':'https://schema.org','@type':'FAQPage',mainEntity:a.faq.map(([q,r])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:r}}))},
  {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Accueil',item:'https://yombal-immo.pro/'},{'@type':'ListItem',position:2,name:'Ressources',item:'https://yombal-immo.pro/ressources'},{'@type':'ListItem',position:3,name:a.h1,item:url}]}];
 const related=a.related.map(articleBySlug).filter(Boolean);
 return <PublicShell eyebrow={a.eyebrow} title={a.h1} intro={a.intro}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(ld).replace(/</g,'\\u003c')}}/>
  <article className="ra-article">
   <nav className="ra-crumbs" aria-label="Fil d’Ariane"><a href="/">Accueil</a> › <a href="/ressources">Ressources</a> › <span>{a.h1}</span></nav>
   <p className="ra-meta">Mis à jour le {new Date(a.updated+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})} · {a.minutes} min de lecture</p>
   <nav className="ra-toc" aria-label="Sommaire"><b>Sommaire</b><ol>{a.blocks.map(b=><li key={b.h2}><a href={'#'+slugify(b.h2)}>{b.h2}</a></li>)}<li><a href="#questions">Questions fréquentes</a></li></ol></nav>
   {a.blocks.map(b=><section key={b.h2} id={slugify(b.h2)}><h2>{b.h2}</h2>
    {b.p?.map((t,i)=><p key={i}>{t}</p>)}
    {b.list&&<ul>{b.list.map((t,i)=><li key={i}>{t}</li>)}</ul>}
    {b.table&&<table className="ra-table"><tbody>{b.table.map(([k,v])=><tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody></table>}
    {b.contract&&<div className="ra-contract"><p className="ra-contract-title">CONTRAT DE BAIL À USAGE D’HABITATION</p><p className="ra-contract-parties">Entre [nom du bailleur], ci-après « le bailleur », et [nom du locataire], ci-après « le locataire », il a été convenu ce qui suit :</p>{parseArticles(defaultClauses[b.contract]).map((art,i)=><div key={i} className="ra-contract-art"><h3>Article {i+1}. {art.title}</h3><Body text={placeholder(art.body)}/></div>)}<p className="ra-contract-sign">Fait à [ville], le [date], en deux exemplaires originaux. Signatures précédées de la mention « Lu et approuvé ».</p></div>}
   </section>)}
   <aside className="ra-cta"><div><b>Faites-le en 2 minutes avec Yombal</b><p>Loyers, reçus, contrats et relances WhatsApp : gratuit jusqu’à 6 biens.</p></div><a className="lp-btn" href="/connexion?mode=inscription">Créer mon espace gratuit</a></aside>
   <section id="questions" className="ra-faq"><h2>Questions fréquentes</h2>{a.faq.map(([q,r])=><details key={q}><summary>{q}</summary><p>{r}</p></details>)}</section>
   {related.length>0&&<section className="ra-related"><h2>À lire aussi</h2><div className="ra-grid">{related.map(r=><a key={r!.slug} className="ra-card" href={'/ressources/'+r!.slug}><span className="lp-eyebrow">{r!.eyebrow}</span><h3>{r!.h1}</h3><small>{r!.minutes} min de lecture →</small></a>)}</div></section>}
   <p className="ra-disclaimer">Ce guide est fourni à titre d’information générale et ne remplace pas l’avis d’un professionnel du droit.</p>
  </article>
 </PublicShell>;
}
