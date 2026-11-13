'use client';
import {useEffect,useRef,useState} from 'react';
import {X,Copy,Check,MoreHorizontal,Compass,Gift,ArrowRight,ArrowLeft,MessageCircle,PartyPopper} from 'lucide-react';
import {handoffLink,iosBrowser,isIpad} from '../lib/app-install';
import {trackEvent} from '../lib/track-event';
import {supportLink} from '../lib/support';

// iPhone : Apple n'autorise pas de bouton « Installer ». On montre exactement où toucher, avec une flèche
// qui pointe le bouton Partager de Safari (en bas) ou de Chrome (en haut). Depuis Facebook/Instagram,
// on explique comment passer dans Safari en gardant la connexion.
const ShareIcon=()=><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const AddIcon=()=><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" strokeWidth="1.9"/><path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round"/></svg>;
export default function IosInstallCoach({onClose}:{onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 const [browser,setBrowser]=useState<'safari'|'chrome'|'inapp'|'other'>('safari'),[tablet,setTablet]=useState(false),[copied,setCopied]=useState(false),[step,setStep]=useState(0);
 useEffect(()=>{setBrowser(iosBrowser(navigator.userAgent));setTablet(isIpad(navigator.userAgent,navigator.maxTouchPoints));const d=ref.current;if(d&&!d.open)d.showModal();trackEvent('install_prompt_accepted','ios-coach');},[]);
 const close=()=>{ref.current?.close();onClose();};
 async function copy(){const link=await handoffLink();try{await navigator.clipboard.writeText(link);setCopied(true);}catch{window.prompt('Copiez ce lien puis collez-le dans Safari :',link);}}
 const arrowTop=browser==='chrome'||tablet;
 // Étape par étape : on ne peut pas toucher Safari à la place de la personne, mais on lui montre un geste à la fois.
 const go=(n:number)=>{setStep(n);if(n>step)trackEvent('ios_coach_step',String(n+1));};
 const menuLabel=browser==='chrome'?'Ajouter à l’écran d’accueil':'Sur l’écran d’accueil';
 return <dialog ref={ref} className={'ios-coach'+(arrowTop?' top':'')} aria-labelledby="ios-coach-title" onCancel={e=>{e.preventDefault();close();}}>
  <div className="ios-coach-card">
   <button type="button" className="ios-coach-close" onClick={close} aria-label="Fermer"><X size={18}/></button>
   {(browser==='inapp'||step===0)?<><img src="/icons/yombal-192.png" alt="" width={52} height={52}/>
   <h2 id="ios-coach-title">{browser==='inapp'?'Ouvrez Yombal dans Safari':'Mettez Yombal sur votre écran d’accueil'}</h2>
   <span className="ios-coach-bonus"><Gift size={14}/>Bonus : +1 reçu gratuit</span></>:<h2 id="ios-coach-title" className="ios-coach-mini">Yombal sur votre écran d’accueil</h2>}
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
    <div className="ios-coach-progress" aria-label={step<3?`Étape ${step+1} sur 3`:'Terminé'}>{[0,1,2].map(i=><i key={i} className={i<=step?'on':''}/>)}</div>
    {step===0&&<>
     <span className="ios-coach-eyebrow">Étape 1 sur 3</span>
     <p className="ios-coach-do">Touchez le bouton Partager <span className="ios-coach-key"><ShareIcon/></span> {arrowTop?'en haut de l’écran':'tout en bas de l’écran'} {arrowTop?'👆':'👇'}</p>
     <small>Apple ne permet pas de bouton direct : on vous guide geste par geste.{browser==='safari'&&!tablet?' Vous ne le voyez pas ? Touchez d’abord ••• en bas à droite.':''}</small>
    </>}
    {step===1&&<>
     <span className="ios-coach-eyebrow">Étape 2 sur 3</span>
     <p className="ios-coach-do">Choisissez <strong>« {menuLabel} »</strong></p>
     <div className="ios-coach-sheet" aria-hidden="true"><span>Copier</span><span>Ajouter aux favoris</span><span className="hl">{menuLabel}<AddIcon/></span></div>
     <small>Faites glisser le menu vers le haut si vous ne voyez pas cette ligne.</small>
    </>}
    {step===2&&<>
     <span className="ios-coach-eyebrow">Étape 3 sur 3</span>
     <p className="ios-coach-do">Touchez <strong>« Ajouter »</strong> en haut à droite</p>
     <div className="ios-coach-addbar" aria-hidden="true"><div><span>Annuler</span><b>Écran d’accueil</b><span className="hl">Ajouter</span></div><div className="app"><img src="/icons/yombal-192.png" alt=""/><span><b>Yombal</b><small>yombal-immo.pro</small></span></div></div>
     <small>C’est la dernière étape !</small>
    </>}
    {step===3&&<>
     <span className="ios-coach-party"><PartyPopper size={30}/></span>
     <p className="ios-coach-do">Bravo ! Ouvrez maintenant Yombal depuis sa <strong>nouvelle icône</strong> sur votre écran d’accueil.</p>
     <small>Votre bonus de +1 reçu gratuit est activé dès la première ouverture depuis l’icône.</small>
    </>}
    {step<3?<button type="button" className="ios-coach-ok" onClick={()=>go(step+1)}><Check size={17}/>{step===2?'C’est fait':'C’est fait — Suivant'}<ArrowRight size={17}/></button>
     :<button type="button" className="ios-coach-ok" onClick={close}>Compris</button>}
    <div className="ios-coach-links">{step>0&&step<3&&<button type="button" onClick={()=>setStep(step-1)}><ArrowLeft size={14}/>Retour</button>}<a href={supportLink()} target="_blank" rel="noopener noreferrer"><MessageCircle size={14}/>Je suis bloqué · WhatsApp</a></div>
   </>}
  </div>
  {browser!=='inapp'&&step===0&&<div className="ios-coach-arrow" aria-hidden="true"><ShareIcon/></div>}
 </dialog>;
}
