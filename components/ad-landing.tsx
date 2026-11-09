"use client";
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {markSignup,track} from '../lib/meta-pixel';
import {ArrowRight,Check,FileSignature,MessageCircle,AlarmClock,LockKeyhole,ShieldCheck,ChevronDown} from 'lucide-react';

const benefits=[
 {icon:MessageCircle,title:'Quittances sur WhatsApp',text:'Le reçu PDF part au locataire en un geste. Fini les reçus à la main.'},
 {icon:AlarmClock,title:'Retards visibles tout de suite',text:'Vous voyez qui a payé, qui doit encore, et combien. Même les paiements en plusieurs fois.'},
 {icon:FileSignature,title:'Contrats de bail prêts',text:'Habitation, meublé ou commercial : vous remplissez les noms, le contrat est prêt.'},
];
const faq=[
 {q:'C’est vraiment gratuit ?',a:'Oui. Jusqu’à 6 biens et 7 locataires, sans carte bancaire et sans limite de temps. La formule Pro (dès 4 900 F/mois) sert seulement si vous avez plus de biens.'},
 {q:'Je ne suis pas à l’aise avec l’informatique.',a:'Yombal est fait pour le téléphone, en français simple. Une courte vidéo vous guide à la première connexion, et on répond sur WhatsApp si besoin.'},
 {q:'Mes informations sont-elles privées ?',a:'Oui. Vos biens et vos locataires ne sont visibles que par vous. Rien n’est vendu ni partagé.'},
];

export default function AdLanding({google}:{google:boolean}){
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[showBar,setShowBar]=useState(false);
 const formRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{track('ViewContent',{content_name:'essai'});const el=formRef.current;if(!el||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(([e])=>setShowBar(!e.isIntersecting&&e.boundingClientRect.top<0),{threshold:0});io.observe(el);return()=>io.disconnect();},[]);
 async function submit(e:FormEvent){
  e.preventDefault();if(busy)return;setBusy(true);setError('');
  try{
   const r=await fetch('/api/auth/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password})});
   const d=await r.json().catch(()=>({})) as {error?:string};
   if(!r.ok)throw Error(d.error||'Réessayez.');
   markSignup();window.location.assign('/');
  }catch(err){setError(err instanceof Error?err.message:'Réessayez.');setBusy(false);}
 }
 const goForm=()=>formRef.current?.scrollIntoView({behavior:'smooth',block:'start'});
 return <div className="al">
  <header className="al-top"><span className="al-brand"><img src="/icons/favicon-96.png" alt="" width="30" height="30"/><span>yombal<em>.immo</em></span></span><a href="/connexion" className="al-login">Se connecter</a></header>
  <section className="al-hero">
   <span className="al-pill">Pour les propriétaires au Sénégal</span>
   <h1>Gérez vos loyers<br/><span>sans stress.</span></h1>
   <p>Qui a payé, qui est en retard, la quittance envoyée sur WhatsApp. Tout depuis votre téléphone.</p>
  </section>
  <div className="al-card" ref={formRef} id="inscription">
   <h2>Créez votre compte gratuit</h2>
   <p className="al-sub">1 minute · sans carte bancaire</p>
   {google&&<><a className="al-google" href="/api/auth/google?return_to=%2F" onClick={()=>setBusy(true)}><svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"/></svg>Continuer avec Google</a>
   <div className="al-or"><span>ou avec votre e-mail</span></div></>}
   <form onSubmit={submit}>
    <label><span>Votre nom ou celui de l’agence</span><input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" minLength={2} maxLength={120} required placeholder="Ex. : Moussa Ndiaye"/></label>
    <label><span>E-mail</span><input type="email" inputMode="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" maxLength={200} required placeholder="vous@exemple.com"/></label>
    <label><span>Mot de passe (8 caractères minimum)</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" minLength={8} maxLength={200} required/></label>
    <button className="al-btn" disabled={busy} aria-busy={busy}>{busy?'Patientez…':<>Créer mon compte gratuit<ArrowRight size={18}/></>}</button>
   </form>
   {error&&<p className="al-error" role="alert">{error}</p>}
   <ul className="al-trust"><li><Check size={14}/>Gratuit jusqu’à 6 biens</li><li><LockKeyhole size={14}/>Données privées</li><li><ShieldCheck size={14}/>Fait pour le Sénégal</li></ul>
  </div>
  <section className="al-mock" aria-hidden="true">
   <div className="al-mock-h"><b>Loyers de novembre</b><small>3 logements</small></div>
   <div className="al-row"><i className="ok"/><div><b>Appartement Ouakam</b><small>Awa Diop · 250 000 F</small></div><span className="ok">Payé</span></div>
   <div className="al-row"><i className="late"/><div><b>Studio Mermoz</b><small>Ibrahima Fall · 120 000 F</small></div><span className="late">Retard 5 j</span></div>
   <div className="al-row"><i className="part"/><div><b>Magasin Thiès</b><small>Mame Sène · 60 000 / 150 000 F</small></div><span className="part">Partiel</span></div>
   <div className="al-mock-f"><MessageCircle size={15}/>Quittance envoyée à Awa Diop sur WhatsApp</div>
  </section>
  <section className="al-benefits">{benefits.map(b=><div key={b.title} className="al-benefit"><span><b.icon size={20}/></span><div><h3>{b.title}</h3><p>{b.text}</p></div></div>)}</section>
  <section className="al-faq"><h2>Vos questions</h2>{faq.map(f=><details key={f.q}><summary>{f.q}<ChevronDown size={18}/></summary><p>{f.a}</p></details>)}</section>
  <section className="al-end"><h2>Prêt à souffler ?</h2><p>Ajoutez votre premier logement en 2 minutes.</p><button type="button" className="al-btn" onClick={goForm}>Créer mon compte gratuit<ArrowRight size={18}/></button><a href="/presentation" className="al-more">Voir toutes les fonctionnalités</a></section>
  <div className={'al-bar'+(showBar?' on':'')}><button type="button" className="al-btn" onClick={goForm} tabIndex={showBar?0:-1}>Créer mon compte gratuit<ArrowRight size={18}/></button></div>
 </div>;
}
