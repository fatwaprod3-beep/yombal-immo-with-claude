import {googleClientId,googleEnabled,googleRedirectUri,googleStateCookie} from '../../../../lib/google-auth';
import {safeRelativeReturnPath} from '../../../auth';
export const dynamic='force-dynamic';
// Démarre la connexion Google : état anti-falsification dans un cookie, puis redirection vers Google.
export async function GET(request:Request){
 const url=new URL(request.url);
 if(!googleEnabled())return Response.redirect(new URL('/connexion?erreur=google-indisponible',url),302);
 const returnTo=safeRelativeReturnPath(url.searchParams.get('return_to')||'/');
 const state=crypto.randomUUID().replace(/-/g,'')+crypto.randomUUID().replace(/-/g,'');
 const target=new URL('https://accounts.google.com/o/oauth2/v2/auth');
 target.search=new URLSearchParams({client_id:googleClientId(),redirect_uri:googleRedirectUri(request),response_type:'code',scope:'openid email profile',state,prompt:'select_account'}).toString();
 const headers=new Headers({Location:target.toString(),'Cache-Control':'no-store'});
 headers.append('Set-Cookie',`${googleStateCookie}=${encodeURIComponent(state+'|'+returnTo)}; Path=/api/auth/google; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);
 return new Response(null,{status:302,headers});
}
