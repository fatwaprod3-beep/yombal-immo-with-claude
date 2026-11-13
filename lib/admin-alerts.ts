import {and,asc,eq,gt} from 'drizzle-orm';
import {getDb} from '../db';
import {userEvents,users} from '../db/schema';
import {pushToUser,type PushMessage} from './web-push';

// Alertes pour le propriétaire de Yombal : un problème arrive (client bloqué, paiement…), son téléphone sonne tout de suite.
// Le texte reste sur le serveur ; le téléphone le demande en recevant la notification (comme pour les clients).
async function ownerId(){
 const email=(process.env.YOMBAL_ADMIN_EMAIL||'').trim().toLowerCase();if(!email)return null;
 return (await getDb().select({id:users.id}).from(users).where(eq(users.email,email)).limit(1))[0]?.id||null;
}
/** Envoie une alerte au propriétaire. `key` évite d'envoyer deux fois la même alerte dans l'heure. Ne bloque jamais. */
export async function alertOwner(key:string,title:string,body:string,url='/administration'){
 try{
  const id=await ownerId();if(!id)return;
  const db=getDb();const now=new Date();
  const recent=(await db.select({id:userEvents.id}).from(userEvents).where(and(eq(userEvents.userId,id),eq(userEvents.kind,'admin_alert'),eq(userEvents.detail,key.slice(0,200)),gt(userEvents.createdAt,new Date(now.getTime()-3600e3).toISOString()))).limit(1))[0];
  if(recent)return;
  await db.insert(userEvents).values([
   {id:crypto.randomUUID(),userId:id,kind:'admin_alert',detail:key.slice(0,200),createdAt:now.toISOString()},
   {id:crypto.randomUUID(),userId:id,kind:'admin_alert_pending',detail:JSON.stringify({title:title.slice(0,80),body:body.slice(0,240),url,tag:'alert-'+key.slice(0,60)}),createdAt:now.toISOString()},
  ]);
  await pushToUser(id);
 }catch(error){console.error('Owner alert failed',error instanceof Error?error.message:'unknown');}
}
/** Prochaine alerte en attente pour ce compte (le plus ancien d'abord), retirée de la file. */
export async function nextOwnerAlert(userId:string):Promise<PushMessage|null>{
 const db=getDb();
 const row=(await db.select().from(userEvents).where(and(eq(userEvents.userId,userId),eq(userEvents.kind,'admin_alert_pending'))).orderBy(asc(userEvents.createdAt)).limit(1))[0];
 if(!row)return null;
 await db.delete(userEvents).where(eq(userEvents.id,row.id));
 try{return JSON.parse(row.detail||'') as PushMessage;}catch{return null;}
}
