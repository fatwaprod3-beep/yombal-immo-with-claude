'use client';
import {useCallback,useEffect,useMemo,useState,type CSSProperties} from 'react';
import Link from 'next/link';
import {Activity,AlertTriangle,ArrowLeft,Bot,Crown,CreditCard,Eye,KeyRound,LayoutDashboard,LoaderCircle,LogOut,Lock,MessageSquareWarning,Power,RefreshCw,Search,ShieldAlert,ShieldCheck,UserCheck,UserX,Users,Wrench,X} from 'lucide-react';
import {apiFetch} from '../lib/api-fetch';
import {money} from '../lib/model';
import AdminPayments from './admin-payments';
import AdminRequests from './admin-requests';

type AdminUser={id:string;email:string;name:string;status:string;createdAt:string;lastSeenAt:string|null;plan:string;expiresAt:string|null;properties:number;tenants:number;spaces:number;paid:number;aiMessages:number;flagged:number};
type Event={id:string;kind:string;email:string|null;userId:string|null;ip:string|null;userAgent:string|null;detail:string|null;createdAt:string};
type Overview={stats:Record<string,number>;signups:{d:string;n:number}[];users:AdminUser[];events:Event[];suspiciousIps:{ip:string;n:number;last:string;emails:string}[];flags:{registrationsOpen:boolean;maintenance:boolean;assistant:boolean;sessionsAfter:number};aiConfig:{provider:string;model:string;configured:boolean}};
type Conversation={id:string;title:string;flagged:number;flagReason:string|null;messageCount:number;updatedAt:string;userId:string;email:string|null;name:string|null};
type Tab='overview'|'users'|'security'|'assistant'|'payments'|'controls';

