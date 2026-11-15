'use client';
import {useEffect,useState} from 'react';
import {X,TriangleAlert} from 'lucide-react';
import {inAppBrowser,installationDevice,openInChrome,openInSafari,handoffLink} from '../lib/app-install';
import {trackEvent} from '../lib/track-event';

// Inscrits depuis une pub : Yombal s'ouvre dans le navigateur de Facebook/Instagram. Le lendemain, la personne
// tape « yombal » dans Chrome… qui ne la connaît pas, et elle a oublié son mot de passe. On l'invite donc tout de
// suite à passer dans son navigateur habituel, déjà connectée (lien personnel de 3 minutes, à usage unique).
const hideKey='yombal-switch-hidden';
export default function BrowserSwitch({onIos}:{onIos:()=>void}){
 const [device,setDevice]=useState<'android'|'ios'|null>(null);
 useEffect(()=>{
  const ua=navigator.userAgent;if(!inAppBrowser(ua))return;
  try{if(sessionStorage.getItem(hideKey)==='1')return;}catch{}
  const d=installationDevice(ua,navigator.maxTouchPoints);if(d==='desktop')return;
  setDevice(d);trackEvent('browser_switch','shown-'+d);
 },[]);
 const [link,setLink]=useState('');
 useEffect(()=>{if(device!=='ios')return;let on=true;const load=()=>void handoffLink().then(l=>{if(on)setLink(l);});load();const t=setInterval(load,150000);return ()=>{on=false;clearInterval(t);};},[device]);
 if(!device)return null;
 const hide=()=>{try{sessionStorage.setItem(hideKey,'1');}catch{}setDevice(null);};
 const go=async()=>{trackEvent('browser_switch','clicked-'+device);if(device==='ios'){const ok=await openInSafari(link||undefined);trackEvent('browser_switch',ok?'xsafari-ok':'xsafari-failed');if(!ok)onIos();}else void openInChrome();};
 const app=/Instagram/i.test(navigator.userAgent)?'Instagram':'Facebook';
 return <div className="browser-switch" role="note">
  <TriangleAlert size={18} aria-hidden="true"/>
  <div><b>Vous êtes dans {app}</b><small>Important : ouvrez Yombal dans {device==='ios'?'Safari':'Chrome'} (déjà connecté), sinon demain il faudra retrouver votre mot de passe.</small></div>
  <button type="button" className="browser-switch-go" onClick={()=>void go()}>Ouvrir dans {device==='ios'?'Safari':'Chrome'}</button>
  <button type="button" className="browser-switch-x" onClick={hide} aria-label="Masquer"><X size={16}/></button>
 </div>;
}
