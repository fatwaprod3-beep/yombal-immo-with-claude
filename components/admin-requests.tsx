'use client';
import {useEffect,useState} from 'react';
import {Check,LoaderCircle,X} from 'lucide-react';
import {apiFetch} from '../lib/api-fetch';
import {askConfirm} from './confirm-dialog';
import {findPlan} from '../lib/billing';
import {money} from '../lib/model';

type Request={id:string;planId:string;amount:number;status:string;createdAt:string;email:string;name:string};
// Abonnements payés via les liens SasPay : vérifier le paiement dans SasPay, puis activer.
export default function AdminRequests(){
 const [requests,setRequests]=useState<Request[]|null>(null),[busy,setBusy]=useState(''),[message,setMessage]=useState(''),[error,setError]=useState('');
 useEffect(()=>{void apiFetch('/api/admin/payments',{cache:'no-store'}).then(async r=>{const d=await r.json() as {requests?:Request[];error?:string};if(!r.ok)throw Error(d.error||'Lecture impossible.');setRequests(d.requests||[]);}).catch(e=>setError(e instanceof Error?e.message:'Réessayez.'));},[]);
 async function act(id:string,action:'activate_request'|'dismiss_request'){
  if(busy)return;if(action==='activate_request'&&!await askConfirm('Avez-vous vérifié ce paiement dans votre tableau de bord SasPay ?',{title:'Activer cet abonnement',confirmLabel:'Oui, activer',danger:false}))return;
  setBusy(id);setError('');setMessage('');
  try{const r=await apiFetch('/api/admin/payments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,id})});const d=await r.json() as {requests?:Request[];expiresAt?:string;error?:string};if(!r.ok)throw Error(d.error||'Action impossible.');setRequests(d.requests||[]);setMessage(action==='activate_request'?'Accès Pro activé jusqu’au '+new Date(d.expiresAt||'').toLocaleDateString('fr-FR')+'.':'Demande retirée.');}
  catch(e){setError(e instanceof Error?e.message:'Réessayez.');}finally{setBusy('');}
 }
 const pending=(requests||[]).filter(r=>r.status==='link_pending'),done=(requests||[]).filter(r=>r.status==='link_paid').slice(0,10);
 return <section className="admin-card" style={{marginTop:20,maxWidth:'none'}}>
  <h2>Abonnements via vos liens SasPay</h2>
  <p>Quand un client clique sur « Continuer au paiement », il est envoyé vers votre lien SasPay. Vérifiez le paiement dans SasPay (montant et e-mail), puis activez son accès ici.</p>
  {requests===null&&!error&&<p><LoaderCircle className="spin" size={16}/> Chargement…</p>}
  {requests&&!pending.length&&<p>Aucune demande en attente.</p>}
  {pending.map(r=><div key={r.id} style={{display:'flex',flexWrap:'wrap',gap:12,alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderTop:'1px solid #eee'}}>
   <div><strong>{r.name||r.email}</strong><br/><small>{r.email} · {findPlan(r.planId)?.name||r.planId} · {money(r.amount)} · {new Date(r.createdAt).toLocaleString('fr-FR')}</small></div>
   <div style={{display:'flex',gap:8}}><button type="button" className="button primary" disabled={!!busy} onClick={()=>void act(r.id,'activate_request')}>{busy===r.id?<LoaderCircle className="spin" size={16}/>:<Check size={16}/>}Activer Pro</button><button type="button" className="button secondary" disabled={!!busy} onClick={()=>void act(r.id,'dismiss_request')} aria-label="Retirer la demande"><X size={16}/></button></div>
  </div>)}
  {done.length>0&&<details style={{marginTop:12}}><summary>Derniers accès activés</summary>{done.map(r=><p key={r.id}><small>{r.email} · {findPlan(r.planId)?.name} · {new Date(r.createdAt).toLocaleDateString('fr-FR')}</small></p>)}</details>}
  {message&&<p className="form-success" role="status">{message}</p>}{error&&<p className="form-error" role="alert">{error}</p>}
 </section>;
}
