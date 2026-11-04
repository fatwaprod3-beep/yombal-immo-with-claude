import type {Activity} from './activity';
export type Space={activity?:Activity;id:string;name:string;mode:'owner'|'agency'};
export type Directory={activeId:string;spaces:Space[]};
export function spaceKey(userId:string,spaceId:string,directory:Directory){if(!directory.spaces.some(s=>s.id===spaceId))throw new Error('Espace inaccessible.');return spaceId==='default'?userId:userId+'::'+spaceId;}
