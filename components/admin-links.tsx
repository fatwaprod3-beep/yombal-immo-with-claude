'use client';
import {useCallback,useEffect,useMemo,useState,type FormEvent} from 'react';
import {Archive,Check,Copy,Crown,LoaderCircle,MousePointerClick,Plus,RotateCcw,Trash2,TrendingUp,Trophy,UserPlus,Wallet} from 'lucide-react';
import {apiFetch} from '../lib/api-fetch';
import {askConfirm} from './confirm-dialog';
import Choice from './choice';

type Link={id:string;code:string;name:string;channel:string;destination:string;cost:number;archived:boolean;createdAt:string;clicks:number;visitors:number;clicks7:number;mobile:number;lastClick:string|null;signups:number;pro:number;payments:number;revenue:number;daily:{d:string;n:number}[]};
const channels:Record<string,{label:string;color:string}>={influenceur:{label:'Influenceur',color:'#674580'},facebook:{label:'Facebook',color:'#1877f2'},instagram:{label:'Instagram',color:'#d6249f'},tiktok:{label:'TikTok',color:'#111111'},whatsapp:{label:'WhatsApp',color:'#25a35a'},google:{label:'Google',color:'#ea8a00'},youtube:{label:'YouTube',color:'#e62117'},partenaire:{label:'Partenaire',color:'#c86f55'},autre:{label:'Autre',color:'#8a7795'}};
const fmt=(n:number)=>new Intl.NumberFormat('fr-FR').format(n).replace(/ | /g,' ');
const pct=(a:number,b:number)=>b>0?Math.round(a/b*1000)/10:0;
const ago=(iso:string|null)=>{if(!iso)return 'Aucun clic';const d=Date.now()-Date.parse(iso);if(d<3600e3)return 'Il y a '+Math.max(1,Math.round(d/60e3))+' min';if(d<864e5)return 'Il y a '+Math.round(d/3600e3)+' h';return 'Il y a '+Math.round(d/864e5)+' j';};

