import {and,eq,inArray} from 'drizzle-orm';
import {getDb} from '../db';
import {userEvents} from '../db/schema';
import {freeLimits} from './free-limits';

// Bonus : une personne qui a mis Yombal sur son écran d'accueil reçoit 1 document gratuit de plus.
export async function freeInvoiceLimit(userId:string){
 try{const row=await getDb().select({id:userEvents.id}).from(userEvents).where(and(eq(userEvents.userId,userId),inArray(userEvents.kind,['app_installed','app_open_standalone']))).limit(1);return freeLimits.invoices+(row.length?1:0);}
 catch{return freeLimits.invoices;}
}
