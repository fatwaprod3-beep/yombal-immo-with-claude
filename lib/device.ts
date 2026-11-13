// Type de téléphone et navigateur, à partir de l'identifiant envoyé par le navigateur.
// Sert uniquement aux statistiques de l'administration (ex. part d'iPhone, navigateur de Facebook).
const brands:[RegExp,string][]=[[/\bSM-[A-Z]\d|\bGalaxy\b|SAMSUNG/i,'Samsung'],[/TECNO/i,'Tecno'],[/Infinix/i,'Infinix'],[/\bitel\b/i,'itel'],[/Redmi|Xiaomi|\bMi \d|POCO|\b2\d{3}[A-Z0-9]{3,}\b/i,'Xiaomi'],[/\bCPH\d|OPPO/i,'Oppo'],[/\bRMX\d|realme/i,'Realme'],[/\bvivo\b|\bV2\d{3}/i,'Vivo'],[/HUAWEI|\bHONOR\b/i,'Huawei/Honor'],[/Pixel/i,'Google Pixel'],[/Nokia/i,'Nokia'],[/Motorola|moto /i,'Motorola']];
export type DeviceInfo={os:'iPhone'|'iPad'|'Android'|'Ordinateur'|'Autre';browser:string;brand:string;label:string};
export function describeDevice(ua:string,model=''):DeviceInfo{
 const os:DeviceInfo['os']=/iPad/i.test(ua)?'iPad':/iPhone|iPod/i.test(ua)?'iPhone':/Android/i.test(ua)?'Android':/Windows|Macintosh|X11|Linux/i.test(ua)?'Ordinateur':'Autre';
 const browser=/FBAN|FBAV|FB_IAB/i.test(ua)?'Facebook':/Instagram/i.test(ua)?'Instagram':/musical_ly|BytedanceWebview/i.test(ua)?'TikTok':/SamsungBrowser/i.test(ua)?'Samsung Internet':/EdgA?\/|EdgiOS/i.test(ua)?'Edge':/OPR\/|Opera/i.test(ua)?'Opera':/Firefox|FxiOS/i.test(ua)?'Firefox':/CriOS|Chrome\//i.test(ua)?'Chrome':/Safari/i.test(ua)?'Safari':'Autre';
 const text=model+' '+ua;const brand=os==='iPhone'||os==='iPad'?'Apple':(brands.find(([r])=>r.test(text))?.[1]||'');
 // Modèle exact : donné par Chrome récent (model), sinon écrit dans l'identifiant (« Android 13; SM-A135F) »), sauf le « K » masqué.
 const raw=(model||(/Android [\d.]+; ([^;)]+?)(?: Build\/[^;)]*)?\)/i.exec(ua)?.[1]||'')).trim();
 const exact=raw&&raw!=='K'&&!/^wv$/i.test(raw)?raw.replace(new RegExp('^('+brand.split('/')[0]+'|'+brand+')\\s*','i'),''):'';
 const name=os==='Android'?([brand,exact].filter(Boolean).join(' ')||'Android'):os;
 return {os,browser,brand,label:(name+' · '+browser).replace(/[^\w\s:.,\/·+-]/g,'').trim().slice(0,70)};
}
