import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const bootstrap=readFileSync(new URL('../public/install-bootstrap.js',import.meta.url),'utf8');
const worker=readFileSync(new URL('../public/sw.js',import.meta.url),'utf8');
const source=ts.transpileModule(readFileSync(new URL('../lib/app-install.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const {installationDevice,chromeInstallUrl,inAppBrowser}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));

function browser({secure=true,topLevel=true}={}){
 const window=new EventTarget(),registrations=[];window.isSecureContext=secure;window.top=topLevel?window:{};
 const context=vm.createContext({window,document:{readyState:'loading'},navigator:{serviceWorker:{register:(...args)=>{registrations.push(args);return Promise.resolve();}}}});
 vm.runInContext(bootstrap,context);
 return {window,context,registrations};
}
test('install event captured before hydration stays available for the user click',()=>{
 const {window}=browser();const event=new Event('beforeinstallprompt',{cancelable:true});event.prompt=()=>{};
 window.dispatchEvent(event);assert.equal(event.defaultPrevented,true);assert.equal(window.yombalInstall.event,event);
});
test('a second bootstrap does not lose the pending prompt',()=>{
 const {window,context}=browser();const event=new Event('beforeinstallprompt');window.dispatchEvent(event);
 vm.runInContext(bootstrap,context);assert.equal(window.yombalInstall.event,event);
});
test('actual appinstalled event clears the one-use prompt',()=>{
 const {window}=browser();window.dispatchEvent(new Event('beforeinstallprompt'));window.dispatchEvent(new Event('appinstalled'));
 assert.equal(window.yombalInstall.event,null);assert.equal(window.yombalInstall.installed,true);
});
test('worker registration waits for load and refreshes the worker without stale cache',()=>{
 const {window,registrations}=browser();assert.equal(registrations.length,0);window.dispatchEvent(new Event('load'));window.dispatchEvent(new Event('load'));
 assert.equal(registrations.length,1);assert.equal(registrations[0][0],'/sw.js');assert.equal(registrations[0][1].updateViaCache,'none');
});
test('insecure previews and embedded frames do not register a worker',()=>{
 for(const config of [{secure:false},{topLevel:false}]){const {window,registrations}=browser(config);window.dispatchEvent(new Event('load'));assert.equal(registrations.length,0);}
});
function workerFetch(fetch){
 const handlers={};const self={location:{origin:'https://yombal.example'},addEventListener:(name,handler)=>handlers[name]=handler};
 vm.runInNewContext(worker,{self,fetch,URL,Response});
 return request=>{let response;handlers.fetch({request,respondWith:value=>response=value});return response;};
}
test('online navigation passes through the original request and response',async()=>{
 const response=new Response('private live page');const request={url:'https://yombal.example/',method:'GET',mode:'navigate',credentials:'include'};
 const handle=workerFetch(async actual=>{assert.equal(actual,request);return response;});assert.equal(await handle(request),response);
});
test('offline navigation returns a generic retry page without retaining private data',async()=>{
 const handle=workerFetch(async()=>{throw new TypeError('offline');});const response=await handle({url:'https://yombal.example/',method:'GET',mode:'navigate'});
 assert.equal(response.status,503);assert.equal(response.headers.get('cache-control'),'no-store');const html=await response.text();assert.match(html,/Retrouvons la connexion/);assert.match(html,/href="\/"/);
});
test('API, file, POST and external requests are not intercepted',()=>{
 const handle=workerFetch(()=>assert.fail('Unexpected network interception'));
 for(const request of [
  {url:'https://yombal.example/api/workspace',method:'GET',mode:'cors'},
  {url:'https://yombal.example/api/files?id=private',method:'GET',mode:'same-origin'},
  {url:'https://yombal.example/',method:'POST',mode:'navigate'},
  {url:'https://other.example/',method:'GET',mode:'navigate'}
 ])assert.equal(handle(request),undefined);
});
test('device instructions distinguish Android, iPhone, iPad desktop mode and desktop',()=>{
 assert.equal(installationDevice('Mozilla/5.0 (Linux; Android 14) Chrome/130'),'android');
 assert.equal(installationDevice('Mozilla/5.0 (iPhone; CPU iPhone OS 18) Safari/604'),'ios');
 assert.equal(installationDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari/605',5),'ios');
 assert.equal(installationDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari/605',0),'desktop');
});
test('Chrome handoff keeps only this site origin, without private query or fragment',()=>{
 const intent=chromeInstallUrl('https://user:password@yombal.example/private?token=secret#loyers');
 assert.ok(intent.startsWith('intent://yombal.example/?installer=1#Intent;scheme=https;package=com.android.chrome;'));
 assert.ok(intent.includes(encodeURIComponent('https://yombal.example/?installer=1')));assert.ok(!intent.includes('secret'));assert.ok(!intent.includes('private'));assert.ok(!intent.includes('password'));
 assert.throws(()=>chromeInstallUrl('javascript:alert(1)'));
});

test('in-app browsers (Facebook, Instagram) are detected, Chrome and Safari are not',()=>{
 assert.equal(inAppBrowser('Mozilla/5.0 (Linux; Android 13) [FB_IAB/FB4A;FBAV/450.0.0.0;]'),true);
 assert.equal(inAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Instagram 300.0.0.0'),true);
 assert.equal(inAppBrowser('Mozilla/5.0 (Linux; Android 13) Chrome/120.0 Mobile Safari/537.36'),false);
 assert.equal(inAppBrowser('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Version/17.0 Mobile/15E148 Safari/604.1'),false);
});
