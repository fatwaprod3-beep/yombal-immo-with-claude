'use client';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowLeft,LogIn,UserPlus} from 'lucide-react';

export default function AuthForm({returnTo,initialMode}:{returnTo:string;initialMode:'login'|'register'}){
 const [mode,setMode]=useState(initialMode),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const register=mode==='register';
 async function submit(e:FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{
   const r=await fetch(register?'/api/auth/register':'/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(register?{name,email,password}:{email,password})});
   const d=await r.json().catch(()=>({})) as {error?:string};
   if(!r.ok)throw Error(d.error||'Réessayez.');
   window.location.assign(returnTo);
  }catch(e){setError(e instanceof Error?e.message:'Réessayez.');setBusy(false);}
 }
 return <main className="admin-shell"><section className="admin-card">
  <Link className="text-button" href="/" prefetch={false}><ArrowLeft size={17}/>Retour à Yombal</Link>
  <span className="admin-symbol">{register?<UserPlus size={28}/>:<LogIn size={28}/>}</span>
  <h1>{register?'Créer mon compte Yombal':'Se connecter à Yombal'}</h1>
  <p>{register?'Gratuit, sans engagement. Vos biens restent privés.':'Retrouvez vos biens, locataires et factures sur tous vos appareils.'}</p>
  <form onSubmit={submit}>
   {register&&<label className="field"><span>Nom complet ou nom de l’agence</span><input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" minLength={2} maxLength={120} required/></label>}
   <label className="field"><span>E-mail</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" maxLength={200} required/></label>
   <label className="field"><span>Mot de passe{register?' (8 caractères minimum)':''}</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete={register?'new-password':'current-password'} minLength={register?8:1} maxLength={200} required/></label>
   <button className="button primary" disabled={busy} aria-busy={busy}>{busy?'Patientez…':register?'Créer mon compte':'Se connecter'}</button>
  </form>
  {error&&<p className="form-error" role="alert">{error}</p>}
  <p>{register?'Déjà un compte ?':'Pas encore de compte ?'} <button type="button" className="text-button" onClick={()=>{setMode(register?'login':'register');setError('');}}>{register?'Se connecter':'Créer un compte'}</button></p>
 </section></main>;
}
