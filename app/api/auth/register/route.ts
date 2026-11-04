import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {getDb} from '../../../../db';
import {users} from '../../../../db/schema';
import {createSessionToken,hashPassword,sessionCookieHeader} from '../../../auth';
import {tooManyAttempts} from '../../../../lib/auth-limits';
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
  if(await tooManyAttempts('register:'+email))return json({error:'Trop de tentatives. Réessayez dans 15 minutes.'},429,{'Retry-After':'900'});
  const db=getDb();
  if((await db.select({id:users.id}).from(users).where(eq(users.email,email)).limit(1))[0])return json({error:'Un compte existe déjà avec cet e-mail. Connectez-vous.'},409);
  const {salt,hash}=await hashPassword(password);const id=crypto.randomUUID();
  await db.insert(users).values({id,email,name,passwordHash:hash,passwordSalt:salt,createdAt:new Date().toISOString()});
  return json({ok:true},200,{'Set-Cookie':sessionCookieHeader(await createSessionToken(id))});
 }catch(error){console.error('Register failed',error instanceof Error?error.message:'unknown');return json({error:'Inscription impossible pour le moment. Réessayez.'},503);}
}
