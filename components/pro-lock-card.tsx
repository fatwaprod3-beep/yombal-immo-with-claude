'use client';
import {Crown,Sparkles,Check,Lock} from 'lucide-react';
import {plans} from '../lib/billing';
import {money} from '../lib/model';

// Carte posée sur la partie floutée d'un document : explique pourquoi c'est flouté, ce que Pro débloque,
// et laisse une sortie gratuite quand elle existe. Le but : que la personne comprenne, pas qu'elle se sente bloquée.
export default function ProLockCard({reason,kind='reçu',onPro,onFree}:{reason:'quota'|'style';kind?:string;onPro:()=>void;onFree?:()=>void}){
 const best=plans.reduce((a,p)=>p.price/p.months<a.price/a.months?p:a,plans[0]),from=money(Math.round(best.price/best.months));
 return <div className="pro-lock-card" role="note">
  <span className="pro-lock-badge">{reason==='style'?<Sparkles size={14}/>:<Lock size={14}/>}{reason==='style'?'Style Pro':'3 documents gratuits utilisés'}</span>
  <h3>{reason==='style'?`Votre ${kind} est prêt, avec votre style Pro ✨`:`Votre ${kind} est prêt 🎉`}</h3>
  <p>{reason==='style'
   ?'Le modèle ou la signature que vous avez choisis sont réservés à Yombal Pro. Le document complet est flouté ici pour qu’il ne circule pas sans abonnement.'
   :'Vous avez utilisé vos 3 documents gratuits : bravo, Yombal vous sert déjà ! Le document complet est flouté ici. Avec Pro, vous l’envoyez tout de suite, ainsi que tous les suivants.'}</p>
  <ul><li><Check size={14}/>Reçus, factures et contrats sans limite</li><li><Check size={14}/>Votre modèle, votre logo et votre signature</li><li><Check size={14}/>Envoi direct sur WhatsApp</li></ul>
  <button type="button" className="pro-lock-cta" onClick={onPro}><Crown size={17}/>Devenir Pro · dès {from} / mois</button>
  {onFree&&<button type="button" className="pro-lock-free" onClick={onFree}>Envoyer gratuitement au modèle Classique</button>}
  <small>{best.months>1?`Formule ${best.months} mois à ${money(best.price)} · `:''}sans engagement · Wave, Orange Money ou carte</small>
 </div>;
}
