'use client';
import {useState} from 'react';
import {KeyRound,Eye,EyeOff} from 'lucide-react';
/** Changer son mot de passe (Paramètres → Préférences). */
export default function PasswordChange(){
 const [open,setOpen]=useState(false),[current,setCurrent]=useState(''),[next,setNext]=useState(''),[confirm,setConfirm]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[err,setErr]=useState('');
 async function save(){setErr('');setMsg('');if(next.length<8){setErr('Au moins 8 caractères.');return;}if(next!==confirm){setErr('Les deux nouveaux mots de passe ne sont pas identiques.');return;}setBusy(true);
  try{const r=await fetch('/api/auth/password',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({current,next})});const d=await r.json() as {error?:string};if(!r.ok)throw Error(d.error||'Modification impossible.');setMsg('Mot de passe modifié. Utilisez-le à votre prochaine connexion (et pour l’administration).');setCurrent('');setNext('');setConfirm('');setOpen(false);}catch(e){setErr(e instanceof Error?e.message:'Réessayez.');}finally{setBusy(false);}}
 const type=show?'text':'password';
 return <section className="password-change">
  <div className="password-change-h"><span><KeyRound size={18}/></span><div><strong>Mot de passe</strong><small>Changez-le régulièrement et ne le partagez jamais.</small></div>{!open&&<button type="button" className="button secondary" onClick={()=>setOpen(true)}>Changer</button>}</div>
  {open&&<div className="password-change-form">
   <label className="field"><span>Mot de passe actuel</span><input type={type} value={current} onChange={e=>setCurrent(e.target.value)} autoComplete="current-password"/></label>
   <label className="field"><span>Nouveau mot de passe</span><input type={type} value={next} onChange={e=>setNext(e.target.value)} autoComplete="new-password" minLength={8}/></label>
   <label className="field"><span>Confirmer le nouveau</span><input type={type} value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password"/></label>
   <div className="password-change-actions"><button type="button" className="text-button" onClick={()=>setShow(v=>!v)}>{show?<EyeOff size={15}/>:<Eye size={15}/>}{show?'Masquer':'Afficher'}</button><button type="button" className="button secondary" onClick={()=>{setOpen(false);setErr('');}}>Annuler</button><button type="button" className="button primary" disabled={busy||!current||!next} onClick={()=>void save()}>{busy?'Enregistrement…':'Enregistrer'}</button></div>
  </div>}
  {err&&<p className="form-error" role="alert">{err}</p>}{msg&&<p className="support-success" role="status">{msg}</p>}
 </section>;
}
