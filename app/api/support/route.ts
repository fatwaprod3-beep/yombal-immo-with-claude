import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getCurrentUser } from '../../auth';
import { getDb } from '../../../db';
import { supportRequests } from '../../../db/schema';
export async function GET(){const user=await getCurrentUser();if(!user)return new Response(null,{status:401});const rows=await getDb().select().from(supportRequests).where(eq(supportRequests.userId,user.userId));return Response.json({requests:rows},{headers:{'Cache-Control':'no-store'}});}
export async function POST(request:Request){const user=await getCurrentUser();if(!user)return new Response(null,{status:401});if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return new Response(null,{status:403});try{const raw=await request.text();if(raw.length>6000)return new Response(null,{status:413});const data=z.object({subject:z.enum(['Question sur mon compte','Problème technique','Factures et paiements','Signalement','Suggestion','Autre']),email:z.string().email().max(254),message:z.string().trim().min(10).max(4000)}).strict().parse(JSON.parse(raw));const row={id:crypto.randomUUID(),userId:user.userId,...data,createdAt:new Date().toISOString()};await getDb().insert(supportRequests).values(row);return Response.json({id:row.id});}catch{return Response.json({error:'Indiquez un e-mail valide et un message de 10 à 4 000 caractères.'},{status:400});}}
