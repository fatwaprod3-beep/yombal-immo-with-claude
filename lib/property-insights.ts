import {type State,type Property,bills,paymentAllocations,today} from './model';
export function propertyInsights(state:State,property:Property,at=today()){
 const ids=new Set([property.id]);let changed=true;
 while(changed){changed=false;for(const p of state.properties)if(p.parentId&&ids.has(p.parentId)&&!ids.has(p.id)){ids.add(p.id);changed=true;}}
 const properties=state.properties.filter(p=>ids.has(p.id));
 const leases=state.leases.filter(l=>ids.has(l.propertyId));const leaseIds=new Set(leases.map(l=>l.id));
 const payments=state.payments.filter(p=>leaseIds.has(p.leaseId)).sort((a,b)=>(b.date+'|'+b.createdAt+'|'+b.id).localeCompare(a.date+'|'+a.createdAt+'|'+a.id));
 const expenses=state.expenses.filter(e=>ids.has(e.propertyId)).sort((a,b)=>b.date.localeCompare(a.date));
 const reservations=state.reservations.filter(r=>ids.has(r.propertyId)&&r.status!=='cancelled');
 const scope={...state,properties,leases,payments,expenses,reservations};
 const outstanding=bills(scope,at.slice(0,7)).filter(b=>b.due<=at&&b.balance>0);
 const paymentIds=new Set(payments.map(p=>p.id));
 return {properties,leases,payments,expenses,reservations,scope,outstanding,
  collected:payments.reduce((sum,p)=>sum+p.amount,0),
  remaining:outstanding.reduce((sum,b)=>sum+b.balance,0),
  spent:expenses.reduce((sum,e)=>sum+e.amount,0),
  fees:paymentAllocations(state).filter(a=>paymentIds.has(a.payment.id)).reduce((sum,a)=>sum+a.fee,0),
  attachments:state.attachments.filter(a=>ids.has(a.propertyId)),
  tasks:state.tasks.filter(t=>ids.has(t.propertyId)),
  tickets:state.tickets.filter(t=>ids.has(t.propertyId)),
  contracts:(state.rentalContracts||[]).filter(c=>leaseIds.has(c.leaseId))};
}
