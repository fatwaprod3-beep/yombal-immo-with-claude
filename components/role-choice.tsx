'use client';
import {useEffect,useRef,useState} from 'react';
import {Home,BriefcaseBusiness,ArrowRight,Check} from 'lucide-react';
import type {Mode} from '../lib/model';

// Première question d'un nouveau compte : propriétaire ou agence. Les menus et les documents s'adaptent ensuite.
export default function RoleChoice({onChoose}:{onChoose:(mode:Mode)=>Promise<void>|void}){
 const ref=useRef<HTMLDialogElement>(null);
 const [mode,setMode]=useState<Mode|null>(null),[busy,setBusy]=useState(false);
 useEffect(()=>{const d=ref.current;if(d&&!d.open)d.showModal();},[]);
 async function confirm(){if(!mode||busy)return;setBusy(true);try{await onChoose(mode);ref.current?.close();}finally{setBusy(false);}}
 return <dialog ref={ref} className="role-choice" aria-labelledby="role-choice-title" onCancel={e=>e.preventDefault()}>
  <div className="role-choice-head"><img src="/icons/yombal-192.png" alt=""/><span className="role-choice-eyebrow">Bienvenue sur Yombal</span><h2 id="role-choice-title">Comment gérez-vous vos biens ?</h2><p>Une seule question, pour adapter votre espace. Vous pourrez changer plus tard dans les paramètres.</p></div>
  <div className="role-choice-options" role="radiogroup" aria-label="Votre profil">
   <button type="button" role="radio" aria-checked={mode==='owner'} className={mode==='owner'?'chosen':''} onClick={()=>setMode('owner')}><span className="role-choice-icon"><Home size={24}/></span><div><strong>Je gère mes propres biens</strong><small>Propriétaire : mes logements, mes locataires, mes loyers.</small></div><i><Check size={15}/></i></button>
   <button type="button" role="radio" aria-checked={mode==='agency'} className={mode==='agency'?'chosen':''} onClick={()=>setMode('agency')}><span className="role-choice-icon agency"><BriefcaseBusiness size={24}/></span><div><strong>Je suis une agence</strong><small>Je gère les biens de mes clients : propriétaires, commissions et reversements.</small></div><i><Check size={15}/></i></button>
  </div>
  <button type="button" className="role-choice-cta" disabled={!mode||busy} aria-busy={busy} onClick={()=>void confirm()}>{busy?'Un instant…':'Continuer'}<ArrowRight size={18}/></button>
 </dialog>;
}
