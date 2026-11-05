import {paymentCredentials} from '../../../lib/payment-config';
import {sasPayPrices,defaultPrices} from '../../../lib/saspay-prices';
export const dynamic='force-dynamic';
// Prix publics des offres, lus sur les liens SasPay du propriétaire.
export async function GET(){
 try{const credentials=await paymentCredentials();const {prices,source}=await sasPayPrices(credentials?.apiKey||null);return Response.json({prices,source},{headers:{'Cache-Control':'public, max-age=60'}});}
 catch{return Response.json({prices:defaultPrices(),source:'default'},{headers:{'Cache-Control':'no-store'}});}
}
