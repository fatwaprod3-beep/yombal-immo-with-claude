import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {getDb} from '../../../../db';
import {users,trackLinks} from '../../../../db/schema';
import {createSessionToken,hashPassword,sessionCookieHeader} from '../../../auth';
import {tooManyAttempts} from '../../../../lib/auth-limits';
import {logSecurity} from '../../../../lib/security';
import {flags} from '../../../../lib/app-settings';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200,extra:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...extra}});
const input=z.object({name:z.string().trim().min(2).max(120),email:z.string().trim().toLowerCase().email().max(200),password:z.string().min(8).max(200)}).strict();
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 try{
  const body=await request.text();if(body.length>2048)return json({error:'Requête invalide.'},400);
  const parsed=input.safeParse(JSON.parse(body));
  if(!parsed.success)return json({error:'Vérifiez vos informations : nom, e-mail valide et mot de passe d’au moins 8 caractères.'},400);
  const {name,email,password}=parsed.data;
  if(!(await flags()).registrationsOpen){await logSecurity('register_blocked',{email,request,detail:'Inscriptions fermées'});return json({error:'Les inscriptions sont momentanément fermées. Réessayez plus tard.'},403);}
  if(await tooManyAttempts('register:'+email)){await logSecurity('register_blocked',{email,request,detail:'Trop de tentatives'});return json({error:'Trop de tentatives. Réessayez dans 15 minutes.'},429,{'Retry-After':'900'});}
  const db=getDb();
  if((await db.select({id:users.id}).from(users).where(eq(users.email,email)).limit(1))[0])return json({error:'Un compte existe déjà avec cet e-mail. Connectez-vous.'},409);
  const {salt,hash}=await hashPassword(password);const id=crypto.randomUUID();
  // Attribution : lien de suivi cliqué avant l'inscription (cookie posé par /r/<code>).
  const ref=/(?:^|;\s*)yombal_ref=([a-f0-9-]{36})/.exec(request.headers.get('cookie')||'')?.[1];
  const refLinkId=ref?(await db.select({id:trackLinks.id}).from(trackLinks).where(eq(trackLinks.id,ref)).limit(1))[0]?.id||null:null;
  await db.insert(users).values({id,email,name,passwordHash:hash,passwordSalt:salt,createdAt:new Date().toISOString(),lastLoginAt:new Date().toISOString(),refLinkId});
  await logSecurity('register',{email,userId:id,request});
  return json({ok:true},200,{'Set-Cookie':sessionCookieHeader(await createSessionToken(id))});
 }catch(error){console.error('Register failed',error instanceof Error?error.message:'unknown');return json({error:'Inscription impossible pour le moment. Réessayez.'},503);}
}
