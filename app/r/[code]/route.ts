import {and,eq} from 'drizzle-orm';
import {getDb} from '../../../db';
import {trackLinks,trackClicks} from '../../../db/schema';
export const dynamic='force-dynamic';
// Lien de suivi : /r/<code> enregistre le clic, mémorise la source 60 jours, puis redirige.
export async function GET(request:Request,{params}:{params:Promise<{code:string}>}){
 const url=new URL(request.url);const {code}=await params;
 const home=new URL('/presentation',url.origin);
 if(!/^[a-z0-9-]{2,40}$/i.test(code))return Response.redirect(home,302);
 try{
  const db=getDb();
  const link=(await db.select().from(trackLinks).where(and(eq(trackLinks.code,code.toLowerCase()),eq(trackLinks.archived,0))).limit(1))[0];
  if(!link)return Response.redirect(home,302);
  const cookies=request.headers.get('cookie')||'';const ua=request.headers.get('user-agent')||'';
  let visitor=/(?:^|;\s*)yombal_vid=([a-f0-9-]{36})/.exec(cookies)?.[1];const fresh=!visitor;if(!visitor)visitor=crypto.randomUUID();
  // Préchargements (Facebook/Instagram chargent la page avant le vrai clic) : on redirige sans compter.
  const purpose=[request.headers.get('x-purpose'),request.headers.get('purpose'),request.headers.get('sec-purpose'),request.headers.get('x-moz')].filter(Boolean).join(' ');
  const prefetch=/prefetch|preview|prerender/i.test(purpose);
  if(!prefetch&&!/bot|crawl|spider|preview|facebookexternalhit|whatsapp|slurp|curl|wget/i.test(ua))
   await db.insert(trackClicks).values({id:crypto.randomUUID(),linkId:link.id,visitor,device:/mobile|android|iphone|ipad/i.test(ua)?'mobile':'ordinateur',createdAt:new Date().toISOString()});
  const dest=link.destination.startsWith('/')&&!link.destination.startsWith('//')?link.destination:'/presentation';
  const headers=new Headers({Location:new URL(dest,url.origin).toString(),'Cache-Control':'no-store'});
  headers.append('Set-Cookie',`yombal_ref=${link.id}; Path=/; Max-Age=${60*86400}; SameSite=Lax; Secure`);
  if(fresh)headers.append('Set-Cookie',`yombal_vid=${visitor}; Path=/; Max-Age=${365*86400}; SameSite=Lax; Secure`);
  return new Response(null,{status:302,headers});
 }catch(e){console.error('track_click_failed',e instanceof Error?e.message:'unknown');return Response.redirect(home,302);}
}
