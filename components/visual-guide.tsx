'use client';
import {useEffect,useRef,useState} from 'react';
import {ArrowRight,Building2,CalendarDays,ChartColumn,FileText,LayoutDashboard,MessageCircle,Settings,Users,Wallet} from 'lucide-react';

type Chapter={id:string;page:string;icon:typeof Users;title:string;intro:string;steps:string[];tip:string};
const chapters:Chapter[]=[
 {id:'accueil',page:'accueil',icon:LayoutDashboard,title:'L’accueil',intro:'Votre mois en un coup d’œil, dès l’ouverture.',steps:['Choisissez le mois en haut pour voir ses chiffres.','Les 4 cartes : loyers encaissés, à recevoir, logements occupés, dépenses. Touchez-en une pour ouvrir le détail.','Le bandeau coloré change toutes les 15 secondes : rouge = retard, corail = à surveiller, vert = bonne nouvelle, violet = conseil.','Le graphique montre vos encaissements mois par mois ; les deux ronds en dessous résument occupation et loyers.'],tip:'Le bouton « Ajouter un bien » est toujours en haut à droite.'},
 {id:'biens',page:'biens',icon:Building2,title:'Mes biens',intro:'Tous vos logements, avec leur situation.',steps:['« Ajouter un bien » : nom, type, ville, loyer et photo.','Pour un immeuble, utilisez « Diviser en logements » : RDC, R+1, appartement gauche/droite…','Chaque carte indique si le logement est occupé, réservé ou à louer.','Touchez un bien pour voir son locataire, ses paiements et son historique.'],tip:'Recadrez la photo : zoom, déplacement et rotation sont possibles.'},
 {id:'locataires',page:'locataires',icon:Users,title:'Locataires',intro:'Qui habite où, et où en est chaque loyer.',steps:['« Ajouter un locataire » : nom, téléphone, logement, loyer, caution et jour de paiement.','Chaque fiche montre le logement, le loyer et la prochaine échéance.','Touchez le numéro pour appeler directement.','« Suivi / relancer » prépare un message poli avec le montant dû.'],tip:'Les échéances de chaque mois se préparent automatiquement.'},
 {id:'loyers',page:'loyers',icon:Wallet,title:'Loyers & paiements',intro:'Encaisser, suivre les retards, éditer les reçus.',steps:['Touchez « Encaisser » sur une échéance.','Saisissez le montant reçu (même partiel), la date et le moyen : espèces, Wave, Orange Money…','Le reste à payer se recalcule tout seul ; les retards passent en rouge.','Éditez le reçu PDF en un geste après chaque paiement.'],tip:'Plusieurs versements peuvent être enregistrés pour un même mois.'},
 {id:'factures',page:'factures',icon:FileText,title:'Factures & contrats',intro:'Des documents professionnels en PDF.',steps:['« Ajouter une facture » : choisissez le locataire et la situation (à payer, déjà payée, plusieurs mois).','Vérifiez le récapitulatif puis enregistrez.','« Envoyer / télécharger » génère le PDF à partager par WhatsApp ou e-mail.','Changez de modèle dans Paramètres → Factures (2 gratuits, 7 avec Pro).'],tip:'Ajoutez votre logo et votre numéro Wave / Orange Money : ils apparaissent sur chaque facture.'},
 {id:'agenda',page:'agenda',icon:CalendarDays,title:'Calendrier',intro:'Visites, remises de clés, échéances et fins de bail.',steps:['Touchez un jour pour ajouter un rendez-vous ou un rappel.','Les échéances de loyer et fins de bail s’ajoutent automatiquement.','La cloche en haut regroupe tous vos rappels.'],tip:'Activez les notifications de l’appareil dans Paramètres.'},
 {id:'rapports',page:'rapports',icon:ChartColumn,title:'Analyses',intro:'Votre rentabilité, simplement.',steps:['Recouvrement, occupation, revenu net et cumul de l’année.','Le détail mois par mois et la performance de chaque bien.','Les locataires qui doivent encore, et vos dépenses par catégorie.','« Rapport / PDF » pour imprimer ou partager un bilan.'],tip:'Les cautions sont toujours exclues des revenus.'},
 {id:'parametres',page:'parametres',icon:Settings,title:'Paramètres',intro:'Votre profil, vos factures, votre sécurité.',steps:['Profil : nom de l’agence, téléphone, ville et logo.','Factures : modèle, signature, moyens de paiement et message de relance.','Préférences : mot de passe, notifications, sauvegarde de vos données.'],tip:'Pensez à « Enregistrer » après chaque modification.'},
];

function Phone({page,active}:{page:string;active:boolean}){
 const [load,setLoad]=useState(false);const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{const el=ref.current;if(!el)return;const io=new IntersectionObserver(([e])=>{if(e.isIntersecting){setLoad(true);io.disconnect();}},{rootMargin:'300px'});io.observe(el);return()=>io.disconnect();},[]);
 return <div ref={ref} className={'vg-phone'+(active?' active':'')}><div className="vg-notch"/><div className="vg-screen">{load?<iframe src={'/?demo=1#'+page} title={'Aperçu : '+page} loading="lazy" tabIndex={-1}/>:<div className="vg-loading"/>}</div></div>;
}

export default function VisualGuide(){
 const [current,setCurrent]=useState(chapters[0].id);
 useEffect(()=>{const io=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting)setCurrent(e.target.id);},{rootMargin:'-45% 0px -45% 0px'});chapters.forEach(c=>{const el=document.getElementById(c.id);if(el)io.observe(el);});return()=>io.disconnect();},[]);
 return <div className="vg">
  <nav className="vg-toc" aria-label="Chapitres">{chapters.map((c,i)=><a key={c.id} href={'#'+c.id} className={current===c.id?'on':''}><span>{i+1}</span>{c.title}</a>)}</nav>
  <div className="vg-chapters">{chapters.map((c,i)=><section key={c.id} id={c.id} className="vg-chapter">
   <Phone page={c.page} active={current===c.id}/>
   <div className="vg-text"><span className="vg-num"><c.icon size={18}/>Étape {i+1} sur {chapters.length}</span><h2>{c.title}</h2><p className="vg-intro">{c.intro}</p>
    <ol>{c.steps.map((s,j)=><li key={j}><b>{j+1}</b><span>{s}</span></li>)}</ol>
    <p className="vg-tip">💡 {c.tip}</p>
    <a className="vg-try" href={'/?demo=1#'+c.page} target="_blank" rel="noopener">Essayer dans la démo<ArrowRight size={15}/></a>
   </div>
  </section>)}</div>
  <section className="vg-end"><MessageCircle size={22}/><div><h2>Une question en chemin ?</h2><p>Dans l’application, la bulle « Assistant » répond tout de suite. Vous pouvez aussi relancer la visite guidée depuis Aide.</p></div><a className="lp-btn" href="/connexion?mode=inscription">Créer mon espace gratuit<ArrowRight size={16}/></a></section>
 </div>;
}
