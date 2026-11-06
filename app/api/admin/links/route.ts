import {sql,eq} from 'drizzle-orm';
import {z} from 'zod';
import {getDb} from '../../../../db';
import {trackLinks,trackClicks,users} from '../../../../db/schema';
import {requireAdmin,adminJson} from '../../../../lib/admin-guard';
import {logSecurity} from '../../../../lib/security';
export const dynamic='force-dynamic';
type Row={id:string;code:string;name:string;channel:string;destination:string;cost:number;archived:number;created_at:string;clicks:number;visitors:number;clicks7:number;mobile:number;signups:number;pro:number;payments:number;revenue:number;last_click:string|null};
// Statistiques par lien : clics, visiteurs uniques, inscriptions, clients Pro, paiements et revenus attribués.
export async function GET(request:Request){
 const {denied}=await requireAdmin(request);if(denied)return denied;
 try{
  const db=getDb();const now=new Date().toISOString();const week=new Date(Date.now()-7*864e5).toISOString();
  const rows=await db.execute(sql`
   select l.id,l.code,l.name,l.channel,l.destination,l.cost,l.archived,l.created_at,
    coalesce(c.clicks,0)::int as clicks,coalesce(c.visitors,0)::int as visitors,coalesce(c.clicks7,0)::int as clicks7,coalesce(c.mobile,0)::int as mobile,c.last_click,
    coalesce(u.signups,0)::int as signups,coalesce(u.pro,0)::int as pro,coalesce(p.payments,0)::int as payments,coalesce(p.revenue,0)::int as revenue
   from yombal_track_links l
   left join (select link_id,count(*) as clicks,count(distinct visitor) as visitors,count(*) filter (where created_at>${week}) as clicks7,count(*) filter (where device='mobile') as mobile,max(created_at) as last_click from yombal_track_clicks group by link_id) c on c.link_id=l.id
   left join (select x.ref_link_id,count(*) as signups,count(*) filter (where s.status='active' and s.expires_at>${now}) as pro from yombal_users x left join yombal_subscriptions s on s.user_id=x.id where x.ref_link_id is not null group by x.ref_link_id) u on u.ref_link_id=l.id
   left join (select x.ref_link_id,count(*) as payments,sum(b.amount) as revenue from yombal_billing_payments b join yombal_users x on x.id=b.user_id where b.applied=1 and x.ref_link_id is not null group by x.ref_link_id) p on p.ref_link_id=l.id
   order by l.archived asc,l.created_at desc`) as unknown as Row[];
  const days=(await db.execute(sql`select link_id,substr(created_at,1,10) as d,count(*)::int as n from yombal_track_clicks where created_at>${new Date(Date.now()-14*864e5).toISOString()} group by 1,2`)) as unknown as {link_id:string;d:string;n:number}[];
  const direct=(await db.execute(sql`select count(*)::int as signups,count(*) filter (where s.status='active' and s.expires_at>${now})::int as pro from yombal_users x left join yombal_subscriptions s on s.user_id=x.id where x.ref_link_id is null`)) as unknown as {signups:number;pro:number}[];
  return adminJson({links:rows.map(r=>({id:r.id,code:r.code,name:r.name,channel:r.channel,destination:r.destination,cost:r.cost,archived:!!r.archived,createdAt:r.created_at,clicks:r.clicks,visitors:r.visitors,clicks7:r.clicks7,mobile:r.mobile,lastClick:r.last_click,signups:r.signups,pro:r.pro,payments:r.payments,revenue:r.revenue,daily:days.filter(d=>d.link_id===r.id).map(d=>({d:d.d,n:d.n}))})),direct:direct[0]||{signups:0,pro:0}});
 }catch(e){console.error('admin_links_failed',e instanceof Error?e.message.slice(0,200):'unknown');return adminJson({error:'Lecture impossible.'},503);}
}
const create=z.object({action:z.literal('create'),name:z.string().trim().min(2).max(80),channel:z.enum(['influenceur','facebook','instagram','tiktok','whatsapp','google','youtube','partenaire','autre']),code:z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,40}$/).optional(),destination:z.enum(['/presentation','/connexion?mode=inscription','/']).default('/presentation'),cost:z.number().int().min(0).max(1e9).default(0)});
const update=z.object({action:z.enum(['archive','restore','delete']),id:z.string().uuid()});
const slug=(t:string)=>t.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,24)||'lien';
export async function POST(request:Request){
 const {user,denied}=await requireAdmin(request,true);if(denied)return denied;
 const body=await request.json().catch(()=>({})) as Record<string,unknown>;const db=getDb();
 if(body.action==='create'){
  const p=create.safeParse(body);if(!p.success)return adminJson({error:'Vérifiez le nom, le canal et le code (lettres, chiffres, tirets).'},400);
  let code=p.data.code||slug(p.data.name);
  if(!p.data.code){for(let i=0;i<5&&(await db.select({id:trackLinks.id}).from(trackLinks).where(eq(trackLinks.code,code)).limit(1))[0];i++)code=slug(p.data.name).slice(0,19)+'-'+Math.random().toString(36).slice(2,6);}
  else if((await db.select({id:trackLinks.id}).from(trackLinks).where(eq(trackLinks.code,code)).limit(1))[0])return adminJson({error:'Ce code est déjà utilisé. Choisissez-en un autre.'},409);
  await db.insert(trackLinks).values({id:crypto.randomUUID(),code,name:p.data.name,channel:p.data.channel,destination:p.data.destination,cost:p.data.cost,createdAt:new Date().toISOString()});
  await logSecurity('admin_action',{userId:user!.userId,email:user!.email,request,detail:'Lien de suivi créé : '+code});
  return adminJson({message:'Lien créé : /r/'+code});
 }
 const p=update.safeParse(body);if(!p.success)return adminJson({error:'Action invalide.'},400);
 if(p.data.action==='delete'){await db.delete(trackClicks).where(eq(trackClicks.linkId,p.data.id));await db.update(users).set({refLinkId:null}).where(eq(users.refLinkId,p.data.id));await db.delete(trackLinks).where(eq(trackLinks.id,p.data.id));return adminJson({message:'Lien supprimé.'});}
 await db.update(trackLinks).set({archived:p.data.action==='archive'?1:0}).where(eq(trackLinks.id,p.data.id));
 return adminJson({message:p.data.action==='archive'?'Lien mis en pause : il redirige vers la page d’accueil sans compter.':'Lien réactivé.'});
}
