'use client';
import {useEffect,useState,useRef} from 'react';
import {Download,Smartphone,Check,TriangleAlert} from 'lucide-react';
import {Dialog} from './ui';
import {isStandalone as standalone,inAppBrowser} from '../lib/app-install';

// Rappel insistant : la fenêtre revient à chaque ouverture de Yombal tant que l'application n'est pas installée,
// et la bannière reste affichée en permanence. On ne bloque jamais l'accès (certains navigateurs ne peuvent pas installer).
const sessionKey='yombal-install-asked';
export default function InstallInvitation({onInstall,available,suspended=false,banner=true}:{onInstall:()=>Promise<void>;available:boolean;suspended?:boolean;banner?:boolean}){
 const started=useRef(Date.now());
 const offered=useRef(false);
 const [open,setOpen]=useState(false),[installed,setInstalled]=useState(true),[busy,setBusy]=useState(false),[mobile,setMobile]=useState(false),[inApp,setInApp]=useState(false);
 useEffect(()=>{
  const done=()=>{setInstalled(true);setOpen(false);};
  const display=window.matchMedia('(display-mode: standalone)');
  const changed=()=>{if(standalone())done();};
  setInstalled(standalone()||!!window.yombalInstall?.installed);
  setInApp(inAppBrowser(navigator.userAgent));
  const mq=window.matchMedia('(max-width: 850px)');const onMq=()=>setMobile(mq.matches);onMq();mq.addEventListener('change',onMq);
  window.addEventListener('appinstalled',done);display.addEventListener('change',changed);
  return ()=>{window.removeEventListener('appinstalled',done);display.removeEventListener('change',changed);mq.removeEventListener('change',onMq);};
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
 const showBanner=banner&&mobile&&!installed;
 useEffect(()=>{document.body.classList.toggle('has-install-banner',showBanner);return()=>document.body.classList.remove('has-install-banner');},[showBanner]);
 function dismiss(){setOpen(false);try{sessionStorage.setItem(sessionKey,'1');}catch{}}
 async function go(){setBusy(true);setOpen(false);try{sessionStorage.setItem(sessionKey,'1');}catch{}try{await onInstall();}finally{setBusy(false);}}
 if(installed)return null;
 const label=available?'Installer':inApp?'Ouvrir dans Chrome':'Comment installer';
 return <>
  {showBanner&&<div className="install-banner" role="region" aria-label="Installer l’application"><Smartphone size={18}/><div><strong>Installez l’application Yombal</strong><small>{inApp?'Vous êtes dans l’application Facebook : ouvrez Yombal dans Chrome pour l’installer.':'Sans l’icône sur votre téléphone, vous risquez de perdre l’accès à votre espace.'}</small></div><button type="button" className="button primary small" disabled={busy} onClick={()=>void go()}><Download size={15}/>{label}</button></div>}
  {open&&<Dialog className="install-invitation" title="Installez Yombal sur votre téléphone" detail="Une étape indispensable pour retrouver votre espace à tout moment." onClose={dismiss}><div className="form-body"><div className="install-app-card"><img src="/icons/yombal-192.png" alt=""/><div><strong>Yombal.immo</strong><small>Vos biens, simplement.</small></div><Smartphone size={25}/></div><ul><li><Check size={16}/>Une icône dédiée sur votre téléphone, comme WhatsApp</li><li><Check size={16}/>Vos loyers et vos locataires en un geste, même hors connexion</li><li><Check size={16}/>Aucun risque de perdre le lien ou votre espace</li></ul>{inApp?<p className="form-note install-warning"><TriangleAlert size={15}/>Vous êtes dans l’application Facebook. Elle ne peut pas installer Yombal : nous allons l’ouvrir dans Chrome.</p>:!available&&<p className="form-note">Si votre navigateur ne propose pas l’installation directe, nous vous montrons les étapes.</p>}</div><div className="dialog-footer"><button type="button" className="button secondary" onClick={dismiss} disabled={busy}>Plus tard</button><button type="button" className="button primary" disabled={busy} onClick={()=>void go()}><Download size={17}/>{label}</button></div></Dialog>}
 </>;
}
