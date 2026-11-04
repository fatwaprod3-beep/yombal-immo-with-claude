import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {runtime,resetDb,request} from './helpers/server-runtime.mjs';
runtime.realSubscription=true;
const {GET,POST}=await import('../app/api/subscription/route.ts');
const {plans}=await import('../lib/billing.ts');
const originalFetch=globalThis.fetch;
afterEach(()=>{globalThis.fetch=originalFetch;});
function setup(){resetDb();runtime.config={secret:'test-encryption-material-not-a-production-secret'};}
test('the three merchant links and XOF tariffs remain recorded correctly',()=>{assert.deepEqual(plans.map(p=>[p.id,p.price,p.months,p.currency,p.checkoutUrl]),[['monthly',4900,1,'XOF','https://link.saspay.me/rq9ukd8p6j4'],['quarterly',9900,3,'XOF','https://link.saspay.me/b5mk93gecf0'],['annual',25000,12,'XOF','https://link.saspay.me/jeultha48me']]);});
test('payments fail closed until the owner connects SasPay instead of issuing an unbound shared link',async()=>{setup();let called=false;globalThis.fetch=async()=>{called=true;throw Error('should not call');};const r=await POST(request('/api/subscription',{planId:'monthly'}));assert.equal(r.status,503);assert.equal((await r.json()).checkoutUrl,undefined);assert.equal(called,false);assert.equal(runtime.sqlite.prepare('SELECT count(*) n FROM yombal_subscription_requests').get().n,0);});
test('unauthenticated and cross-origin checkout requests cannot create orders',async()=>{setup();runtime.user=null;assert.equal((await POST(request('/api/subscription',{planId:'monthly'}))).status,401);assert.equal((await GET()).status,401);runtime.user={userId:'test-user',email:'owner@example.test',fullName:null};assert.equal((await POST(request('/api/subscription',{planId:'monthly'},'https://attacker.example'))).status,403);assert.equal(runtime.sqlite.prepare('SELECT count(*) n FROM yombal_billing_checkouts').get().n,0);});
test('unknown plans, malformed JSON and old administrator unlock commands never grant access',async()=>{setup();assert.equal((await POST(request('/api/subscription',{planId:'unknown'}))).status,400);assert.equal((await POST(request('/api/subscription',{action:'admin_unlock'}))).status,403);const malformed=new Request('https://yombal.example/api/subscription',{method:'POST',headers:{Origin:'https://yombal.example'},body:'{'});assert.equal((await POST(malformed)).status,503);assert.equal(runtime.sqlite.prepare('SELECT count(*) n FROM yombal_subscriptions').get().n,0);});
test('without configuration subscription refresh remains read-only and does not unlock access',async()=>{setup();const r=await GET(new Request('https://yombal.example/api/subscription?paid=true&isPro=true'));assert.equal(r.status,200);const data=await r.json();assert.equal(data.subscription.isPro,false);assert.equal(data.payment.state,'idle');});
