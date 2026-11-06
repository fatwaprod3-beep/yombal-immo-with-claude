'use client';
import {useCallback,useEffect,useLayoutEffect,useState,type CSSProperties} from 'react';
import {ArrowLeft,ArrowRight,PlayCircle,Sparkles,X} from 'lucide-react';

type Step={targets:string[];title:string;text:string};
// Visite guidée, étape par étape, comme dans les applications : une zone éclairée et une bulle d’explication.
const steps:Step[]=[
 {targets:[],title:'Bienvenue sur Yombal 👋',text:'En 1 minute, découvrez où tout se trouve. Vous pourrez revoir ce guide à tout moment dans Aide.'},
 {targets:['.overview-add'],title:'Ajoutez votre premier bien',text:'Appartement, villa, chambre ou immeuble entier. Tout commence ici.'},
 {targets:['.mobile-nav [data-nav="locataires"]','.sidebar [data-nav="locataires"]'],title:'Vos locataires',text:'Ajoutez chaque locataire avec son loyer, sa caution et son jour de paiement.'},
 {targets:['.mobile-nav [data-nav="loyers"]','.sidebar [data-nav="loyers"]'],title:'Loyers & paiements',text:'Encaissez un loyer, même partiel. Les retards apparaissent en rouge, les relances sont prêtes.'},
 {targets:['.stats-grid'],title:'Votre mois en un coup d’œil',text:'Loyers encaissés, à recevoir, logements occupés et dépenses : tout se met à jour seul.'},
 {targets:['.home-bulletin-wrap','.home-bulletin'],title:'Alertes et conseils',text:'Rouge : retard. Corail : à surveiller. Vert : bonne nouvelle. Violet : conseil du jour.'},
 {targets:['.sidebar [data-nav="factures"]','.mobile-nav [data-tour="more"]'],title:'Factures, reçus et plus',text:'Factures PDF, contrats, calendrier, entretien et analyses se trouvent ici.'},
 {targets:['[data-tour="settings"]','.mobile-nav [data-tour="more"]'],title:'Vos paramètres',text:'Ajoutez votre logo, votre téléphone et votre numéro Wave / Orange Money : ils apparaîtront sur vos factures.'},
 {targets:['.ya-fab'],title:'Une question ?',text:'L’assistant Yombal répond tout de suite, à toute heure.'},
];
const visible=(sel:string)=>{const el=document.querySelector<HTMLElement>(sel);if(!el)return null;const r=el.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(el).visibility!=='hidden'?el:null;};

export default function GuidedTour({open,onClose,onDemo}:{open:boolean;onClose:()=>void;onDemo?:()=>void}){
 const [index,setIndex]=useState(0),[rect,setRect]=useState<DOMRect|null>(null);
 const list=steps.filter(s=>!s.targets.length||typeof document==='undefined'||s.targets.some(t=>visible(t)));
 const step=list[Math.min(index,list.length-1)];
 const measure=useCallback(()=>{if(!step||!step.targets.length){setRect(null);return;}const el=step.targets.map(visible).find(Boolean);if(!el){setRect(null);return;}setRect(el.getBoundingClientRect());},[step]);
 useLayoutEffect(()=>{if(!open||!step)return;const el=step.targets.map(visible).find(Boolean);if(el){const r=el.getBoundingClientRect();if(r.top<70||r.bottom>window.innerHeight-90)el.scrollIntoView({block:'center',behavior:'instant' as ScrollBehavior});}measure();},[open,index,step,measure]);
 useEffect(()=>{if(!open)return;const on=()=>measure();window.addEventListener('resize',on);window.addEventListener('scroll',on,true);const key=(e:KeyboardEvent)=>{if(e.key==='Escape')onClose();if(e.key==='ArrowRight')setIndex(i=>Math.min(i+1,list.length-1));if(e.key==='ArrowLeft')setIndex(i=>Math.max(0,i-1));};window.addEventListener('keydown',key);return()=>{window.removeEventListener('resize',on);window.removeEventListener('scroll',on,true);window.removeEventListener('keydown',key);};},[open,measure,onClose,list.length]);
 useEffect(()=>{if(open)setIndex(0);},[open]);
 if(!open||!step)return null;
 const last=index>=list.length-1,pad=8;
 const hole=rect?{top:rect.top-pad,left:rect.left-pad,width:rect.width+pad*2,height:rect.height+pad*2}:null;
 const vw=typeof window!=='undefined'?window.innerWidth:400,vh=typeof window!=='undefined'?window.innerHeight:800;
 const cardW=Math.min(340,vw-24);
 let style:CSSProperties={left:(vw-cardW)/2,top:vh/2-130,width:cardW};
 if(hole){const below=hole.top+hole.height+14,above=hole.top-14;const left=Math.max(12,Math.min(vw-cardW-12,hole.left+hole.width/2-cardW/2));style=below+190<vh?{left,top:below,width:cardW}:{left,top:Math.max(12,above-190),width:cardW};}
 return <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
  {hole?<div className="tour-hole" style={hole}/>:<div className="tour-dim"/>}
  <div className="tour-card" style={style}>
   <div className="tour-top"><span className="tour-step"><Sparkles size={13}/>{index+1} / {list.length}</span><button type="button" className="tour-x" onClick={onClose} aria-label="Fermer le guide"><X size={16}/></button></div>
   <h3 id="tour-title">{step.title}</h3><p>{step.text}</p>
   <div className="tour-dots" aria-hidden="true">{list.map((_,i)=><i key={i} className={i===index?'on':''}/>)}</div>
   <div className="tour-actions">
    {index>0?<button type="button" className="tour-prev" onClick={()=>setIndex(i=>i-1)}><ArrowLeft size={15}/>Retour</button>:<button type="button" className="tour-prev" onClick={onClose}>Passer</button>}
    {last?<div className="tour-end">{onDemo&&<button type="button" className="tour-prev" onClick={()=>{onClose();onDemo();}}><PlayCircle size={15}/>Démo</button>}<button type="button" className="tour-next" onClick={onClose}>C’est parti !</button></div>
    :<button type="button" className="tour-next" onClick={()=>setIndex(i=>i+1)}>{index===0?'Commencer':'Suivant'}<ArrowRight size={15}/></button>}
   </div>
  </div>
 </div>;
}
