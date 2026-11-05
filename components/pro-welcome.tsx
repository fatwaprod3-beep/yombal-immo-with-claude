'use client';
import {useEffect,useRef,useState} from 'react';
import {Crown,X,ArrowRight,CalendarCheck} from 'lucide-react';
import {ProBenefitGrid} from './pro-benefits';
import {findPlan,type Subscription} from '../lib/billing';
import {dateLabel} from '../lib/model';

// Message de remerciement affiché une fois par période payée (nouvel abonnement ou renouvellement).
export default function ProWelcome({subscription,onDiscover}:{subscription:Subscription;onDiscover?:()=>void}){
 const [open,setOpen]=useState(false);const ref=useRef<HTMLDialogElement>(null);
 const key=subscription.isPro&&!subscription.development&&subscription.expiresAt?'yombal-pro-welcome:'+subscription.expiresAt:'';
 useEffect(()=>{if(!key)return;let seen=false;try{seen=localStorage.getItem('yombal-pro-welcome')===key;}catch{}
  // L’affichage dépend du navigateur (déjà vu ou non), connu seulement après le chargement.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  if(!seen)setOpen(true);},[key]);
 useEffect(()=>{const d=ref.current;if(open&&d&&!d.open)d.showModal();},[open]);
 function close(){try{localStorage.setItem('yombal-pro-welcome',key);}catch{}ref.current?.close();setOpen(false);}
 if(!open)return null;
 const plan=findPlan(subscription.planId);
 return <dialog ref={ref} className="pro-welcome" aria-labelledby="pro-welcome-title" onCancel={e=>{e.preventDefault();close();}}>
  <div className="pro-welcome-top"><div className="pro-welcome-sparkles" aria-hidden="true">{Array.from({length:14},(_,i)=><i key={i}/>)}</div>
   <button type="button" className="pro-welcome-close" onClick={close} aria-label="Fermer"><X size={20}/></button>
   <span className="pro-welcome-crown"><Crown size={38}/></span>
   <span className="pro-welcome-eyebrow">BIENVENUE DANS YOMBAL PRO</span>
   <h2 id="pro-welcome-title">Merci pour votre confiance !</h2>
   <p>Votre paiement est confirmé. Toutes les fonctions Pro sont maintenant ouvertes pour faire grandir votre activité.</p>
  </div>
  <div className="pro-welcome-body">
   <div className="pro-member-status"><CalendarCheck size={20}/><div><strong>{plan?.name||'Yombal Pro'}</strong><span>{subscription.expiresAt?'Actif jusqu’au '+dateLabel(subscription.expiresAt.slice(0,10)):'Accès actif'}</span></div></div>
   <h3 className="pro-member-title">Ce que vous débloquez</h3>
   <ProBenefitGrid/>
   <button type="button" className="button primary pro-welcome-cta" onClick={()=>{close();onDiscover?.();}}>Commencer avec Pro<ArrowRight size={17}/></button>
   <p className="pro-welcome-note">Un reçu de paiement vous a été envoyé par SasPay. Retrouvez votre abonnement à tout moment dans « Mon abonnement ».</p>
  </div>
 </dialog>;
}

// Badge affiché à côté du profil : couronne pour Pro, pousse pour le plan gratuit.
export function PlanBadge({subscription,onClick}:{subscription:Subscription;onClick:()=>void}){
 const pro=subscription.isPro;
 return <button type="button" className={'plan-badge '+(pro?'is-pro':'is-free')} onClick={onClick} title={pro?(subscription.expiresAt?'Yombal Pro · actif jusqu’au '+dateLabel(subscription.expiresAt.slice(0,10)):'Yombal Pro'):'Plan gratuit · découvrir Pro'}>
  {pro?<Crown size={14}/>:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 20h10"/><path d="M12 20v-8"/><path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6Z"/><path d="M12 14c0-3-2-5-6-5 0 3 2 5 6 5Z"/></svg>}
  <span>{pro?'Pro':'Gratuit'}</span>
 </button>;
}
