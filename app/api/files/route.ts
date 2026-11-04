import { getFile, putFile, storageReady } from '../../../lib/storage';
import { getCurrentUser } from '../../auth';
export const dynamic = 'force-dynamic';
async function scope(userId: string) { const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(userId)); return Array.from(new Uint8Array(digest)).map(v => v.toString(16).padStart(2, '0')).join(''); }
export async function POST(request: Request) {
  const user = await getCurrentUser(); if (!user) return Response.json({ error: 'Connexion nécessaire.' }, { status: 401 });
  const origin = request.headers.get('origin'); if (origin && origin !== new URL(request.url).origin) return Response.json({ error: 'Origine non autorisée.' }, { status: 403 });
  try {
    if (!storageReady()) return Response.json({ error: 'Le stockage des fichiers est momentanément indisponible.' }, { status: 503 });
    if (Number(request.headers.get('content-length') || 0) > 13000000) return Response.json({ error: 'Fichier trop volumineux : maximum 12 Mo.' }, { status: 413 });
    const form = await request.formData(); const file = form.get('file');
    if (!(file instanceof File) || file.size > 12000000 || !file.size) return Response.json({ error: 'Choisissez un fichier de moins de 12 Mo.' }, { status: 400 });
    const bytes = await file.arrayBuffer(); const h = new Uint8Array(bytes.slice(0, 16)); const ascii = String.fromCharCode(...h); let type = ''; let ext = '';
    if (h[0] === 137 && ascii.slice(1, 4) === 'PNG') { type = 'image/png'; ext = 'png'; } else if (h[0] === 255 && h[1] === 216 && h[2] === 255) { type = 'image/jpeg'; ext = 'jpg'; } else if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') { type = 'image/webp'; ext = 'webp'; } else if (ascii.startsWith('%PDF-')) { type = 'application/pdf'; ext = 'pdf'; } else return Response.json({ error: 'Formats acceptés : JPG, PNG, WebP et PDF.' }, { status: 400 });
    const key = await scope(user.userId) + '/' + crypto.randomUUID() + '.' + ext; await putFile(key, bytes, type);
    return Response.json({ url: '/api/files?key=' + encodeURIComponent(key), type, name: file.name.slice(0, 200) });
  } catch { return Response.json({ error: 'Le fichier n’a pas pu être envoyé. Réessayez.' }, { status: 500 }); }
}
export async function GET(request: Request) {
  const user = await getCurrentUser(); if (!user) return Response.json({error:'Connexion nécessaire pour afficher cette image.'}, {status:401,headers:{'Cache-Control':'no-store'}});
  const key = new URL(request.url).searchParams.get('key') || '';
  if (!key.startsWith(await scope(user.userId) + '/') || !/^[a-f0-9]{64}\/[a-f0-9-]+\.(png|jpg|webp|pdf)$/.test(key)) return Response.json({error:'Fichier introuvable.'},{status:404,headers:{'Cache-Control':'no-store'}});
  try {
    const bytes = await getFile(key); if (!bytes) return Response.json({error:'Fichier introuvable. Importez à nouveau l’image depuis sa fiche.'}, {status:404});
    const types:Record<string,string> = {png:'image/png',jpg:'image/jpeg',webp:'image/webp',pdf:'application/pdf'};
    const type = types[key.split('.').at(-1)!];
    const headers = {'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'};
    if (new URL(request.url).searchParams.get('format')==='data') {
      if (!type.startsWith('image/')) return Response.json({error:'Ce fichier n’est pas une image.'},{status:415,headers});
      if (bytes.byteLength>12000000) return Response.json({error:'Image trop volumineuse.'},{status:413,headers});
      const values=new Uint8Array(bytes);let binary='';
      for(let i=0;i<values.length;i+=8192) binary+=String.fromCharCode(...values.subarray(i,i+8192));
      return Response.json({dataUrl:'data:'+type+';base64,'+btoa(binary)},{headers});
    }
    return new Response(bytes, {headers:{...headers,'Content-Type':type,'Content-Length':String(bytes.byteLength),'Content-Disposition':'inline'}});
  } catch { return Response.json({error:'Fichier momentanément indisponible. Réessayez.'},{status:503,headers:{'Cache-Control':'no-store'}}); }
}
