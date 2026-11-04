import {type State,addMonth,totals,billed,balanceFor,dueDate,paidFor,rentalProperties,propertyStatus,today} from './model';
export function monthlyPoints(state:State,period:string,length:number){return Array.from({length},(_,i)=>{const month=addMonth(period,i-length+1);return {month,...totals(state,month)};});}
export function occupancySlices(state:State){
 const units=rentalProperties(state);const count=(status:string)=>units.filter(p=>propertyStatus(state,p)===status).length;
 return [{label:'Occupés',value:count('occupied'),color:'#458e75'},{label:'Disponibles',value:count('available'),color:'#b5a3cc'},{label:'Réservés',value:count('reserved'),color:'#d98b46'}];
}
export function collectionSlices(state:State,period:string,at=today()){
 const leases=state.leases.filter(l=>billed(l,period));let paid=0,late=0,pending=0;
 for(const l of leases){paid+=Math.min(l.rent+l.charges,paidFor(state,l.id,period));const balance=balanceFor(state,l,period);if(dueDate(l,period)<at)late+=balance;else pending+=balance;}
 return [{label:'Encaissés',value:paid,color:'#458e75'},{label:'En retard',value:late,color:'#cb535f'},{label:'À venir',value:pending,color:'#d98b46'}];
}
/** Rounded axis ceiling with headroom; never invents data on empty months. */
export function chartCeiling(maximum:number){if(maximum<=0)return 1;const power=10**Math.floor(Math.log10(maximum));return Math.ceil(maximum/power*1.1/0.5)*0.5*power;}
export function curvePath(values:number[],ceiling:number,width=720,height=220){
 if(!values.length)return '';
 const points=values.map((v,i)=>({x:i*width/Math.max(1,values.length-1),y:height-Math.max(0,v)/ceiling*height}));
 let d=`M ${points[0].x} ${points[0].y}`;
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],mid=(a.x+b.x)/2;d+=` C ${mid} ${a.y}, ${mid} ${b.y}, ${b.x} ${b.y}`;}
 return d;
}
