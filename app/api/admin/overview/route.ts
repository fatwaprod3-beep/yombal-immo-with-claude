import {sql,desc} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {securityEvents} from '../../../../db/schema';
import {requireAdmin,adminJson} from '../../../../lib/admin-guard';
import {flags,getSetting} from '../../../../lib/app-settings';
export const dynamic='force-dynamic';
type UserRow={id:string;email:string;name:string;status:string;created_at:string;last_seen_at:string|null;last_login_at:string|null;plan_id:string|null;sub_status:string|null;expires_at:string|null;properties:number|null;tenants:number|null;spaces:number|null;paid:number|null;ai_messages:number|null;flagged:number|null};
export async function GET(request:Request){
 const {denied}=await requireAdmin(request);if(denied)return denied;
 try{
  const db=getDb();const now=Date.now();const iso=(ms:number)=>new Date(now-ms).toISOString();
  const users=await db.execute(sql`
   select u.id,u.email,u.name,u.status,u.created_at,u.last_seen_at,u.last_login_at,s.plan_id,s.status as sub_status,s.expires_at,
    w.properties,w.tenants,w.spaces,p.paid,a.ai_messages,a.flagged
   from yombal_users u
   left join yombal_subscriptions s on s.user_id=u.id
   left join (select split_part(user_id,'::',1) uid,
      sum(case when json_typeof((data::json)->'properties')='array' then json_array_length((data::json)->'properties') else 0 end)::int properties,
      sum(case when json_typeof((data::json)->'tenants')='array' then json_array_length((data::json)->'tenants') else 0 end)::int tenants,
      count(*)::int spaces
     from yombal_workspaces group by 1) w on w.uid=u.id
   left join (select user_id,sum(amount)::int paid from yombal_billing_payments where applied=1 group by 1) p on p.user_id=u.id
   left join (select user_id,count(*)::int ai_messages,sum(flagged)::int flagged from yombal_ai_messages where role='user' group by 1) a on a.user_id=u.id
   order by u.created_at desc limit 1000`) as unknown as UserRow[];
  const nowIso=new Date(now).toISOString();
  const list=users.map(u=>{const pro=u.sub_status==='active'&&!!u.expires_at&&u.expires_at>nowIso;return {id:u.id,email:u.email,name:u.name,status:u.status,createdAt:u.created_at,lastSeenAt:u.last_seen_at||u.last_login_at,plan:pro?u.plan_id:'free',expiresAt:pro?u.expires_at:null,properties:u.properties||0,tenants:u.tenants||0,spaces:u.spaces||0,paid:u.paid||0,aiMessages:u.ai_messages||0,flagged:u.flagged||0};});
  const active30=list.filter(u=>u.lastSeenAt&&u.lastSeenAt>iso(30*864e5)).length;
  const signups=(await db.execute(sql`select substr(created_at,1,10) d,count(*)::int n from yombal_users where created_at>${iso(30*864e5)} group by 1 order by 1`)) as unknown as {d:string;n:number}[];
  const revenue=(await db.execute(sql`select coalesce(sum(amount),0)::int total,coalesce(sum(case when created_at>${iso(30*864e5)} then amount else 0 end),0)::int month,count(*)::int count from yombal_billing_payments where applied=1`)) as unknown as {total:number;month:number;count:number}[];
  const sec=(await db.execute(sql`select kind,count(*)::int n from yombal_security_events where created_at>${iso(864e5)} group by 1`)) as unknown as {kind:string;n:number}[];
  const suspiciousIps=(await db.execute(sql`select ip,count(*)::int n,max(created_at) last,string_agg(distinct coalesce(email,''),', ') emails from yombal_security_events where kind in ('login_failed','login_blocked','admin_failed','register_blocked') and created_at>${iso(7*864e5)} and ip is not null group by ip having count(*)>=3 order by n desc limit 20`)) as unknown as {ip:string;n:number;last:string;emails:string}[];
  const events=await db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(150);
  const ai=(await db.execute(sql`select count(*)::int conversations,coalesce(sum(flagged),0)::int flagged,coalesce(sum(message_count),0)::int messages from yombal_ai_conversations`)) as unknown as {conversations:number;flagged:number;messages:number}[];
  const aiConfigRaw=await getSetting('assistant_config');let aiConfig={provider:'groq',model:'',configured:false};
  if(aiConfigRaw){try{const c=JSON.parse(aiConfigRaw) as {provider:string;model:string;key?:string};aiConfig={provider:c.provider,model:c.model,configured:!!c.key};}catch{}}
  const by=(k:string)=>sec.find(s=>s.kind===k)?.n||0;
  return adminJson({
   stats:{total:list.length,pro:list.filter(u=>u.plan!=='free').length,free:list.filter(u=>u.plan==='free').length,active30,inactive:list.length-active30,
    new7:list.filter(u=>u.createdAt>iso(7*864e5)).length,suspended:list.filter(u=>u.status!=='active').length,online:list.filter(u=>u.lastSeenAt&&u.lastSeenAt>iso(15*60e3)).length,
    revenueTotal:revenue[0]?.total||0,revenueMonth:revenue[0]?.month||0,payments:revenue[0]?.count||0,
    failed24:by('login_failed')+by('admin_failed'),blocked24:by('login_blocked')+by('register_blocked'),logins24:by('login'),
    aiConversations:ai[0]?.conversations||0,aiFlagged:ai[0]?.flagged||0,aiMessages:ai[0]?.messages||0},
   signups,users:list,events,suspiciousIps,flags:await flags(),aiConfig,
  });
 }catch(e){console.error('admin_overview_failed',e instanceof Error?e.message:'unknown');return adminJson({error:'Lecture impossible.'},503);}
}
