import ResetPassword from '../../components/reset-password';
export const dynamic='force-dynamic';
export const metadata={title:'Nouveau mot de passe — Yombal.immo',robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default async function Page({searchParams}:{searchParams:Promise<{t?:string}>}){const {t}=await searchParams;return <ResetPassword token={typeof t==='string'?t:''}/>;}
