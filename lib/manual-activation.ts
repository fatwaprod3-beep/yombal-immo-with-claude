import {and,desc,eq,inArray,sql} from 'drizzle-orm';
import {getDb} from '../db';
import {subscriptionRequests,subscriptions,users} from '../db/schema';
import {plans} from './billing';
import {addCalendarMonths} from './subscription-payments';

// Demandes faites via les liens SasPay partagés : le propriétaire vérifie le paiement
// dans SasPay, puis active l’accès ici. Une demande ne peut être activée qu’une fois.
export async function pendingLinkRequests(){
 const db=getDb();
 const rows=await db.select().from(subscriptionRequests).where(inArray(subscriptionRequests.status,['link_pending','link_paid'])).orderBy(desc(subscriptionRequests.createdAt)).limit(100);
 const ids=[...new Set(rows.map(r=>r.userId))];
 const accounts=ids.length?await db.select({id:users.id,email:users.email,name:users.name}).from(users).where(inArray(users.id,ids)):[];
 return rows.map(r=>{const a=accounts.find(x=>x.id===r.userId);return {id:r.id,planId:r.planId,amount:r.amount,status:r.status,createdAt:r.createdAt,email:a?.email||'compte supprimé',name:a?.name||''};});
}

export async function activateLinkRequest(id:string){
 const db=getDb(),now=new Date().toISOString();
 return db.transaction(async tx=>{
  const request=(await tx.select().from(subscriptionRequests).where(and(eq(subscriptionRequests.id,id),eq(subscriptionRequests.status,'link_pending'))).for('update').limit(1))[0];
  if(!request)throw Error('Demande introuvable ou déjà activée.');
  const plan=plans.find(p=>p.id===request.planId);if(!plan)throw Error('Offre inconnue.');
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${'yombal-billing:'+request.userId}))`);
  const current=(await tx.select().from(subscriptions).where(eq(subscriptions.userId,request.userId)).limit(1))[0];
  const base=current&&current.status==='active'&&current.expiresAt&&Date.parse(current.expiresAt)>Date.now()?current.expiresAt:now;
  const expiresAt=addCalendarMonths(base,plan.months);
  await tx.insert(subscriptions).values({userId:request.userId,planId:plan.id,status:'active',expiresAt,updatedAt:now}).onConflictDoUpdate({target:subscriptions.userId,set:{planId:plan.id,status:'active',expiresAt,updatedAt:now}});
  await tx.update(subscriptionRequests).set({status:'link_paid'}).where(eq(subscriptionRequests.id,id));
  return {expiresAt};
 });
}

export async function dismissLinkRequest(id:string){
 await getDb().update(subscriptionRequests).set({status:'link_cancelled'}).where(and(eq(subscriptionRequests.id,id),eq(subscriptionRequests.status,'link_pending')));
}
