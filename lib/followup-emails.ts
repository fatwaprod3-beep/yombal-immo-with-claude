import {sql} from 'drizzle-orm';
import {getDb} from '../db';
import {userEvents} from '../db/schema';
import {createPurposeToken} from '../app/auth';
import {emailEnabled,emailHtml,sendEmail,type EmailCard} from './email';
import type {State} from './model';

// Relances par e-mail des inscrits qui ne sont pas revenus. Deux e-mails au plus par personne :
//  1. le lendemain (ou dès que possible pour les anciens inscrits) : l'étape qui leur manque ;
//  2. 3 jours plus tard s'ils ne sont toujours pas revenus : un autre angle (le jour des loyers).
// Chaque bouton connecte directement, sans mot de passe (3 jours, une seule utilisation).
type Row={id:string;email:string;name:string|null;data:string|null;step1_at:string|null};
type Mail={subject:string;title:string;lines:string[];cta:string;next:string;card?:EmailCard;ps?:string};
const site='https://yombal-immo.pro',dailyCap=80; // Resend gratuit : 100 e-mails par jour.
const money=(n:number)=>n.toLocaleString('fr-FR').replace(/ | /g,' ')+' F';
const companyLike=/immo|agence|sarl|sas|gestion|groupe|services|business/i;

function profileOf(name:string|null,state:State|null){
 const p=state?.profile as (State['profile']&{mode?:string;company?:string;city?:string})|undefined;
 const agency=p?.mode==='agency';
 const company=(p?.company||'').trim()||(agency&&companyLike.test(name||'')?(name||'').trim():'');
 const first=companyLike.test(name||'')?'':((name||'').trim().split(/\s+/)[0]||'');
 const props=state?.properties||[];
 const lease=state?.leases.find(l=>l.status==='active');
 const tenant=lease?state?.tenants.find(t=>t.id===lease.tenantId):undefined;
 const prop=lease?props.find(x=>x.id===lease.propertyId)||props[0]:props[0];
 return {agency,company,first,props,lease,tenant,prop,city:(prop?.city||'').trim()};
}
export function followupMessage(step:1|2,name:string|null,state:State|null):Mail{
 const {agency,company,first,props,lease,tenant,prop,city}=profileOf(name,state);
 const hello=`Bonjour${first?' '+first:company?' '+company:''},`;
 const rent=lease?(lease.rent||0)+(lease.charges||0):prop?.rent||0;
 const card:EmailCard|undefined=prop?{label:agency&&company?company:'Votre logement',title:prop.name,sub:[city,tenant?`Locataire : ${tenant.name}`:'Pas encore de locataire',rent?money(rent)+' / mois':''].filter(Boolean).join(' · '),badge:tenant?undefined:'à compléter'}:undefined;
 if(step===1){
  if(lease&&tenant)return {subject:`📅 Le loyer de ${tenant.name} : on s’en occupe`,title:`${tenant.name} paie le ${lease.dueDay||5} : Yombal surveille pour vous`,card,
   lines:[hello,`Tout est en place. Le jour où ${tenant.name} paie, vous l’enregistrez en 2 secondes et le reçu PDF part sur WhatsApp. S’il est en retard, Yombal vous le montre tout de suite.`,props.length>1?`Vos ${props.length} logements sont suivis au même endroit.`:'Vous avez d’autres logements ? Ajoutez-les : tout se suit au même endroit.'],
   cta:'Voir mon tableau des loyers',next:'/#loyers',ps:'Activez les rappels quand Yombal vous le propose : vous serez prévenu sans avoir à ouvrir l’application.'};
  if(prop)return {subject:`🏠 « ${prop.name} » attend son locataire`,title:'Il ne manque qu’une chose : votre locataire',card,
   lines:[hello,`Votre logement « ${prop.name} » est bien enregistré. Ajoutez votre locataire et son loyer : chaque mois, Yombal vous dira s’il a payé et préparera le reçu tout seul.`,'Ça prend moins d’une minute, promis.'],
   cta:'Ajouter mon locataire',next:'/#locataires'};
  return agency?{subject:`${company||'Votre agence'} : vos loyers au même endroit en 1 minute`,title:'Votre agence est prête, il manque votre premier bien',
   lines:[hello,'Votre espace agence est créé. Ajoutez un premier bien et son locataire : vous verrez d’un coup d’œil qui a payé, qui doit encore, et les reçus se préparent tout seuls.','Fini les cahiers et les messages perdus.'],cta:'Ajouter mon premier bien',next:'/'}
  :{subject:'🏠 Votre premier logement en 1 minute',title:'Votre espace Yombal vous attend',
   lines:[hello,'Votre compte est prêt. Ajoutez votre premier logement : chaque mois, Yombal vous montre qui a payé, qui doit encore, et prépare les reçus à envoyer sur WhatsApp.'],cta:'Ajouter mon logement',next:'/'};
 }
 // Deuxième e-mail : le jour des loyers.
 if(lease&&tenant)return {subject:`⏰ Le ${lease.dueDay||5} approche : ${tenant.name} a-t-il payé ?`,title:'Le jour des loyers, la réponse en 2 secondes',card,
  lines:[hello,`Le ${lease.dueDay||5} du mois, ouvrez Yombal : vous voyez tout de suite si ${tenant.name} a payé${rent?` ses ${money(rent)}`:''}. Un retard ? Le rappel poli est prêt à envoyer sur WhatsApp.`,'Pas de cahier, pas de calcul, pas d’oubli.'],
  cta:'Ouvrir mon espace',next:'/#loyers',ps:'Pour ne plus jamais chercher le lien : quand Yombal vous le propose, mettez-le sur votre écran d’accueil.'};
 return {subject:agency?'Comment les agences suivent leurs loyers sans cahier':'Qui a payé ce mois-ci ? Yombal vous le dit',title:agency?'Vos loyers, vos reçus, vos propriétaires : au même endroit':'Le jour des loyers, sans stress',card,
  lines:[hello,agency?'Avec Yombal, chaque bien a son locataire et son loyer. Le jour du paiement : un geste, et le reçu part sur WhatsApp. Les retards sautent aux yeux, les reversements aux propriétaires sont suivis.':'Avec Yombal, vous voyez d’un coup d’œil qui a payé et qui doit encore. Le reçu PDF part sur WhatsApp en un geste.',prop?`Votre logement « ${prop.name} » est déjà là : il ne manque que quelques informations.`:'Il suffit d’ajouter votre premier logement : 1 minute.'],
  cta:prop?'Terminer mon installation':'Ajouter mon logement',next:prop?'/#locataires':'/',ps:'Besoin d’aide ? Répondez à cet e-mail : on vous aide à tout installer.'};
}
async function send(r:Row,step:1|2,now:Date){
 let state:State|null=null;try{state=r.data?JSON.parse(r.data) as State:null;}catch{}
 const m=followupMessage(step,r.name,state);
 const token=await createPurposeToken('magic',r.id,72*36e5);
 const link=`${site}/api/auth/magic?t=${token}&next=${encodeURIComponent(m.next)}`;
 const ok=await sendEmail({to:r.email,subject:m.subject,
  html:emailHtml({title:m.title,card:m.card,lines:[...m.lines,'Pas besoin de mot de passe : ce bouton vous connecte directement (valable 3 jours).'],cta:{label:m.cta,url:link},ps:m.ps,foot:'Vous recevez cet e-mail car vous avez créé un compte Yombal. Une question ? Répondez à cet e-mail ou écrivez-nous sur WhatsApp : +44 7445 510315.'}),
  text:`${m.lines.join('\n\n')}\n\n${m.cta} (sans mot de passe, valable 3 jours) :\n${link}\n${m.ps?'\nP.S. '+m.ps+'\n':''}\nL'équipe Yombal`});
 await getDb().insert(userEvents).values({id:crypto.randomUUID(),userId:r.id,kind:step===1?'email_day1':'email_day4',detail:ok?'sent':'failed',createdAt:now.toISOString()});
 return ok;
}
export async function sendFollowupEmails(now=new Date()){
 if(!emailEnabled())return {sent:0,step1:0,step2:0};
 const db=getDb();const since20h=new Date(now.getTime()-20*36e5).toISOString(),since3d=new Date(now.getTime()-3*864e5).toISOString();
 const step1=(await db.execute(sql`
  select u.id,u.email,u.name,w.data,null as step1_at from yombal_users u left join yombal_workspaces w on w.user_id=u.id
  where u.status='active' and coalesce(u.tester,0)=0 and u.created_at>='2026-11-01' and u.created_at<=${since20h}
   and (u.last_seen_at is null or u.last_seen_at::timestamptz < u.created_at::timestamptz + interval '6 hours')
   and not exists(select 1 from yombal_user_events e where e.user_id=u.id and e.kind='email_day1')
  order by u.created_at desc limit ${dailyCap}`)) as unknown as Row[];
 const step2=(await db.execute(sql`
  select u.id,u.email,u.name,w.data,e1.created_at as step1_at from yombal_users u left join yombal_workspaces w on w.user_id=u.id
  join yombal_user_events e1 on e1.user_id=u.id and e1.kind='email_day1' and e1.detail='sent'
  where u.status='active' and coalesce(u.tester,0)=0 and e1.created_at<=${since3d}
   and (u.last_seen_at is null or u.last_seen_at < e1.created_at)
   and not exists(select 1 from yombal_user_events e where e.user_id=u.id and e.kind='email_day4')
  order by e1.created_at limit ${dailyCap}`)) as unknown as Row[];
 let sent=0,n1=0,n2=0;
 for(const r of step1){if(sent>=dailyCap)break;if(await send(r,1,now)){sent++;n1++;}}
 for(const r of step2){if(sent>=dailyCap)break;if(await send(r,2,now)){sent++;n2++;}}
 return {sent,step1:n1,step2:n2};
}
