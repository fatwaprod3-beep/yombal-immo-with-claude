'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {Bot,LoaderCircle,MessageCircle,Plus,Send,X} from 'lucide-react';
import {apiFetch} from '../lib/api-fetch';

type Msg={role:'user'|'assistant';content:string};
const suggestions=['Comment encaisser un loyer partiel ?','Comment relancer un locataire en retard ?','Que comprend Yombal Pro ?','Comment créer une facture ?'];

/** Assistant Yombal : bulle flottante disponible pour les clients connectés. */
export default function AssistantWidget({name}:{name:string}){
 const [open,setOpen]=useState(false),[ready,setReady]=useState<boolean|null>(null),[messages,setMessages]=useState<Msg[]>([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[conversationId,setConversationId]=useState<string|undefined>();
 const end=useRef<HTMLDivElement>(null),input=useRef<HTMLTextAreaElement>(null);
 useEffect(()=>{if(!open||ready!==null)return;void apiFetch('/api/assistant',{cache:'no-store'}).then(r=>r.json()).then((d:{ready?:boolean;conversations?:{id:string}[]})=>{setReady(!!d.ready);const last=d.conversations?.[0];if(last){setConversationId(last.id);void apiFetch('/api/assistant?id='+last.id,{cache:'no-store'}).then(r=>r.json()).then((m:{messages?:Msg[]})=>setMessages((m.messages||[]).slice(-20)));}}).catch(()=>setReady(false));},[open,ready]);
 useEffect(()=>{end.current?.scrollIntoView({block:'end'});},[messages,busy,open]);
 useEffect(()=>{if(open)setTimeout(()=>input.current?.focus(),80);},[open]);
 async function send(value:string,e?:FormEvent){e?.preventDefault();const message=value.trim();if(!message||busy)return;setError('');setText('');setMessages(m=>[...m,{role:'user',content:message}]);setBusy(true);
  try{const r=await apiFetch('/api/assistant',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message,...(conversationId?{conversationId}:{})})},40000);const d=await r.json() as {reply?:string;conversationId?:string;error?:string};if(d.conversationId)setConversationId(d.conversationId);if(!r.ok||!d.reply)throw Error(d.error||'L’assistant ne répond pas.');setMessages(m=>[...m,{role:'assistant',content:d.reply!}]);}
  catch(err){setError(err instanceof Error?err.message:'Réessayez.');}finally{setBusy(false);}}
 function fresh(){setConversationId(undefined);setMessages([]);setError('');}
 const first=(name||'').split(' ')[0];
 return <>
  {!open&&<button type="button" className="ya-fab" onClick={()=>setOpen(true)} aria-label="Ouvrir l’assistant Yombal"><MessageCircle size={22}/><span>Assistant</span></button>}
  {open&&<section className="ya-panel" role="dialog" aria-label="Assistant Yombal">
   <header><span className="ya-avatar"><Bot size={19}/></span><div><strong>Yombal Assistant</strong><small><i/>Répond en quelques secondes</small></div><button type="button" onClick={fresh} aria-label="Nouvelle discussion" title="Nouvelle discussion"><Plus size={18}/></button><button type="button" onClick={()=>setOpen(false)} aria-label="Fermer l’assistant"><X size={18}/></button></header>
   <div className="ya-body">
    {ready===false?<div className="ya-empty"><Bot size={30}/><strong>Assistant bientôt disponible</strong><p>En attendant, l’équipe Yombal vous répond depuis Aide → Contacter le support.</p></div>:<>
     <div className="ya-msg bot"><p>Bonjour{first?' '+first:''} 👋 Je suis l’assistant Yombal. Posez-moi vos questions sur vos loyers, locataires, factures ou votre abonnement.</p></div>
     {messages.map((m,i)=><div key={i} className={'ya-msg '+(m.role==='user'?'me':'bot')}><p>{m.content}</p></div>)}
     {!messages.length&&ready&&<div className="ya-suggest">{suggestions.map(s=><button type="button" key={s} onClick={()=>void send(s)}>{s}</button>)}</div>}
     {busy&&<div className="ya-msg bot typing"><span/><span/><span/></div>}
     {ready===null&&<div className="ya-empty"><LoaderCircle className="spin" size={20}/></div>}
     {error&&<p className="ya-error" role="alert">{error}</p>}
    </>}
    <div ref={end}/>
   </div>
   {ready!==false&&<form className="ya-input" onSubmit={e=>void send(text,e)}><textarea ref={input} value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();void send(text);}}} placeholder="Écrivez votre question…" rows={1} maxLength={1500} disabled={!ready}/><button type="submit" disabled={busy||!text.trim()||!ready} aria-label="Envoyer"><Send size={17}/></button></form>}
   <small className="ya-foot">Les discussions sont conservées pour la qualité et la sécurité du service.</small>
  </section>}
 </>;
}
