'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {Check,Copy,KeyRound,LoaderCircle,ShieldCheck} from 'lucide-react';
import {apiFetch} from '../lib/api-fetch';
import {plans} from '../lib/billing';
import {money} from '../lib/model';

type Connection={configured:boolean;mode:'live'|'test'|null;verifiedAt?:string|null;lastWebhookAt?:string|null};
export default function AdminPayments(){
 const [connection,setConnection]=useState<Connection|null>(null),[key,setKey]=useState(''),[secret,setSecret]=useState('');
 const [origin,setOrigin]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 useEffect(()=>{
  const controller=new AbortController();
  void apiFetch('/api/admin/payments',{signal:controller.signal,cache:'no-store'}).then(async r=>{const data=await r.json() as Connection&{error?:string};if(!r.ok)throw Error(data.error||'Lecture impossible.');if(!controller.signal.aborted){setConnection(data);setOrigin(window.location.origin);}}).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Réessayez.');});
  return()=>controller.abort();
 },[]);
 async function save(event:FormEvent){
  event.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('');
  try{
   const r=await apiFetch('/api/admin/payments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save',apiKey:key})});
   const data=await r.json() as Connection&{error?:string;message?:string};if(!r.ok)throw Error(data.error||'Connexion impossible.');
   setConnection(data);setKey('');setMessage(data.message||'SasPay est connecté.');
  }catch(e){setError(e instanceof Error?e.message:'Réessayez.');}finally{setBusy(false);}
 }
 async function showSecret(){
  if(busy)return;setBusy(true);setError('');
  try{const r=await apiFetch('/api/admin/payments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'webhook_secret'})});const data=await r.json() as {webhookSecret?:string;error?:string};if(!r.ok||!data.webhookSecret)throw Error(data.error||'Secret indisponible.');setSecret(data.webhookSecret);}
  catch(e){setError(e instanceof Error?e.message:'Réessayez.');}finally{setBusy(false);}
 }
 const [sasSecret,setSasSecret]=useState('');
 async function saveSasSecret(event:FormEvent){event.preventDefault();if(busy)return;setBusy(true);setError('');setMessage('');try{const r=await apiFetch('/api/admin/payments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'set_webhook_secret',apiKey:sasSecret})});const d=await r.json() as {message?:string;error?:string};if(!r.ok)throw Error(d.error||'Enregistrement impossible.');setSasSecret('');setSecret('');setMessage(d.message||'Secret enregistré.');}catch(e){setError(e instanceof Error?e.message:'Réessayez.');}finally{setBusy(false);}}
 async function copy(value:string){try{await navigator.clipboard.writeText(value);setMessage('Copié.');}catch{setMessage('Sélectionnez le texte puis utilisez Copier sur votre appareil.');}}
 return <section className="admin-payments" aria-labelledby="payments-title">
  <div className="admin-payments-title"><div><span className="pro-eyebrow">PAIEMENTS YOMBAL PRO</span><h2 id="payments-title">Connecter SasPay</h2><p>Une seule connexion pour les trois durées d’abonnement.</p></div><span className={'billing-connection '+(connection?.configured?'connected':'')}><i/>{connection===null?'Chargement…':connection.configured?(connection.mode==='live'?'Paiements réels':'Mode test'):'À connecter'}</span></div>
  <div className="admin-payments-grid">
   <section className="billing-setup-card"><span className="billing-step">1</span><h3>Votre clé API</h3><p>Copiez la clé complète depuis Développeur dans SasPay, avec la portée <strong>Encaissement</strong>.</p><form onSubmit={save}><label className="field"><span>{connection?.configured?'Remplacer la clé enregistrée':'Clé secrète SasPay'}</span><input type="password" name="saspay-key" value={key} onChange={e=>setKey(e.target.value)} autoComplete="off" spellCheck={false} placeholder="sk_live_…" minLength={20} maxLength={520} required/></label><button className="button primary" type="submit" disabled={busy||!key.trim()} aria-busy={busy}>{busy?<LoaderCircle size={17} className="spin"/>:<KeyRound size={17}/>}Vérifier et connecter</button></form><div className="billing-security"><ShieldCheck size={17}/><span>Clé chiffrée côté serveur, réservée à votre administration. Elle n’apparaît pas dans le code du site.</span></div>{connection?.mode==='test'&&<p className="billing-warning">Mode test : les essais ne débloquent pas les abonnements réels.</p>}</section>
   <section className="billing-setup-card"><span className="billing-step">2</span><h3>Activation et durée</h3><p>SasPay encaisse. Yombal vérifie le paiement, puis ouvre l’accès du bon compte.</p><div className="billing-plan-rows">{plans.map(plan=><div key={plan.id}><strong>{plan.period}</strong><span>{money(plan.price)} <small>XOF</small></span></div>)}</div><ul className="billing-check-list"><li><Check size={16}/>Vérification au retour dans l’application</li><li><Check size={16}/>Renouvellement ajouté à la date de fin</li><li><Check size={16}/>Retour au gratuit à l’expiration</li><li><Check size={16}/>Données conservées</li></ul></section>
  </div>
  <details className="billing-webhook"><summary>Webhooks · réglages à copier dans SasPay</summary><div className="billing-webhook-content"><p className="billing-warning"><strong>À finaliser avant l’ouverture publique.</strong> Copiez cette adresse publique dans SasPay, puis envoyez un événement de test depuis leur tableau de bord. La vérification au retour dans Yombal fonctionne aussi sans webhook.</p><label className="field"><span>URL préparée du webhook</span><div className="billing-copy"><input readOnly value={origin?origin+'/api/payments/saspay/webhook':''} onFocus={e=>e.target.select()}/><button type="button" className="button secondary" disabled={!origin} onClick={()=>void copy(origin+'/api/payments/saspay/webhook')} aria-label="Copier l’URL du webhook"><Copy size={16}/></button></div></label><p>Dans SasPay : description <strong>Yombal Pro</strong>, événement <strong>transaction.success</strong>. Le secret ci-dessous doit être identique dans les deux applications.</p>{secret?<label className="field"><span>Secret de signature · gardez-le privé</span><div className="billing-copy"><input readOnly value={secret} onFocus={e=>e.target.select()} autoComplete="off"/><button type="button" className="button secondary" onClick={()=>void copy(secret)} aria-label="Copier le secret de signature"><Copy size={16}/></button></div><button type="button" className="text-button" onClick={()=>setSecret('')}>Masquer le secret</button></label>:<button type="button" className="button secondary" disabled={busy||!connection?.configured} onClick={()=>void showSecret()}>Afficher le secret à copier</button>}<small>{connection?.lastWebhookAt?'Dernière signature reçue : '+new Date(connection.lastWebhookAt).toLocaleString('fr-FR',{timeZone:'Africa/Dakar'}):'Aucune confirmation webhook reçue à ce jour.'}</small></div></details>
  <section className="billing-setup-card" style={{marginTop:16}}><h3>Secret de signature donné par SasPay</h3><p>Si SasPay vous a affiché son propre secret à la création du webhook, collez-le ici pour qu’il soit identique dans les deux applications.</p><form onSubmit={saveSasSecret}><label className="field"><span>Secret SasPay</span><input type="password" value={sasSecret} onChange={e=>setSasSecret(e.target.value)} autoComplete="off" spellCheck={false} minLength={16} maxLength={300} required/></label><button className="button primary" type="submit" disabled={busy||!sasSecret.trim()||!connection?.configured}>{busy?<LoaderCircle size={17} className="spin"/>:<KeyRound size={17}/>}Enregistrer le secret</button></form>{connection?.lastWebhookAt?<p className="billing-security"><Check size={16}/> Dernier webhook reçu : {new Date(connection.lastWebhookAt).toLocaleString('fr-FR')}</p>:<p className="billing-warning">Aucun webhook reçu pour l’instant.</p>}</section>
  {message&&<p className="support-success" role="status">{message}</p>}{error&&<p className="form-error" role="alert">{error}</p>}
 </section>;
}
