import {eq} from 'drizzle-orm';
import {getDb} from '../db';
import {appSettings} from '../db/schema';
// Réglages globaux contrôlés depuis l'administration. Cache court pour ne pas solliciter la base à chaque requête.
export type SettingKey='registrations'|'maintenance'|'assistant'|'assistant_config'|'sessions_after'|'plan_prices';
const cache=new Map<string,{value:string|null;at:number}>();
export async function getSetting(key:SettingKey):Promise<string|null>{
 const hit=cache.get(key);if(hit&&Date.now()-hit.at<15000)return hit.value;
 try{const row=(await getDb().select().from(appSettings).where(eq(appSettings.key,key)).limit(1))[0];const value=row?.value??null;cache.set(key,{value,at:Date.now()});return value;}
 catch{return hit?.value??null;}
}
export async function setSetting(key:SettingKey,value:string){
 const now=new Date().toISOString();
 await getDb().insert(appSettings).values({key,value,updatedAt:now}).onConflictDoUpdate({target:appSettings.key,set:{value,updatedAt:now}});
 cache.set(key,{value,at:Date.now()});
}
export async function flags(){
 const [registrations,maintenance,assistant,sessionsAfter]=await Promise.all([getSetting('registrations'),getSetting('maintenance'),getSetting('assistant'),getSetting('sessions_after')]);
 return {registrationsOpen:registrations!=='closed',maintenance:maintenance==='on',assistant:assistant!=='off',sessionsAfter:Number(sessionsAfter||0)};
}
