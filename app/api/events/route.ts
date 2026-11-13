import {and,eq,gt} from 'drizzle-orm';
import {z} from 'zod';
import {getCurrentUser} from '../../auth';
import {getDb} from '../../../db';
import {userEvents} from '../../../db/schema';
export const dynamic='force-dynamic';
// Étapes mesurées pour comprendre le parcours des inscrits (aucune donnée personnelle dans le détail).
const kinds=['install_prompt_shown','install_prompt_accepted','install_prompt_dismissed','app_installed','app_open_standalone','push_granted','push_denied','push_opened','onboarding_example_saved','onboarding_example_skipped','document_locked','device_seen','ios_coach_step'] as const;
// Événements comptés au plus une fois par jour et par personne, pour ne pas gonfler les chiffres.
const daily=new Set<string>(['app_open_standalone','install_prompt_shown','document_locked','device_seen']);
const input=z.object({kind:z.enum(kinds),detail:z.string().trim().max(80).regex(/^[\w\s:.,/·+-]*$/).optional()}).strict();
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return new Response(null,{status:403});
 const user=await getCurrentUser();if(!user)return new Response(null,{status:204});
 try{
  const body=await request.text();if(body.length>400)return new Response(null,{status:413});
  const parsed=input.safeParse(JSON.parse(body));if(!parsed.success)return new Response(null,{status:400});
  const db=getDb();const now=new Date();
  if(daily.has(parsed.data.kind)){const since=new Date(now.getTime()-20*36e5).toISOString();const seen=await db.select({id:userEvents.id}).from(userEvents).where(and(eq(userEvents.userId,user.userId),eq(userEvents.kind,parsed.data.kind),gt(userEvents.createdAt,since))).limit(1);if(seen.length)return new Response(null,{status:204});}
  await db.insert(userEvents).values({id:crypto.randomUUID(),userId:user.userId,kind:parsed.data.kind,detail:parsed.data.detail||null,createdAt:now.toISOString()});
  return new Response(null,{status:204});
 }catch(e){console.error('user_event_failed',e instanceof Error?e.message.slice(0,120):'unknown');return new Response(null,{status:204});}
}
