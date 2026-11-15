import {and,eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {userEvents,users} from '../../../../db/schema';
import {createSessionToken,safeRelativeReturnPath,sessionCookieHeader,verifyPurposeToken} from '../../../auth';
import {logSecurity} from '../../../../lib/security';
export const dynamic='force-dynamic';
// Lien de connexion envoyé par e-mail (relance du lendemain) : connecte sans mot de passe,
// valable 3 jours, une seule utilisation. Pratique pour ceux qui ont oublié le mot de passe choisi à l'inscription.
export async function GET(request:Request){
 const url=new URL(request.url),login=new URL('/connexion',url.origin);
 const next=new URL(safeRelativeReturnPath(url.searchParams.get('next')||'/'),url.origin);
 const headers=(location:URL,cookie?:string)=>{const h=new Headers({Location:location.toString(),'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});if(cookie)h.append('Set-Cookie',cookie);return h;};
 try{
  const verified=await verifyPurposeToken('magic',url.searchParams.get('t')||'');
  if(!verified)return new Response(null,{status:303,headers:headers(login)});
  const db=getDb();const used=verified.signature.slice(0,40);
  const seen=await db.select({id:userEvents.id}).from(userEvents).where(and(eq(userEvents.userId,verified.userId),eq(userEvents.kind,'login_magic'),eq(userEvents.detail,used))).limit(1);
  if(seen.length)return new Response(null,{status:303,headers:headers(login)});
  const row=(await db.select({id:users.id,email:users.email,status:users.status}).from(users).where(eq(users.id,verified.userId)).limit(1))[0];
  if(!row||row.status!=='active')return new Response(null,{status:303,headers:headers(login)});
  await db.insert(userEvents).values({id:crypto.randomUUID(),userId:row.id,kind:'login_magic',detail:used,createdAt:new Date().toISOString()});
  await logSecurity('login_handoff',{email:row.email,userId:row.id,request,detail:'Connexion par le lien de l’e-mail'});
  return new Response(null,{status:303,headers:headers(next,sessionCookieHeader(await createSessionToken(row.id)))});
 }catch{return new Response(null,{status:303,headers:headers(login)});}
}
