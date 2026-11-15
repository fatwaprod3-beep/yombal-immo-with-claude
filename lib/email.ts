// E-mails Yombal via Resend. Sans clé RESEND_API_KEY (réglages Vercel), rien n'est envoyé et le reste du site marche normalement.
export const emailEnabled=()=>Boolean(process.env.RESEND_API_KEY);
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
/** Gabarit simple, lisible sur téléphone et dans Gmail. Le texte est échappé ; `cta.url` doit venir de Yombal. */
export function emailHtml({title,lines,cta,foot}:{title:string;lines:string[];cta?:{label:string;url:string};foot?:string}){
 return `<!doctype html><html lang="fr"><body style="margin:0;background:#f5f1f7;font-family:Arial,Helvetica,sans-serif;color:#21152e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f1f7;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#fff;border-radius:18px;overflow:hidden">
<tr><td style="background:#281b34;padding:22px 26px"><span style="color:#fff;font-size:20px;font-weight:bold">Yombal</span><span style="color:#cdbfd8;font-size:13px"> · gestion locative</span></td></tr>
<tr><td style="padding:28px 26px 8px"><h1 style="margin:0 0 14px;font-size:22px;line-height:1.3">${esc(title)}</h1>
${lines.map(l=>`<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:#4b4155">${esc(l)}</p>`).join('')}
${cta?`<p style="margin:22px 0 8px"><a href="${esc(cta.url)}" style="display:inline-block;background:#281b34;color:#fff;text-decoration:none;font-weight:bold;font-size:15px;padding:14px 22px;border-radius:12px">${esc(cta.label)}</a></p>`:''}
</td></tr>
<tr><td style="padding:14px 26px 24px;font-size:12.5px;line-height:1.5;color:#8a7f93">${esc(foot||'Une question ? Répondez à cet e-mail ou écrivez-nous sur WhatsApp : +44 7445 510315.')}</td></tr>
</table><p style="font-size:11.5px;color:#9b90a6;margin:14px 0 0">yombal-immo.pro</p></td></tr></table></body></html>`;
}
export async function sendEmail({to,subject,html,text}:{to:string;subject:string;html:string;text:string}){
 const key=process.env.RESEND_API_KEY;if(!key)return false;
 try{
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify({from:process.env.EMAIL_FROM||'Yombal <contact@yombal-immo.pro>',to:[to],subject,html,text,...(process.env.EMAIL_REPLY_TO?{reply_to:process.env.EMAIL_REPLY_TO}:{})})});
  if(!r.ok){console.error('email_failed',r.status,(await r.text()).slice(0,200));return false;}
  return true;
 }catch(error){console.error('email_failed',error instanceof Error?error.message:'unknown');return false;}
}
