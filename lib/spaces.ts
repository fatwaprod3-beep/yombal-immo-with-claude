import { eq } from 'drizzle-orm';
import { getDb } from '../db';
import { directories, workspaces } from '../db/schema';
import { emptyState, type State } from './model';
import {spaceKey,type Directory} from './space-model';
export {spaceKey,type Space,type Directory} from './space-model';
export async function getDirectory(user:{userId:string;fullName:string|null;email:string}):Promise<Directory> {
 const db=getDb(); const existing=(await db.select().from(directories).where(eq(directories.userId,user.userId)).limit(1))[0]; if(existing)return JSON.parse(existing.data);
 const legacy=(await db.select().from(workspaces).where(eq(workspaces.userId,user.userId)).limit(1))[0];const state:State=legacy?JSON.parse(legacy.data):emptyState(user.fullName||'',user.email);
 const data:Directory={activeId:'default',spaces:[{id:'default',name:state.profile.company||'Mon patrimoine',mode:state.profile.mode,activity:state.profile.activity||'realestate'}]};
 await db.insert(directories).values({userId:user.userId,data:JSON.stringify(data)}).onConflictDoNothing();return JSON.parse((await db.select().from(directories).where(eq(directories.userId,user.userId)).limit(1))[0].data);
}
export async function getWorkspace(user:{userId:string;fullName:string|null;email:string},requested?:string){const directory=await getDirectory(user);const spaceId=requested||directory.activeId;const key=spaceKey(user.userId,spaceId,directory);const db=getDb(); const space=directory.spaces.find(s=>s.id===spaceId)!;const initial=emptyState(user.fullName||'',user.email);initial.profile={...initial.profile,company:space.name,mode:space.mode,activity:space.activity||'realestate'};await db.insert(workspaces).values({userId:key,data:JSON.stringify(initial),revision:0,updatedAt:new Date().toISOString()}).onConflictDoNothing();const row=(await db.select().from(workspaces).where(eq(workspaces.userId,key)).limit(1))[0];return {row,key,spaceId,directory};}
