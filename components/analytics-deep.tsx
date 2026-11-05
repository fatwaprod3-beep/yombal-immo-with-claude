'use client';
import {useMemo} from 'react';
import {TrendingUp,TrendingDown,Percent,Building2,Wallet,CalendarRange,Users,ReceiptText,Trophy} from 'lucide-react';
import {type State,money,monthLabel,addMonth,totals,bills,billed,rentalProperties,propertyStatus} from '../lib/model';

// Analyse approfondie : ratios clés, évolution sur 12 mois, performance par bien,
// locataires à relancer et dépenses par catégorie. Calculs faits sur les données existantes.
const pct=(a:number,b:number)=>b>0?Math.round(a/b*100):0;
function Delta({now,before,inverse=false}:{now:number;before:number;inverse?:boolean}){
 if(!before&&!now)return <small className="an-delta">—</small>;
 const d=before?Math.round((now-before)/Math.abs(before)*100):100;const good=inverse?d<=0:d>=0;
 return <small className={'an-delta '+(good?'up':'down')}>{d>=0?<TrendingUp size={13}/>:<TrendingDown size={13}/>}{d>0?'+':''}{d} % vs mois précédent</small>;
}
export default function AnalyticsDeep({state,period}:{state:State;period:string}){
 const data=useMemo(()=>{
  const months=Array.from({length:12},(_,i)=>addMonth(period,i-11));
  const rows=months.map(m=>{const t=totals(state,m);return {m,expected:t.expected,collected:t.collected+t.seasonal,expenses:t.expenses,net:t.net};});
  const cur=rows[11],prev=rows[10];
  const props=rentalProperties(state);const occupied=props.filter(p=>propertyStatus(state,p)==='occupied').length;
  const year=period.slice(0,4);const ytd=rows.filter(r=>r.m.startsWith(year));
  const perProperty=props.map(p=>{const leases=state.leases.filter(l=>l.propertyId===p.id);const ids=new Set(leases.map(l=>l.id));
   const collected=state.payments.filter(x=>ids.has(x.leaseId)&&months.includes(x.period)).reduce((s,x)=>s+x.amount,0);
   const expenses=state.expenses.filter(e=>e.propertyId===p.id&&months.includes(e.date.slice(0,7))).reduce((s,e)=>s+e.amount,0);
   const expected=months.reduce((s,m)=>s+leases.filter(l=>billed(l,m)).reduce((a,l)=>a+l.rent+l.charges,0),0);
   return {id:p.id,name:p.name,city:p.city,status:propertyStatus(state,p),collected,expenses,net:collected-expenses,recovery:pct(collected,expected)};}).sort((a,b)=>b.net-a.net);
  const debt=new Map<string,number>();for(const b of bills(state,period)){if(b.balance>0)debt.set(b.lease.tenantId,(debt.get(b.lease.tenantId)||0)+b.balance);}
  const debtors=[...debt].map(([id,amount])=>({name:state.tenants.find(t=>t.id===id)?.name||'Locataire',amount})).sort((a,b)=>b.amount-a.amount).slice(0,5);
  const cats=new Map<string,number>();state.expenses.filter(e=>months.includes(e.date.slice(0,7))).forEach(e=>cats.set(e.category||'Autre',(cats.get(e.category||'Autre')||0)+e.amount));
  const categories=[...cats].sort((a,b)=>b[1]-a[1]);
  return {rows,cur,prev,occupancy:pct(occupied,props.length),occupied,total:props.length,ytdCollected:ytd.reduce((s,r)=>s+r.collected,0),ytdNet:ytd.reduce((s,r)=>s+r.net,0),perProperty,debtors,categories,year};
 },[state,period]);
 const max=Math.max(1,...data.rows.map(r=>Math.max(r.expected,r.collected)));const maxCat=Math.max(1,...data.categories.map(c=>c[1]));
 return <div className="an-deep">
  <div className="an-kpis">
   <div className="an-kpi"><span className="an-ico green"><Percent size={18}/></span><em>Taux de recouvrement</em><strong>{pct(data.cur.collected,data.cur.expected)} %</strong><small>{money(data.cur.collected)} sur {money(data.cur.expected)}</small><Delta now={pct(data.cur.collected,data.cur.expected)} before={pct(data.prev.collected,data.prev.expected)}/></div>
   <div className="an-kpi"><span className="an-ico purple"><Building2 size={18}/></span><em>Taux d’occupation</em><strong>{data.occupancy} %</strong><small>{data.occupied} logement{data.occupied>1?'s':''} occupé{data.occupied>1?'s':''} sur {data.total}</small></div>
   <div className="an-kpi"><span className="an-ico coral"><Wallet size={18}/></span><em>Revenu net du mois</em><strong>{money(data.cur.net)}</strong><small>Encaissé moins dépenses{state.profile.mode==='agency'?' et commissions':''}</small><Delta now={data.cur.net} before={data.prev.net}/></div>
   <div className="an-kpi"><span className="an-ico sand"><CalendarRange size={18}/></span><em>Cumul {data.year}</em><strong>{money(data.ytdCollected)}</strong><small>Net de l’année : {money(data.ytdNet)}</small></div>
  </div>
  <section className="panel an-panel"><header><h3>Les 12 derniers mois</h3><p>Loyers attendus, encaissés, dépenses et résultat net, mois par mois.</p></header>
   <div className="an-months">{data.rows.map(r=><div key={r.m} className={'an-month'+(r.m===period?' current':'')}>
    <span className="an-month-label">{monthLabel(r.m,true)}</span>
    <span className="an-bars"><i className="exp" style={{width:pct(r.expected,max)+'%'}}/><i className="col" style={{width:pct(r.collected,max)+'%'}}/></span>
    <span className="an-month-num"><b>{money(r.collected)}</b><small>{pct(r.collected,r.expected)} % · dép. {money(r.expenses)}</small></span>
    <span className={'an-month-net '+(r.net<0?'neg':'')}>{money(r.net)}</span>
   </div>)}</div>
   <div className="an-legend"><span><i className="exp"/>Attendus</span><span><i className="col"/>Encaissés</span><span>Colonne de droite : résultat net</span></div>
  </section>
  <div className="an-split">
   <section className="panel an-panel"><header><h3><Trophy size={17}/>Performance par bien</h3><p>Sur les 12 derniers mois, du plus rentable au moins rentable.</p></header>
    {data.perProperty.length?<div className="an-table">{data.perProperty.map((p,i)=><div key={p.id} className="an-row"><span className="an-rank">{i+1}</span><span className="an-name"><b>{p.name}</b><small>{p.city} · {p.status==='occupied'?'Occupé':p.status==='reserved'?'Réservé':'À louer'}</small></span><span className="an-val"><b>{money(p.net)}</b><small>{money(p.collected)} encaissés · {money(p.expenses)} dép.</small></span><span className={'an-pill '+(p.recovery>=90?'good':p.recovery>=60?'mid':'low')}>{p.recovery} %</span></div>)}</div>:<p className="an-empty">Ajoutez vos biens pour comparer leurs performances.</p>}
   </section>
   <div className="an-col">
    <section className="panel an-panel"><header><h3><Users size={17}/>Locataires à relancer</h3><p>Montants restant dus à ce jour.</p></header>
     {data.debtors.length?<div className="an-table">{data.debtors.map(d=><div key={d.name} className="an-row"><span className="an-name"><b>{d.name}</b></span><span className="an-pill low">{money(d.amount)}</span></div>)}</div>:<p className="an-empty good">Aucun impayé : tous vos locataires sont à jour.</p>}
    </section>
    <section className="panel an-panel"><header><h3><ReceiptText size={17}/>Dépenses par catégorie</h3><p>Sur les 12 derniers mois.</p></header>
     {data.categories.length?<div className="an-cats">{data.categories.map(([c,v])=><div key={c} className="an-cat"><span><b>{c}</b><small>{money(v)}</small></span><i><i style={{width:pct(v,maxCat)+'%'}}/></i></div>)}</div>:<p className="an-empty">Aucune dépense enregistrée sur la période.</p>}
    </section>
   </div>
  </div>
 </div>;
}
