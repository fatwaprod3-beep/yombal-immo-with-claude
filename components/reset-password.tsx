'use client';
import {useState} from 'react';
import {KeyRound,Eye,EyeOff,Check} from 'lucide-react';

// Choisir un nouveau mot de passe à partir du lien reçu (WhatsApp ou e-mail).
export default function ResetPassword({token}:{token:string}){
 const [next,setNext]=useState(''),[confirm,setConfirm]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[done,setDone]=useState(false);
 async function submit(){
  setError('');
  if(next.length<8)return setError('8 caractères minimum.');
  if(next!==confirm)return setError('Les deux mots de passe ne sont pas identiques.');
  setBusy(true);
  try{const r=await fetch('/api/auth/reset',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,next})});const d=await r.json().catch(()=>({})) as {error?:string};if(!r.ok)throw new Error(d.error||'Impossible pour le moment.');setDone(true);setTimeout(()=>{window.location.href='/';},1500);}
  catch(e){setError(e instanceof Error?e.message:'Impossible pour le moment.');}
  finally{setBusy(false);}
 }
 return <main className="reset-page"><div className="reset-card">
  <img src="/icons/yombal-192.png" alt="Yombal" width={56} height={56}/>
  {done?<><span className="reset-ok"><Check size={26}/></span><h1>C’est fait !</h1><p>Votre nouveau mot de passe est enregistré. On vous ouvre votre espace…</p></>
  :!token?<><h1>Lien incomplet</h1><p>Ouvrez à nouveau le lien reçu, en entier. S’il ne marche plus, demandez-en un nouveau.</p><a className="reset-btn" href="/connexion">Retour à la connexion</a></>
  :<><h1>Choisissez un nouveau mot de passe</h1><p>Il remplace l’ancien sur tous vos appareils.</p>
   <form onSubmit={e=>{e.preventDefault();void submit();}}>
    <label><span>Nouveau mot de passe</span><div className="reset-input"><input type={show?'text':'password'} autoComplete="new-password" value={next} onChange={e=>setNext(e.target.value)} minLength={8} maxLength={200} required/><button type="button" onClick={()=>setShow(v=>!v)} aria-label={show?'Masquer':'Afficher'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
    <label><span>Confirmez-le</span><input type={show?'text':'password'} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={8} maxLength={200} required/></label>
    {error&&<p className="reset-error" role="alert">{error}</p>}
    <button type="submit" className="reset-btn" disabled={busy} aria-busy={busy}><KeyRound size={17}/>{busy?'Enregistrement…':'Enregistrer et me connecter'}</button>
   </form></>}
 </div></main>;
}
