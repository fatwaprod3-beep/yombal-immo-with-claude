'use client';
import {Building2,Check,CreditCard,PlayCircle,Settings,Sparkles,Users,Wallet,X} from 'lucide-react';
import {useEffect,useState} from 'react';
import type {State} from '../lib/model';
import type {Actions} from './views';

/** Premiers pas : guide les nouveaux comptes tant que l’espace est presque vide. */
export default function GettingStarted({state,actions}:{state:State;actions:Actions}){
 const [hidden,setHidden]=useState(false);
 useEffect(()=>{try{setHidden(localStorage.getItem('yombal-start-hidden')==='1');}catch{}},[]);
 const p=state.profile;
 const steps=[
  {done:!!(p.company&&p.phone),icon:Settings,title:'Complétez votre profil',text:'Nom de l’agence ou du patrimoine, téléphone et ville : ils apparaissent sur vos documents.',cta:'Ouvrir les paramètres',run:()=>actions.go('parametres')},
  {done:!!p.image,icon:Sparkles,title:'Ajoutez votre logo',text:'Vos factures et reçus deviennent professionnels, à votre image.',cta:'Ajouter le logo',run:()=>actions.go('parametres')},
  {done:state.properties.length>0,icon:Building2,title:'Ajoutez votre premier bien',text:'Appartement, villa, chambre ou immeuble avec plusieurs logements.',cta:'Ajouter un bien',run:()=>actions.add('properties')},
  {done:state.leases.length>0,icon:Users,title:'Ajoutez un locataire et son loyer',text:'Loyer, charges, caution et jour de paiement : les échéances se préparent seules.',cta:'Ajouter un locataire',run:()=>actions.go('locataires')},
  {done:state.payments.length>0,icon:Wallet,title:'Encaissez un premier loyer',text:'Même partiel : Yombal calcule le reste et prépare le reçu.',cta:'Voir les loyers',run:()=>actions.go('loyers')},
  {done:!!p.paymentInstructions,icon:CreditCard,title:'Indiquez comment vous payer',text:'Votre numéro Wave / Orange Money s’affiche sur les factures.',cta:'Régler mes factures',run:()=>actions.go('parametres')},
 ];
 const done=steps.filter(s=>s.done).length;
 if(hidden||actions.isDemo||done===steps.length||state.payments.length>2)return null;
 const next=steps.find(s=>!s.done)!;
 return <section className="gs" aria-label="Premiers pas">
  <div className="gs-head">
   <div><span className="gs-eyebrow">PREMIERS PAS · {done}/{steps.length}</span><h2>Bienvenue sur Yombal ! Configurons votre espace.</h2><p>Suivez ces étapes, ou découvrez d’abord un espace d’exemple déjà rempli.</p></div>
   <div className="gs-actions">{actions.demo&&<button type="button" className="gs-demo" onClick={actions.demo}><PlayCircle size={18}/>Voir la démonstration</button>}<button type="button" className="gs-close" aria-label="Masquer les premiers pas" onClick={()=>{setHidden(true);try{localStorage.setItem('yombal-start-hidden','1');}catch{}}}><X size={16}/></button></div>
  </div>
  <div className="gs-bar"><i style={{width:Math.round(done/steps.length*100)+'%'}}/></div>
  <ol className="gs-steps">{steps.map(s=><li key={s.title} className={s.done?'done':s===next?'next':''}>
   <span className="gs-ic">{s.done?<Check size={17}/>:<s.icon size={17}/>}</span>
   <div><b>{s.title}</b><small>{s.text}</small></div>
   {!s.done&&<button type="button" className={s===next?'button primary small':'text-button'} onClick={s.run}>{s.cta}</button>}
  </li>)}</ol>
 </section>;
}
