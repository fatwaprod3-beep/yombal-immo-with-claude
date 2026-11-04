import {clearSessionCookieHeader,safeRelativeReturnPath} from '../../../auth';
import {adminCookie} from '../../../../lib/admin-access';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 const url=new URL(request.url);const target=new URL(safeRelativeReturnPath(url.searchParams.get('return_to')||'/'),url.origin);
 const headers=new Headers({Location:target.toString(),'Cache-Control':'no-store'});
 headers.append('Set-Cookie',clearSessionCookieHeader());
 headers.append('Set-Cookie',`${adminCookie}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);
 return new Response(null,{status:303,headers});
}
