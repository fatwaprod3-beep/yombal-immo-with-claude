import {sql} from 'drizzle-orm';
import {getDb} from '../db';
import {userEvents} from '../db/schema';
import {createPurposeToken} from '../app/auth';
import {emailEnabled,emailHtml,sendEmail} from './email';
import type {State} from './model';

// E-mail du lendemain : pour les inscrits d'hier qui ne sont pas revenus. Un seul envoi par personne.
// Le bouton les connecte directement (sans mot de passe) et les amène à l'étape qui leur manque.
type Row={id:string;email:string;name:string|null;data:string|null};
const site='https://yombal-immo.pro';
const money=(n:number)=>n.toLocaleString('fr-FR').replace(/ | /g,' ')+' F';
export function dayAfterMessage(name:string|null,state:State|null){
 const first=(name||'').trim().split(/\s+/)[0]||'';const hello='Bonjour'+(first&&!/immo|agence|sarl|sas|gestion/i.test(name||'')?' '+first:'')+',';
 const props=state?.properties||[],lease=state?.leases.find(l=>l.status==='active'),tenant=lease&&state?.tenants.find(t=>t.id===lease.tenantId);
 if(lease&&tenant)return {subject:`Le loyer de ${tenant.name} est suivi dans Yombal`,title:`${tenant.name} : tout est prêt pour le ${lease.dueDay||5}`,
  lines:[hello,`Yombal suit maintenant le loyer de ${tenant.name}${lease.rent?' ('+money(lease.rent+(lease.charges||0))+')':''}. Le jour du paiement, enregistrez-le en 2 secondes : le reçu PDF est prêt à envoyer sur WhatsApp.`,'Vous avez d’autres logements ou locataires ? Ajoutez-les maintenant, tout se suit au même endroit.'],cta:'Ouvrir mon espace Yombal',next:'/'};
 if(props.length)return {subject:`Votre logement « ${props[0].name} » attend son locataire`,title:'Encore une étape : votre locataire',
  lines:[hello,`Votre logement « ${props[0].name} » est bien enregistré dans Yombal. Il ne reste qu’à ajouter votre locataire : Yombal suivra ensuite chaque loyer et préparera les reçus.`,'Ça prend moins d’une minute.'],cta:'Ajouter mon locataire',next:'/#locataires'};
 return {subject:'Votre espace Yombal vous attend',title:'Votre premier logement en 1 minute',
  lines:[hello,'Votre compte Yombal est prêt. Ajoutez votre premier logement : chaque mois, Yombal vous montre qui a payé, qui doit encore, et prépare les reçus.'],cta:'Ajouter mon logement',next:'/'};
}
export async function sendDayAfterEmails(now=new Date()){
 if(!emailEnabled())return {sent:0,candidates:0};
 const db=getDb();
 const from=new Date(now.getTime()-48*36e5).toISOString(),to=new Date(now.getTime()-20*36e5).toISOString();
 const rows=(await db.execute(sql`
  select u.id,u.email,u.name,w.data from yombal_users u
  left join yombal_workspaces w on w.user_id=u.id
  where u.status='active' and coalesce(u.tester,0)=0 and u.created_at>=${from} and u.created_at<=${to}
   and (u.last_seen_at is null or u.last_seen_at::timestamptz < u.created_at::timestamptz + interval '6 hours')
   and not exists(select 1 from yombal_user_events e where e.user_id=u.id and e.kind='email_day1')
  limit 200`)) as unknown as Row[];
 let sent=0;
 for(const r of rows){
  let state:State|null=null;try{state=r.data?JSON.parse(r.data) as State:null;}catch{}
  const m=dayAfterMessage(r.name,state);
  const token=await createPurposeToken('magic',r.id,72*36e5);
  const link=`${site}/api/auth/magic?t=${token}&next=${encodeURIComponent(m.next)}`;
  const ok=await sendEmail({to:r.email,subject:m.subject,
   html:emailHtml({title:m.title,lines:[...m.lines,'Pas besoin de mot de passe : ce bouton vous connecte directement (valable 3 jours).'],cta:{label:m.cta,url:link},foot:'Vous recevez cet e-mail car vous avez créé un compte Yombal. Une question ? Répondez à cet e-mail ou écrivez-nous sur WhatsApp : +44 7445 510315.'}),
   text:`${m.lines.join('\n\n')}\n\n${m.cta} (sans mot de passe, valable 3 jours) :\n${link}\n\nL'équipe Yombal`});
  await db.insert(userEvents).values({id:crypto.randomUUID(),userId:r.id,kind:'email_day1',detail:ok?'sent':'failed',createdAt:now.toISOString()});
  if(ok)sent++;
 }
 return {sent,candidates:rows.length};
}
