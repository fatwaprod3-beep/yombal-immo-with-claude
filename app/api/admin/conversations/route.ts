import {asc,desc,eq,sql} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {aiConversations,aiMessages,users} from '../../../../db/schema';
import {requireAdmin,adminJson} from '../../../../lib/admin-guard';
export const dynamic='force-dynamic';
// Historique des discussions avec l'assistant, signalées en premier, pour la modération.
export async function GET(request:Request){
 const {denied}=await requireAdmin(request);if(denied)return denied;
 const db=getDb();const url=new URL(request.url);const id=url.searchParams.get('id');
 if(id){const messages=await db.select({role:aiMessages.role,content:aiMessages.content,flagged:aiMessages.flagged,createdAt:aiMessages.createdAt}).from(aiMessages).where(eq(aiMessages.conversationId,id)).orderBy(asc(aiMessages.createdAt)).limit(400);return adminJson({messages});}
 const userId=url.searchParams.get('user');
 const q=db.select({id:aiConversations.id,title:aiConversations.title,flagged:aiConversations.flagged,flagReason:aiConversations.flagReason,messageCount:aiConversations.messageCount,updatedAt:aiConversations.updatedAt,userId:aiConversations.userId,email:users.email,name:users.name}).from(aiConversations).leftJoin(users,eq(users.id,aiConversations.userId));
 const conversations=await (userId?q.where(eq(aiConversations.userId,userId)):q).orderBy(desc(aiConversations.flagged),desc(aiConversations.updatedAt)).limit(200);
 return adminJson({conversations});
}
export async function POST(request:Request){
 const {denied}=await requireAdmin(request,true);if(denied)return denied;
 const body=await request.json().catch(()=>({})) as {id?:string;action?:string};
 if(typeof body.id!=='string'||body.action!=='clear_flag')return adminJson({error:'Action invalide.'},400);
 await getDb().update(aiConversations).set({flagged:0,flagReason:sql`null`}).where(eq(aiConversations.id,body.id));
 return adminJson({ok:true});
}
