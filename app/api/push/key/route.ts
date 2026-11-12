import {vapidKeys} from '../../../../lib/web-push';
export const dynamic='force-dynamic';
// Clé publique utilisée par le téléphone pour s'abonner aux notifications (elle n'a rien de secret).
export async function GET(){try{return Response.json({publicKey:(await vapidKeys()).publicKey},{headers:{'Cache-Control':'no-store'}});}catch{return Response.json({error:'Notifications indisponibles.'},{status:503});}}
