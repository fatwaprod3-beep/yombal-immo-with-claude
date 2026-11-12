'use client';
import {useEffect,useRef} from 'react';
import {Lock,Crown,Check} from 'lucide-react';
import {trackEvent} from '../lib/track-event';

// Après les 3 documents gratuits : on montre le haut du document, le reste est flouté, et on propose Pro.
// Le brouillon reste enregistré : rien n'est perdu.
export default function LockedDocument({html,onUnlock,onClose}:{html:string;onUnlock:()=>void;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current;if(d&&!d.open)d.showModal();trackEvent('document_locked');},[]);
 const close=()=>{ref.current?.close();onClose();};
 return <dialog ref={ref} className="locked-doc" aria-labelledby="locked-doc-title" onCancel={e=>{e.preventDefault();close();}}>
  <div className="locked-doc-preview" aria-hidden="true">
   <iframe title="Aperçu du document" srcDoc={html} sandbox="" tabIndex={-1}/>
   <div className="locked-doc-veil"><span><Lock size={20}/></span></div>
  </div>
  <div className="locked-doc-body">
   <span className="locked-doc-eyebrow">Votre document est prêt</span>
   <h2 id="locked-doc-title">Débloquez-le avec Yombal Pro</h2>
   <p>Vous avez utilisé vos <strong>3 documents gratuits</strong>. Celui-ci est enregistré en brouillon : avec Pro, vous le téléchargez et l’envoyez sur WhatsApp tout de suite, ainsi que tous les suivants.</p>
   <ul><li><Check size={15}/>Reçus et factures illimités</li><li><Check size={15}/>Contrats de bail prêts à signer</li><li><Check size={15}/>Votre signature et votre logo sur vos documents</li></ul>
   <button type="button" className="locked-doc-cta" onClick={()=>{ref.current?.close();onUnlock();}}><Crown size={18}/>Débloquer avec Pro</button>
   <button type="button" className="locked-doc-later" onClick={close}>Plus tard · le brouillon reste enregistré</button>
  </div>
 </dialog>;
}
