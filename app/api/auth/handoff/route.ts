import {and,eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {userEvents,users} from '../../../../db/schema';
import {createPurposeToken,createSessionToken,getCurrentUser,sessionCookieHeader,verifyPurposeToken} from '../../../auth';
import {logSecurity} from '../../../../lib/security';
export const dynamic='force-dynamic';
// Passage du navigateur de Facebook/Instagram vers Chrome sans se reconnecter :
// lien personnel, valable 3 minutes, utilisable une seule fois.
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origine non autorisée.'},{status:403});
 const user=await getCurrentUser();if(!user)return Response.json({error:'Connexion nécessaire.'},{status:401});
 const token=await createPurposeToken('handoff',user.userId,3*60_000);
 return Response.json({path:'/api/auth/handoff?t='+token},{headers:{'Cache-Control':'no-store'}});
}
export async function GET(request:Request){
 const url=new URL(request.url),home=new URL('/?installer=1',url.origin),login=new URL('/connexion',url.origin);
 const headers=(location:URL,cookie?:string)=>{const h=new Headers({Location:location.toString(),'Cache-Control':'no-store','Referrer-Policy':'no-referrer'});if(cookie)h.append('Set-Cookie',cookie);return h;};
 try{
  const verified=await verifyPurposeToken('handoff',url.searchParams.get('t')||'');
  if(!verified)return new Response(null,{status:303,headers:headers(login)});
  const db=getDb();const used=verified.signature.slice(0,40);
  const seen=await db.select({id:userEvents.id}).from(userEvents).where(and(eq(userEvents.userId,verified.userId),eq(userEvents.kind,'login_handoff'),eq(userEvents.detail,used))).limit(1);
  if(seen.length)return new Response(null,{status:303,headers:headers(login)});
  const row=(await db.select({id:users.id,email:users.email,status:users.status}).from(users).where(eq(users.id,verified.userId)).limit(1))[0];
  if(!row||row.status!=='active')return new Response(null,{status:303,headers:headers(login)});
  await db.insert(userEvents).values({id:crypto.randomUUID(),userId:row.id,kind:'login_handoff',detail:used,createdAt:new Date().toISOString()});
  await logSecurity('login_handoff',{email:row.email,userId:row.id,request,detail:'Ouverture dans Chrome depuis une application'});
  return new Response(null,{status:303,headers:headers(home,sessionCookieHeader(await createSessionToken(row.id)))});
 }catch{return new Response(null,{status:303,headers:headers(login)});}
}
