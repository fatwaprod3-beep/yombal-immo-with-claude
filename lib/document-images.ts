/** Embed private images so PDF windows and opaque iframes need no cookies or relative URLs. */
export async function embedPrivateImages(html:string,resolve:(url:string)=>Promise<string>){
 const urls=[...new Set(Array.from(html.matchAll(/src="(\/api\/files\?key=[A-Za-z0-9%_.-]+)"/g),m=>m[1]))];
 const images=await Promise.all(urls.map(async url=>{const data=await resolve(url);if(!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data))throw new Error('Le logo ne peut pas être intégré.');return [url,data] as const;}));
 for(const [url,data] of images)html=html.split('src="'+url+'"').join('src="'+data+'"');
 return html;
}
