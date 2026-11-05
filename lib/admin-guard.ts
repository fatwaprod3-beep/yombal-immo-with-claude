import {getCurrentUser} from '../app/auth';
import {hasAdminAccess} from './admin-access';
export const adminJson=(data:unknown,status=200,extra:Record<string,string>={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...extra}});
/** Vérifie la session administrateur (compte propriétaire + mot de passe admin) et, pour les écritures, l'origine. */
export async function requireAdmin(request:Request,write=false){
 const user=await getCurrentUser();
 if(!user||!await hasAdminAccess(user.userId))return {user:null,denied:adminJson({error:'Session administrateur requise.'},403)};
 if(write&&request.headers.get('origin')!==new URL(request.url).origin)return {user:null,denied:adminJson({error:'Origine non autorisée.'},403)};
 return {user,denied:null};
}
