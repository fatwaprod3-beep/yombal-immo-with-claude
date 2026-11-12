'use client';
import {useEffect,useState,useRef} from 'react';
import {Download,Check,X,Zap,BellRing,MessageCircle,TriangleAlert,Search,Clock,Smartphone,Share,SquarePlus,MousePointerClick} from 'lucide-react';
import {isStandalone as standalone,inAppBrowser,installationDevice} from '../lib/app-install';
import {trackEvent} from '../lib/track-event';

// Invitation à installer l'application : une fois par ouverture de Yombal sur téléphone, tant que l'application
// n'est pas installée. Trois versions différentes se relaient pour ne pas lasser. Jamais pendant une saisie,
// jamais bloquante (le navigateur Facebook ne sait pas installer).
const sessionKey='yombal-install-asked',countKey='yombal-install-shown';
type Variant='phone'|'rents'|'steps';
const order:Variant[]=['phone','rents','steps'];

export default function InstallInvitation({onInstall,available,suspended=false}:{onInstall:()=>Promise<void>;available:boolean;suspended?:boolean}){
 const started=useRef(Date.now());
 const offered=useRef(false),momentRef=useRef(false);
 const ref=useRef<HTMLDialogElement>(null);
 const [open,setOpen]=useState(false),[installed,setInstalled]=useState(true),[busy,setBusy]=useState(false),[inApp,setInApp]=useState(false),[variant,setVariant]=useState<Variant>('phone'),[device,setDevice]=useState<'android'|'ios'|'desktop'>('android'),[moment,setMoment]=useState(false);
 useEffect(()=>{
  const done=()=>{setInstalled(true);setOpen(false);};
  const installedNow=()=>{trackEvent('app_installed');done();};
  if(standalone())trackEvent('app_open_standalone');
  const display=window.matchMedia('(display-mode: standalone)');
  const changed=()=>{if(standalone())done();};
  setInstalled(standalone()||!!window.yombalInstall?.installed);
  setInApp(inAppBrowser(navigator.userAgent));
  setDevice(installationDevice(navigator.userAgent,navigator.maxTouchPoints));
  window.addEventListener('appinstalled',installedNow);display.addEventListener('change',changed);
  return ()=>{window.removeEventListener('appinstalled',installedNow);display.removeEventListener('change',changed);};
 },[]);
 useEffect(()=>{if(available&&!standalone())setInstalled(false);},[available]);
 useEffect(()=>{
  if(installed||suspended||standalone())return;
  const mq=window.matchMedia('(max-width: 850px)');
  let shown=0;try{shown=Number(localStorage.getItem(countKey)||0);}catch{}
  // Première fois : vite. Ensuite on laisse la personne travailler un peu avant de reproposer.
  const delay=shown===0?6000:15000;
  let due=false;
  const busyTyping=()=>{const a=document.activeElement;return !!a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.tagName==='SELECT'||(a as HTMLElement).isContentEditable);};
  const check=()=>{if(!due||offered.current||!mq.matches||document.hidden||standalone()||busyTyping()||document.querySelector('dialog[open], [role=dialog][data-state=open], [role=listbox]'))return;try{if(sessionStorage.getItem(sessionKey)==='1')return;localStorage.setItem(countKey,String(shown+1));}catch{}offered.current=true;try{sessionStorage.setItem('yombal-popup-shown','1');}catch{}const v=momentRef.current?'phone':order[shown%order.length];setVariant(v);setOpen(true);trackEvent('install_prompt_shown',v);};
  const resized=()=>{if(!mq.matches)setOpen(false);else check();};
  // Juste après une réussite (premier logement enregistré…) : c'est le meilleur moment pour proposer le raccourci.
  const success=()=>{due=true;momentRef.current=true;setMoment(true);try{sessionStorage.removeItem(sessionKey);sessionStorage.removeItem('yombal-popup-shown');}catch{}offered.current=false;setTimeout(check,700);};
  window.addEventListener('yombal:success',success);
  const timer=setTimeout(()=>{due=true;check();},Math.max(0,delay-(Date.now()-started.current)));
  const observer=new MutationObserver(check);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',check);document.addEventListener('focusout',check);
  mq.addEventListener('change',resized);
  return ()=>{clearTimeout(timer);observer.disconnect();document.removeEventListener('visibilitychange',check);document.removeEventListener('focusout',check);mq.removeEventListener('change',resized);window.removeEventListener('yombal:success',success);};
 },[installed,suspended,available]);
 useEffect(()=>{const d=ref.current;if(open&&d&&!d.open)d.showModal();},[open]);
 function remember(){try{sessionStorage.setItem(sessionKey,'1');}catch{}}
 function dismiss(){trackEvent('install_prompt_dismissed',variant);remember();ref.current?.close();setOpen(false);}
 async function go(){trackEvent('install_prompt_accepted',variant);setBusy(true);remember();ref.current?.close();setOpen(false);try{await onInstall();}finally{setBusy(false);}}
 if(installed||!open)return null;
 const label=available?'📌 Mettre sur mon écran d’accueil':inApp?'Ouvrir dans Chrome':device==='ios'?'Me montrer comment':'📌 Mettre sur mon écran d’accueil';
 const ios=device==='ios'&&!available;
 const steps=available?[{icon:MousePointerClick,text:'Appuyez sur « Installer Yombal »'},{icon:Check,text:'Confirmez « Installer »'},{icon:Smartphone,text:'L’icône apparaît sur votre téléphone'}]
  :ios?[{icon:Share,text:'Dans Safari, appuyez sur Partager'},{icon:SquarePlus,text:'Choisissez « Sur l’écran d’accueil »'},{icon:Check,text:'Confirmez avec « Ajouter »'}]
  :[{icon:Download,text:'Ouvrez le menu ⋮ de Chrome'},{icon:SquarePlus,text:'« Installer l’application »'},{icon:Check,text:'Confirmez : l’icône est là'}];
 const content={
  phone:{eyebrow:moment?'Dernière étape · votre raccourci':'Votre espace, toujours à portée de main',title:moment?'Bravo ! Gardez vos loyers à portée de main':'Suivez vos loyers depuis votre écran d’accueil',text:'Comme WhatsApp ou Wave : une icône, un geste, et vos loyers sont là. Sans chercher le lien, sans retaper l’adresse.',
   items:[{icon:Zap,title:'Ouverture instantanée',text:'Plein écran, sans la barre du navigateur.'},{icon:BellRing,title:'Vos rappels de loyers',text:'Retards et échéances visibles dès l’ouverture.'},{icon:MessageCircle,title:'Quittances en un geste',text:'Reçu PDF envoyé sur WhatsApp depuis l’icône.'}]},
  rents:{eyebrow:'Le 5 du mois, sans stress',title:'Qui a payé ? La réponse en 2 secondes',text:'Le jour des loyers, vous n’avez pas le temps de chercher un lien dans vos messages. Avec l’icône, vous ouvrez et vous voyez tout.',
   items:[{icon:Search,title:'Fini « c’était quoi le site déjà ? »',text:'Yombal reste sur votre écran, à côté de vos applis.'},{icon:Clock,title:'Prêt en un geste',text:'Pas de navigateur, pas d’onglets à fouiller.'}]},
  steps:{eyebrow:'10 secondes, c’est tout',title:'Un raccourci Yombal, c’est plus simple que vous ne le pensez',text:ios?'Sur iPhone, Apple ne permet pas de bouton direct : voici les 3 gestes à faire dans Safari.':'Pas de boutique d’applications, pas de compte à créer. Juste 3 gestes :',items:[]},
 }[variant];
 return <dialog ref={ref} className={'install-invite v-'+variant} aria-labelledby="install-invite-title" onCancel={e=>{e.preventDefault();dismiss();}}>
  <div className="install-invite-hero" aria-hidden="true">
   <button type="button" className="install-invite-close" onClick={dismiss} aria-label="Plus tard"><X size={20}/></button>
   <span className="install-invite-glow"/>
   {variant==='phone'&&<div className="install-invite-phone"><div className="install-invite-screen"><span className="install-invite-app"><img src="/icons/yombal-192.png" alt=""/><small>Yombal</small></span>{Array.from({length:7},(_,i)=><span key={i} className="install-invite-dot"/>)}</div></div>}
   {variant==='rents'&&<div className="install-invite-rents">
    <div className="iir-card"><i className="ok"/><div><b>Appartement Ouakam</b><small>Awa Diop · 250 000 F</small></div><span className="ok">Payé</span></div>
    <div className="iir-card"><i className="late"/><div><b>Studio Mermoz</b><small>Ibrahima Fall · 120 000 F</small></div><span className="late">5 j de retard</span></div>
    <div className="iir-card"><i className="part"/><div><b>Magasin Thiès</b><small>Mame Sène · 60 000 / 150 000 F</small></div><span className="part">Partiel</span></div>
   </div>}
   {variant==='steps'&&<div className="install-invite-timer"><img src="/icons/yombal-192.png" alt=""/><span><b>10</b><small>secondes</small></span></div>}
  </div>
  <div className="install-invite-body">
   <span className="install-invite-eyebrow">{content.eyebrow}</span>
   <h2 id="install-invite-title">{content.title}</h2>
   <p>{content.text}</p>
   {variant==='steps'?<ol className="install-invite-steps">{steps.map((s,i)=><li key={i}><span>{i+1}</span><s.icon size={16}/><b>{s.text}</b></li>)}</ol>
   :<ul>{content.items.map(it=><li key={it.title}><span><it.icon size={16}/></span><div><strong>{it.title}</strong><small>{it.text}</small></div></li>)}</ul>}
   {inApp&&<p className="install-invite-note"><TriangleAlert size={15}/>Vous êtes dans l’application Facebook : elle ne peut pas installer Yombal. On va l’ouvrir dans Chrome, c’est l’affaire de 10 secondes.</p>}
   <button type="button" className="install-invite-cta" disabled={busy} onClick={()=>void go()}><Download size={18}/>{label}</button>
   <button type="button" className="install-invite-later" onClick={dismiss} disabled={busy}>Pas maintenant</button>
   <small className="install-invite-free"><Check size={13}/>Gratuit · rien à télécharger sur le Play Store · se retire en 1 geste</small>
  </div>
 </dialog>;
}
