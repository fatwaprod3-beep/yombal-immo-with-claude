import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {getDb} from '../../../../db';
import {users} from '../../../../db/schema';
import {createSessionToken,hashPassword,sessionCookieHeader,verifyPurposeToken} from '../../../auth';
import {tooManyAttempts} from '../../../../lib/auth-limits';
import {logSecurity} from '../../../../lib/security';
export const dynamic='force-dynamic';
const schema=z.object({token:z.string().max(200),next:z.string().min(8).max(200)});
// Nouveau mot de passe à partir d'un lien envoyé par Yombal (48 h, inutilisable dès que le mot de passe change).
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origine non autorisée.'},{status:403});
 const p=schema.safeParse(await request.json().catch(()=>({})));
 if(!p.success)return Response.json({error:'Le mot de passe doit contenir au moins 8 caractères.'},{status:400});
 if(await tooManyAttempts('reset:'+(request.headers.get('x-forwarded-for')||'').split(',')[0]))return Response.json({error:'Trop d’essais. Réessayez dans 15 minutes.'},{status:429});
 const db=getDb();
 const verified=await verifyPurposeToken('reset',p.data.token,async id=>{const row=(await db.select({hash:users.passwordHash}).from(users).where(eq(users.id,id)).limit(1))[0];return row?row.hash.slice(0,32):null;});
 if(!verified)return Response.json({error:'Ce lien n’est plus valable. Demandez-en un nouveau.'},{status:400});
 const row=(await db.select().from(users).where(eq(users.id,verified.userId)).limit(1))[0];
 if(!row||row.status==='suspended')return Response.json({error:'Ce compte ne peut pas être modifié pour le moment.'},{status:403});
 const {salt,hash}=await hashPassword(p.data.next);
 await db.update(users).set({passwordSalt:salt,passwordHash:hash,sessionsAfter:Date.now(),lastLoginAt:new Date().toISOString()}).where(eq(users.id,row.id));
 await logSecurity('password_reset',{email:row.email,userId:row.id,request,detail:'Nouveau mot de passe par lien'});
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':sessionCookieHeader(await createSessionToken(row.id))}});
}
