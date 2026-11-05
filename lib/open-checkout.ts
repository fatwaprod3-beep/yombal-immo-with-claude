// Ouvre le paiement SasPay dans un nouvel onglet. L’onglet est ouvert tout de suite
// (au clic) pour ne pas être bloqué par le navigateur, puis dirigé vers SasPay.
export function openCheckoutTab(){
 try{const tab=window.open('about:blank','_blank');if(tab){try{tab.document.title='Paiement SasPay…';tab.document.body.innerHTML='<p style="font:16px system-ui;padding:24px">Ouverture du paiement sécurisé SasPay…</p>';}catch{}}return tab;}catch{return null;}
}
export function sendCheckoutTab(tab:Window|null,url:string){
 if(tab&&!tab.closed){try{tab.opener=null;}catch{}tab.location.href=url;return true;}
 window.location.assign(url);return false;
}
export function closeCheckoutTab(tab:Window|null){try{if(tab&&!tab.closed)tab.close();}catch{}}
