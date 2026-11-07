// Connexion « Continuer avec Google » (OAuth 2.0 / OpenID Connect, sans dépendance externe).
// Les identifiants vivent dans les variables d'environnement Vercel : GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.
const clientId=()=>(process.env.GOOGLE_CLIENT_ID||'').trim();
const clientSecret=()=>(process.env.GOOGLE_CLIENT_SECRET||'').trim().replace(/^["']|["']$/g,'');
export function googleClientId(){return clientId();}
export function googleEnabled(){return !!(clientId()&&clientSecret());}
export function googleRedirectUri(request:Request){return process.env.GOOGLE_REDIRECT_URI||new URL('/api/auth/google/callback',request.url).toString();}
export const googleStateCookie='yombal_g_state';
export function readCookie(request:Request,name:string){const m=new RegExp('(?:^|;\\s*)'+name+'=([^;]+)').exec(request.headers.get('cookie')||'');return m?decodeURIComponent(m[1]):null;}
export type GoogleProfile={sub:string;email:string;name:string;picture?:string};
/** Échange le code contre un id_token, reçu directement de Google en HTTPS, puis contrôle ses champs. */
export async function googleProfile(code:string,request:Request):Promise<GoogleProfile>{
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,client_id:clientId(),client_secret:clientSecret(),redirect_uri:googleRedirectUri(request),grant_type:'authorization_code'}),cache:'no-store'});
 const data=await r.json().catch(()=>({})) as {id_token?:string;error?:string};
 if(!r.ok||!data.id_token)throw new Error('token:'+(data.error||r.status)+(data.error==='invalid_client'?' (secret length '+clientSecret().length+', starts '+clientSecret().slice(0,6)+')':''));
 const part=data.id_token.split('.')[1];if(!part)throw new Error('id_token');
 const p=JSON.parse(Buffer.from(part.replace(/-/g,'+').replace(/_/g,'/'),'base64').toString('utf8')) as {iss?:string;aud?:string;exp?:number;sub?:string;email?:string;email_verified?:boolean|string;name?:string;given_name?:string;picture?:string};
 if(!['https://accounts.google.com','accounts.google.com'].includes(p.iss||''))throw new Error('iss');
 if(p.aud!==clientId())throw new Error('aud');
 if(!p.exp||p.exp*1000<Date.now())throw new Error('exp');
 if(!p.sub||!p.email||!(p.email_verified===true||p.email_verified==='true'))throw new Error('email');
 const email=p.email.trim().toLowerCase();
 return {sub:p.sub,email,name:(p.name||p.given_name||email.split('@')[0]).slice(0,120),picture:p.picture};
}
