'use client';
import {useEffect,useRef,useState} from 'react';
import {AlertTriangle,ShieldCheck} from 'lucide-react';

// Fenêtre de confirmation aux couleurs de Yombal, à la place de window.confirm du navigateur.
type Request={message:string;title?:string;confirmLabel?:string;danger?:boolean;resolve:(ok:boolean)=>void};
let open:((r:Request)=>void)|null=null;

export function askConfirm(message:string,options:{title?:string;confirmLabel?:string;danger?:boolean}={}):Promise<boolean>{
 return new Promise(resolve=>{if(!open){resolve(window.confirm(message));return;}open({message,...options,resolve});});
}

export default function ConfirmHost(){
 const [req,setReq]=useState<Request|null>(null);const ok=useRef<HTMLButtonElement>(null);
 useEffect(()=>{open=r=>setReq(r);return()=>{open=null;};},[]);
 useEffect(()=>{if(!req)return;ok.current?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape')close(false);};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);});
 function close(value:boolean){req?.resolve(value);setReq(null);}
 if(!req)return null;
 const danger=req.danger??/supprim|déconnect|suspend|ferm|coup|maintenance|retir/i.test(req.message);
 return <div className="yc-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)close(false);}}>
  <div className="yc-dialog" role="alertdialog" aria-modal="true" aria-labelledby="yc-title" aria-describedby="yc-text">
   <span className={'yc-icon'+(danger?' danger':'')}>{danger?<AlertTriangle size={22}/>:<ShieldCheck size={22}/>}</span>
   <h2 id="yc-title">{req.title||(danger?'Confirmer cette action':'Confirmation')}</h2>
   <p id="yc-text">{req.message}</p>
   <div className="yc-actions"><button type="button" className="yc-cancel" onClick={()=>close(false)}>Annuler</button><button type="button" ref={ok} className={'yc-ok'+(danger?' danger':'')} onClick={()=>close(true)}>{req.confirmLabel||'Confirmer'}</button></div>
  </div>
 </div>;
}
