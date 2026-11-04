import {registerHooks,createRequire} from 'node:module';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,existsSync,readdirSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {drizzle} from 'drizzle-orm/d1';
import ts from 'typescript';
const root=fileURLToPath(new URL('../../',import.meta.url)),prefix=pathToFileURL(root).href;
export const runtime={user:{userId:'test-user',email:'owner@example.test',fullName:null},isOwner:true,isPro:false,adminSession:false,realSubscription:false,config:{}};
globalThis.__yombalTestRuntime=runtime;
const overrides={
 'db/index.ts':'export const getDb=()=>globalThis.__yombalTestRuntime.db;',
 'app/auth.ts':'export const getCurrentUser=async()=>globalThis.__yombalTestRuntime.user;',
 'lib/development-admin.ts':'export const isDevelopmentAdmin=async()=>globalThis.__yombalTestRuntime.isOwner;',
 'lib/admin-access.ts':"export const adminCookie='__Host-yombal-admin';export const adminConfig=()=>globalThis.__yombalTestRuntime.config;export const hasAdminAccess=async()=>globalThis.__yombalTestRuntime.isOwner&&globalThis.__yombalTestRuntime.adminSession;",
 'lib/spaces.ts':"export const getWorkspace=async(user,space)=>{if(space&&space!=='default')throw Error('Espace inaccessible.');return {spaceId:'default',row:{data:JSON.stringify(globalThis.__yombalTestRuntime.state)}};};",
 'lib/subscription-server.ts':"export const subscriptionFor=async()=>({isPro:globalThis.__yombalTestRuntime.isPro});",
 'lib/server-document.ts':'export const serverDocument=async html=>html;'
};
registerHooks({resolve(spec,context,next){if(spec.startsWith('.')&&context.parentURL?.startsWith(prefix)&&!context.parentURL.includes('/node_modules/')&&!/\.[^/]+$/.test(spec)){const p=fileURLToPath(new URL(spec,context.parentURL));for(const ext of ['','.ts','.tsx','.js','.mjs','/index.ts'])if(existsSync(p+ext)&&/\.(ts|tsx|js|mjs)$/.test(p+ext))return next(pathToFileURL(p+ext).href,context);}return next(spec,context);},load(url,context,next){if(url.startsWith(prefix)&&!url.includes('/node_modules/')&&/\.tsx?$/.test(url)){const relative=fileURLToPath(url).slice(root.length);const s=(relative==='lib/subscription-server.ts'&&runtime.realSubscription?undefined:overrides[relative])??readFileSync(fileURLToPath(url),'utf8');return {format:'module',shortCircuit:true,source:ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText};}return next(url,context);}});
export function resetDb(){
 runtime.sqlite?.close();const db=new DatabaseSync(':memory:');
 for(const file of readdirSync(root+'drizzle').filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync(root+'drizzle/'+file,'utf8'));
 runtime.sqlite=db;
 function prepare(sql){const stmt=db.prepare(sql);let args=[];return {
  bind(...p){args=p;return this;},
  _all(){stmt.setReturnArrays(false);return {success:true,results:stmt.all(...args)};},
  async all(){return this._all();},
  async raw(){stmt.setReturnArrays(true);return stmt.all(...args);},
  async run(){return {success:true,meta:stmt.run(...args)};}
 };}
 async function batch(queries){db.exec('BEGIN');try{const results=queries.map(q=>q._all());db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}}
 runtime.db=drizzle({prepare,batch});runtime.user={userId:'test-user',email:'owner@example.test',fullName:null};runtime.isOwner=true;runtime.isPro=false;runtime.adminSession=false;return db;
}
export const request=(path,body,origin='https://yombal.example')=>new Request('https://yombal.example'+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
