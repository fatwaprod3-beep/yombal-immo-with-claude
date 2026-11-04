import {cookies} from 'next/headers';
import {isDevelopmentAdmin} from './development-admin';
import {verifyAdminToken} from './admin-crypto';
export const adminCookie='__Host-yombal-admin';
export function adminConfig(){const e=process.env;return {email:e.YOMBAL_ADMIN_EMAIL||'',hash:e.YOMBAL_ADMIN_PASSWORD_HASH||'',salt:e.YOMBAL_ADMIN_PASSWORD_SALT||'',secret:e.YOMBAL_ADMIN_SESSION_SECRET||''};}
export async function hasAdminAccess(userId:string){if(!await isDevelopmentAdmin(userId))return false;const {secret}=adminConfig();if(!secret)return false;const token=(await cookies()).get(adminCookie)?.value;return !!token&&await verifyAdminToken(token,userId,secret);}
