'use client';
import {useEffect,useRef,useState} from 'react';
import {BellRing,X,Check,AlarmClock,CalendarDays,ReceiptText} from 'lucide-react';
import {isStandalone} from '../lib/app-install';
import {trackEvent} from '../lib/track-event';

// Invitation à activer les rappels (notifications du téléphone). Une seule fenêtre par ouverture de Yombal :
// si l'invitation d'installation est apparue, celle-ci attend la prochaine fois.
const askedKey='yombal-push-asked-at',popupKey='yombal-popup-shown';
const fromB64=(v:string)=>{const pad='='.repeat((4-v.length%4)%4);const raw=atob((v+pad).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0));};
export function pushSupported(){return typeof window!=='undefined'&&'Notification' in window&&'serviceWorker' in navigator&&'PushManager' in window;}
export async function enablePush():Promise<boolean>{
 if(!pushSupported())return false;
 const permission=await Notification.requestPermission();
 if(permission!=='granted'){trackEvent('push_denied');return false;}
 const reg=await navigator.serviceWorker.ready;
 const {publicKey}=await (await fetch('/api/push/key',{cache:'no-store'})).json() as {publicKey:string};
 const sub=(await reg.pushManager.getSubscription())||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:fromB64(publicKey)});
 const r=await fetch('/api/push/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(sub.toJSON())});
 return r.ok;
}
export default function NotifyInvitation({ready,suspended=false}:{ready:boolean;suspended?:boolean}){
 const ref=useRef<HTMLDialogElement>(null),offered=useRef(false);
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[done,setDone]=useState('');
 useEffect(()=>{
  if(!ready||suspended||!pushSupported()||Notification.permission!=='default')return;
  try{const at=Number(localStorage.getItem(askedKey)||0);if(at&&Date.now()-at<3*864e5)return;if(sessionStorage.getItem(popupKey)==='1')return;}catch{}
  // Déjà abonné sur ce téléphone : rien à demander.
  void navigator.serviceWorker.ready.then(r=>r.pushManager.getSubscription()).then(s=>{if(s)offered.current=true;}).catch(()=>{});
  let due=false;
  const typing=()=>{const a=document.activeElement;return !!a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.tagName==='SELECT');};
  const check=()=>{if(!due||offered.current||document.hidden||typing()||document.querySelector('dialog[open], [role=dialog][data-state=open], [role=listbox]'))return;try{if(sessionStorage.getItem(popupKey)==='1')return;sessionStorage.setItem(popupKey,'1');localStorage.setItem(askedKey,String(Date.now()));}catch{}offered.current=true;setOpen(true);};
  const timer=setTimeout(()=>{due=true;check();},isStandalone()?8000:20000);
  const observer=new MutationObserver(check);observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
  document.addEventListener('visibilitychange',check);document.addEventListener('focusout',check);
  return ()=>{clearTimeout(timer);observer.disconnect();document.removeEventListener('visibilitychange',check);document.removeEventListener('focusout',check);};
 },[ready,suspended]);
 useEffect(()=>{const d=ref.current;if(open&&d&&!d.open)d.showModal();},[open]);
 const close=()=>{ref.current?.close();setOpen(false);};
 async function accept(){setBusy(true);try{const ok=await enablePush();if(ok){setDone('ok');setTimeout(close,1800);}else{setDone(Notification.permission==='denied'?'denied':'error');}}catch{setDone('error');}finally{setBusy(false);}}
 if(!open)return null;
 return <dialog ref={ref} className="install-invite notify-invite" aria-labelledby="notify-invite-title" onCancel={e=>{e.preventDefault();close();}}>
  <div className="install-invite-hero" aria-hidden="true">
   <button type="button" className="install-invite-close" onClick={close} aria-label="Plus tard"><X size={20}/></button>
   <span className="install-invite-glow"/>
   <div className="notify-lock"><small>09:00</small>
    <div className="notify-card"><img src="/icons/yombal-192.png" alt=""/><div><b>⏰ 2 loyers à relancer</b><span>Ibrahima Fall, Mame Sène — envoyez un rappel en 1 geste.</span></div></div>
    <div className="notify-card second"><img src="/icons/yombal-192.png" alt=""/><div><b>📅 C’est le mois des loyers</b><span>Suivez vos locataires d’un coup d’œil.</span></div></div>
   </div>
  </div>
  <div className="install-invite-body">
   <span className="install-invite-eyebrow">Rappels Yombal</span>
   <h2 id="notify-invite-title">Ne ratez plus jamais un loyer</h2>
   <p>Yombal vous prévient au bon moment, directement sur votre téléphone, même quand l’application est fermée.</p>
   <ul>
    <li><span><AlarmClock size={16}/></span><div><strong>Loyers en retard</strong><small>Qui doit encore, et le rappel prêt à envoyer.</small></div></li>
    <li><span><CalendarDays size={16}/></span><div><strong>Début du mois</strong><small>Le bon moment pour encaisser et envoyer les reçus.</small></div></li>
    <li><span><ReceiptText size={16}/></span><div><strong>Rien d’inutile</strong><small>Au plus un rappel tous les 2 jours. Jamais de publicité.</small></div></li>
   </ul>
   {done==='ok'?<p className="notify-done"><Check size={17}/>C’est activé ! Une première notification arrive pour vérifier.</p>
   :done==='denied'?<p className="install-invite-note">Les notifications sont bloquées pour Yombal. Pour les activer : réglages du téléphone → Notifications → Yombal (ou Chrome).</p>
   :done==='error'?<p className="install-invite-note">L’activation n’a pas abouti. Réessayez dans un instant.</p>:null}
   {done!=='ok'&&<button type="button" className="install-invite-cta" disabled={busy} onClick={()=>void accept()}><BellRing size={18}/>{busy?'Activation…':'Activer les rappels'}</button>}
   <button type="button" className="install-invite-later" onClick={close} disabled={busy}>{done==='ok'?'Fermer':'Pas maintenant'}</button>
  </div>
 </dialog>;
}
