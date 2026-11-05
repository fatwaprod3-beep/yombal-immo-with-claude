import {and,asc,desc,eq,gt,sql} from 'drizzle-orm';
import {z} from 'zod';
import {getDb} from '../../../db';
import {aiConversations,aiMessages} from '../../../db/schema';
import {getCurrentUser} from '../../auth';
import {flags} from '../../../lib/app-settings';
import {assistantConfig,askModel,moderate,systemPrompt} from '../../../lib/assistant';
import {subscriptionFor} from '../../../lib/subscription-server';
import {sasPayPrices} from '../../../lib/saspay-prices';
import {paymentCredentials} from '../../../lib/payment-config';
import {logSecurity} from '../../../lib/security';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const input=z.object({conversationId:z.string().uuid().optional(),message:z.string().trim().min(1).max(1500)}).strict();
export async function GET(request:Request){
 const user=await getCurrentUser();if(!user)return json({error:'Connectez-vous.'},401);
 const f=await flags();const ready=f.assistant&&!!(await assistantConfig());
 const id=new URL(request.url).searchParams.get('id');const db=getDb();
 if(id){const conv=(await db.select().from(aiConversations).where(and(eq(aiConversations.id,id),eq(aiConversations.userId,user.userId))).limit(1))[0];if(!conv)return json({error:'Conversation introuvable.'},404);
  const messages=await db.select({role:aiMessages.role,content:aiMessages.content,createdAt:aiMessages.createdAt}).from(aiMessages).where(eq(aiMessages.conversationId,id)).orderBy(asc(aiMessages.createdAt));return json({ready,messages});}
 const conversations=await db.select({id:aiConversations.id,title:aiConversations.title,updatedAt:aiConversations.updatedAt}).from(aiConversations).where(eq(aiConversations.userId,user.userId)).orderBy(desc(aiConversations.updatedAt)).limit(20);
 return json({ready,conversations});
}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return json({error:'Origine non autorisée.'},403);
 const user=await getCurrentUser();if(!user)return json({error:'Connectez-vous pour discuter avec l’assistant.'},401);
 try{
  const body=await request.text();if(body.length>4000)return json({error:'Message trop long.'},400);
  const parsed=input.safeParse(JSON.parse(body));if(!parsed.success)return json({error:'Message invalide (1 500 caractères maximum).'},400);
  if(!(await flags()).assistant)return json({error:'L’assistant est momentanément désactivé.'},503);
  const config=await assistantConfig();if(!config)return json({error:'L’assistant n’est pas encore configuré.'},503);
  const db=getDb();const now=new Date();const hourAgo=new Date(now.getTime()-3600e3).toISOString();
  const recent=(await db.select({n:sql<number>`count(*)::int`}).from(aiMessages).where(and(eq(aiMessages.userId,user.userId),eq(aiMessages.role,'user'),gt(aiMessages.createdAt,hourAgo))))[0]?.n||0;
  if(recent>=30){await logSecurity('ai_limited',{email:user.email,userId:user.userId,request});return json({error:'Vous avez envoyé beaucoup de messages. Réessayez dans une heure.'},429);}
  const {message}=parsed.data;let conversationId=parsed.data.conversationId;
  if(conversationId){const own=(await db.select({id:aiConversations.id}).from(aiConversations).where(and(eq(aiConversations.id,conversationId),eq(aiConversations.userId,user.userId))).limit(1))[0];if(!own)conversationId=undefined;}
  if(!conversationId){conversationId=crypto.randomUUID();await db.insert(aiConversations).values({id:conversationId,userId:user.userId,title:message.slice(0,70),createdAt:now.toISOString(),updatedAt:now.toISOString()});}
  const flag=moderate(message);
  await db.insert(aiMessages).values({id:crypto.randomUUID(),conversationId,userId:user.userId,role:'user',content:message,flagged:flag?1:0,createdAt:now.toISOString()});
  if(flag){await db.update(aiConversations).set({flagged:1,flagReason:flag}).where(eq(aiConversations.id,conversationId));await logSecurity('ai_flagged',{email:user.email,userId:user.userId,request,detail:flag+' · '+message.slice(0,160)});}
  const history=(await db.select({role:aiMessages.role,content:aiMessages.content}).from(aiMessages).where(eq(aiMessages.conversationId,conversationId)).orderBy(desc(aiMessages.createdAt)).limit(12)).reverse();
  const sub=await subscriptionFor(user.userId).catch(()=>null);
  const creds=await paymentCredentials().catch(()=>null);const prices=(await sasPayPrices(creds?.apiKey||null).catch(()=>({prices:{} as Record<string,number>}))).prices;
  let reply:string;
  try{reply=await askModel(config,[{role:'system',content:systemPrompt({name:user.fullName||'',plan:sub?.isPro&&!sub.development?'Yombal Pro':'Gratuit',prices})},...history.map(h=>({role:h.role==='assistant'?'assistant' as const:'user' as const,content:h.content}))]);}
  catch(e){return json({error:e instanceof Error?e.message:'L’assistant ne répond pas.',conversationId},502);}
  const at=new Date().toISOString();
  await db.insert(aiMessages).values({id:crypto.randomUUID(),conversationId,userId:user.userId,role:'assistant',content:reply,createdAt:at});
  await db.update(aiConversations).set({updatedAt:at,messageCount:sql`${aiConversations.messageCount}+2`}).where(eq(aiConversations.id,conversationId));
  return json({conversationId,reply});
 }catch(e){console.error('assistant_failed',e instanceof Error?e.message:'unknown');return json({error:'L’assistant ne répond pas pour le moment. Réessayez.'},503);}
}
