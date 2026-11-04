import {eq,sql} from 'drizzle-orm';
import {getDb} from '../db';
import {adminAttempts} from '../db/schema';
// Limite les essais de connexion : 8 tentatives par quart d’heure et par clé.
export async function tooManyAttempts(key:string){
 const now=Date.now(),cutoff=now-15*60*1000;
 const rows=await getDb().insert(adminAttempts).values({userId:key,attempts:1,windowAt:now}).onConflictDoUpdate({target:adminAttempts.userId,set:{attempts:sql`CASE WHEN ${adminAttempts.windowAt}<${cutoff} THEN 1 ELSE ${adminAttempts.attempts}+1 END`,windowAt:sql`CASE WHEN ${adminAttempts.windowAt}<${cutoff} THEN ${now} ELSE ${adminAttempts.windowAt} END`}}).returning();
 return rows[0].attempts>8;
}
export async function resetAttempts(key:string){await getDb().delete(adminAttempts).where(eq(adminAttempts.userId,key));}
