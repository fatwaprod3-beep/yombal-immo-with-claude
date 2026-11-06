'use client';
import {useMemo,useState} from 'react';
import {Building2,CalendarDays,ChevronDown,Crown,FileText,PlayCircle,Rocket,Search,ShieldCheck,Wallet} from 'lucide-react';
import {helpTopics} from '../lib/help-faq';

const icons={start:Rocket,rent:Wallet,invoice:FileText,home:Building2,pro:Crown,shield:ShieldCheck,calendar:CalendarDays,settings:Rocket};
/** Centre d’aide : recherche, thèmes et réponses détaillées en accordéon. */
export default function HelpCenter({onDemo}:{onDemo?:()=>void}){
 const [query,setQuery]=useState(''),[topic,setTopic]=useState('demarrer'),[open,setOpen]=useState<string|null>(null);
 const q=query.trim().toLocaleLowerCase('fr');
 const results=useMemo(()=>q?helpTopics.flatMap(t=>t.items.filter(([a,b])=>(a+' '+b).toLocaleLowerCase('fr').includes(q)).map(i=>({topic:t,item:i}))):[],[q]);
 const current=helpTopics.find(t=>t.id===topic)||helpTopics[0];
 const Item=({id,q:question,a}:{id:string;q:string;a:string})=><div className={'hc-item'+(open===id?' open':'')}><button type="button" aria-expanded={open===id} onClick={()=>setOpen(open===id?null:id)}><span>{question}</span><ChevronDown size={18}/></button>{open===id&&<p>{a}</p>}</div>;
 return <div className="hc">
  <div className="hc-hero"><div><span className="hc-eyebrow">CENTRE D’AIDE</span><h2>Comment pouvons-nous vous aider ?</h2><p>Guides pas à pas pour gérer vos biens, vos loyers et vos documents.</p></div>
   <label className="hc-search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher : paiement partiel, facture, logo…" aria-label="Rechercher dans l’aide"/></label>
   {onDemo&&<button type="button" className="hc-demo" onClick={onDemo}><PlayCircle size={18}/>Voir la démonstration</button>}</div>
  {q?<div className="hc-panel"><h3>{results.length} résultat{results.length>1?'s':''} pour « {query} »</h3>{results.map(({topic:t,item:[question,a]})=><Item key={t.id+question} id={t.id+question} q={question} a={a}/>)}{!results.length&&<p className="hc-empty">Aucune réponse trouvée. Essayez un autre mot ou écrivez-nous dans Contact.</p>}</div>
  :<div className="hc-layout">
   <nav className="hc-topics" aria-label="Thèmes">{helpTopics.map(t=>{const Icon=icons[t.icon];return <button type="button" key={t.id} className={t.id===topic?'on':''} onClick={()=>{setTopic(t.id);setOpen(null);}}><span className="hc-ic"><Icon size={18}/></span><span><b>{t.title}</b><small>{t.intro}</small></span></button>;})}</nav>
   <div className="hc-panel"><h3>{current.title}</h3><p className="hc-intro">{current.intro}</p>{current.items.map(([question,a])=><Item key={question} id={current.id+question} q={question} a={a}/>)}</div>
  </div>}
 </div>;
}
