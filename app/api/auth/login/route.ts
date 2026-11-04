import {eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {users} from '../../../../db/schema';
import {checkPassword,createSessionToken,sessionCookieHeader} from '../../../auth';
import {resetAttempts,tooManyAttempts} from '../../../../lib/auth-limits';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200,extra:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...extra}});
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 try{
  const body=await request.text();if(body.length>1024)return json({error:'Requête invalide.'},400);
  const value=JSON.parse(body) as {email?:unknown;password?:unknown};
  if(typeof value.email!=='string'||typeof value.password!=='string'||value.password.length>200)return json({error:'E-mail ou mot de passe incorrect.'},400);
  const email=value.email.trim().toLowerCase();const key='login:'+email;
  if(await tooManyAttempts(key))return json({error:'Trop de tentatives. Réessayez dans 15 minutes.'},429,{'Retry-After':'900'});
  const row=(await getDb().select().from(users).where(eq(users.email,email)).limit(1))[0];
  if(!row||!await checkPassword(value.password,row.passwordSalt,row.passwordHash))return json({error:'E-mail ou mot de passe incorrect.'},401);
  await resetAttempts(key);
  return json({ok:true},200,{'Set-Cookie':sessionCookieHeader(await createSessionToken(row.id))});
 }catch(error){console.error('Login failed',error instanceof Error?error.message:'unknown');return json({error:'Connexion impossible pour le moment. Réessayez.'},503);}
}
