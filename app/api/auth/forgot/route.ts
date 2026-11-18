import {and,eq,gt,sql} from 'drizzle-orm';
import {z} from 'zod';
import {getDb} from '../../../../db';
import {securityEvents,users} from '../../../../db/schema';
import {createPurposeToken} from '../../../auth';
import {tooManyAttempts} from '../../../../lib/auth-limits';
import {logSecurity} from '../../../../lib/security';
import {emailEnabled,emailHtml,sendEmail} from '../../../../lib/email';
export const dynamic='force-dynamic';
const schema=z.object({email:z.string().trim().toLowerCase().email().max(200)});
// « Mot de passe oublié » : envoie un lien (48 h, une seule utilisation) par e-mail.
// Réponse identique que le compte existe ou non, pour ne pas révéler qui est inscrit.
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Origine non autorisée.'},{status:403});
 if(!emailEnabled())return Response.json({error:'L’envoi par e-mail n’est pas encore disponible. Écrivez-nous par e-mail.',whatsapp:true},{status:503});
 const p=schema.safeParse(await request.json().catch(()=>({})));
 if(!p.success)return Response.json({error:'Vérifiez votre adresse e-mail.'},{status:400});
 if(await tooManyAttempts('forgot:'+(request.headers.get('x-forwarded-for')||'').split(',')[0]))return Response.json({error:'Trop de demandes. Réessayez dans 15 minutes.'},{status:429});
 const db=getDb();const email=p.data.email;
 const user=(await db.select().from(users).where(eq(users.email,email)).limit(1))[0];
 if(user&&user.status!=='suspended'){
  const recent=(await db.select({n:sql<number>`count(*)::int`}).from(securityEvents).where(and(eq(securityEvents.email,email),eq(securityEvents.kind,'password_reset_requested'),gt(securityEvents.createdAt,new Date(Date.now()-36e5).toISOString()))))[0]?.n||0;
  if(recent<3){
   const token=await createPurposeToken('reset',user.id,48*36e5,user.passwordHash.slice(0,32));
   const url=new URL('/reinitialiser?t='+token,new URL(request.url).origin).toString();
   const first=(user.name||'').split(' ')[0];
   const sent=await sendEmail({to:email,subject:'Yombal — choisissez un nouveau mot de passe',
    html:emailHtml({title:`Bonjour${first?' '+first:''}, voici votre lien`,lines:['Vous avez demandé à choisir un nouveau mot de passe pour votre espace Yombal.','Touchez le bouton ci-dessous : vous choisissez votre mot de passe et vous êtes connecté tout de suite. Le lien marche 48 heures, une seule fois.','Si vous n’avez rien demandé, ignorez simplement cet e-mail : votre mot de passe actuel reste valable.'],cta:{label:'Choisir mon nouveau mot de passe',url}}),
    text:`Bonjour${first?' '+first:''},\n\nPour choisir un nouveau mot de passe Yombal (lien valable 48 h, une seule fois) :\n${url}\n\nSi vous n'avez rien demandé, ignorez cet e-mail.\n\nL'équipe Yombal`});
   await logSecurity('password_reset_requested',{email,userId:user.id,request,detail:sent?'Lien envoyé par e-mail':'Échec d’envoi'});
  }
 }
 return Response.json({ok:true,message:'Si un compte existe avec cette adresse, un e-mail vient de partir. Regardez aussi dans « Spam » ou « Promotions ».'},{headers:{'Cache-Control':'no-store'}});
}
