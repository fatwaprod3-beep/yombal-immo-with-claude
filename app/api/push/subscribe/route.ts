import {and,eq} from 'drizzle-orm';
import {z} from 'zod';
import {getCurrentUser} from '../../../auth';
import {getDb} from '../../../../db';
import {pushSubscriptions,userEvents} from '../../../../db/schema';
import {sendPush} from '../../../../lib/web-push';
export const dynamic='force-dynamic';
const b64=z.string().min(10).max(200).regex(/^[A-Za-z0-9_=-]+$/);
const input=z.object({endpoint:z.string().url().max(1000).refine(v=>v.startsWith('https://'),'Adresse invalide.'),keys:z.object({p256dh:b64,auth:b64})}).strip();
async function idFor(endpoint:string){return Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(endpoint))).toString('hex').slice(0,40);}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origine non autorisée.'},{status:403});
 const user=await getCurrentUser();if(!user)return Response.json({error:'Connexion nécessaire.'},{status:401});
 try{
  const body=await request.text();if(body.length>3000)return Response.json({error:'Requête invalide.'},{status:413});
  const parsed=input.safeParse(JSON.parse(body));if(!parsed.success)return Response.json({error:'Abonnement invalide.'},{status:400});
  const db=getDb();const now=new Date().toISOString();const id=await idFor(parsed.data.endpoint);
  await db.insert(pushSubscriptions).values({id,userId:user.userId,endpoint:parsed.data.endpoint,p256dh:parsed.data.keys.p256dh,auth:parsed.data.keys.auth,userAgent:(request.headers.get('user-agent')||'').slice(0,250),createdAt:now})
   .onConflictDoUpdate({target:pushSubscriptions.endpoint,set:{userId:user.userId,p256dh:parsed.data.keys.p256dh,auth:parsed.data.keys.auth,failures:0}});
  await db.insert(userEvents).values([{id:crypto.randomUUID(),userId:user.userId,kind:'push_granted',detail:null,createdAt:now},{id:crypto.randomUUID(),userId:user.userId,kind:'push_welcome_pending',detail:null,createdAt:now}]);
  // Notification de bienvenue immédiate : la personne voit tout de suite que ça marche.
  await sendPush({id,endpoint:parsed.data.endpoint});
  return Response.json({ok:true});
 }catch(e){console.error('push_subscribe_failed',e instanceof Error?e.message.slice(0,120):'unknown');return Response.json({error:'Activation impossible pour le moment.'},{status:503});}
}
export async function DELETE(request:Request){
 const user=await getCurrentUser();if(!user)return new Response(null,{status:204});
 try{const {endpoint}=z.object({endpoint:z.string().url().max(1000)}).parse(JSON.parse(await request.text()));await getDb().delete(pushSubscriptions).where(and(eq(pushSubscriptions.userId,user.userId),eq(pushSubscriptions.endpoint,endpoint)));}catch{}
 return new Response(null,{status:204});
}
