import {hasAdminAccess} from './admin-access';
import {isDevelopmentAdmin} from './development-admin';
import {eq,desc,and} from 'drizzle-orm';
import {getDb} from '../db';
import {subscriptions,subscriptionRequests} from '../db/schema';
import {activeSubscription,type Subscription} from './billing';
export async function subscriptionFor(userId:string):Promise<Subscription>{
 const isAdmin=await isDevelopmentAdmin(userId);const db=getDb();const row=(await db.select().from(subscriptions).where(eq(subscriptions.userId,userId)).limit(1))[0];
 // Un vrai abonnement payé passe toujours en priorité, même pour le propriétaire.
 if(activeSubscription(row))return {isAdmin,isPro:true,status:'active',planId:row.planId,expiresAt:row.expiresAt};
 if(isAdmin&&await hasAdminAccess(userId))return {isAdmin:true,development:true,isPro:true,status:'active',planId:'development',expiresAt:null};
 const pending=(await db.select().from(subscriptionRequests).where(and(eq(subscriptionRequests.userId,userId),eq(subscriptionRequests.status,'pending'))).orderBy(desc(subscriptionRequests.createdAt)).limit(1))[0];
 return {isAdmin,isPro:false,status:pending?'pending':'free',planId:pending?.planId||null,expiresAt:null,...(pending?{requestId:pending.id}:{})};
}
