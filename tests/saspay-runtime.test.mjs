import test,{after,before} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,realpathSync} from 'node:fs';
import ts from 'typescript';
import {fileURLToPath} from 'node:url';
// Exercise the real module in workerd, not Node's more permissive fetch.
const require=createRequire(realpathSync(new URL('../node_modules/wrangler/package.json',import.meta.url)));
const {Miniflare}=require('miniflare');
const compile=path=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const fixtureKey='sk_live_UNIT_TEST_NOT_A_REAL_PROVIDER_SECRET';
const moduleRoot=fileURLToPath(new URL('../.sites-runtime/',import.meta.url));
let mf,status=200,body,requests;
before(()=>{
 mf=new Miniflare({compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],modulesRoot:moduleRoot,modules:[
  {type:'ESModule',path:moduleRoot+'connection-worker.mjs',contents:compile('../lib/saspay.ts')+`\nexport default {async fetch(){try{await checkSasPayKey('${fixtureKey}');return Response.json({connected:true});}catch(e){return Response.json({connected:false,code:e.code,httpStatus:e.httpStatus,message:e.message});}}}`},
  {type:'ESModule',path:moduleRoot+'billing',contents:compile('../lib/billing.ts')},
 ],outboundService:async request=>{
  requests.push({url:request.url,key:request.headers.get('Authorization'),method:request.method});
  if(status>=300&&status<400)return new Response(null,{status,headers:{Location:'https://untrusted.example/key-leak'}});
  return new Response(typeof body==='string'?body:JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
 }});
});
after(async()=>{await mf?.dispose();});
async function run(nextStatus=200,nextBody={success:true,data:{count:0,results:[]},code:200}){status=nextStatus;body=nextBody;requests=[];return (await mf.dispatchFetch('https://unit.test/connect')).json();}
test('the actual Workers fetch reaches SasPay with supported options and validates an empty account',async()=>{assert.deepEqual(await run(),{connected:true});assert.equal(requests.length,1);assert.equal(requests[0].url,'https://api.saspay.me/api/v1/checkout-sessions/');assert.equal(requests[0].key,'Bearer '+fixtureKey);assert.equal(requests[0].method,'GET');});
test('Workers rejects a provider redirect without forwarding the secret to its destination',async()=>{const result=await run(302);assert.equal(result.connected,false);assert.equal(result.code,'redirect');assert.equal(requests.length,1);assert.equal(new URL(requests[0].url).hostname,'api.saspay.me');});
test('upstream 401, 403 and 429 are distinct without exposing a provider error body',async()=>{for(const [status,code] of [[401,'authentication'],[403,'forbidden'],[429,'rate_limit'],[500,'upstream']]){const result=await run(status,{error:'private upstream '+fixtureKey});assert.equal(result.code,code);assert.equal(result.httpStatus,status);assert(!JSON.stringify(result).includes(fixtureKey));}});
test('malformed successful responses do not validate a key or leak response content',async()=>{for(const body of ['<html>private upstream '+fixtureKey+'</html>',{unexpected:'private '+fixtureKey}]){const result=await run(200,body);assert.equal(result.connected,false);assert.equal(result.code,'invalid_response');assert(!JSON.stringify(result).includes(fixtureKey));}});
test('both documented response envelopes work on the Workers runtime',async()=>{for(const payload of [{count:0,results:[]},{success:true,data:[],code:200},[]])assert.deepEqual(await run(200,payload),{connected:true});});
