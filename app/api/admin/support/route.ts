import {desc} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {supportRequests} from '../../../../db/schema';
import {requireAdmin,adminJson} from '../../../../lib/admin-guard';
export const dynamic='force-dynamic';
// Messages reçus via le formulaire de contact (clients connectés et visiteurs).
export async function GET(request:Request){
 const {denied}=await requireAdmin(request);if(denied)return denied;
 const rows=await getDb().select().from(supportRequests).orderBy(desc(supportRequests.createdAt)).limit(200);
 return adminJson({messages:rows});
}