export default function AdminLinks(){
 const [links,setLinks]=useState<Link[]|null>(null),[direct,setDirect]=useState({signups:0,pro:0}),[error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false),[copied,setCopied]=useState('');
 const [name,setName]=useState(''),[channel,setChannel]=useState('influenceur'),[code,setCode]=useState(''),[destination,setDestination]=useState('/presentation'),[cost,setCost]=useState(''),[sort,setSort]=useState<'signups'|'clicks'|'pro'|'revenue'|'conv'>('signups'),[showArchived,setShowArchived]=useState(false);
 const load=useCallback(async()=>{try{const r=await apiFetch('/api/admin/links',{cache:'no-store'});const d=await r.json() as {links?:Link[];direct?:{signups:number;pro:number};error?:string};if(!r.ok)throw Error(d.error||'Lecture impossible.');setLinks(d.links||[]);setDirect(d.direct||{signups:0,pro:0});}catch(e){setError(e instanceof Error?e.message:'Réessayez.');}},[]);
 useEffect(()=>{void load();const t=setInterval(()=>void load(),60000);return()=>clearInterval(t);},[load]);
 const origin=typeof window!=='undefined'?window.location.origin:'';
 async function post(body:Record<string,unknown>){setBusy(true);setError('');setNotice('');try{const r=await apiFetch('/api/admin/links',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json() as {message?:string;error?:string};if(!r.ok)throw Error(d.error||'Action impossible.');setNotice(d.message||'Fait.');await load();return true;}catch(e){setError(e instanceof Error?e.message:'Réessayez.');return false;}finally{setBusy(false);}}
 async function submit(e:FormEvent){e.preventDefault();if(await post({action:'create',name,channel,destination,cost:Number(cost.replace(/\D/g,''))||0,...(code.trim()?{code:code.trim()}:{})})){setName('');setCode('');setCost('');}}
 async function copy(l:Link){const url=origin+'/r/'+l.code;try{await navigator.clipboard.writeText(url);}catch{}setCopied(l.id);setTimeout(()=>setCopied(''),1800);}
 const active=useMemo(()=>(links||[]).filter(l=>showArchived||!l.archived),[links,showArchived]);
 const sorted=useMemo(()=>[...active].sort((a,b)=>sort==='conv'?pct(b.signups,b.visitors)-pct(a.signups,a.visitors):(b[sort]-a[sort])),[active,sort]);
 const tot=useMemo(()=>(links||[]).reduce((t,l)=>({clicks:t.clicks+l.clicks,visitors:t.visitors+l.visitors,signups:t.signups+l.signups,pro:t.pro+l.pro,revenue:t.revenue+l.revenue,cost:t.cost+l.cost}),{clicks:0,visitors:0,signups:0,pro:0,revenue:0,cost:0}),[links]);
 const best=useMemo(()=>[...(links||[])].filter(l=>l.signups>0).sort((a,b)=>b.pro-a.pro||b.signups-a.signups)[0],[links]);
 const allSignups=tot.signups+direct.signups;
 if(!links)return <div className="adm-card adm-loading">{error||<><LoaderCircle className="spin" size={22}/>Chargement des liens…</>}</div>;
 return <div className="adm-stack">
  {notice&&<p className="adm-notice g" role="status">{notice}</p>}{error&&<p className="adm-notice r" role="alert">{error}</p>}
  <div className="adm-kpis">
   <Stat icon={MousePointerClick} tone="p" label="Clics sur vos liens" value={fmt(tot.clicks)} sub={fmt(tot.visitors)+' visiteurs uniques'}/>
   <Stat icon={UserPlus} tone="c" label="Inscriptions attribuées" value={fmt(tot.signups)} sub={pct(tot.signups,tot.visitors)+' % des visiteurs · '+pct(tot.signups,allSignups)+' % de tous les inscrits'}/>
   <Stat icon={Crown} tone="gold" label="Clients Pro" value={fmt(tot.pro)} sub={pct(tot.pro,tot.signups)+' % des inscrits passent Pro'}/>
   <Stat icon={Wallet} tone="g" label="Revenus attribués" value={fmt(tot.revenue)+' F'} sub={tot.cost?'Coût '+fmt(tot.cost)+' F · retour ×'+(Math.round(tot.revenue/tot.cost*10)/10):'Payés via SasPay'}/>
  </div>

  <div className="adm-split lk-split">
   <form className="adm-card adm-form lk-form" onSubmit={submit}>
    <div className="adm-card-h"><h3>Créer un lien de suivi</h3><span className="adm-muted">Pour un influenceur, une pub, un partenaire…</span></div>
    <label><span>Nom de la campagne</span><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ex. : Aïcha Dakar · TikTok novembre" maxLength={80} required/></label>
    <div className="lk-row"><label><span>Canal</span><Choice label="Canal" value={channel} onChange={setChannel} options={Object.entries(channels).map(([k,c])=>({value:k,label:c.label}))}/></label>
    <label><span>Arrivée sur</span><Choice label="Arrivée sur" value={destination} onChange={setDestination} options={[{value:'/presentation',label:'Page de présentation'},{value:'/connexion?mode=inscription',label:'Inscription directe'},{value:'/',label:'Accueil du site'}]}/></label></div>
    <div className="lk-row"><label><span>Code du lien (facultatif)</span><input value={code} onChange={e=>setCode(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} placeholder="aicha" maxLength={40} autoComplete="off"/></label>
    <label><span>Coût payé (F, facultatif)</span><input value={cost} onChange={e=>setCost(e.target.value.replace(/[^\d ]/g,''))} inputMode="numeric" placeholder="0" autoComplete="off"/></label></div>
    <p className="lk-preview">{origin}/r/<b>{code||'code-auto'}</b></p>
    <button className="adm-btn" disabled={busy||name.trim().length<2}><Plus size={16}/>Créer le lien</button>
   </form>
   <div className="adm-card lk-compare">
    <div className="adm-card-h"><h3>Comparaison des sources</h3><span className="adm-muted">Sur 100 inscriptions, combien viennent de chaque lien</span></div>
    {best&&<div className="lk-best"><Trophy size={18}/><div><b>Meilleur lien : {best.name}</b><small>{best.signups} inscription{best.signups>1?'s':''} · {best.pro} Pro · {pct(best.signups,best.visitors)} % de conversion</small></div></div>}
    <div className="lk-bars">{[...active].sort((a,b)=>b.signups-a.signups).slice(0,6).map(l=><div key={l.id} className="lk-bar"><span className="lk-bar-name"><i style={{background:channels[l.channel]?.color}}/>{l.name}</span><span className="lk-bar-track"><i style={{width:(allSignups?l.signups/allSignups*100:0)+'%',background:channels[l.channel]?.color}}/></span><b>{pct(l.signups,allSignups)} %</b></div>)}
     <div className="lk-bar direct"><span className="lk-bar-name"><i/>Sans lien (direct)</span><span className="lk-bar-track"><i style={{width:(allSignups?direct.signups/allSignups*100:0)+'%'}}/></span><b>{pct(direct.signups,allSignups)} %</b></div></div>
    {!active.length&&<p className="adm-empty">Créez votre premier lien pour commencer à mesurer vos campagnes.</p>}
   </div>
  </div>

  <div className="adm-card adm-table-card">
   <div className="adm-card-h lk-table-h"><h3>Vos liens</h3><div className="lk-tools"><div className="lk-sort"><Choice label="Trier" value={sort} onChange={v=>setSort(v as typeof sort)} options={[{value:'signups',label:'Trier : inscriptions'},{value:'clicks',label:'Trier : clics'},{value:'pro',label:'Trier : clients Pro'},{value:'revenue',label:'Trier : revenus'},{value:'conv',label:'Trier : conversion'}]}/></div><label className="lk-check"><input type="checkbox" checked={showArchived} onChange={e=>setShowArchived(e.target.checked)}/>Afficher les liens en pause</label></div></div>
   <div className="adm-table-wrap"><table className="adm-table lk-table"><thead><tr><th>Lien</th><th>Clics</th><th>Visiteurs</th><th>Inscrits</th><th>Conversion</th><th>Pro</th><th>Revenus</th><th>14 jours</th><th/></tr></thead>
    <tbody>{sorted.map(l=><tr key={l.id} className={l.archived?'is-archived':''}>
     <td><div className="lk-name"><span className="lk-dot" style={{background:channels[l.channel]?.color}}/><div><b>{l.name}</b><small>{channels[l.channel]?.label} · /r/{l.code} · {ago(l.lastClick)}</small></div></div></td>
     <td><b>{fmt(l.clicks)}</b><small className="lk-sub">{l.clicks7} cette semaine</small></td>
     <td>{fmt(l.visitors)}<small className="lk-sub">{pct(l.mobile,l.clicks)} % mobile</small></td>
     <td><b>{l.signups}</b></td>
     <td><span className={'adm-tag '+(pct(l.signups,l.visitors)>=10?'g':pct(l.signups,l.visitors)>=3?'gold':'')}>{pct(l.signups,l.visitors)} %</span></td>
     <td><b>{l.pro}</b><small className="lk-sub">{pct(l.pro,l.signups)} % des inscrits</small></td>
     <td><b>{fmt(l.revenue)} F</b>{l.cost>0&&<small className="lk-sub">coût {fmt(l.cost)} F</small>}</td>
     <td><Spark daily={l.daily}/></td>
     <td><div className="lk-actions"><button type="button" className="adm-btn ghost sm" onClick={()=>void copy(l)} title="Copier le lien">{copied===l.id?<Check size={14}/>:<Copy size={14}/>}{copied===l.id?'Copié':'Copier'}</button>
      {l.archived?<button type="button" className="adm-btn ghost sm" disabled={busy} onClick={()=>void post({action:'restore',id:l.id})} title="Réactiver"><RotateCcw size={14}/></button>:<button type="button" className="adm-btn ghost sm" disabled={busy} onClick={()=>void post({action:'archive',id:l.id})} title="Mettre en pause"><Archive size={14}/></button>}
      <button type="button" className="adm-btn danger sm" disabled={busy} title="Supprimer" onClick={async()=>{if(await askConfirm('Supprimer le lien « '+l.name+' » et toutes ses statistiques ? Les comptes déjà inscrits restent, mais ne seront plus attribués à ce lien.',{confirmLabel:'Supprimer'}))void post({action:'delete',id:l.id});}}><Trash2 size={14}/></button></div></td>
    </tr>)}{!sorted.length&&<tr><td colSpan={9} className="adm-empty">Aucun lien pour le moment.</td></tr>}</tbody></table></div>
  </div>
  <p className="adm-hint lk-hint"><TrendingUp size={15}/>Un visiteur est attribué au dernier lien cliqué pendant 60 jours. Les robots d’aperçu (WhatsApp, Facebook…) ne sont pas comptés. Revenus = paiements SasPay confirmés des comptes venus par le lien.</p>
 </div>;
}
function Stat({icon:Icon,tone,label,value,sub}:{icon:typeof Crown;tone:string;label:string;value:string;sub:string}){return <div className={'adm-kpi t-'+tone}><div className="adm-kpi-h"><span>{label}</span><i><Icon size={17}/></i></div><strong>{value}</strong><small>{sub}</small></div>;}
function Spark({daily}:{daily:{d:string;n:number}[]}){
 const days:number[]=[];for(let i=13;i>=0;i--){const d=new Date(Date.now()-i*864e5).toISOString().slice(0,10);days.push(daily.find(x=>x.d===d)?.n||0);}
 const max=Math.max(1,...days);return <svg className="lk-spark" viewBox="0 0 84 24" aria-hidden="true">{days.map((n,i)=><rect key={i} x={i*6} y={24-Math.max(1.5,n/max*22)} width="4" height={Math.max(1.5,n/max*22)} rx="1.5"/>)}</svg>;
}
