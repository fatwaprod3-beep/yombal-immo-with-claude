import {eq} from 'drizzle-orm';
import {getDb} from '../../../../../db';
import {users,trackLinks} from '../../../../../db/schema';
import {createSessionToken,hashPassword,sessionCookieHeader,safeRelativeReturnPath} from '../../../../auth';
import {googleEnabled,googleProfile,googleStateCookie,readCookie} from '../../../../../lib/google-auth';
import {logSecurity} from '../../../../../lib/security';
import {flags} from '../../../../../lib/app-settings';
export const dynamic='force-dynamic';
const clearState=`${googleStateCookie}=; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
function go(request:Request,path:string,cookies:string[]=[]){const h=new Headers({Location:new URL(path,request.url).toString(),'Cache-Control':'no-store'});h.append('Set-Cookie',clearState);for(const c of cookies)h.append('Set-Cookie',c);return new Response(null,{status:302,headers:h});}
export async function GET(request:Request){
 const url=new URL(request.url);
 if(!googleEnabled())return go(request,'/connexion?erreur=google-indisponible');
 const saved=readCookie(request,googleStateCookie);const [state,returnRaw]=(saved||'').split('|');
 if(url.searchParams.get('error'))return go(request,'/connexion?erreur=google-annule');
 const code=url.searchParams.get('code');
 if(!code||!state||url.searchParams.get('state')!==state)return go(request,'/connexion?erreur=google-session');
 const returnTo=safeRelativeReturnPath(returnRaw||'/');
 try{
  const profile=await googleProfile(code,request);const db=getDb();const now=new Date().toISOString();
  const row=(await db.select().from(users).where(eq(users.email,profile.email)).limit(1))[0];
  if(row){
   if(row.status==='suspended'){await logSecurity('login_suspended',{email:profile.email,userId:row.id,request,detail:'Google'});return go(request,'/connexion?erreur=suspendu');}
   await db.update(users).set({lastLoginAt:now}).where(eq(users.id,row.id));
   await logSecurity('login',{email:profile.email,userId:row.id,request,detail:'Google'});
   return go(request,returnTo,[sessionCookieHeader(await createSessionToken(row.id))]);
  }
  if(!(await flags()).registrationsOpen){await logSecurity('register_blocked',{email:profile.email,request,detail:'Inscriptions fermées (Google)'});return go(request,'/connexion?erreur=inscriptions-fermees');}
  // Compte créé avec Google : mot de passe aléatoire inutilisable (l’utilisateur se connecte avec Google).
  const {salt,hash}=await hashPassword(crypto.randomUUID()+crypto.randomUUID());const id=crypto.randomUUID();
  const ref=/(?:^|;\s*)yombal_ref=([a-f0-9-]{36})/.exec(request.headers.get('cookie')||'')?.[1];
  const refLinkId=ref?(await db.select({id:trackLinks.id}).from(trackLinks).where(eq(trackLinks.id,ref)).limit(1))[0]?.id||null:null;
  await db.insert(users).values({id,email:profile.email,name:profile.name.length>=2?profile.name:profile.email,passwordHash:hash,passwordSalt:salt,createdAt:now,lastLoginAt:now,refLinkId});
  await logSecurity('register',{email:profile.email,userId:id,request,detail:'Google'});
  return go(request,'/?inscription=1',[sessionCookieHeader(await createSessionToken(id))]);
 }catch(error){console.error('Google sign-in failed',error instanceof Error?error.message:'unknown');return go(request,'/connexion?erreur=google-echec');}
}