const tabs:{id:Tab;label:string;icon:typeof Users}[]=[{id:'overview',label:'Vue d’ensemble',icon:LayoutDashboard},{id:'users',label:'Utilisateurs',icon:Users},{id:'security',label:'Sécurité',icon:ShieldAlert},{id:'assistant',label:'Assistant IA',icon:Bot},{id:'payments',label:'Paiements',icon:CreditCard},{id:'controls',label:'Contrôles d’urgence',icon:Power}];
const kinds:Record<string,{label:string;tone:'g'|'r'|'c'|'p'}>={login:{label:'Connexion',tone:'g'},login_failed:{label:'Échec de connexion',tone:'c'},login_blocked:{label:'Connexion bloquée',tone:'r'},login_suspended:{label:'Compte suspendu refusé',tone:'r'},register:{label:'Inscription',tone:'p'},register_blocked:{label:'Inscription refusée',tone:'c'},admin_login:{label:'Accès admin',tone:'p'},admin_failed:{label:'Échec accès admin',tone:'r'},admin_action:{label:'Action admin',tone:'p'},ai_flagged:{label:'Message IA signalé',tone:'r'},ai_limited:{label:'Limite IA atteinte',tone:'c'}};
const planLabel:Record<string,string>={free:'Gratuit',monthly:'Pro mensuel',quarterly:'Pro trimestriel',annual:'Pro annuel',test:'Pro (test)'};
const when=(iso:string|null)=>{if(!iso)return 'Jamais';const d=Date.now()-Date.parse(iso);if(d<60e3)return 'À l’instant';if(d<3600e3)return 'Il y a '+Math.round(d/60e3)+' min';if(d<864e5)return 'Il y a '+Math.round(d/3600e3)+' h';if(d<30*864e5)return 'Il y a '+Math.round(d/864e5)+' j';return new Date(iso).toLocaleDateString('fr-FR');};
const fullDate=(iso:string)=>new Date(iso).toLocaleString('fr-FR',{timeZone:'Africa/Dakar',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
const activeUser=(u:AdminUser)=>!!u.lastSeenAt&&Date.now()-Date.parse(u.lastSeenAt)<30*864e5;

export default function AdminConsole({email,onLeave,busy}:{email:string;onLeave:()=>void;busy:boolean}){
 const [tab,setTab]=useState<Tab>('overview'),[data,setData]=useState<Overview|null>(null),[loading,setLoading]=useState(true),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=useCallback(async()=>{setLoading(true);setError('');try{const r=await apiFetch('/api/admin/overview',{cache:'no-store'});const d=await r.json() as Overview&{error?:string};if(!r.ok)throw Error(d.error||'Lecture impossible.');setData(d);}catch(e){setError(e instanceof Error?e.message:'Réessayez.');}finally{setLoading(false);}},[]);
 useEffect(()=>{void load();const t=setInterval(()=>void load(),60000);return()=>clearInterval(t);},[load]);
 const act=useCallback(async(body:Record<string,unknown>,confirmText?:string)=>{if(confirmText&&!window.confirm(confirmText))return false;setNotice('');setError('');try{const r=await apiFetch('/api/admin/control',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json() as {message?:string;error?:string};if(!r.ok)throw Error(d.error||'Action impossible.');setNotice(d.message||'Fait.');await load();return true;}catch(e){setError(e instanceof Error?e.message:'Réessayez.');return false;}},[load]);
 const alerts=(data?.stats.failed24||0)+(data?.stats.blocked24||0)+(data?.suspiciousIps.length||0);
 return <div className="adm">
  <aside className="adm-side">
   <div className="adm-brand"><span className="adm-logo"><ShieldCheck size={18}/></span><div><strong>Yombal</strong><small>Administration</small></div></div>
   <nav>{tabs.map(t=><button key={t.id} type="button" className={tab===t.id?'on':''} onClick={()=>setTab(t.id)}><t.icon size={18}/><span>{t.label}</span>{t.id==='security'&&alerts>0&&<em className="adm-pill r">{alerts}</em>}{t.id==='assistant'&&!!data?.stats.aiFlagged&&<em className="adm-pill r">{data.stats.aiFlagged}</em>}{t.id==='users'&&data&&<em className="adm-pill">{data.stats.total}</em>}</button>)}</nav>
   <div className="adm-side-foot"><Link href="/" prefetch={false} className="adm-link"><ArrowLeft size={16}/>Retour à Yombal</Link><button type="button" className="adm-link" disabled={busy} onClick={onLeave}><LogOut size={16}/>Fermer la session admin</button><small>{email}</small></div>
  </aside>
  <main className="adm-main">
   <header className="adm-top"><div><span className="adm-eyebrow">ADMINISTRATION PRIVÉE</span><h1>{tabs.find(t=>t.id===tab)?.label}</h1></div><div className="adm-top-tools">{data&&<span className={'adm-status '+(data.flags.maintenance?'r':'g')}><i/>{data.flags.maintenance?'Maintenance active':'Site en ligne'}</span>}<button type="button" className="adm-btn ghost" onClick={()=>void load()} disabled={loading}>{loading?<LoaderCircle size={16} className="spin"/>:<RefreshCw size={16}/>}Actualiser</button></div></header>
   {notice&&<p className="adm-notice g" role="status">{notice}<button type="button" onClick={()=>setNotice('')} aria-label="Fermer"><X size={15}/></button></p>}
   {error&&<p className="adm-notice r" role="alert">{error}</p>}
   {!data?<div className="adm-card adm-loading"><LoaderCircle className="spin" size={22}/>Chargement des données…</div>:
    tab==='overview'?<OverviewTab data={data} go={setTab}/>:
    tab==='users'?<UsersTab data={data} act={act}/>:
    tab==='security'?<SecurityTab data={data}/>:
    tab==='assistant'?<AssistantTab data={data} act={act}/>:
    tab==='payments'?<div className="adm-stack"><AdminRequests/><AdminPayments/></div>:
    <ControlsTab data={data} act={act}/>}
  </main>
 </div>;
}

function Kpi({label,value,sub,tone,icon:Icon}:{label:string;value:string|number;sub?:string;tone:string;icon:typeof Users}){return <div className={'adm-kpi t-'+tone}><div className="adm-kpi-h"><span>{label}</span><i><Icon size={17}/></i></div><strong>{value}</strong>{sub&&<small>{sub}</small>}</div>;}

function OverviewTab({data,go}:{data:Overview;go:(t:Tab)=>void}){
 const s=data.stats;const days=useMemo(()=>{const out:{d:string;n:number}[]=[];for(let i=29;i>=0;i--){const d=new Date(Date.now()-i*864e5).toISOString().slice(0,10);out.push({d,n:data.signups.find(x=>x.d===d)?.n||0});}return out;},[data.signups]);
 const max=Math.max(1,...days.map(d=>d.n));const proShare=s.total?Math.round(s.pro/s.total*100):0;const activeShare=s.total?Math.round(s.active30/s.total*100):0;
 const recent=data.users.slice(0,6);
 return <div className="adm-stack">
  <div className="adm-kpis">
   <Kpi label="Inscrits" value={s.total} sub={`+${s.new7} cette semaine`} tone="p" icon={Users}/>
   <Kpi label="Comptes Pro" value={s.pro} sub={`${proShare} % des inscrits · ${s.free} gratuits`} tone="gold" icon={Crown}/>
   <Kpi label="Actifs (30 jours)" value={s.active30} sub={`${s.inactive} inactifs · ${s.online} en ligne`} tone="g" icon={Activity}/>
   <Kpi label="Revenus encaissés" value={money(s.revenueTotal)} sub={`${money(s.revenueMonth)} sur 30 jours`} tone="c" icon={CreditCard}/>
  </div>
  <div className="adm-grid-2">
   <section className="adm-card"><div className="adm-card-h"><div><h3>Inscriptions</h3><p>30 derniers jours</p></div><strong className="adm-big">{days.reduce((a,b)=>a+b.n,0)}</strong></div>
    <div className="adm-bars">{days.map(d=><span key={d.d} title={`${new Date(d.d).toLocaleDateString('fr-FR')} : ${d.n}`}><i style={{height:Math.max(4,d.n/max*100)+'%'}} className={d.n?'':'zero'}/></span>)}</div>
    <div className="adm-bars-x"><span>il y a 30 j</span><span>aujourd’hui</span></div></section>
   <section className="adm-card"><div className="adm-card-h"><div><h3>Répartition</h3><p>Formules et activité</p></div></div>
    <div className="adm-split"><div><div className="adm-split-h"><span>Pro</span><b>{s.pro}</b></div><div className="adm-meter"><i className="gold" style={{width:proShare+'%'}}/></div><div className="adm-split-h"><span>Gratuit</span><b>{s.free}</b></div><div className="adm-meter"><i style={{width:(100-proShare)+'%'}}/></div></div>
     <div><div className="adm-split-h"><span>Actifs</span><b>{s.active30}</b></div><div className="adm-meter"><i className="g" style={{width:activeShare+'%'}}/></div><div className="adm-split-h"><span>Inactifs</span><b>{s.inactive}</b></div><div className="adm-meter"><i className="mute" style={{width:(100-activeShare)+'%'}}/></div></div></div>
    {s.suspended>0&&<p className="adm-hint r"><UserX size={15}/>{s.suspended} compte(s) suspendu(s)</p>}</section>
  </div>
  <div className="adm-grid-3">
   <button type="button" className={'adm-card adm-tile '+(s.failed24+s.blocked24?'warn':'')} onClick={()=>go('security')}><ShieldAlert size={22}/><div><strong>{s.failed24+s.blocked24}</strong><span>tentative(s) suspecte(s) en 24 h</span></div><small>{data.suspiciousIps.length} adresse(s) IP à surveiller</small></button>
   <button type="button" className={'adm-card adm-tile '+(s.aiFlagged?'warn':'')} onClick={()=>go('assistant')}><MessageSquareWarning size={22}/><div><strong>{s.aiFlagged}</strong><span>discussion(s) IA signalée(s)</span></div><small>{s.aiConversations} conversations · {s.aiMessages} messages</small></button>
   <button type="button" className="adm-card adm-tile" onClick={()=>go('controls')}><Lock size={22}/><div><strong>{data.flags.registrationsOpen?'Ouvertes':'Fermées'}</strong><span>inscriptions</span></div><small>{data.flags.maintenance?'Maintenance active':'Site ouvert'} · assistant {data.flags.assistant?'actif':'coupé'}</small></button>
  </div>
  <section className="adm-card"><div className="adm-card-h"><div><h3>Derniers inscrits</h3><p>Les 6 comptes les plus récents</p></div><button type="button" className="adm-btn ghost" onClick={()=>go('users')}>Tous les utilisateurs</button></div>
   <div className="adm-list">{recent.map(u=><div key={u.id} className="adm-row"><span className="adm-av">{(u.name||u.email)[0]?.toUpperCase()}</span><div><b>{u.name||'—'}</b><small>{u.email}</small></div><PlanTag u={u}/><small className="adm-muted">{when(u.createdAt)}</small></div>)}{!recent.length&&<p className="adm-empty">Aucun compte pour l’instant.</p>}</div></section>
 </div>;
}

function PlanTag({u}:{u:AdminUser}){return u.status!=='active'?<span className="adm-tag r">Suspendu</span>:u.plan==='free'?<span className="adm-tag">Gratuit</span>:<span className="adm-tag gold"><Crown size={12}/>{planLabel[u.plan]||'Pro'}</span>;}

function UsersTab({data,act}:{data:Overview;act:(b:Record<string,unknown>,c?:string)=>Promise<boolean>}){
 const [q,setQ]=useState(''),[filter,setFilter]=useState<'all'|'pro'|'free'|'active'|'inactive'|'suspended'>('all'),[open,setOpen]=useState<AdminUser|null>(null),[months,setMonths]=useState(1);
 const list=data.users.filter(u=>(u.email+u.name).toLowerCase().includes(q.toLowerCase())&&(filter==='all'||(filter==='pro'&&u.plan!=='free')||(filter==='free'&&u.plan==='free')||(filter==='active'&&activeUser(u))||(filter==='inactive'&&!activeUser(u))||(filter==='suspended'&&u.status!=='active')));
 const counts={all:data.users.length,pro:data.stats.pro,free:data.stats.free,active:data.stats.active30,inactive:data.stats.inactive,suspended:data.stats.suspended};
 const labels={all:'Tous',pro:'Pro',free:'Gratuits',active:'Actifs',inactive:'Inactifs',suspended:'Suspendus'};
 useEffect(()=>{if(open){const fresh=data.users.find(u=>u.id===open.id);if(fresh&&fresh!==open)setOpen(fresh);}},[data.users,open]);
 return <div className="adm-stack">
  <div className="adm-toolbar"><label className="adm-search"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Rechercher un nom ou un e-mail"/></label><div className="adm-chips">{(Object.keys(labels) as (keyof typeof labels)[]).map(k=><button key={k} type="button" className={filter===k?'on':''} onClick={()=>setFilter(k)}>{labels[k]} <em>{counts[k]}</em></button>)}</div></div>
  <section className="adm-card adm-table-card"><div className="adm-table-wrap"><table className="adm-table"><thead><tr><th>Utilisateur</th><th>Formule</th><th>Activité</th><th>Patrimoine</th><th>Inscrit</th><th/></tr></thead><tbody>
   {list.map(u=><tr key={u.id} onClick={()=>setOpen(u)}><td><div className="adm-user"><span className="adm-av">{(u.name||u.email)[0]?.toUpperCase()}</span><div><b>{u.name||'—'}</b><small>{u.email}</small></div></div></td><td><PlanTag u={u}/>{u.expiresAt&&<small className="adm-sub">jusqu’au {new Date(u.expiresAt).toLocaleDateString('fr-FR')}</small>}</td><td><span className={'adm-dot '+(activeUser(u)?'g':'')}/>{when(u.lastSeenAt)}</td><td><small>{u.properties} bien(s) · {u.tenants} locataire(s)</small></td><td><small>{new Date(u.createdAt).toLocaleDateString('fr-FR')}</small></td><td><Eye size={16} className="adm-muted"/></td></tr>)}
   {!list.length&&<tr><td colSpan={6} className="adm-empty">Aucun compte ne correspond.</td></tr>}
  </tbody></table></div></section>
  {open&&<div className="adm-drawer-scrim" onClick={()=>setOpen(null)}><aside className="adm-drawer" onClick={e=>e.stopPropagation()} role="dialog" aria-label={'Compte '+open.email}>
   <header><span className="adm-av lg">{(open.name||open.email)[0]?.toUpperCase()}</span><div><h3>{open.name||'—'}</h3><small>{open.email}</small></div><button type="button" className="adm-icon" onClick={()=>setOpen(null)} aria-label="Fermer"><X size={18}/></button></header>
   <div className="adm-facts"><div><span>Formule</span><PlanTag u={open}/></div><div><span>Fin Pro</span><b>{open.expiresAt?new Date(open.expiresAt).toLocaleDateString('fr-FR'):'—'}</b></div><div><span>Inscrit le</span><b>{new Date(open.createdAt).toLocaleDateString('fr-FR')}</b></div><div><span>Dernière activité</span><b>{when(open.lastSeenAt)}</b></div><div><span>Biens / locataires</span><b>{open.properties} / {open.tenants}</b></div><div><span>Espaces</span><b>{open.spaces||1}</b></div><div><span>Total payé</span><b>{money(open.paid)}</b></div><div><span>Messages IA</span><b>{open.aiMessages}{open.flagged?` · ${open.flagged} signalé(s)`:''}</b></div></div>
   <h4>Abonnement</h4><div className="adm-inline"><select value={months} onChange={e=>setMonths(Number(e.target.value))} aria-label="Durée offerte"><option value={1}>1 mois</option><option value={3}>3 mois</option><option value={6}>6 mois</option><option value={12}>12 mois</option></select><button type="button" className="adm-btn gold" onClick={()=>void act({action:'grant_pro',userId:open.id,months},`Offrir ${months} mois de Pro à ${open.email} ?`)}><Crown size={15}/>Offrir Pro</button>{open.plan!=='free'&&<button type="button" className="adm-btn ghost" onClick={()=>void act({action:'revoke_pro',userId:open.id},`Retirer l’accès Pro de ${open.email} ?`)}>Retirer Pro</button>}</div>
   <h4>Sécurité du compte</h4><div className="adm-inline"><button type="button" className="adm-btn ghost" onClick={()=>void act({action:'logout_user',userId:open.id},`Fermer toutes les sessions de ${open.email} ?`)}><LogOut size={15}/>Déconnecter partout</button>{open.status==='active'?<button type="button" className="adm-btn danger" onClick={()=>void act({action:'suspend',userId:open.id},`Suspendre ${open.email} ? Il ne pourra plus se connecter.`)}><UserX size={15}/>Suspendre</button>:<button type="button" className="adm-btn green" onClick={()=>void act({action:'activate',userId:open.id})}><UserCheck size={15}/>Réactiver</button>}</div>
  </aside></div>}
 </div>;
}

function SecurityTab({data}:{data:Overview}){
 const [kind,setKind]=useState('suspect');const suspect=['login_failed','login_blocked','login_suspended','admin_failed','register_blocked','ai_flagged','ai_limited'];
 const events=data.events.filter(e=>kind==='all'||(kind==='suspect'?suspect.includes(e.kind):kind==='admin'?e.kind.startsWith('admin'):e.kind===kind));
 const s=data.stats;
 return <div className="adm-stack">
  <div className="adm-kpis">
   <Kpi label="Échecs (24 h)" value={s.failed24} sub="Mots de passe incorrects" tone="c" icon={KeyRound}/>
   <Kpi label="Blocages (24 h)" value={s.blocked24} sub="Trop de tentatives" tone="r" icon={ShieldAlert}/>
   <Kpi label="Connexions (24 h)" value={s.logins24} sub="Réussies" tone="g" icon={UserCheck}/>
   <Kpi label="IP à surveiller" value={data.suspiciousIps.length} sub="3 échecs ou plus en 7 jours" tone="p" icon={AlertTriangle}/>
  </div>
  {data.suspiciousIps.length>0&&<section className="adm-card"><div className="adm-card-h"><div><h3>Adresses suspectes</h3><p>Plusieurs échecs depuis la même adresse sur 7 jours</p></div></div><div className="adm-list">{data.suspiciousIps.map(ip=><div className="adm-row" key={ip.ip}><span className="adm-ico r"><AlertTriangle size={16}/></span><div><b>{ip.ip}</b><small>{ip.emails||'—'}</small></div><span className="adm-tag r">{ip.n} échecs</span><small className="adm-muted">{when(ip.last)}</small></div>)}</div></section>}
  <section className="adm-card"><div className="adm-card-h"><div><h3>Journal de sécurité</h3><p>Les 150 derniers événements · aucun mot de passe n’est enregistré</p></div><div className="adm-chips">{[['suspect','Suspects'],['all','Tout'],['login','Connexions'],['register','Inscriptions'],['admin','Admin']].map(([k,l])=><button key={k} type="button" className={kind===k?'on':''} onClick={()=>setKind(k)}>{l}</button>)}</div></div>
   <div className="adm-list">{events.map(e=>{const k=kinds[e.kind]||{label:e.kind,tone:'p' as const};return <div className="adm-row" key={e.id}><span className={'adm-ico '+k.tone}>{k.tone==='g'?<UserCheck size={15}/>:k.tone==='r'?<ShieldAlert size={15}/>:k.tone==='c'?<KeyRound size={15}/>:<Activity size={15}/>}</span><div><b>{k.label}{e.email?' · '+e.email:''}</b><small>{e.detail||''}{e.ip?` · IP ${e.ip}`:''}{e.userAgent?` · ${e.userAgent.replace(/\(.*?\)/g,'').slice(0,60)}`:''}</small></div><small className="adm-muted">{fullDate(e.createdAt)}</small></div>;})}{!events.length&&<p className="adm-empty">Rien à signaler. 👍</p>}</div></section>
 </div>;
}

function AssistantTab({data,act}:{data:Overview;act:(b:Record<string,unknown>,c?:string)=>Promise<boolean>}){
 const [list,setList]=useState<Conversation[]|null>(null),[open,setOpen]=useState<Conversation|null>(null),[messages,setMessages]=useState<{role:string;content:string;flagged:number;createdAt:string}[]>([]),[onlyFlagged,setOnlyFlagged]=useState(false);
 const [provider,setProvider]=useState(data.aiConfig.provider||'groq'),[model,setModel]=useState(data.aiConfig.model||''),[key,setKey]=useState(''),[saving,setSaving]=useState(false);
 const loadList=useCallback(async()=>{const r=await apiFetch('/api/admin/conversations',{cache:'no-store'});const d=await r.json() as {conversations?:Conversation[]};setList(d.conversations||[]);},[]);
 useEffect(()=>{void loadList();},[loadList]);
 async function view(c:Conversation){setOpen(c);setMessages([]);const r=await apiFetch('/api/admin/conversations?id='+c.id,{cache:'no-store'});const d=await r.json() as {messages?:typeof messages};setMessages(d.messages||[]);}
 async function clear(c:Conversation){await apiFetch('/api/admin/conversations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:c.id,action:'clear_flag'})});setOpen({...c,flagged:0});await loadList();}
 const providers:Record<string,{label:string;model:string;url:string}>={groq:{label:'Groq · gratuit (recommandé)',model:'llama-3.3-70b-versatile',url:'https://console.groq.com/keys'},gemini:{label:'Google Gemini · gratuit',model:'gemini-2.0-flash',url:'https://aistudio.google.com/apikey'},xai:{label:'xAI Grok · payant',model:'grok-3-mini',url:'https://console.x.ai'},openai:{label:'OpenAI · payant',model:'gpt-4o-mini',url:'https://platform.openai.com/api-keys'}};
 const shown=(list||[]).filter(c=>!onlyFlagged||c.flagged);
 return <div className="adm-stack">
  <div className="adm-grid-2">
   <section className="adm-card"><div className="adm-card-h"><div><h3>Configuration</h3><p>L’assistant répond à vos clients depuis le bouton en bas à droite de Yombal.</p></div><span className={'adm-status '+(data.aiConfig.configured&&data.flags.assistant?'g':'r')}><i/>{!data.aiConfig.configured?'Clé manquante':data.flags.assistant?'Actif':'Coupé'}</span></div>
    <form className="adm-form" onSubmit={async e=>{e.preventDefault();setSaving(true);const ok=await act({action:'ai_config',provider,model,...(key.trim()?{apiKey:key.trim()}:{})});if(ok)setKey('');setSaving(false);}}>
     <label><span>Fournisseur</span><select value={provider} onChange={e=>{setProvider(e.target.value);setModel(providers[e.target.value].model);}}>{Object.entries(providers).map(([k,p])=><option key={k} value={k}>{p.label}</option>)}</select></label>
     <label><span>Modèle</span><input name="ai-model" autoComplete="off" spellCheck={false} value={model} onChange={e=>setModel(e.target.value)} placeholder={providers[provider]?.model}/></label>
     <label><span>{data.aiConfig.configured?'Remplacer la clé API (facultatif)':'Clé API'}</span><input type="text" name="ai-api-key" data-lpignore="true" data-1p-ignore style={{WebkitTextSecurity:'disc'} as CSSProperties} value={key} onChange={e=>setKey(e.target.value)} autoComplete="off" spellCheck={false} placeholder="Collez la clé ici"/></label>
     <p className="adm-hint">Créez une clé gratuite sur <a href={providers[provider]?.url} target="_blank" rel="noreferrer">{providers[provider]?.url.replace('https://','')}</a>. Elle est chiffrée et n’apparaît jamais dans le code.</p>
     <div className="adm-inline"><button className="adm-btn" type="submit" disabled={saving}>{saving?<LoaderCircle size={15} className="spin"/>:<KeyRound size={15}/>}Enregistrer</button><button type="button" className={'adm-btn '+(data.flags.assistant?'ghost':'green')} onClick={()=>void act({action:'flag',flag:'assistant',value:!data.flags.assistant})}><Power size={15}/>{data.flags.assistant?'Couper l’assistant':'Activer l’assistant'}</button></div>
    </form></section>
   <section className="adm-card"><div className="adm-card-h"><div><h3>Modération</h3><p>Les messages à risque sont signalés automatiquement</p></div></div>
    <div className="adm-kpis two"><Kpi label="Conversations" value={data.stats.aiConversations} tone="p" icon={Bot}/><Kpi label="Signalées" value={data.stats.aiFlagged} tone="r" icon={MessageSquareWarning}/></div>
    <p className="adm-hint">Mots surveillés : violence, menaces, détresse, piratage, fraude ou faux documents, pratiques locatives illégales et insultes graves. L’assistant refuse ces demandes et vous gardez l’historique complet.</p></section>
  </div>
  <section className="adm-card"><div className="adm-card-h"><div><h3>Historique des discussions</h3><p>Signalées en premier</p></div><div className="adm-chips"><button type="button" className={!onlyFlagged?'on':''} onClick={()=>setOnlyFlagged(false)}>Toutes</button><button type="button" className={onlyFlagged?'on':''} onClick={()=>setOnlyFlagged(true)}>Signalées</button></div></div>
   {list===null?<p className="adm-empty"><LoaderCircle size={16} className="spin"/></p>:<div className="adm-list">{shown.map(c=><button type="button" key={c.id} className="adm-row clickable" onClick={()=>void view(c)}><span className={'adm-ico '+(c.flagged?'r':'p')}>{c.flagged?<MessageSquareWarning size={15}/>:<Bot size={15}/>}</span><div><b>{c.title}</b><small>{c.name||'—'} · {c.email}{c.flagged&&c.flagReason?' · '+c.flagReason:''}</small></div><span className="adm-tag">{c.messageCount} msg</span><small className="adm-muted">{when(c.updatedAt)}</small></button>)}{!shown.length&&<p className="adm-empty">Aucune discussion pour l’instant.</p>}</div>}</section>
  {open&&<div className="adm-drawer-scrim" onClick={()=>setOpen(null)}><aside className="adm-drawer wide" onClick={e=>e.stopPropagation()} role="dialog" aria-label="Discussion">
   <header><span className={'adm-ico '+(open.flagged?'r':'p')}><Bot size={17}/></span><div><h3>{open.title}</h3><small>{open.name} · {open.email}</small></div><button type="button" className="adm-icon" onClick={()=>setOpen(null)} aria-label="Fermer"><X size={18}/></button></header>
   {!!open.flagged&&<p className="adm-notice r">Signalée : {open.flagReason} <button type="button" className="adm-btn ghost sm" onClick={()=>void clear(open)}>Marquer comme vérifiée</button></p>}
   <div className="adm-chat">{messages.map((m,i)=><div key={i} className={'adm-bubble '+(m.role==='user'?'me':'bot')+(m.flagged?' flagged':'')}><p>{m.content}</p><small>{m.role==='user'?'Client':'Assistant'} · {fullDate(m.createdAt)}{m.flagged?' · ⚠ signalé':''}</small></div>)}{!messages.length&&<p className="adm-empty"><LoaderCircle size={16} className="spin"/></p>}</div>
   <div className="adm-inline"><button type="button" className="adm-btn danger" onClick={()=>void act({action:'suspend',userId:open.userId},`Suspendre le compte ${open.email} ?`)}><UserX size={15}/>Suspendre ce compte</button></div>
  </aside></div>}
 </div>;
}

function ControlsTab({data,act}:{data:Overview;act:(b:Record<string,unknown>,c?:string)=>Promise<boolean>}){
 const f=data.flags;
 const Row=({icon:Icon,title,text,on,tone,onToggle,label}:{icon:typeof Users;title:string;text:string;on:boolean;tone:'g'|'r';onToggle:()=>void;label:string})=><div className="adm-control"><span className={'adm-ico '+tone}><Icon size={18}/></span><div><b>{title}</b><small>{text}</small></div><button type="button" className={'adm-switch '+(on?'on':'')} role="switch" aria-checked={on} aria-label={label} onClick={onToggle}><i/></button></div>;
 return <div className="adm-stack">
  <p className="adm-notice p"><ShieldCheck size={17}/>En cas d’attaque ou de comportement anormal, ces commandes agissent immédiatement, sans attendre personne. Chaque action est notée dans le journal de sécurité.</p>
  <section className="adm-card"><div className="adm-card-h"><div><h3>Accès au site</h3><p>Interrupteurs instantanés</p></div></div>
   <Row icon={Users} title="Inscriptions ouvertes" text="Fermez-les pour bloquer la création de nouveaux comptes (attaque de faux comptes)." on={f.registrationsOpen} tone={f.registrationsOpen?'g':'r'} label="Inscriptions" onToggle={()=>void act({action:'flag',flag:'registrations',value:!f.registrationsOpen},f.registrationsOpen?'Fermer les inscriptions ?':undefined)}/>
   <Row icon={Wrench} title="Mode maintenance" text="Affiche une page « Yombal revient très vite » à tous les clients. Vous seul gardez l’accès." on={f.maintenance} tone={f.maintenance?'r':'g'} label="Maintenance" onToggle={()=>void act({action:'flag',flag:'maintenance',value:!f.maintenance},!f.maintenance?'Activer la maintenance ? Les clients ne pourront plus utiliser Yombal.':undefined)}/>
   <Row icon={Bot} title="Assistant IA" text="Coupe immédiatement l’assistant pour tous les clients." on={f.assistant} tone={f.assistant?'g':'r'} label="Assistant" onToggle={()=>void act({action:'flag',flag:'assistant',value:!f.assistant})}/>
  </section>
  <section className="adm-card danger-zone"><div className="adm-card-h"><div><h3>Mesures d’urgence</h3><p>À utiliser si un compte ou un mot de passe a pu être volé</p></div></div>
   <div className="adm-control"><span className="adm-ico r"><LogOut size={18}/></span><div><b>Déconnecter tous les comptes</b><small>Ferme toutes les sessions ouvertes. Chacun devra se reconnecter. Vous restez connecté.{f.sessionsAfter?` Dernière fois : ${fullDate(new Date(f.sessionsAfter).toISOString())}.`:''}</small></div><button type="button" className="adm-btn danger" onClick={()=>void act({action:'logout_all'},'Déconnecter tous les comptes maintenant ?')}>Déconnecter tout le monde</button></div>
   <div className="adm-control"><span className="adm-ico c"><UserX size={18}/></span><div><b>Suspendre un compte précis</b><small>Ouvrez l’onglet Utilisateurs, cliquez sur le compte puis « Suspendre ». Il est aussitôt déconnecté.</small></div></div>
   <div className="adm-control"><span className="adm-ico p"><KeyRound size={18}/></span><div><b>Clés SasPay et assistant</b><small>Remplacez-les dans les onglets Paiements et Assistant IA : l’ancienne clé cesse aussitôt d’être utilisée.</small></div></div>
  </section>
 </div>;
}
