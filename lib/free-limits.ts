import type {State} from './model';
import type {ProFeature} from './billing';
export const freeLimits={properties:6,tenants:7,invoices:3} as const;
/** Existing over-limit records remain editable. Only growth past a limit is gated. */
export function freeLimitExceeded(current:State,next:State):ProFeature|null{
 if(next.properties.length>freeLimits.properties&&next.properties.length>current.properties.length)return 'properties';
 if((next.assets?.length||0)>freeLimits.properties&&(next.assets?.length||0)>(current.assets?.length||0))return 'properties';
 if(next.tenants.length>freeLimits.tenants&&next.tenants.length>current.tenants.length)return 'tenants';
 return null;
}
