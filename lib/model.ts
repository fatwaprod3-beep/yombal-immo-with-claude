import type {Activity} from './activity';
import type {Asset,AssetMovement,AssetCost} from './inventory';
import type {RentalContract} from './contracts';
export type Mode = 'owner' | 'agency';
export type Profile = { activity?: Activity; name: string; company: string; mode: Mode; city: string; phone: string; email: string; browserAlerts: boolean; configured: boolean; address?: string; signature?: string; paymentInstructions?: string; lateMessage?:string; invoiceTemplate?:'classic'|'studio'|'prestige'|'minimal'|'emerald'|'horizon'|'sahel'|'atlantique'|'ardoise';image?:string;imageStyle?:'photo'|'logo';ninea?:string;rccm?:string;agencyNumber?:string };
export type Owner = { id: string; name: string; phone: string; email: string;status?:'active'|'inactive' };
export type Property = { id: string; name: string; type: string; city: string; address: string; rent: number; charges: number; area: number; rooms: number; ownerId: string; description: string; image: string; createdAt: string; availability?:'available'|'occupied'|'reserved';parentId?:string;unitLabel?:string;floor?:string;reference?:string };
export type Tenant = { id: string; name: string; phone: string; email: string; notes: string; photo?:string; identityNumber?:string };
export type Lease = { id: string; propertyId: string; tenantId: string; startDate: string; endDate: string; firstMonth: string; rent: number; charges: number; deposit: number; dueDay: number; commissionRate: number; commissionMode?:'percent'|'fixed';commissionFixed?:number; status: 'active' | 'ended'; createdAt: string; firstDueDate?:string };
export type OwnerTransfer={id:string;ownerId:string;period:string;amount:number;date:string;method:string;reference:string;note:string;createdAt:string;status:'paid'|'cancelled';cancelledAt?:string;cancellationNote?:string};
export type Payment = {ownerId?:string;commissionRate?:number;commissionMode?:'percent'|'fixed';commissionFixed?:number;rentBase?:number; id: string; leaseId: string; period: string; amount: number; date: string; method: string; reference: string; note: string; createdAt: string };
export type Expense = {ownerId?:string; id: string; propertyId: string; amount: number; date: string; category: string; description: string; ownerCharge: boolean };
export type Ticket = { id: string; propertyId: string; title: string; description: string; priority: 'low' | 'medium' | 'high'; status: 'open' | 'ongoing' | 'done'; date: string };
export type Reservation = { id: string; propertyId: string; name: string; phone: string; startDate: string; endDate: string; total: number; paid: number; status: 'pending' | 'confirmed' | 'cancelled'; note: string };
export type Attachment = { id: string; name: string; propertyId: string; url: string; type: string; date: string };
export type Task = { assetId?: string; id: string; title: string; date: string; done: boolean; propertyId: string; category?:'visit'|'handover'|'maintenance'|'meeting'|'other';time?:string;contact?:string;note?:string };
export type RentReminder = { id: string; leaseId: string; period: string; channel: 'whatsapp' | 'email' | 'copy' | 'document'; status: 'prepared' | 'sent'; message: string; createdAt: string; sentAt?: string };
export type Entities = { properties: Property; tenants: Tenant; owners: Owner; leases: Lease; payments: Payment; expenses: Expense; tickets: Ticket; reservations: Reservation; attachments: Attachment; tasks: Task };
export type Entity = keyof Entities;
export type State = { assets?: Asset[]; assetMovements?: AssetMovement[]; assetCosts?: AssetCost[]; profile: Profile; seen: string[]; rentReminders?: RentReminder[];ownerTransfers?:OwnerTransfer[];rentalContracts?:RentalContract[];contractTemplates?:Partial<Record<'habitation'|'meuble'|'commercial',string>>;propertySequence?:number } & { [K in Entity]: Entities[K][] };
export type BillRequest={leaseId:string;from:string;to:string;mode:'pending'|'paid'|'overdue';paymentDate?:string;method?:string;received?:boolean};
export type UnitsRequest={propertyId:string;units:Property[];moveExistingTo?:string};
export type Mutation = {action:'saveContractTemplate';data:{kind:'habitation'|'meuble'|'commercial';clauses:string}} | {action:'saveAsset';data:Asset} | {action:'deleteAsset';data:{id:string}} | {action:'assetMovement';data:Omit<AssetMovement,'createdAt'|'cancelledAt'|'cancellationNote'>} | {action:'cancelAssetMovement';data:{id:string;reason:string}} | {action:'saveAssetCost';data:AssetCost} | {action:'deleteAssetCost';data:{id:string}} | { action: 'save' | 'delete'; entity: Entity; data: Record<string, unknown> } | { action: 'profile'; data: Profile } | { action: 'seen'; data: string[] } | { action: 'import'; data: Property[] } | { action: 'restore'; data: State } | {action:'createContract';data:{id:string;leaseId:string;title:string;usage:string;clauses:string;kind?:'habitation'|'meuble'|'commercial'}} | {action:'signContract';data:{id:string;date:string;fileUrl:string}} | {action:'ownerTransfer';data:Omit<OwnerTransfer,'createdAt'|'status'|'cancelledAt'|'cancellationNote'>&{confirmed:boolean}} | {action:'cancelOwnerTransfer';data:{id:string;reason:string}} | {action:'prepareBills';data:BillRequest} | {action:'addUnits';data:UnitsRequest} | { action: 'startRental'; data: {tenant?: Tenant; tenantId: string; property?: Property; existingUnit?:Property; owner?: Owner; lease: Lease} } | { action: 'saveProperty'; data: {property: Property; owner?: Owner} } | { action: 'rentReminder'; data: Omit<RentReminder, 'createdAt' | 'sentAt'> };
export type Alert = { id: string; title: string; detail: string; kind: 'danger' | 'warning' | 'info'; page: string; date: string; leaseId?: string; period?: string };
export const propertyTypes = ['Appartement', 'Maison', 'Villa', 'Studio', 'Chambre', 'Commerce', 'Immeuble', 'Terrain'];
export const paymentMethods = ['Wave', 'Orange Money', 'Espèces', 'Virement', 'Carte', 'Autre'];
export const expenseCategories = ['Entretien', 'Réparation', 'Eau', 'Électricité', 'Assurance', 'Gestion', 'Autre'];
export const emptyState = (name = '', email = ''): State => ({ profile: { name, email, company: '', mode: 'owner', city: 'Mbour', phone: '', browserAlerts: false, configured: false }, seen: [], properties: [], tenants: [], owners: [], leases: [], payments: [], expenses: [], tickets: [], reservations: [], attachments: [], tasks: [] });
export function today() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Dakar', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
export function currentMonth() { return today().slice(0, 7); }
export const money = (value: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value) + ' F';
export function dateLabel(value: string, short = false) { return value ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: short ? 'short' : 'long', year: short ? undefined : 'numeric', timeZone: 'UTC' }).format(new Date(value.slice(0, 10) + 'T12:00:00Z')) : 'Sans échéance'; }
export function monthLabel(value: string, short = false) { return new Intl.DateTimeFormat('fr-FR', { month: short ? 'short' : 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + '-15T12:00:00Z')); }
export function addMonth(value: string, amount: number) { const [y, m] = value.split('-').map(Number); const date = new Date(Date.UTC(y, m - 1 + amount, 1)); return date.toISOString().slice(0, 7); }
export function monthEnd(value: string) { const [y, m] = value.split('-').map(Number); return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10); }
export function dueDate(lease: Lease, period: string) { if(lease.firstDueDate&&period===lease.firstMonth)return lease.firstDueDate;const due=period + '-' + String(Math.min(lease.dueDay, Number(monthEnd(period).slice(-2)))).padStart(2, '0');return period===lease.startDate.slice(0,7)&&due<lease.startDate?lease.startDate:due; }
export function billed(lease: Lease, period: string) { return period >= lease.firstMonth && lease.startDate <= monthEnd(period) && (!lease.endDate || lease.endDate >= period + '-01'); }
export function paidFor(state: State, leaseId: string, period: string) { return state.payments.filter(p => p.leaseId === leaseId && p.period === period).reduce((sum, p) => sum + p.amount, 0); }
export function balanceFor(state: State, lease: Lease, period: string) { return billed(lease, period) ? Math.max(0, lease.rent + lease.charges - paidFor(state, lease.id, period)) : 0; }
export function leaseFor(state: State, propertyId: string, at = today()) { return state.leases.find(l => l.propertyId === propertyId && l.status === 'active' && l.startDate <= at && (!l.endDate || l.endDate >= at)); }
export function propertyUnits(state:State,p:Property){return state.properties.filter(u=>u.parentId===p.id);}
export function rentalProperties(state:State){const parents=new Set(state.properties.map(p=>p.parentId).filter(Boolean));return state.properties.filter(p=>!parents.has(p.id));}
export function propertyReference(state:State,p:Property){return p.reference||'B-'+String(state.properties.findIndex(v=>v.id===p.id)+1).padStart(3,'0');}
export function assignPropertyReferences(state:State){let seq=Math.max(state.propertySequence||0,...state.properties.map(p=>Number(p.reference?.match(/^B-(\d+)$/)?.[1])||0));for(const p of state.properties)if(!p.reference)p.reference='B-'+String(++seq).padStart(3,'0');state.propertySequence=seq;}
export function propertyStatus(state: State, property: Property) { if (leaseFor(state, property.id)) return 'occupied'; if (state.leases.some(l=>l.propertyId===property.id&&l.status==='active'&&l.startDate>today()) || state.reservations.some(r => r.propertyId === property.id && r.status === 'confirmed' && r.startDate <= today() && r.endDate > today())) return 'reserved'; return property.availability||'available'; }
export function rentSituation(state:State,lease:Lease,period:string,at=today()) { const due=dueDate(lease,period),paid=paidFor(state,lease.id,period),balance=balanceFor(state,lease,period),tracked=billed(lease,period); const days=tracked&&balance>0&&due<at?Math.round((Date.parse(at+'T12:00:00Z')-Date.parse(due+'T12:00:00Z'))/86400000):0; return {due,paid,balance,days,tone:!tracked?'neutral':balance===0?'green':days>0?'red':paid>0?'orange':'orange',label:!tracked?'Hors période':balance===0?'Payé':days>0?'En retard de '+days+' jour'+(days>1?'s':''):paid>0?'Paiement partiel':'En attente de paiement'}; }
export function followPeriod(state:State,lease:Lease,at=today()) { const late=bills(state,at.slice(0,7)).find(b=>b.lease.id===lease.id&&b.balance>0&&b.due<at); return late?.period || (billed(lease,at.slice(0,7))?at.slice(0,7):lease.firstMonth>at.slice(0,7)?lease.firstMonth:lease.endDate?.slice(0,7)||lease.firstMonth); }
export function bills(state: State, until = currentMonth()) { return state.leases.flatMap(lease => { const result: { lease: Lease; period: string; due: string; paid: number; balance: number }[] = []; for (let period = lease.firstMonth, n = 0; period <= until && n < 600; period = addMonth(period, 1), n++) { if (billed(lease, period)) result.push({ lease, period, due: dueDate(lease, period), paid: paidFor(state, lease.id, period), balance: balanceFor(state, lease, period) }); } return result; }); }
/** Allocate partial receipts to rent first, then recovered charges, using the stored monthly contract snapshot. */
export function paymentAllocations(state:State){
 const groups=new Map<string,Payment[]>();for(const payment of state.payments){const key=payment.leaseId+'|'+payment.period;groups.set(key,[...(groups.get(key)||[]),payment]);}
 const result:{payment:Payment;ownerId:string;rent:number;charges:number;fee:number}[]=[];
 for(const payments of groups.values()){
  payments.sort((a,b)=>(a.createdAt+'|'+a.date+'|'+a.id).localeCompare(b.createdAt+'|'+b.date+'|'+b.id));let received=0;
  for(const p of payments){const l=state.leases.find(l=>l.id===p.leaseId);if(!l)continue;const base=p.rentBase??l.rent,rate=p.commissionRate??l.commissionRate;const before=Math.min(received,base),after=Math.min(received+p.amount,base),rent=after-before;const ownerId=p.ownerId??state.properties.find(v=>v.id===l.propertyId)?.ownerId??'';const mode=p.commissionMode??(p.commissionRate!==undefined?'percent':l.commissionMode||'percent');const target=Math.min(base,p.commissionFixed??l.commissionFixed??0);const feeAt=(v:number)=>mode==='fixed'?(base>0?Math.round(v/base*target):0):Math.round(v*rate/100);result.push({payment:p,ownerId,rent,charges:p.amount-rent,fee:feeAt(after)-feeAt(before)});received+=p.amount;}
 }
 return result;
}
export function snapshotFinancials(state:State){
 const groups=new Map<string,Payment[]>();for(const p of state.payments){const key=p.leaseId+'|'+p.period;groups.set(key,[...(groups.get(key)||[]),p]);}
 for(const payments of groups.values()){
  const captured=payments.find(p=>p.ownerId!==undefined);const l=state.leases.find(l=>l.id===payments[0].leaseId);if(!l)continue;
  const owner=captured?.ownerId??state.properties.find(v=>v.id===l.propertyId)?.ownerId??'';const mode=captured?.commissionMode??(captured?.commissionRate!==undefined?'percent':l.commissionMode||'percent');
  for(const p of payments){if(mode==='fixed'){p.commissionMode??='fixed';p.commissionFixed??=captured?.commissionFixed??l.commissionFixed??0;}p.ownerId??=owner;p.commissionRate??=captured?.commissionRate??l.commissionRate;p.rentBase??=captured?.rentBase??l.rent;}
 }
 for(const e of state.expenses)e.ownerId??=state.properties.find(v=>v.id===e.propertyId)?.ownerId||'';
}
export function totals(state: State, period: string) {
  const contracts = state.leases.filter(l => billed(l, period));
  const expected = contracts.reduce((sum, l) => sum + l.rent + l.charges, 0);
  const collected = state.payments.filter(p => p.period === period).reduce((sum, p) => sum + p.amount, 0);
  const expenses = state.expenses.filter(e => e.date.startsWith(period)).reduce((sum, e) => sum + e.amount, 0);
  const fees = paymentAllocations(state).filter(a=>a.payment.period===period).reduce((sum,a)=>sum+a.fee,0);
  const seasonal = state.reservations.filter(r => r.status !== 'cancelled' && r.startDate.startsWith(period)).reduce((sum, r) => sum + r.paid, 0);
  return { expected, collected, expenses, fees, seasonal, balance: Math.max(0, expected - collected), net: collected + seasonal - expenses - (state.profile.mode === 'agency' ? fees : 0), occupied: rentalProperties(state).filter(p => propertyStatus(state, p) === 'occupied'||state.reservations.some(r=>r.propertyId===p.id&&r.status==='confirmed'&&r.startDate<=today()&&r.endDate>today())).length };
}
export function alerts(state: State, at = today()): Alert[] {
  const result: Alert[] = [];
  for (const bill of bills(state, at.slice(0, 7))) {
    if (!bill.balance) continue;
    const property = state.properties.find(p => p.id === bill.lease.propertyId);
    const tenant = state.tenants.find(t => t.id === bill.lease.tenantId);
    const late = bill.due < at;
    result.push({ id: 'rent-' + bill.lease.id + '-' + bill.period, title: late ? 'Loyer à relancer' : 'Prochaine échéance de loyer', detail: (tenant?.name || 'Locataire') + ' · ' + (property?.name || 'Logement') + ' · ' + money(bill.balance), kind: late ? 'danger' : 'info', page: 'loyers', date: bill.due, leaseId: bill.lease.id, period: bill.period });
  }
  state.leases.filter(l => l.status === 'active' && l.endDate && l.endDate >= at && l.endDate <= new Date(new Date(at + 'T12:00:00Z').getTime() + 60 * 86400000).toISOString().slice(0, 10)).forEach(l => result.push({ id: 'end-' + l.id, title: 'Bail à préparer au renouvellement', detail: (state.properties.find(p => p.id === l.propertyId)?.name || 'Logement') + ' · fin le ' + dateLabel(l.endDate, true), kind: 'warning', page: 'locations', date: l.endDate }));
  state.tickets.filter(t => t.status !== 'done').forEach(t => result.push({ id: 'ticket-' + t.id, title: t.title, detail: (state.properties.find(p => p.id === t.propertyId)?.name || 'Bien') + ' · ' + (t.priority === 'high' ? 'Urgent' : 'Intervention à suivre'), kind: t.priority === 'high' ? 'danger' : 'warning', page: 'entretien', date: t.date }));
  state.tasks.filter(t => !t.done).forEach(t => result.push({ id: 'task-' + t.id, title: t.title, detail: ((t.assetId?state.assets?.find(a=>a.id===t.assetId)?.name:state.properties.find(p => p.id === t.propertyId)?.name) || 'Rappel personnel') + ' · ' + dateLabel(t.date, true), kind: t.date < at ? 'warning' : 'info', page: state.profile.activity&&state.profile.activity!=='realestate'?'rappels':'agenda', date: t.date }));
  state.reservations.filter(r => r.status !== 'cancelled' && r.startDate >= at).forEach(r => result.push({ id: 'reservation-' + r.id, title: 'Arrivée à préparer', detail: r.name + ' · ' + (state.properties.find(p => p.id === r.propertyId)?.name || 'Logement'), kind: 'info', page: 'sejours', date: r.startDate }));
  return result.sort((a, b) => a.date.localeCompare(b.date));
}
export function demoState(): State {
  const state = emptyState('Modou', ''); const period = currentMonth(); const prev = addMonth(period, -1); const at = today();
  state.profile = { ...state.profile, company: 'Mon patrimoine', configured: true };
  state.properties = [
    { id: 'demo-p1', name: 'Résidence Les Alizés', type: 'Appartement', city: 'Dakar', address: 'Mermoz, rue 12', rent: 185000, charges: 15000, area: 85, rooms: 3, ownerId: '', description: 'Appartement lumineux avec terrasse et parking.', image: '', createdAt: at },
    { id: 'demo-p2', name: 'Villa Noflaye', type: 'Villa', city: 'Saly', address: 'Saly Niakh Niakhal', rent: 350000, charges: 25000, area: 210, rooms: 5, ownerId: '', description: 'Villa avec jardin et piscine, proche de la mer.', image: '', createdAt: at },
    { id: 'demo-p3', name: 'Studio Baobab', type: 'Studio', city: 'Mbour', address: 'Saly Doute', rent: 90000, charges: 5000, area: 38, rooms: 1, ownerId: '', description: 'Studio indépendant, cuisine équipée.', image: '', createdAt: at },
    { id: 'demo-p4', name: 'Appartement Horizon', type: 'Appartement', city: 'Dakar', address: 'Sacré-Cœur 3', rent: 225000, charges: 20000, area: 110, rooms: 4, ownerId: '', description: 'Un espace familial agréable et bien situé.', image: '', createdAt: at },
    { id: 'demo-p5', name: 'Maison Teranga', type: 'Maison', city: 'Mbour', address: 'Malicounda', rent: 160000, charges: 0, area: 140, rooms: 4, ownerId: '', description: 'Maison de plain-pied avec cour.', image: '', createdAt: at },
  ];
  state.tenants = [ { id: 'demo-t1', name: 'Aminata Fall', phone: '', email: '', notes: '' }, { id: 'demo-t2', name: 'Moussa Diop', phone: '', email: '', notes: '' }, { id: 'demo-t3', name: 'Fatou Ndiaye', phone: '', email: '', notes: '' } ];
  state.leases = state.tenants.map((t, i) => ({ id: 'demo-l' + (i + 1), tenantId: t.id, propertyId: state.properties[i].id, startDate: prev + '-01', endDate: addMonth(period, i === 1 ? 1 : 10) + '-28', firstMonth: period, rent: state.properties[i].rent, charges: state.properties[i].charges, deposit: state.properties[i].rent * 2, dueDay: 5, commissionRate: 0, status: 'active', createdAt: at }));
  state.payments = [ { id: 'demo-pay1', leaseId: 'demo-l1', period, amount: 200000, date: period + '-03', method: 'Wave', reference: 'EXEMPLE-001', note: '', createdAt: at }, { id: 'demo-pay2', leaseId: 'demo-l2', period, amount: 200000, date: period + '-04', method: 'Virement', reference: 'EXEMPLE-002', note: 'Premier versement', createdAt: at } ];
  state.expenses = [{ id: 'demo-e1', propertyId: 'demo-p1', amount: 18500, date: period + '-06', category: 'Réparation', description: 'Réparation robinet de cuisine', ownerCharge: true }];
  state.tickets = [{ id: 'demo-ti1', propertyId: 'demo-p2', title: 'Climatisation du salon', description: 'Prévoir une visite du technicien.', priority: 'medium', status: 'open', date: at }];
  const tomorrow = new Date(new Date(at + 'T12:00:00Z').getTime() + 86400000).toISOString().slice(0, 10);
  state.tasks = [{ id: 'demo-task1', title: 'Visite de l’appartement Horizon', propertyId: 'demo-p4', date: tomorrow, done: false }];
  return state;
}
