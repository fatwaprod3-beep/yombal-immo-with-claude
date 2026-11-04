import {eq} from 'drizzle-orm';
import {getDb} from '../db';
import {users} from '../db/schema';
/** Le compte propriétaire est celui dont l’e-mail correspond à YOMBAL_ADMIN_EMAIL (côté serveur uniquement). */
export async function isDevelopmentAdmin(userId:string){
 const owner=(process.env.YOMBAL_ADMIN_EMAIL||'').trim().toLowerCase();if(!owner)return false;
 const row=(await getDb().select({email:users.email}).from(users).where(eq(users.id,userId)).limit(1))[0];
 return !!row&&row.email.toLowerCase()===owner;
}
