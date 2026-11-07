'use client';
import {track} from '../lib/meta-pixel';
import {useState,type FormEvent} from 'react';
import {Mail,MessageCircle,Send,Clock3} from 'lucide-react';
const subjects=['Question sur mon compte','Problème technique','Factures et paiements','Signalement','Suggestion','Autre'];
/** Formulaire de contact public : enregistré dans Yombal et visible dans l’administration. */
export default function PublicContact(){
 const [subject,setSubject]=useState(subjects[0]),[email,setEmail]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[done,setDone]=useState(''),[error,setError]=useState('');
 async function submit(e:FormEvent){e.preventDefault();setError('');if(!email.includes('@')||message.trim().length<10){setError('Indiquez votre e-mail et un message d’au moins 10 caractères.');return;}setBusy(true);
  try{const r=await fetch('/api/support',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subject,email,message})});const d=await r.json() as {id?:string;error?:string};if(!r.ok)throw Error(d.error||'Envoi impossible.');setDone(d.id||'');setMessage('');track('Contact');}catch(e){setError(e instanceof Error?e.message:'Réessayez.');}finally{setBusy(false);}}
 return <div className="pc-grid">
  <form className="pc-card pc-form" onSubmit={submit} noValidate>
   <h2>Écrivez-nous</h2><p>Réponse sous 24 à 48 h ouvrées.</p>
   <div className="pc-chips" role="group" aria-label="Sujet">{subjects.map(s=><button type="button" key={s} className={s===subject?'on':''} aria-pressed={s===subject} onClick={()=>setSubject(s)}>{s}</button>)}</div>
   <label><span>Votre e-mail</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} placeholder="vous@exemple.com" required/></label>
   <label><span>Votre message</span><textarea rows={6} value={message} onChange={e=>setMessage(e.target.value)} maxLength={4000} placeholder="Expliquez simplement votre demande. Ne partagez jamais de mot de passe ni de code secret." required/></label>
   {error&&<p className="pc-error" role="alert">{error}</p>}{done&&<p className="pc-ok" role="status">Message bien reçu · référence {done.slice(0,8).toUpperCase()}. Nous vous répondons par e-mail.</p>}
   <button className="lp-btn lp-btn-lg" disabled={busy}><Send size={17}/>{busy?'Envoi…':'Envoyer mon message'}</button>
  </form>
  <aside className="pc-side">
   <div className="pc-card"><span className="pc-ic"><Mail size={20}/></span><h3>Par e-mail</h3><p><a href="mailto:fatwaprod3@gmail.com">fatwaprod3@gmail.com</a></p></div>
   <div className="pc-card"><span className="pc-ic"><MessageCircle size={20}/></span><h3>Dans l’application</h3><p>Connecté, ouvrez la bulle « Assistant » pour une réponse immédiate, ou Aide → Contact.</p></div>
   <div className="pc-card"><span className="pc-ic"><Clock3 size={20}/></span><h3>Horaires</h3><p>Du lundi au samedi, 9 h – 19 h (heure de Dakar).</p></div>
  </aside>
 </div>;
}
