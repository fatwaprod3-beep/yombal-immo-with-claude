'use client';
import {useEffect,useState,useRef} from 'react';
import {Download,Smartphone,Check} from 'lucide-react';
import {Dialog} from './ui';
import {isStandalone as standalone} from '../lib/app-install';

const laterKey='yombal-install-later-v2';
export default function InstallInvitation({onInstall,available,suspended=false}:{onInstall:()=>Promise<void>;available:boolean;suspended?:boolean}){
 const started=useRef(Date.now());
 const offered=useRef(false);
 const [open,setOpen]=useState(false),[installed,setInstalled]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{
  const done=()=>{setInstalled(true);setOpen(false);};
  const display=window.matchMedia('(display-mode: standalone)');
  const changed=()=>{if(standalone())done();};
  if(standalone()||window.yombalInstall?.installed)done();
  window.addEventListener('appinstalled',done);display.addEventListener('change',changed);
  return ()=>{window.removeEventListener('appinstalled',done);display.removeEventListener('change',changed);};
 },[]);
 useEffect(()=>{if(available&&!standalone())setInstalled(false);},[available]);
 useEffect(()=>{
  if(installed||suspended||standalone())return;
  const mobile=window.matchMedia('(max-width: 850px)');
  let due=false;
  const check=()=>{if(!due||offered.current||!mobile.matches||document.hidden||standalone()||document.querySelector('dialog[open], [role=dialog][data-state=open], [role=listbox]'))return;try{if(Date.now()-Number(localStorage.getItem(laterKey)||0)<7*86400000)return;}catch{}offered.current=true;setOpen(true);};
  const resized=()=>{if(!mobile.matches)setOpen(false);else check();};
  const timer=setTimeout(()=>{due=true;check();},Math.max(0,20000-(Date.now()-started.current)));
  const observer=new MutationObserver(check);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',check);
  mobile.addEventListener('change',resized);
  return ()=>{clearTimeout(timer);observer.disconnect();document.removeEventListener('visibilitychange',check);mobile.removeEventListener('change',resized);};
 },[installed,suspended,available]);
 function dismiss(){setOpen(false);try{localStorage.setItem(laterKey,String(Date.now()));}catch{}}
 if(!open||installed)return null;
 return <Dialog className="install-invitation" title="Yombal sur votre téléphone" detail="Retrouvez votre gestion en un geste, depuis l’écran d’accueil." onClose={dismiss}><div className="form-body"><div className="install-app-card"><img src="/icons/yombal-192.png" alt=""/><div><strong>Yombal.immo</strong><small>Vos biens, simplement.</small></div><Smartphone size={25}/></div><ul><li><Check size={16}/>Une icône dédiée sur votre téléphone</li><li><Check size={16}/>Vos biens et vos loyers au même endroit</li></ul>{!available&&<p className="form-note">Si votre navigateur ne propose pas l’installation directe, nous vous montrons les étapes.</p>}</div><div className="dialog-footer"><button type="button" className="button secondary" onClick={dismiss} disabled={busy}>Plus tard</button><button type="button" className="button primary" disabled={busy} onClick={async()=>{setBusy(true);setOpen(false);try{await onInstall();}finally{setBusy(false);}}}><Download size={17}/>{available?'Installer':'Comment installer'}</button></div></Dialog>;
}
