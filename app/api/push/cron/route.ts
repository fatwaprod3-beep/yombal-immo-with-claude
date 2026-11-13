import {sql} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {userEvents} from '../../../../db/schema';
import {pushMessageFor,sendPush} from '../../../../lib/web-push';
import {subscriptionFor} from '../../../../lib/subscription-server';
import type {State} from '../../../../lib/model';
export const dynamic='force-dynamic';
export const maxDuration=60;
type Row={pro_welcomed:boolean;user_id:string;created_at:string;last_seen_at:string|null;data:string|null;documents:number;last_sent:string|null;subs:{id:string;endpoint:string}[];recent_tags:string[]|null};
// Tous les jours à 9 h (heure de Dakar) : au plus une notification tous les 2 jours par personne,
// seulement si elle a quelque chose d'utile à lui dire, et jamais deux fois le même sujet dans la semaine.
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET;
 if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return new Response('Non autorisé',{status:401});
 const db=getDb();const now=new Date();
 const rows=(await db.execute(sql`
  select s.user_id,u.created_at,u.last_seen_at,w.data,
   (select count(*)::int from yombal_invoice_links i where i.user_id=s.user_id) as documents,
   max(s.last_sent_at) as last_sent,
   json_agg(json_build_object('id',s.id,'endpoint',s.endpoint)) as subs,
   exists(select 1 from yombal_user_events e where e.user_id=s.user_id and e.kind='push_sent' and e.detail='pro-welcome') as pro_welcomed,
   (select array_agg(e.detail) from yombal_user_events e where e.user_id=s.user_id and e.kind='push_sent' and e.created_at>${new Date(now.getTime()-6*864e5).toISOString()}) as recent_tags
  from yombal_push_subscriptions s
  join yombal_users u on u.id=s.user_id and u.status='active'
  left join yombal_workspaces w on w.user_id=s.user_id
  where s.failures<5
  group by s.user_id,u.created_at,u.last_seen_at,w.data
  limit 500`)) as unknown as Row[];
 let sent=0,skipped=0;
 for(const r of rows){
  const isPro=(await subscriptionFor(r.user_id)).isPro;
  // Les clients Pro qui n'ont jamais reçu la bienvenue la reçoivent en priorité (le texte est donné par /api/push/next).
  if(isPro&&!r.pro_welcomed){let ok=false;for(const s of r.subs)ok=(await sendPush(s))||ok;if(ok)sent++;continue;}
  if(r.last_sent&&now.getTime()-Date.parse(r.last_sent)<44*36e5){skipped++;continue;}
  if(!r.data){skipped++;continue;}
  let message;try{message=pushMessageFor(JSON.parse(r.data) as State,{createdAt:r.created_at,lastSeenAt:r.last_seen_at,isPro,documents:r.documents});}catch{message=null;}
  if(!message||(r.recent_tags||[]).includes(message.tag)){skipped++;continue;}
  let ok=false;for(const s of r.subs)ok=(await sendPush(s))||ok;
  if(ok){sent++;await db.insert(userEvents).values({id:crypto.randomUUID(),userId:r.user_id,kind:'push_sent',detail:message.tag,createdAt:now.toISOString()});}
 }
 return Response.json({users:rows.length,sent,skipped});
}
