import {activities,activityOf} from './activity';
import {validateInventory} from './inventory';
import {contractSnapshot} from './contracts';
import {ownerAccount} from './owner-account';
import { z } from 'zod';
import { type State, type Entity, type Entities, propertyTypes, paymentMethods, expenseCategories, billed, today, addMonth, dueDate, balanceFor,assignPropertyReferences,snapshotFinancials } from './model';
const text = (max = 250) => z.string().trim().max(max);
const id = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
const optionalId = z.union([id, z.literal('')]);
const amount = z.number().int().min(0).max(100000000000);
const date = z.string().regex(/^20\d{2}-\d{2}-\d{2}$/).refine(v => { const d = new Date(v + 'T12:00:00Z'); return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v; }, 'Date invalide.');
const optionalDate = z.union([date, z.literal('')]);
const period = z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/);
const email = z.union([z.string().trim().email().max(254), z.literal('')]);
const phone = text(35).regex(/^[+\d().\s-]*$/, 'Numéro de téléphone invalide.');
const storedUrl = z.union([z.string().regex(/^\/api\/files\?key=[A-Za-z0-9%_.-]+$/).max(500), z.literal('')]);
export const profileSchema = z.object({ activity:z.enum(activities).optional(), name: text(100), company: text(120), mode: z.enum(['owner', 'agency']), city: text(100), phone, email, browserAlerts: z.boolean(), configured: z.boolean(), address: text(300).optional(), signature: z.string().max(250000).regex(/^(?:data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+)?$/).optional(), paymentInstructions: text(1500).optional(),lateMessage:text(1500).optional(),invoiceTemplate:z.enum(['classic','studio','prestige','minimal','emerald','horizon','sahel','atlantique','ardoise']).optional(),image:storedUrl.optional(),imageStyle:z.enum(['photo','logo']).optional(),ninea:text(80).optional(),rccm:text(100).optional(),agencyNumber:text(80).optional() }).strict();
export const schemas: Record<Entity, z.ZodTypeAny> = {
  properties: z.object({ id, name: text(150).min(1), type: z.enum(propertyTypes as [string, ...string[]]), city: text(100).min(1), address: text(), rent: amount, charges: amount, area: z.number().min(0).max(10000000), rooms: z.number().int().min(0).max(10000), ownerId: optionalId, description: text(4000), image: storedUrl, createdAt: date,availability:z.enum(['available','occupied','reserved']).optional(),parentId:optionalId.optional(),unitLabel:text(80).optional(),floor:text(40).optional(),reference:text(40).optional() }).strict(),
  tenants: z.object({ id, name: text(120).min(1), phone, email, notes: text(2000),photo:storedUrl.optional(),identityNumber:text(80).optional() }).strict(),
  owners: z.object({ id, name: text(120).min(1), phone, email,status:z.enum(['active','inactive']).optional() }).strict(),
  leases: z.object({ id, propertyId: id, tenantId: id, startDate: date, endDate: optionalDate, firstMonth: period, rent: amount.positive(), charges: amount, deposit: amount, dueDay: z.number().int().min(1).max(31), commissionRate: z.number().min(0).max(100),commissionMode:z.enum(['percent','fixed']).optional(),commissionFixed:amount.optional(), status: z.enum(['active', 'ended']), createdAt: date,firstDueDate:optionalDate.optional() }).strict(),
  payments: z.object({ownerId:optionalId.optional(),commissionRate:z.number().min(0).max(100).optional(),commissionMode:z.enum(['percent','fixed']).optional(),commissionFixed:amount.optional(),rentBase:amount.optional(), id, leaseId: id, period, amount: amount.positive(), date, method: z.enum(paymentMethods as [string, ...string[]]), reference: text(120), note: text(1000), createdAt: date }).strict(),
  expenses: z.object({ownerId:optionalId.optional(), id, propertyId: id, amount: amount.positive(), date, category: z.enum(expenseCategories as [string, ...string[]]), description: text(1000).min(1), ownerCharge: z.boolean() }).strict(),
  tickets: z.object({ id, propertyId: id, title: text(150).min(1), description: text(3000), priority: z.enum(['low', 'medium', 'high']), status: z.enum(['open', 'ongoing', 'done']), date }).strict(),
  reservations: z.object({ id, propertyId: id, name: text(120).min(1), phone, startDate: date, endDate: date, total: amount.positive(), paid: amount, status: z.enum(['pending', 'confirmed', 'cancelled']), note: text(2000) }).strict(),
  attachments: z.object({ id, name: text(200).min(1), propertyId: optionalId, url: storedUrl.refine(v => v.length > 0), type: text(100), date }).strict(),
  tasks: z.object({ assetId:optionalId.optional(), id, title: text(200).min(1), date, done: z.boolean(), propertyId: optionalId,category:z.enum(['visit','handover','maintenance','meeting','other']).optional(),time:z.union([z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),z.literal('')]).optional(),contact:text(150).optional(),note:text(1500).optional() }).strict(),
};
const contractDataSchema=z.object({issuer:text(150),issuerAddress:text(500),phone,email,logo:storedUrl,ninea:text(80),rccm:text(100),agencyNumber:text(80),owner:text(150),tenant:text(120),tenantPhone:phone,tenantEmail:email,property:text(150),address:text(500),start:date,end:optionalDate,rent:amount,charges:amount,deposit:amount,dueDay:z.number().int().min(1).max(31)}).strict();
const contractSchema=z.object({id,leaseId:id,title:text(150).min(1),usage:text(100).min(1),clauses:text(12000).min(1),status:z.enum(['draft','signed']),createdAt:z.string().datetime(),data:contractDataSchema,signedAt:date.optional(),signedFile:storedUrl.optional()}).strict();
const transferSchema=z.object({id,ownerId:id,period,amount:amount.positive(),date,method:z.enum(paymentMethods as [string,...string[]]),reference:text(120),note:text(1000),createdAt:z.string().datetime(),status:z.enum(['paid','cancelled']),cancelledAt:z.string().datetime().optional(),cancellationNote:text(500).optional()}).strict();
const reminderSchema=z.object({id,leaseId:id,period,channel:z.enum(['whatsapp','email','copy','document']),status:z.enum(['prepared','sent']),message:text(6000),createdAt:z.string().datetime(),sentAt:z.string().datetime().optional()}).strict();
const assetSchema=z.object({id,name:text(150).min(1),category:text(100).min(1),reference:text(80),quantity:z.number().int().min(1).max(1000000),location:text(200),value:amount,acquiredDate:optionalDate,image:storedUrl,note:text(2000),birthDate:optionalDate.optional(),sex:z.enum(['','male','female']).optional()}).strict();
const movementSchema=z.object({id,assetId:id,type:z.enum(['out','return','sold','retired']),quantity:z.number().int().min(1).max(1000000),person:text(150),date,note:text(1500),createdAt:z.string().datetime(),cancelledAt:z.string().datetime().optional(),cancellationNote:text(500).optional()}).strict();
const assetCostSchema=z.object({id,assetId:optionalId,amount:amount.positive(),date,category:text(100).min(1),note:text(1500)}).strict();
const shape: Record<string, z.ZodTypeAny> = {assets:z.array(assetSchema).max(10000).optional(),assetMovements:z.array(movementSchema).max(10000).optional(),assetCosts:z.array(assetCostSchema).max(10000).optional(), profile: profileSchema, seen: z.array(text(200)).max(3000),rentReminders:z.array(reminderSchema).max(5000).optional(),rentalContracts:z.array(contractSchema).max(5000).optional(),ownerTransfers:z.array(transferSchema).max(10000).optional(),propertySequence:z.number().int().nonnegative().optional() };
for (const [key, schema] of Object.entries(schemas)) shape[key] = z.array(schema).max(10000);
export const stateSchema = z.object(shape).strict();
export function validateRelations(state: State) {
  validateInventory(state);
  if(activityOf(state.profile)!=='realestate') {
    if(state.profile.mode!=='owner')throw new Error('Le profil agence est réservé à l’immobilier.');
    if(['properties','tenants','owners','leases','payments','expenses','tickets','reservations','attachments'].some(k=>state[k as Entity].length)||(state.rentalContracts||[]).length||(state.ownerTransfers||[]).length||(state.rentReminders||[]).length)throw new Error('Conservez les données immobilières dans un espace immobilier.');
    if(state.tasks.some(t=>t.propertyId))throw new Error('Associez ce rappel à un bien de cet espace.');
  } else if((state.assets||[]).length||(state.assetMovements||[]).length||(state.assetCosts||[]).length||state.tasks.some(t=>t.assetId))throw new Error('Créez un espace distinct pour cet inventaire.');

  const has = (e: Entity, value: string) => state[e].some(item => item.id === value);
  const demand = (condition: boolean, message: string) => { if (!condition) throw new Error(message); };
  for (const e of Object.keys(schemas) as Entity[]) demand(new Set(state[e].map(item => item.id)).size === state[e].length, 'Un identifiant est présent plusieurs fois.');
  for (const p of state.properties) demand(!p.ownerId || has('owners', p.ownerId), 'Le propriétaire de ce bien est introuvable.');
  for(const p of state.properties)if(p.parentId){const parent=state.properties.find(v=>v.id===p.parentId);demand(!!parent&&parent.id!==p.id&&!parent.parentId,'Rattachez ce logement à un bâtiment existant.');demand(parent?.ownerId===p.ownerId,'Le bâtiment et ses logements doivent avoir le même propriétaire.');}
  for(const parent of state.properties){const labels=state.properties.filter(p=>p.parentId===parent.id).map(p=>(p.unitLabel||p.name).trim().toLocaleLowerCase('fr'));demand(new Set(labels).size===labels.length,'Deux logements du même bâtiment portent le même nom.');}
  const refs=state.properties.map(p=>p.reference).filter(Boolean);demand(new Set(refs).size===refs.length,'Une référence de bien existe plusieurs fois.');
  demand(new Set((state.rentReminders||[]).map(r=>r.id)).size===(state.rentReminders||[]).length,'Un rappel est présent plusieurs fois.');
  for(const r of state.rentReminders||[]){const lease=state.leases.find(l=>l.id===r.leaseId);demand(!!lease&&billed(lease,r.period),'La location de ce rappel est introuvable.');demand(r.status!=='sent'||!!r.sentAt,'La date d’envoi du rappel est manquante.');}
  for (const l of state.leases) {
    demand(l.commissionMode!=='fixed'||(l.commissionFixed||0)<=l.rent,'La commission fixe ne peut pas dépasser le loyer mensuel.');
    demand(has('properties', l.propertyId) && has('tenants', l.tenantId), 'Ce bail doit être associé à un bien et un locataire existants.');
    demand(!state.properties.some(p=>p.parentId===l.propertyId),'Choisissez le logement ou l’étage occupé dans ce bâtiment.');
    demand(!l.endDate || l.endDate >= l.startDate, 'La fin du bail doit suivre son début.');
    demand(l.firstMonth >= l.startDate.slice(0, 7) && (!l.endDate || l.firstMonth <= l.endDate.slice(0, 7)), 'Le premier mois suivi doit appartenir à la période du bail.');
    demand(!l.firstDueDate||(l.firstDueDate>=l.startDate&&l.firstDueDate.slice(0,7)===l.firstMonth&&(!l.endDate||l.firstDueDate<=l.endDate)),'La première échéance doit appartenir au bail et au premier mois suivi.');
    demand(l.status !== 'ended' || !!l.endDate, 'Indiquez la date de fin du bail terminé.');
    for (const other of state.leases) if (other.id !== l.id && other.propertyId === l.propertyId) demand(l.startDate > (other.endDate || '2099-12-31') || other.startDate > (l.endDate || '2099-12-31'), 'Un autre bail couvre déjà ces dates pour ce logement.');
  }
  demand(new Set((state.ownerTransfers||[]).map(t=>t.id)).size===(state.ownerTransfers||[]).length,'Un reversement existe plusieurs fois.');
  for(const t of state.ownerTransfers||[]){demand(has('owners',t.ownerId),'Le propriétaire du reversement est introuvable.');demand(t.date<=today()&&t.period<=t.date.slice(0,7),'Un reversement doit correspondre à un versement déjà effectué.');demand(t.status!=='cancelled'||!!t.cancelledAt&&!!t.cancellationNote,'Indiquez le motif d’annulation du reversement.');}
  demand(new Set((state.rentalContracts||[]).map(c=>c.id)).size===(state.rentalContracts||[]).length,'Un contrat existe plusieurs fois.');
  for(const c of state.rentalContracts||[]){demand(has('leases',c.leaseId),'La location de ce contrat est introuvable.');demand(c.status!=='signed'||!!c.signedAt&&c.signedAt<=today()&&!!c.signedFile,'Joignez la version signée et sa date.');}
  for (const p of state.payments) {
    demand(!p.ownerId||has('owners',p.ownerId),'Le propriétaire de cet encaissement est introuvable.');
    const l = state.leases.find(item => item.id === p.leaseId);
    demand(!!l, 'Le bail associé à ce paiement est introuvable.');
    if (l) { demand(billed(l, p.period), 'Ce mois ne fait pas partie de la période de suivi du bail.'); const total = state.payments.filter(item => item.leaseId === l.id && item.period === p.period).reduce((sum, item) => sum + item.amount, 0); demand(total <= l.rent + l.charges, 'Le montant dépasse le solde du loyer pour ce mois.'); }
  }
  for(const e of state.expenses)demand(!e.ownerId||has('owners',e.ownerId),'Le propriétaire de cette dépense est introuvable.');
  for (const e of ['expenses', 'tickets', 'reservations'] as const) for (const item of state[e]) demand(has('properties', item.propertyId), 'Le bien associé est introuvable.');
  for (const e of ['attachments', 'tasks'] as const) for (const item of state[e]) demand(!item.propertyId || has('properties', item.propertyId), 'Le bien associé est introuvable.');
  for (const r of state.reservations) {
    demand(!state.properties.some(p=>p.parentId===r.propertyId),'Choisissez le logement ou l’étage réservé dans ce bâtiment.');
    demand(r.endDate > r.startDate, 'Le départ doit suivre l’arrivée.'); demand(r.paid <= r.total, 'Le montant payé dépasse le prix du séjour.');
    if (r.status === 'cancelled') continue;
    for (const other of state.reservations) if (other.id !== r.id && other.propertyId === r.propertyId && other.status !== 'cancelled') demand(r.endDate <= other.startDate || r.startDate >= other.endDate, 'Ce logement est déjà réservé sur ces dates.');
    for (const l of state.leases.filter(item => item.propertyId === r.propertyId)) demand(r.endDate <= l.startDate || r.startDate > (l.endDate || '2099-12-31'), 'Un bail couvre déjà ces dates pour ce logement.');
  }
}
function checkDuplicate(state:State,entity:Entity,item:Record<string,unknown>){
 const norm=(v:unknown)=>String(v||'').trim().toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(['properties','tenants','owners'].includes(entity)){const key=(value:Record<string,unknown>)=>norm(value.name)+(entity==='properties'?'|'+norm(value.city)+'|'+norm(value.address):'|'+String(value.phone||'').replace(/\D/g,'')+'|'+norm(value.email));if(state[entity].some(other=>other.id!==item.id&&key(other as unknown as Record<string,unknown>)===key(item)))throw new Error('Cet élément existe déjà. Modifiez sa fiche plutôt que de le créer une deuxième fois.');}
 if(entity==='payments'&&norm(item.reference)&&state.payments.some(p=>p.id!==item.id&&p.leaseId===item.leaseId&&p.period===item.period&&p.method===item.method&&norm(p.reference)===norm(item.reference)))throw new Error('Un paiement avec cette référence existe déjà pour ce mois.');
}
export function applyMutation(current: State, raw: unknown): State {
  const request = z.object({ action: z.enum(['save', 'delete', 'profile', 'seen', 'import', 'restore','startRental','saveProperty','rentReminder','prepareBills','addUnits','ownerTransfer','cancelOwnerTransfer','createContract','signContract','saveAsset','deleteAsset','assetMovement','cancelAssetMovement','saveAssetCost','deleteAssetCost']), entity: z.string().optional(), data: z.unknown() }).strict().parse(raw);
  let next = structuredClone(current);
  assignPropertyReferences(next);snapshotFinancials(next);
  if(activityOf(current.profile)!=='realestate'&&(['import','startRental','saveProperty','rentReminder','prepareBills','addUnits','ownerTransfer','cancelOwnerTransfer','createContract','signContract'].includes(request.action)||['save','delete'].includes(request.action)&&request.entity!=='tasks'))throw new Error('Cette fonction appartient à un espace immobilier.');
  if(activityOf(current.profile)==='realestate'&&['saveAsset','deleteAsset','assetMovement','cancelAssetMovement','saveAssetCost','deleteAssetCost'].includes(request.action))throw new Error('Créez un espace distinct pour cet inventaire.');
  if (request.action === 'restore') {next = stateSchema.parse(request.data) as State;if(activityOf(next.profile)!==activityOf(current.profile))throw new Error('Restaurez cette sauvegarde dans un espace du même type.');}

  else if (request.action === 'profile') {const profile=profileSchema.parse(request.data);if(activityOf(profile)!==activityOf(current.profile))throw new Error('Créez un nouvel espace pour changer d’activité.');if(profile.image!==undefined&&!profile.image)throw new Error('Importez votre photo ou le logo de votre agence.');next.profile=profile;}
  else if(request.action==='saveAsset'){const d=assetSchema.parse(request.data);next.assets=[...(next.assets||[]).filter(a=>a.id!==d.id),d];next.profile.configured=true;}
  else if(request.action==='deleteAsset'){const d=z.object({id}).strict().parse(request.data);if(!next.assets?.some(a=>a.id===d.id))throw new Error('Ce bien est introuvable.');if((next.assetMovements||[]).some(m=>m.assetId===d.id)||(next.assetCosts||[]).some(c=>c.assetId===d.id)||next.tasks.some(t=>t.assetId===d.id))throw new Error('Conservez cette fiche : elle possède un historique ou un rappel.');next.assets=next.assets.filter(a=>a.id!==d.id);}
  else if(request.action==='assetMovement'){const d=movementSchema.omit({createdAt:true,cancelledAt:true,cancellationNote:true}).parse(request.data);if(next.assetMovements?.some(m=>m.id===d.id))throw new Error('Ce mouvement est déjà enregistré.');next.assetMovements=[...(next.assetMovements||[]),{...d,createdAt:new Date().toISOString()}];}
  else if(request.action==='cancelAssetMovement'){const d=z.object({id,reason:text(500).min(3)}).strict().parse(request.data);const m=next.assetMovements?.find(m=>m.id===d.id);if(!m||m.cancelledAt)throw new Error('Ce mouvement est introuvable ou déjà annulé.');m.cancelledAt=new Date().toISOString();m.cancellationNote=d.reason;}
  else if(request.action==='saveAssetCost'){const d=assetCostSchema.parse(request.data);next.assetCosts=[...(next.assetCosts||[]).filter(c=>c.id!==d.id),d];}
  else if(request.action==='deleteAssetCost'){const d=z.object({id}).strict().parse(request.data);if(!next.assetCosts?.some(c=>c.id===d.id))throw new Error('Dépense introuvable.');next.assetCosts=next.assetCosts.filter(c=>c.id!==d.id);}
  else if (request.action === 'seen') next.seen = z.array(text(200)).max(3000).parse(request.data);
  else if(request.action==='createContract'){const d=z.object({id,leaseId:id,title:text(150).min(1),usage:text(100).min(1),clauses:text(12000).min(1)}).strict().parse(request.data);if((next.rentalContracts||[]).some(c=>c.id===d.id))throw new Error('Ce contrat est déjà enregistré.');next.rentalContracts=[...(next.rentalContracts||[]),{...d,status:'draft',createdAt:new Date().toISOString(),data:contractSnapshot(next,d.leaseId)}];next.profile.configured=true;}
  else if(request.action==='signContract'){const d=z.object({id,date,fileUrl:storedUrl.refine(v=>!!v,'Joignez le contrat signé.')}).strict().parse(request.data);const c=next.rentalContracts?.find(c=>c.id===d.id);if(!c)throw new Error('Contrat introuvable.');if(c.status==='signed')throw new Error('Ce contrat possède déjà une version signée.');if(d.date>today())throw new Error('La signature ne peut pas être future.');c.status='signed';c.signedAt=d.date;c.signedFile=d.fileUrl;}
  else if(request.action==='ownerTransfer'){
    const d=transferSchema.omit({createdAt:true,status:true,cancelledAt:true,cancellationNote:true}).extend({confirmed:z.literal(true)}).parse(request.data);
    if(!next.owners.some(o=>o.id===d.ownerId))throw new Error('Choisissez le propriétaire.');if(d.date>today()||d.period>d.date.slice(0,7))throw new Error('Enregistrez uniquement un reversement déjà effectué.');const old=(next.ownerTransfers||[]).find(t=>t.id===d.id);if(old)throw new Error('Ce reversement est déjà enregistré.');const laterPeriods=[...new Set((next.ownerTransfers||[]).filter(t=>t.ownerId===d.ownerId&&t.status!=='cancelled'&&t.period>d.period).map(t=>t.period))];if(d.amount>Math.min(ownerAccount(next,d.ownerId,d.period).available,...laterPeriods.map(p=>ownerAccount(next,d.ownerId,p).available)))throw new Error('Ce montant dépasse le solde disponible du propriétaire.');if(d.reference&&(next.ownerTransfers||[]).some(t=>t.status!=='cancelled'&&t.ownerId===d.ownerId&&t.reference===d.reference&&t.method===d.method))throw new Error('Un reversement avec cette référence existe déjà.');const {confirmed,...record}=d;void confirmed;next.ownerTransfers=[...(next.ownerTransfers||[]),{...record,status:'paid',createdAt:new Date().toISOString()}];next.profile.configured=true;
  }
  else if(request.action==='cancelOwnerTransfer'){const d=z.object({id,reason:text(500).min(3)}).strict().parse(request.data);const transfer=next.ownerTransfers?.find(t=>t.id===d.id);if(!transfer)throw new Error('Reversement introuvable.');if(transfer.status==='cancelled')throw new Error('Ce reversement est déjà annulé.');transfer.status='cancelled';transfer.cancelledAt=new Date().toISOString();transfer.cancellationNote=d.reason;}
  else if(request.action==='addUnits'){
    const d=z.object({propertyId:id,units:z.array(schemas.properties).min(1).max(100),moveExistingTo:id.optional()}).strict().parse(request.data) as {propertyId:string;units:Entities['properties'][];moveExistingTo?:string};const parent=next.properties.find(p=>p.id===d.propertyId);if(!parent||parent.parentId)throw new Error('Choisissez le bâtiment principal.');const hasHistory=next.leases.some(l=>l.propertyId===parent.id)||next.reservations.some(r=>r.propertyId===parent.id);if(hasHistory&&!d.units.some(u=>u.id===d.moveExistingTo))throw new Error('Indiquez le logement qui reprend la location existante.');for(const u of d.units){if(next.properties.some(p=>p.id===u.id))throw new Error('Un logement est déjà enregistré.');if(!u.unitLabel)throw new Error('Donnez un nom à chaque logement ou étage.');const child={...u,parentId:parent.id,ownerId:parent.ownerId,city:parent.city,address:parent.address,name:parent.name.slice(0,65)+' · '+u.unitLabel};checkDuplicate(next,'properties',child);next.properties.push(child);}if(hasHistory){next.leases=next.leases.map(l=>l.propertyId===parent.id?{...l,propertyId:d.moveExistingTo!}:l);next.reservations=next.reservations.map(r=>r.propertyId===parent.id?{...r,propertyId:d.moveExistingTo!}:r);}next.profile.configured=true;
  }
  else if(request.action==='prepareBills'){
    const d=z.object({leaseId:id,from:period,to:period,mode:z.enum(['pending','paid','overdue']),paymentDate:date.optional(),method:z.enum(paymentMethods as [string,...string[]]).optional(),received:z.boolean().optional()}).strict().parse(request.data);const l=next.leases.find(l=>l.id===d.leaseId);if(!l)throw new Error('Choisissez la location concernée.');if(d.from>d.to)throw new Error('La fin doit suivre le premier mois.');const periods:string[]=[];for(let p=d.from;p<=d.to;p=addMonth(p,1)){periods.push(p);if(periods.length>36)throw new Error('Préparez au maximum 36 mois à la fois.');}if(d.from<l.startDate.slice(0,7)||l.endDate&&d.to>l.endDate.slice(0,7))throw new Error('Ces mois doivent appartenir à la période du bail.');if(d.mode==='paid'&&(!d.received||!d.paymentDate||d.paymentDate>today()||!d.method))throw new Error('Confirmez le paiement réellement reçu, sa date et son mode.');if(d.from<l.firstMonth){l.firstMonth=d.from;if(l.firstDueDate)delete l.firstDueDate;}for(const p of periods){if(!billed(l,p))throw new Error('Ce mois ne fait pas partie de la location.');if(d.mode==='overdue'&&dueDate(l,p)>=today())throw new Error('Choisissez uniquement des échéances déjà dépassées.');const balance=balanceFor(next,l,p);if(d.mode==='paid'&&balance>0)next.payments.push({id:crypto.randomUUID(),leaseId:l.id,period:p,amount:balance,date:d.paymentDate!,method:d.method!,reference:'',note:'Règlement confirmé lors de la création du document',createdAt:today()});}next.profile.configured=true;
  }
  else if(request.action==='startRental'||request.action==='saveProperty'){
    const data=(request.action==='startRental'?z.object({tenant:schemas.tenants.optional(),tenantId:id,property:schemas.properties.optional(),existingUnit:schemas.properties.optional(),owner:schemas.owners.optional(),lease:schemas.leases}).strict():z.object({property:schemas.properties,owner:schemas.owners.optional()}).strict()).parse(request.data) as {tenant?:Entities['tenants'];tenantId?:string;property?:Entities['properties'];existingUnit?:Entities['properties'];owner?:Entities['owners'];lease?:Entities['leases']};
    const insert=(entity:Entity,item:{id:string})=>{if(next[entity].some(v=>v.id===item.id))throw new Error('Cet élément est déjà enregistré.');checkDuplicate(next,entity,item as Record<string,unknown>);(next[entity] as {id:string}[]).push(item);};
    if(data.existingUnit&&!data.property?.parentId)throw new Error('Choisissez le bâtiment qui contient ces logements.');
    if(data.property?.parentId){
      const parent=next.properties.find(p=>p.id===data.property!.parentId);
      if(!parent||parent.parentId)throw new Error('Choisissez un bâtiment principal existant.');
      if(!data.property.unitLabel?.trim())throw new Error('Précisez l’étage, le côté ou le numéro du nouveau logement.');
      data.property={...data.property,name:parent.name.slice(0,65)+' · '+data.property.unitLabel,ownerId:parent.ownerId,city:parent.city,address:parent.address};
      const history=next.leases.some(l=>l.propertyId===parent.id)||next.reservations.some(r=>r.propertyId===parent.id);
      if(history&&!data.existingUnit)throw new Error('Précisez le logement qui conserve la location existante.');
      if(data.existingUnit){
        if(!history||data.existingUnit.id===data.property.id||data.existingUnit.parentId!==parent.id||!data.existingUnit.unitLabel?.trim())throw new Error('Indiquez un logement distinct pour la location existante.');
        const previous={...data.existingUnit,name:parent.name.slice(0,65)+' · '+data.existingUnit.unitLabel,ownerId:parent.ownerId,city:parent.city,address:parent.address};
        insert('properties',previous);
        next.leases=next.leases.map(l=>l.propertyId===parent.id?{...l,propertyId:previous.id}:l);
        next.reservations=next.reservations.map(r=>r.propertyId===parent.id?{...r,propertyId:previous.id}:r);
      }
    }
    if(data.owner)insert('owners',data.owner);
    if(data.property){if(data.owner&&data.property.ownerId!==data.owner.id)throw new Error('Le propriétaire ne correspond pas au bien.');if(request.action==='saveProperty'){checkDuplicate(next,'properties',data.property);const i=next.properties.findIndex(p=>p.id===data.property!.id);if(i<0)next.properties.push(data.property);else next.properties[i]={...data.property,reference:next.properties[i].reference};}else insert('properties',data.property);}
    if(request.action==='startRental'){if(data.tenant){if(data.tenant.id!==data.tenantId)throw new Error('Le locataire ne correspond pas.');insert('tenants',data.tenant);}const occupied=next.properties.find(p=>p.id===data.lease!.propertyId);if(occupied)delete occupied.availability;if(data.lease!.tenantId!==data.tenantId||data.property&&data.lease!.propertyId!==data.property.id)throw new Error('La location ne correspond pas au bien et au locataire.');insert('leases',data.lease!);}next.profile.configured=true;
  }
  else if(request.action==='rentReminder'){
    const data=reminderSchema.omit({createdAt:true,sentAt:true}).parse(request.data);const lease=next.leases.find(l=>l.id===data.leaseId);if(!lease||!billed(lease,data.period))throw new Error('Ce mois ne fait pas partie de cette location.');const list=next.rentReminders||[];const old=list.find(r=>r.id===data.id);if(old&&(old.leaseId!==data.leaseId||old.period!==data.period))throw new Error('Ce rappel appartient à une autre échéance.');if(data.status==='sent'&&!old)throw new Error('Préparez le rappel avant de confirmer son envoi.');if(old?.status==='sent'&&data.status==='prepared')throw new Error('Ce rappel est déjà confirmé envoyé.');const now=new Date().toISOString();const reminder={...data,createdAt:old?.createdAt||now,...(data.status==='sent'?{sentAt:old?.sentAt||now}:{})};next.rentReminders=[...list.filter(r=>r.id!==data.id),reminder];
  }
  else if (request.action === 'import') { const items = z.array(schemas.properties).min(1).max(500).parse(request.data) as Entities['properties'][]; for(const item of items){checkDuplicate(next,'properties',item as unknown as Record<string,unknown>);next.properties.push(item);} next.profile.configured = true; }
  else {
    const entity = request.entity as Entity;
    if (!Object.hasOwn(schemas, entity)) throw new Error('Type de donnée inconnu.');
    if (request.action === 'delete') { const target = z.object({ id }).strict().parse(request.data); if (!next[entity].some(item => item.id === target.id)) throw new Error('Cet élément n’existe plus.'); (next[entity] as { id: string }[]) = next[entity].filter(item => item.id !== target.id); }
    else { const item = schemas[entity].parse(request.data) as { id: string }; checkDuplicate(next,entity,item as Record<string,unknown>);if(entity==='properties'){const p=item as Entities['properties'];const occupied=next.leases.some(l=>l.propertyId===p.id&&l.status==='active'&&l.startDate<=today()&&(!l.endDate||l.endDate>=today()));if(occupied&&p.availability&&p.availability!=='occupied')throw new Error('Ce logement a une location active. Terminez la location avant de le déclarer libre ou réservé.');if(occupied)delete p.availability;} const list = next[entity] as { id: string }[]; const index = list.findIndex(value => value.id === item.id); if (index < 0) {if(entity==='payments'){delete (item as Entities['payments']).ownerId;delete (item as Entities['payments']).commissionRate;delete (item as Entities['payments']).commissionMode;delete (item as Entities['payments']).commissionFixed;delete (item as Entities['payments']).rentBase;}if(entity==='expenses')delete (item as Entities['expenses']).ownerId;list.push(item);} else {if(entity==='properties')(item as Entities['properties']).reference=next.properties[index].reference;if(entity==='payments'){const old=next.payments[index],incoming=item as Entities['payments'];if(old.leaseId===incoming.leaseId&&old.period===incoming.period)Object.assign(item,{ownerId:old.ownerId,commissionRate:old.commissionRate,commissionMode:old.commissionMode,commissionFixed:old.commissionFixed,rentBase:old.rentBase});else {delete incoming.ownerId;delete incoming.commissionRate;delete incoming.commissionMode;delete incoming.commissionFixed;delete incoming.rentBase;}}if(entity==='expenses'){if((item as Entities['expenses']).propertyId===next.expenses[index].propertyId)Object.assign(item,{ownerId:next.expenses[index].ownerId});else delete (item as Entities['expenses']).ownerId;}list[index] = item;} next.profile.configured = true; }
  }
  for(const p of next.properties)if(p.parentId){const parent=next.properties.find(v=>v.id===p.parentId);if(parent){p.ownerId=parent.ownerId;p.city=parent.city;p.address=parent.address;if(p.unitLabel)p.name=parent.name.slice(0,65)+' · '+p.unitLabel;}}
  assignPropertyReferences(next);snapshotFinancials(next);next = stateSchema.parse(next) as State; validateRelations(next);
  if (JSON.stringify(next).length > 2000000) throw new Error('Votre espace dépasse la capacité de cette version. Exportez vos données avant de poursuivre.');
  return next;
}
export function defaultRecord(entity: Entity, state: State): Record<string, unknown> {
  const at = today(); const id = crypto.randomUUID(); const propertyId = state.properties[0]?.id || '';
  const defaults: Record<Entity, Record<string, unknown>> = {
    properties: { id, name: '', type: 'Appartement', city: state.profile.city || 'Mbour', address: '', rent: 0, charges: 0, area: 0, rooms: 0, ownerId: '', description: '', image: '', createdAt: at },
    tenants: { id, name: '', phone: '', email: '', notes: '' }, owners: { id, name: '', phone: '', email: '',status:'active' },
    leases: { id, propertyId, tenantId: state.tenants[0]?.id || '', startDate: at, endDate: '', firstMonth: at.slice(0, 7), rent: state.properties[0]?.rent || 0, charges: state.properties[0]?.charges || 0, deposit: 0, dueDay: 5, commissionRate: 0, status: 'active', createdAt: at },
    payments: { id, leaseId: state.leases[0]?.id || '', period: at.slice(0, 7), amount: 0, date: at, method: 'Wave', reference: '', note: '', createdAt: at },
    expenses: { id, propertyId, amount: 0, date: at, category: 'Entretien', description: '', ownerCharge: true },
    tickets: { id, propertyId, title: '', description: '', priority: 'medium', status: 'open', date: at },
    reservations: { id, propertyId, name: '', phone: '', startDate: at, endDate: '', total: 0, paid: 0, status: 'confirmed', note: '' },
    attachments: { id, name: '', propertyId: '', url: '', type: '', date: at }, tasks: { id, title: '', date: at, done: false, propertyId: '',category:'other',time:'',contact:'',note:'' },
  }; return defaults[entity];
}
