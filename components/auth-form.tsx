'use client';
import {useState,type FormEvent} from 'react';
import Link from 'next/link';
import {ArrowLeft,LogIn,UserPlus} from 'lucide-react';

export default function AuthForm({returnTo,initialMode,google=false,initialError=''}:{returnTo:string;initialMode:'login'|'register';google?:boolean;initialError?:string}){
 const [mode,setMode]=useState(initialMode),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(initialError);
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
  {google&&<><a className="google-button" href={'/api/auth/google?return_to='+encodeURIComponent(returnTo)} onClick={()=>setBusy(true)}><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>{register?'S’inscrire avec Google':'Continuer avec Google'}</a>
  <div className="auth-divider"><span>ou avec votre e-mail</span></div></>}
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
