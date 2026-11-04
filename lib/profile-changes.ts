import type {Profile} from './model';
const editableKeys=['activity','name','company','mode','city','phone','email','address','signature','paymentInstructions','lateMessage','invoiceTemplate','image','imageStyle','ninea','rccm','agencyNumber'] as const;
export function profileChanged(current:Profile,saved:Profile){
 const value=(profile:Profile,key:typeof editableKeys[number])=>key==='activity'?profile.activity||'realestate':key==='invoiceTemplate'?profile.invoiceTemplate||'classic':key==='imageStyle'?profile.imageStyle||(profile.mode==='agency'?'logo':'photo'):profile[key]??'';
 return editableKeys.some(key=>value(current,key)!==value(saved,key));
}
