export function contactPhone(value=''){let phone=value.replace(/\D/g,'').replace(/^00/,'');if(phone.length===9)phone='221'+phone;return /^\d{10,15}$/.test(phone)?phone:'';}
export function whatsappLink(text:string,phone=''){const number=contactPhone(phone);return 'https://wa.me/'+(number?number:'')+'?'+new URLSearchParams({text}).toString();}
export function emailLink(subject:string,body:string,to=''){const query=new URLSearchParams({view:'cm',fs:'1',su:subject,body});if(to.trim())query.set('to',to.trim());return 'https://mail.google.com/mail/?'+query.toString();}
export function mailAppLink(subject:string,body:string,to=''){return 'mailto:'+encodeURIComponent(to.trim())+'?'+new URLSearchParams({subject,body}).toString();}
