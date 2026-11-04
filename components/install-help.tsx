'use client';
import {useEffect,useState} from 'react';
import {Copy,Download,ExternalLink,Smartphone} from 'lucide-react';
import {Dialog} from './ui';
import {chromeInstallUrl,installationDevice} from '../lib/app-install';

export default function InstallHelp({available,onInstall,onClose}:{available:boolean;onInstall:()=>Promise<void>;onClose:()=>void}){
 const [device,setDevice]=useState<'android'|'ios'|'desktop'>('desktop');
 const [url,setUrl]=useState(''),[chrome,setChrome]=useState(''),[copy,setCopy]=useState(''),[busy,setBusy]=useState(false);
 useEffect(()=>{setDevice(installationDevice(navigator.userAgent,navigator.maxTouchPoints));setUrl(window.location.origin+'/');setChrome(chromeInstallUrl(window.location.origin));},[]);
 async function copyLink(){try{await navigator.clipboard.writeText(url);setCopy('Lien copié. Ouvrez-le dans votre navigateur.');}catch{setCopy('Appuyez longtemps sur le lien pour le copier.');}}
 return <Dialog className="install-help-dialog" title="Installer Yombal" detail="Une icône sur votre téléphone, votre espace habituel." onClose={onClose}>
  <div className="form-body">
   <div className="install-app-card"><img src="/icons/yombal-192.png" alt=""/><div><strong>Yombal.immo</strong><small>Votre gestion, à portée de main.</small></div><Smartphone size={25}/></div>
   {available?<p className="install-ready" role="status">L’installation est prête. Appuyez sur « Installer maintenant », puis confirmez sur votre appareil.</p>:<>
    <div className="filter-tabs install-device-picker" role="group" aria-label="Votre appareil">{([['android','Android'],['ios','iPhone'],['desktop','Ordinateur']] as const).map(([value,label])=><button key={value} type="button" className={device===value?'active':''} aria-pressed={device===value} onClick={()=>setDevice(value)}>{label}</button>)}</div>
    {device==='android'?<><div className="install-help"><div><span>1</span><p>Ouvrez Yombal dans <strong>Chrome</strong>. Si vous venez d’une autre application, utilisez le bouton ci-dessous.</p></div><div><span>2</span><p>Dans Chrome, ouvrez le menu <strong>⋮</strong>, puis <strong>Ajouter à l’écran d’accueil</strong> ou <strong>Installer l’application</strong>.</p></div><div><span>3</span><p>Confirmez <strong>Installer</strong>. L’icône Yombal apparaîtra sur votre téléphone.</p></div></div>{chrome&&<a className="button primary install-browser-link" href={chrome}>Ouvrir dans Chrome<ExternalLink size={16}/></a>}<p className="form-note">Le bouton ne s’ouvre pas ? Copiez le lien ci-dessous et collez-le dans Chrome.</p></>:device==='ios'?<div className="install-help"><div><span>1</span><p>Ouvrez le lien de Yombal dans <strong>Safari</strong>.</p></div><div><span>2</span><p>Appuyez sur <strong>Partager</strong>, puis <strong>Sur l’écran d’accueil</strong>.</p></div><div><span>3</span><p>Confirmez avec <strong>Ajouter</strong>.</p></div></div>:<div className="install-help"><div><span>1</span><p>Ouvrez Yombal dans <strong>Chrome ou Edge</strong>.</p></div><div><span>2</span><p>Utilisez l’icône d’installation dans la barre d’adresse ou le menu du navigateur.</p></div></div>}
    <label className="field install-copy-link"><span>Lien de Yombal</span><input aria-label="Lien de Yombal" readOnly value={url} onFocus={event=>event.currentTarget.select()}/></label><button type="button" className="button secondary" onClick={copyLink}><Copy size={16}/>Copier le lien</button>{copy&&<p className="form-note" role="status">{copy}</p>}
   </>}
  </div>
  <div className="dialog-footer"><button type="button" className="button secondary" onClick={onClose} disabled={busy}>Fermer</button>{available&&<button type="button" className="button primary" disabled={busy} onClick={async()=>{setBusy(true);try{await onInstall();}finally{setBusy(false);}}}><Download size={17}/>Installer maintenant</button>}</div>
 </Dialog>;
}
