import {and,desc,eq,sql} from 'drizzle-orm';
import {getCurrentUser} from '../../../auth';
import {getDb} from '../../../../db';
import {userEvents,users,workspaces} from '../../../../db/schema';
import {pushMessageFor,proWelcomeMessage} from '../../../../lib/web-push';
import {subscriptionFor} from '../../../../lib/subscription-server';
import type {State} from '../../../../lib/model';
import {nextOwnerAlert} from '../../../../lib/admin-alerts';
export const dynamic='force-dynamic';
const generic={title:'Yombal',body:'Vos loyers et vos locataires vous attendent.',url:'/',tag:'yombal'};
// Appelé par le téléphone à la réception d'une notification : renvoie le texte à afficher (jamais transmis par le réseau de notification).
export async function GET(){
 const user=await getCurrentUser();if(!user)return Response.json(generic,{headers:{'Cache-Control':'no-store'}});
 try{
  const db=getDb();
  const alert=await nextOwnerAlert(user.userId);if(alert)return Response.json(alert,{headers:{'Cache-Control':'no-store'}});
  const welcome=(await db.select({id:userEvents.id}).from(userEvents).where(and(eq(userEvents.userId,user.userId),eq(userEvents.kind,'push_welcome_pending'))).orderBy(desc(userEvents.createdAt)).limit(1))[0];
  if(welcome){await db.delete(userEvents).where(and(eq(userEvents.userId,user.userId),eq(userEvents.kind,'push_welcome_pending')));return Response.json({title:'🔔 C’est activé !',body:'Yombal vous préviendra pour les loyers en retard, le début du mois et vos reçus. Rien d’autre, promis.',url:'/',tag:'welcome'},{headers:{'Cache-Control':'no-store'}});}
  const isPro=(await subscriptionFor(user.userId)).isPro;
  if(isPro){const welcomed=(await db.select({id:userEvents.id}).from(userEvents).where(and(eq(userEvents.userId,user.userId),eq(userEvents.kind,'push_sent'),eq(userEvents.detail,'pro-welcome'))).limit(1))[0];
   if(!welcomed){await db.insert(userEvents).values({id:crypto.randomUUID(),userId:user.userId,kind:'push_sent',detail:'pro-welcome',createdAt:new Date().toISOString()});return Response.json(proWelcomeMessage,{headers:{'Cache-Control':'no-store'}});}}
  const row=(await db.select().from(workspaces).where(eq(workspaces.userId,user.userId)).limit(1))[0];
  const u=(await db.select({createdAt:users.createdAt,lastSeenAt:users.lastSeenAt}).from(users).where(eq(users.id,user.userId)).limit(1))[0];
  const docs=(await db.execute(sql`select count(*)::int as n from yombal_invoice_links where user_id=${user.userId}`)) as unknown as {n:number}[];
  const message=row&&u?pushMessageFor(JSON.parse(row.data) as State,{createdAt:u.createdAt,lastSeenAt:u.lastSeenAt,isPro,documents:docs[0]?.n||0}):null;
  return Response.json(message||generic,{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json(generic,{headers:{'Cache-Control':'no-store'}});}
}
