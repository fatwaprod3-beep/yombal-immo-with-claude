import {getCurrentUser} from '../../../auth';
import {isDevelopmentAdmin} from '../../../../lib/development-admin';
import {adminConfig,adminCookie} from '../../../../lib/admin-access';
import {passwordDigest,sameValue,createAdminToken,adminSessionSeconds} from '../../../../lib/admin-crypto';
import {getDb} from '../../../../db';
import {adminAttempts} from '../../../../db/schema';
import {eq,sql} from 'drizzle-orm';
const json=(data:unknown,status=200,extra:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...extra}});
export async function POST(request:Request){
 const user=await getCurrentUser();if(!user||!await isDevelopmentAdmin(user.userId))return json({error:'Accès réservé au compte propriétaire connecté.'},403);
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 try{
  const body=await request.text();if(body.length>1024)return json({error:'Requête invalide.'},400);const input=JSON.parse(body) as {email?:unknown;password?:unknown};if(typeof input.email!=='string'||typeof input.password!=='string'||input.password.length>200)return json({error:'Identifiants invalides.'},400);
  const config=adminConfig();if(!config.hash||!config.salt||!config.secret||!config.email)return json({error:'L’accès privé n’est pas encore configuré.'},503);
  const now=Date.now(),cutoff=now-15*60*1000;const db=getDb();
  const attempts=await db.insert(adminAttempts).values({userId:user.userId,attempts:1,windowAt:now}).onConflictDoUpdate({target:adminAttempts.userId,set:{attempts:sql`CASE WHEN ${adminAttempts.windowAt}<${cutoff} THEN 1 ELSE ${adminAttempts.attempts}+1 END`,windowAt:sql`CASE WHEN ${adminAttempts.windowAt}<${cutoff} THEN ${now} ELSE ${adminAttempts.windowAt} END`}}).returning();
  if(attempts[0].attempts>5)return json({error:'Trop de tentatives. Réessayez dans 15 minutes.'},429,{'Retry-After':'900'});
  const digest=await passwordDigest(input.password,config.salt);if(!sameValue(digest,config.hash)||input.email.trim().toLowerCase()!==config.email.toLowerCase()||user.email.toLowerCase()!==config.email.toLowerCase())return json({error:'E-mail ou mot de passe incorrect.'},401);
  const token=await createAdminToken(user.userId,config.secret);await db.delete(adminAttempts).where(eq(adminAttempts.userId,user.userId));
  return json({ok:true},200,{'Set-Cookie':`${adminCookie}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${adminSessionSeconds}`});
 }catch{return json({error:'Connexion impossible. Réessayez.'},503);}
}
export async function DELETE(request:Request){const user=await getCurrentUser();if(!user||!await isDevelopmentAdmin(user.userId)||request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Accès refusé.'},403);return json({ok:true},200,{'Set-Cookie':`${adminCookie}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`});}
