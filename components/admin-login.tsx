'use client';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowLeft,ShieldCheck,LockKeyhole} from 'lucide-react';
import {apiFetch} from '../lib/api-fetch';
import AdminConsole from './admin-console';

export default function AdminLogin({email,active}:{email:string;active:boolean}){
 const [password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{const r=await apiFetch('/api/admin/session',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json() as {error?:string};if(!r.ok)throw Error(d.error||'Connexion impossible.');window.location.assign('/administration');}
  catch(e){setError(e instanceof Error?e.message:'Réessayez.');}finally{setBusy(false);}
 }
 async function leave(){
  setBusy(true);try{const r=await apiFetch('/api/admin/session',{method:'DELETE'});if(!r.ok)throw Error('Déconnexion impossible.');window.location.assign('/');}
  catch(e){setError(e instanceof Error?e.message:'Réessayez.');setBusy(false);}
 }
 if(active)return <>{error&&<p className="form-error" role="alert" style={{position:'fixed',bottom:16,left:16,zIndex:50}}>{error}</p>}<AdminConsole email={email} busy={busy} onLeave={()=>void leave()}/></>;
 return <main className="admin-shell"><section className="admin-card"><Link className="text-button" href="/" prefetch={false}><ArrowLeft size={17}/>Retour à Yombal</Link><span className="admin-symbol"><ShieldCheck size={28}/></span><h1>Votre administration privée</h1><p>Réservée à votre compte propriétaire. Votre connexion Yombal reste nécessaire.</p><form onSubmit={submit}><label className="field"><span>E-mail du propriétaire</span><input type="email" value={email} readOnly autoComplete="username"/></label><label className="field"><span>Votre mot de passe Yombal</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" maxLength={200} required/></label><button className="button primary" disabled={busy||!password} aria-busy={busy}><LockKeyhole size={17}/>{busy?'Vérification…':'Ouvrir mon accès privé'}</button></form>{error&&<p className="form-error" role="alert">{error}</p>}</section></main>;
}
