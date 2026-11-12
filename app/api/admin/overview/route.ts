import {sql,desc} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {securityEvents} from '../../../../db/schema';
import {requireAdmin,adminJson} from '../../../../lib/admin-guard';
import {flags,getSetting} from '../../../../lib/app-settings';
export const dynamic='force-dynamic';
type UserRow={id:string;email:string;name:string;status:string;created_at:string;last_seen_at:string|null;last_login_at:string|null;plan_id:string|null;sub_status:string|null;expires_at:string|null;properties:number|null;tenants:number|null;spaces:number|null;paid:number|null;ai_messages:number|null;flagged:number|null;tester:number|null;configured:boolean|null;mode:string|null;leases:number|null;rent_payments:number|null;receipts:number|null;contracts:number|null;app_opens:number|null;app_installed:number|null;app_last:string|null;prompts:number|null;prompt_dismissed:number|null;push:number|null;ref_code:string|null;phone:string|null;company:string|null};
export async function GET(request:Request){
 const {denied}=await requireAdmin(request);if(denied)return denied;
 try{
  const db=getDb();const now=Date.now();const iso=(ms:number)=>new Date(now-ms).toISOString();
  const users=await db.execute(sql`
   select u.id,u.email,u.name,u.status,u.created_at,u.last_seen_at,u.last_login_at,u.tester,s.plan_id,s.status as sub_status,s.expires_at,
    w.properties,w.tenants,w.spaces,w.leases,w.rent_payments,w.contracts,w.configured,w.mode,w.phone,w.company,p.paid,a.ai_messages,a.flagged,
    (select count(*)::int from yombal_invoice_links i where i.user_id=u.id) as receipts,
    e.app_opens,e.app_installed,e.app_last,e.prompts,e.prompt_dismissed,
    (select count(*)::int from yombal_push_subscriptions ps where ps.user_id=u.id and ps.failures<5) as push,
    l.code as ref_code
   from yombal_users u
   left join yombal_track_links l on l.id=u.ref_link_id
   left join (select user_id,
      count(*) filter (where kind='app_open_standalone')::int as app_opens,
      count(*) filter (where kind='app_installed')::int as app_installed,
      max(created_at) filter (where kind in ('app_open_standalone','app_installed')) as app_last,
      count(*) filter (where kind='install_prompt_shown')::int as prompts,
      count(*) filter (where kind='install_prompt_dismissed')::int as prompt_dismissed
     from yombal_user_events group by 1) e on e.user_id=u.id
   left join yombal_subscriptions s on s.user_id=u.id
   left join (select split_part(user_id,'::',1) as uid,
      sum(case when json_typeof((data::json)->'properties')='array' then json_array_length((data::json)->'properties') else 0 end)::int as properties,
      sum(case when json_typeof((data::json)->'tenants')='array' then json_array_length((data::json)->'tenants') else 0 end)::int as tenants,
      count(*)::int as spaces,
      sum(case when json_typeof((data::json)->'leases')='array' then json_array_length((data::json)->'leases') else 0 end)::int as leases,
      sum(case when json_typeof((data::json)->'payments')='array' then json_array_length((data::json)->'payments') else 0 end)::int as rent_payments,
      sum(case when json_typeof((data::json)->'rentalContracts')='array' then json_array_length((data::json)->'rentalContracts') else 0 end)::int as contracts,
      bool_or(((data::json)->'profile'->>'configured')='true') as configured,
      max((data::json)->'profile'->>'mode') as mode,
      max((data::json)->'profile'->>'phone') as phone,
      max((data::json)->'profile'->>'company') as company
     from yombal_workspaces group by 1) w on w.uid=u.id
   left join (select user_id,sum(amount)::int as paid from yombal_billing_payments where applied=1 group by 1) p on p.user_id=u.id
   left join (select user_id,count(*)::int as ai_messages,sum(flagged)::int as flagged from yombal_ai_messages where role='user' group by 1) a on a.user_id=u.id
   order by u.created_at desc limit 1000`) as unknown as UserRow[];
  const nowIso=new Date(now).toISOString();
  const list=users.map(u=>{const pro=u.sub_status==='active'&&!!u.expires_at&&u.expires_at>nowIso;return {id:u.id,email:u.email,name:u.name,status:u.status,createdAt:u.created_at,lastSeenAt:u.last_seen_at||u.last_login_at,plan:pro?u.plan_id:'free',expiresAt:pro?u.expires_at:null,properties:u.properties||0,tenants:u.tenants||0,spaces:u.spaces||0,paid:u.paid||0,aiMessages:u.ai_messages||0,flagged:u.flagged||0,
   tester:!!u.tester,mode:u.mode||null,ref:u.ref_code||null,phone:(u.phone||'').trim()||null,company:u.company&&u.company!=='Mon patrimoine'?u.company:null,
   // Parcours : 0 inscrit → 1 profil choisi → 2 logement → 3 locataire → 4 loyer encaissé → 5 document → 6 Pro.
   journey:{profile:!!u.configured,property:(u.properties||0)>0,tenant:(u.tenants||0)>0,payment:(u.rent_payments||0)>0,document:(u.receipts||0)+(u.contracts||0)>0,pro},
   documents:(u.receipts||0)+(u.contracts||0),
   app:{installed:(u.app_installed||0)+(u.app_opens||0)>0,opens:u.app_opens||0,last:u.app_last,prompts:u.prompts||0,dismissed:u.prompt_dismissed||0},push:(u.push||0)>0};});
  const real=list.filter(u=>!u.tester);
  const funnel={signups:real.length,profile:real.filter(u=>u.journey.profile).length,property:real.filter(u=>u.journey.property).length,tenant:real.filter(u=>u.journey.tenant).length,payment:real.filter(u=>u.journey.payment).length,document:real.filter(u=>u.journey.document).length,pro:real.filter(u=>u.journey.pro).length,app:real.filter(u=>u.app.installed).length,prompted:real.filter(u=>u.app.prompts>0).length,push:real.filter(u=>u.push).length};
  // Les comptes de test (vos propres essais) sont exclus des chiffres.
  const active30=real.filter(u=>u.lastSeenAt&&u.lastSeenAt>iso(30*864e5)).length;
  const signups=(await db.execute(sql`select substr(created_at,1,10) as d,count(*)::int as n from yombal_users where created_at>${iso(30*864e5)} and tester=0 group by 1 order by 1`)) as unknown as {d:string;n:number}[];
  const revenue=(await db.execute(sql`select coalesce(sum(amount),0)::int as total,coalesce(sum(case when created_at>${iso(30*864e5)} then amount else 0 end),0)::int as month,count(*)::int as count from yombal_billing_payments where applied=1 and user_id not in (select id from yombal_users where tester=1)`)) as unknown as {total:number;month:number;count:number}[];
  const sec=(await db.execute(sql`select kind,count(*)::int as n from yombal_security_events where created_at>${iso(864e5)} group by 1`)) as unknown as {kind:string;n:number}[];
  const suspiciousIps=(await db.execute(sql`select ip,count(*)::int as n,max(created_at) as last,string_agg(distinct coalesce(email,''),', ') as emails from yombal_security_events where kind in ('login_failed','login_blocked','admin_failed','register_blocked') and created_at>${iso(7*864e5)} and ip is not null group by ip having count(*)>=3 order by n desc limit 20`)) as unknown as {ip:string;n:number;last:string;emails:string}[];
  const events=await db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(150);
  const ai=(await db.execute(sql`select count(*)::int as conversations,coalesce(sum(flagged),0)::int as flagged,coalesce(sum(message_count),0)::int as messages from yombal_ai_conversations`)) as unknown as {conversations:number;flagged:number;messages:number}[];
  const aiConfigRaw=await getSetting('assistant_config');let aiConfig={provider:'groq',model:'',configured:false};
  if(aiConfigRaw){try{const c=JSON.parse(aiConfigRaw) as {provider:string;model:string;key?:string};aiConfig={provider:c.provider,model:c.model,configured:!!c.key};}catch{}}
  const by=(k:string)=>sec.find(s=>s.kind===k)?.n||0;
  return adminJson({
   stats:{total:real.length,pro:real.filter(u=>u.plan!=='free').length,free:real.filter(u=>u.plan==='free').length,active30,inactive:real.length-active30,testers:list.length-real.length,
    new7:real.filter(u=>u.createdAt>iso(7*864e5)).length,suspended:real.filter(u=>u.status!=='active').length,online:real.filter(u=>u.lastSeenAt&&u.lastSeenAt>iso(15*60e3)).length,
    revenueTotal:revenue[0]?.total||0,revenueMonth:revenue[0]?.month||0,payments:revenue[0]?.count||0,
    failed24:by('login_failed')+by('admin_failed'),blocked24:by('login_blocked')+by('register_blocked'),logins24:by('login'),
    aiConversations:ai[0]?.conversations||0,aiFlagged:ai[0]?.flagged||0,aiMessages:ai[0]?.messages||0},
   signups,funnel,users:list,events,suspiciousIps,flags:await flags(),aiConfig,
  });
 }catch(e){console.error('admin_overview_failed',e instanceof Error?(e.message.slice(0,200)+' | '+String((e as {cause?:unknown}).cause||'')):'unknown');return adminJson({error:'Lecture impossible.'},503);}
}
