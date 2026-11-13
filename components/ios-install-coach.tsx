'use client';
import {useEffect,useRef,useState} from 'react';
import {X,Copy,Check,MoreHorizontal,Compass,Gift} from 'lucide-react';
import {handoffLink,iosBrowser,isIpad} from '../lib/app-install';
import {trackEvent} from '../lib/track-event';

// iPhone : Apple n'autorise pas de bouton « Installer ». On montre exactement où toucher, avec une flèche
// qui pointe le bouton Partager de Safari (en bas) ou de Chrome (en haut). Depuis Facebook/Instagram,
// on explique comment passer dans Safari en gardant la connexion.
const ShareIcon=()=><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const AddIcon=()=><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" strokeWidth="1.9"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>;
export default function IosInstallCoach({onClose}:{onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 const [browser,setBrowser]=useState<'safari'|'chrome'|'inapp'|'other'>('safari'),[tablet,setTablet]=useState(false),[copied,setCopied]=useState(false);
 useEffect(()=>{setBrowser(iosBrowser(navigator.userAgent));setTablet(isIpad(navigator.userAgent,navigator.maxTouchPoints));const d=ref.current;if(d&&!d.open)d.showModal();trackEvent('install_prompt_accepted','ios-coach');},[]);
 const close=()=>{ref.current?.close();onClose();};
 async function copy(){const link=await handoffLink();try{await navigator.clipboard.writeText(link);setCopied(true);}catch{window.prompt('Copiez ce lien puis collez-le dans Safari :',link);}}
 const arrowTop=browser==='chrome'||tablet;
 return <dialog ref={ref} className={'ios-coach'+(arrowTop?' top':'')} aria-labelledby="ios-coach-title" onCancel={e=>{e.preventDefault();close();}}>
  <div className="ios-coach-card">
   <button type="button" className="ios-coach-close" onClick={close} aria-label="Fermer"><X size={18}/></button>
   <img src="/icons/yombal-192.png" alt="" width={52} height={52}/>
   <h2 id="ios-coach-title">{browser==='inapp'?'Ouvrez Yombal dans Safari':'Mettez Yombal sur votre écran d’accueil'}</h2>
   <span className="ios-coach-bonus"><Gift size={14}/>Bonus : +1 reçu gratuit</span>
   {browser==='inapp'?<>
    <p>Vous êtes dans l’application Facebook ou Instagram : elle ne permet pas d’ajouter Yombal. Passez dans Safari, c’est rapide.</p>
    <ol className="ios-coach-steps">
     <li><b>1</b><span>Touchez <MoreHorizontal size={17}/> en haut à droite de l’écran</span></li>
     <li><b>2</b><span>Choisissez <strong>« Ouvrir dans le navigateur »</strong> <Compass size={16}/></span></li>
     <li><b>3</b><span>Dans Safari, touchez <ShareIcon/> puis <strong>« Sur l’écran d’accueil »</strong></span></li>
    </ol>
    <button type="button" className="ios-coach-copy" onClick={()=>void copy()}>{copied?<><Check size={17}/>Lien copié : collez-le dans Safari</>:<><Copy size={17}/>Ou copier mon lien de connexion</>}</button>
    <small>Le lien vous reconnecte directement. Valable 3 minutes, une seule fois.</small>
   </>:<>
    <p>Apple ne permet pas de bouton direct : c’est vous qui l’ajoutez, en 3 gestes.</p>
    <ol className="ios-coach-steps">
     <li><b>1</b><span>Touchez le bouton Partager <span className="ios-coach-key"><ShareIcon/></span> {arrowTop?'en haut':'en bas de l’écran'}</span></li>
     <li><b>2</b><span>Faites défiler et choisissez <span className="ios-coach-key"><AddIcon/></span> <strong>« Sur l’écran d’accueil »</strong></span></li>
     <li><b>3</b><span>Touchez <strong>« Ajouter »</strong> en haut à droite : c’est fait !</span></li>
    </ol>
    <button type="button" className="ios-coach-ok" onClick={close}>J’ai compris</button>
   </>}
  </div>
  {browser!=='inapp'&&<div className="ios-coach-arrow" aria-hidden="true"><ShareIcon/></div>}
 </dialog>;
}
