import {getDb} from '../db';
import {securityEvents} from '../db/schema';
// Journal de sécurité visible dans l'administration. N'enregistre jamais de mot de passe.
export type SecurityKind='login'|'login_failed'|'login_blocked'|'login_suspended'|'register'|'register_blocked'|'admin_login'|'admin_failed'|'admin_action'|'ai_flagged'|'ai_limited';
export function requestInfo(request?:Request){
 if(!request)return {ip:null as string|null,userAgent:null as string|null};
 const ip=(request.headers.get('x-forwarded-for')||'').split(',')[0].trim()||request.headers.get('x-real-ip')||null;
 return {ip:ip?ip.slice(0,64):null,userAgent:(request.headers.get('user-agent')||'').slice(0,200)||null};
}
export async function logSecurity(kind:SecurityKind,data:{email?:string|null;userId?:string|null;detail?:string|null;request?:Request}={}){
 try{const {ip,userAgent}=requestInfo(data.request);
  await getDb().insert(securityEvents).values({id:crypto.randomUUID(),kind,email:data.email?.slice(0,200)||null,userId:data.userId||null,ip,userAgent,detail:data.detail?.slice(0,500)||null,createdAt:new Date().toISOString()});
 }catch(e){console.error('security_log_failed',e instanceof Error?e.message:'unknown');}
}
