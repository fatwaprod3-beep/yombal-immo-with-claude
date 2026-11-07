'use client';
import {useEffect,useRef,useState} from 'react';
import {Send,Mail,Copy,Download,LoaderCircle} from 'lucide-react';
import {whatsappLink,emailLink,mailAppLink} from '../lib/sharing';
import {htmlToPdfFile,sharePdf,downloadFile,canShareFile} from '../lib/pdf-file';

/** Prépare le PDF d’un document en arrière-plan, pour que le partage s’ouvre immédiatement au toucher. */
export function usePdf(pdf?:{html:string;filename:string}){
 const [file,setFile]=useState<File|null>(null),[state,setState]=useState<'idle'|'busy'|'ready'|'error'>('idle');const key=pdf?pdf.filename+pdf.html.length:'';const run=useRef(0);
 useEffect(()=>{if(!pdf)return;const id=++run.current;setState('busy');setFile(null);htmlToPdfFile(pdf.html,pdf.filename).then(f=>{if(run.current===id){setFile(f);setState('ready');}}).catch(()=>{if(run.current===id)setState('error');});// eslint-disable-next-line react-hooks/exhaustive-deps
 },[key]);
 return {file,state};
}

export default function ShareActions({text,subject,phone='',email='',pdf,onPrepare,onError}:{text:string;subject:string;phone?:string;email?:string;pdf?:{html:string;filename:string};onPrepare?:(channel:'whatsapp'|'email'|'copy')=>void;onError?:(message:string)=>void}){
 const {file,state}=usePdf(pdf);const [note,setNote]=useState('');
 async function whatsapp(){if(!file)return;onPrepare?.('whatsapp');const r=await sharePdf(file,text,phone);if(r==='downloaded')setNote('PDF téléchargé : dans WhatsApp, touchez 📎 puis « Document » pour le joindre au message.');else if(r==='shared')setNote('');}
 const mobileShare=!!file&&canShareFile(file);
 return <div className="share-actions">
  {pdf?<button type="button" className="button primary share-wa" disabled={state!=='ready'} onClick={()=>void whatsapp()}>{state==='busy'?<LoaderCircle size={16} className="spin"/>:<Send size={16}/>}{state==='busy'?'Préparation du PDF…':state==='error'?'PDF indisponible':mobileShare?'Envoyer le PDF (WhatsApp…)':'WhatsApp + PDF'}</button>
  :<a className="button secondary" href={whatsappLink(text,phone)} target="_blank" rel="noopener noreferrer" onClick={()=>onPrepare?.('whatsapp')}><Send size={16}/>WhatsApp</a>}
  {pdf&&<button type="button" className="button secondary" disabled={!file} onClick={()=>file&&downloadFile(file)}><Download size={16}/>Télécharger le PDF</button>}
  {pdf&&state==='error'&&<a className="button secondary" href={whatsappLink(text,phone)} target="_blank" rel="noopener noreferrer" onClick={()=>onPrepare?.('whatsapp')}><Send size={16}/>WhatsApp (texte)</a>}
  <a className="button secondary" href={emailLink(subject,text,email)} target="_blank" rel="noopener noreferrer" onClick={()=>onPrepare?.('email')}><Mail size={16}/>E-mail</a>
  <button type="button" className="button secondary" onClick={async()=>{try{await navigator.clipboard.writeText(text);onPrepare?.('copy');}catch{onError?.('Copie indisponible. Sélectionnez le texte du message.');}}}><Copy size={16}/>Copier le texte</button>
  <details className="share-email-options"><summary>Autre application e-mail</summary><a href={mailAppLink(subject,text,email)} onClick={()=>onPrepare?.('email')}>Ouvrir mon application de messagerie</a></details>
  {note?<small className="share-note">{note}</small>:<small>{pdf?(mobileShare?'Le PDF est joint automatiquement : choisissez WhatsApp puis le contact.':'Sur ordinateur, le PDF se télécharge et WhatsApp s’ouvre : joignez-le avec 📎.'):'Un message s’ouvre avant l’envoi. Vous pouvez choisir ou modifier son destinataire.'}</small>}
 </div>;
}
