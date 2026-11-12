'use client';
import {useEffect,useState,useRef} from 'react';
import {Download,Check,X,Zap,BellRing,MessageCircle,TriangleAlert} from 'lucide-react';
import {isStandalone as standalone,inAppBrowser} from '../lib/app-install';

// Invitation à installer l'application : revient à chaque ouverture de Yombal sur téléphone tant que
// l'application n'est pas installée. On ne bloque jamais l'accès (le navigateur Facebook ne sait pas installer).
const sessionKey='yombal-install-asked';
export default function InstallInvitation({onInstall,available,suspended=false}:{onInstall:()=>Promise<void>;available:boolean;suspended?:boolean}){
 const started=useRef(Date.now());
 const offered=useRef(false);
 const ref=useRef<HTMLDialogElement>(null);
 const [open,setOpen]=useState(false),[installed,setInstalled]=useState(true),[busy,setBusy]=useState(false),[inApp,setInApp]=useState(false);
 useEffect(()=>{
  const done=()=>{setInstalled(true);setOpen(false);};
  const display=window.matchMedia('(display-mode: standalone)');
  const changed=()=>{if(standalone())done();};
  setInstalled(standalone()||!!window.yombalInstall?.installed);
  setInApp(inAppBrowser(navigator.userAgent));
  window.addEventListener('appinstalled',done);display.addEventListener('change',changed);
  return ()=>{window.removeEventListener('appinstalled',done);display.removeEventListener('change',changed);};
 },[]);
 useEffect(()=>{if(available&&!standalone())setInstalled(false);},[available]);
 useEffect(()=>{
  if(installed||suspended||standalone())return;
  const mq=window.matchMedia('(max-width: 850px)');
  let due=false;
  const check=()=>{if(!due||offered.current||!mq.matches||document.hidden||standalone()||document.querySelector('dialog[open], [role=dialog][data-state=open], [role=listbox]'))return;try{if(sessionStorage.getItem(sessionKey)==='1')return;}catch{}offered.current=true;setOpen(true);};
  const resized=()=>{if(!mq.matches)setOpen(false);else check();};
  const timer=setTimeout(()=>{due=true;check();},Math.max(0,6000-(Date.now()-started.current)));
  const observer=new MutationObserver(check);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',check);
  mq.addEventListener('change',resized);
  return ()=>{clearTimeout(timer);observer.disconnect();document.removeEventListener('visibilitychange',check);mq.removeEventListener('change',resized);};
 },[installed,suspended,available]);
 useEffect(()=>{const d=ref.current;if(open&&d&&!d.open)d.showModal();},[open]);
 function remember(){try{sessionStorage.setItem(sessionKey,'1');}catch{}}
 function dismiss(){remember();ref.current?.close();setOpen(false);}
 async function go(){setBusy(true);remember();ref.current?.close();setOpen(false);try{await onInstall();}finally{setBusy(false);}}
 if(installed||!open)return null;
 const label=available?'Installer Yombal':inApp?'Ouvrir dans Chrome':'Voir comment installer';
 return <dialog ref={ref} className="install-invite" aria-labelledby="install-invite-title" onCancel={e=>{e.preventDefault();dismiss();}}>
  <div className="install-invite-hero" aria-hidden="true">
   <button type="button" className="install-invite-close" onClick={dismiss} aria-label="Plus tard"><X size={20}/></button>
   <span className="install-invite-glow"/>
   <div className="install-invite-phone">
    <div className="install-invite-screen">
     <span className="install-invite-app"><img src="/icons/yombal-192.png" alt=""/><small>Yombal</small></span>
     {Array.from({length:7},(_,i)=><span key={i} className="install-invite-dot"/>)}
    </div>
   </div>
  </div>
  <div className="install-invite-body">
   <span className="install-invite-eyebrow">Votre espace, toujours à portée de main</span>
   <h2 id="install-invite-title">Ajoutez Yombal à votre écran d’accueil</h2>
   <p>Comme WhatsApp ou Wave : une icône, un geste, et vos loyers sont là. Sans chercher le lien, sans retaper l’adresse.</p>
   <ul>
    <li><span><Zap size={16}/></span><div><strong>Ouverture instantanée</strong><small>Plein écran, sans la barre du navigateur.</small></div></li>
    <li><span><BellRing size={16}/></span><div><strong>Vos rappels de loyers</strong><small>Retards et échéances visibles dès l’ouverture.</small></div></li>
    <li><span><MessageCircle size={16}/></span><div><strong>Quittances en un geste</strong><small>Reçu PDF envoyé sur WhatsApp depuis l’icône.</small></div></li>
   </ul>
   {inApp&&<p className="install-invite-note"><TriangleAlert size={15}/>Vous êtes dans l’application Facebook : elle ne peut pas installer Yombal. On va l’ouvrir dans Chrome, c’est l’affaire de 10 secondes.</p>}
   <button type="button" className="install-invite-cta" disabled={busy} onClick={()=>void go()}><Download size={18}/>{label}</button>
   <button type="button" className="install-invite-later" onClick={dismiss} disabled={busy}>Pas maintenant</button>
   <small className="install-invite-free"><Check size={13}/>Gratuit · 1 Mo · aucune boutique d’applications</small>
  </div>
 </dialog>;
}
