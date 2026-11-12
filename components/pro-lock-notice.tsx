'use client';
import {Lock,Crown,FileText} from 'lucide-react';
import {usesProStyle,plans} from '../lib/billing';
import {invoiceTemplates} from '../lib/invoices';
import {money,type Profile} from '../lib/model';

// Explication claire au-dessus d'un aperçu flouté : pourquoi c'est flouté, et comment le débloquer.
export default function ProLockNotice({profile,onPro,onFree}:{profile:Profile;onPro:()=>void;onFree?:()=>void}){
 const style=usesProStyle(profile);
 const template=invoiceTemplates.find(t=>t.id===profile.invoiceTemplate);
 const why=style?[template&&template.id!=='classic'&&template.id!=='minimal'?`le modèle Pro « ${template.name} »`:'',profile.signature?'votre signature':''].filter(Boolean).join(' et '):'';
 return <section className="pro-lock-notice" role="note">
  <span className="pro-lock-icon"><Lock size={18}/></span>
  <div className="pro-lock-text">
   <strong>Aperçu flouté : ce document est réservé à Yombal Pro</strong>
   <p>{style?`Il utilise ${why||'une option Pro'}. `:'Vous avez utilisé vos 3 documents gratuits. '}Votre brouillon est bien enregistré ; avec <b>Yombal Pro</b> (dès {money(plans[0].price)}/mois), vous l’envoyez sur WhatsApp et le téléchargez en PDF, sans limite.</p>
   <div className="pro-lock-actions"><button type="button" className="pro-lock-cta" onClick={onPro}><Crown size={16}/>Devenir Pro</button>{style&&onFree&&<button type="button" className="pro-lock-free" onClick={onFree}><FileText size={15}/>Envoyer avec le modèle gratuit</button>}</div>
  </div>
 </section>;
}
