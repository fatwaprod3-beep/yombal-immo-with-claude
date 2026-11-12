'use client';
import {useEffect,useRef} from 'react';
import {Lock,Crown,Check} from 'lucide-react';
import type {ProFeature} from '../lib/billing';
import {trackEvent} from '../lib/track-event';

// Le vrai document est préparé : on montre le haut, le reste est flouté, et on propose Pro.
// Rien n'est perdu (brouillon enregistré) et, pour un modèle Pro, la version gratuite reste possible.
const texts:Partial<Record<ProFeature,{eyebrow:string;title:string;text:string}>>={
 invoices:{eyebrow:'Votre document est prêt',title:'Débloquez-le avec Yombal Pro',text:'Vous avez utilisé vos 3 documents gratuits. Celui-ci est enregistré en brouillon : avec Pro, vous le téléchargez et l’envoyez sur WhatsApp tout de suite, ainsi que tous les suivants.'},
 invoiceTemplates:{eyebrow:'Votre document est prêt',title:'Envoyez-le avec votre style Pro',text:'Ce document utilise un modèle ou une signature Pro. Passez à Pro pour l’envoyer tel quel, ou envoyez-le avec le modèle gratuit.'},
 contracts:{eyebrow:'Votre contrat est prêt',title:'Débloquez votre contrat avec Yombal Pro',text:'Votre contrat est rempli avec le logement, le locataire et le loyer. Avec Pro, vous l’imprimez, l’envoyez et gardez la copie signée au bon endroit.'},
};
export default function LockedDocument({html,feature='invoices',onUnlock,onClose,onFree}:{html:string;feature?:ProFeature;onUnlock:()=>void;onClose:()=>void;onFree?:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;if(d&&!d.open)d.showModal();trackEvent('document_locked',feature);},[feature]);
 const close=()=>{ref.current?.close();onClose();};
 const t=texts[feature]||texts.invoices!;
 return <dialog ref={ref} className="locked-doc" aria-labelledby="locked-doc-title" onCancel={e=>{e.preventDefault();close();}}>
  <div className="locked-doc-preview" aria-hidden="true">
   <iframe title="Aperçu du document" srcDoc={html} sandbox="" tabIndex={-1}/>
   <div className="locked-doc-veil"><span><Lock size={20}/></span></div>
  </div>
  <div className="locked-doc-body">
   <span className="locked-doc-eyebrow">{t.eyebrow}</span>
   <h2 id="locked-doc-title">{t.title}</h2>
   <p>{t.text}</p>
   <ul><li><Check size={15}/>Reçus et factures illimités</li><li><Check size={15}/>Contrats de bail prêts à signer</li><li><Check size={15}/>Votre modèle, votre signature et votre logo</li></ul>
   <button type="button" className="locked-doc-cta" onClick={()=>{ref.current?.close();onUnlock();}}><Crown size={18}/>Débloquer avec Pro</button>
   {onFree&&<button type="button" className="locked-doc-free" onClick={()=>{ref.current?.close();onFree();}}>Envoyer avec le modèle gratuit</button>}
   <button type="button" className="locked-doc-later" onClick={close}>{feature==='contracts'?'Plus tard':'Plus tard · le brouillon reste enregistré'}</button>
  </div>
 </dialog>;
}
