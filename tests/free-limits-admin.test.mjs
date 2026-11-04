import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {pbkdf2Sync} from 'node:crypto';
const compile=s=>ts.transpileModule(s,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText;
const load=async file=>import('data:text/javascript;base64,'+Buffer.from(compile(readFileSync(new URL(file,import.meta.url),'utf8'))).toString('base64'));
const {freeLimitExceeded,freeLimits}=await load('../lib/free-limits.ts');
const {passwordDigest,sameValue,createAdminToken,verifyAdminToken,adminSessionSeconds}=await load('../lib/admin-crypto.ts');
const state=(properties=0,tenants=0,assets=0)=>({properties:Array.from({length:properties},(_,i)=>({id:'p'+i})),tenants:Array.from({length:tenants},(_,i)=>({id:'t'+i})),assets:Array.from({length:assets},(_,i)=>({id:'a'+i}))});
test('free plan allows six properties and seven tenants and gates further growth',()=>{assert.deepEqual(freeLimits,{properties:6,tenants:7,invoices:3});assert.equal(freeLimitExceeded(state(),state(6,7)),null);assert.equal(freeLimitExceeded(state(6),state(7)),'properties');assert.equal(freeLimitExceeded(state(0,7),state(0,8)),'tenants');assert.equal(freeLimitExceeded(state(0,0,6),state(0,0,7)),'properties');});
test('existing over-limit data can be edited, reduced or deleted without being locked',()=>{assert.equal(freeLimitExceeded(state(10,12),state(10,12)),null);assert.equal(freeLimitExceeded(state(10,12),state(8,9)),null);assert.equal(freeLimitExceeded(state(10,12),state(11,12)),'properties');assert.equal(freeLimitExceeded(state(10,12),state(10,13)),'tenants');});
test('PBKDF2 verifier matches independent Node implementation, salt and password matter',async()=>{const password='test-only-unusable-password',salt='test-only-salt';const d=await passwordDigest(password,salt);assert.equal(d,pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex'));assert.notEqual(d,await passwordDigest(password+'x',salt));assert.notEqual(d,await passwordDigest(password,salt+'x'));assert(sameValue(d,d));assert(!sameValue(d,'0'.repeat(64)));});
test('admin session signature is bound to owner, secret and expiry',async()=>{const at=Date.parse('2026-10-31T12:00:00Z'),secret='test-secret-never-configured';const token=await createAdminToken('owner-user',secret,at);assert(await verifyAdminToken(token,'owner-user',secret,at+1));assert(!await verifyAdminToken(token,'other-user',secret,at+1));assert(!await verifyAdminToken(token,'owner-user','other-secret',at+1));assert(!await verifyAdminToken(token,'owner-user',secret,at+adminSessionSeconds*1000));assert(!await verifyAdminToken(token.replace(/.$/,'x'),'owner-user',secret,at+1));assert(!await verifyAdminToken('malformed','owner-user',secret,at+1));});
// SQLite executes the actual quota predicate used by the Worker, with parallel calls sharing one DB.
const require=createRequire(import.meta.url);const {execFileSync}=require('node:child_process');
test('invoice exports reserve only three slots atomically; drafts and repeat exports do not consume extra slots',()=>{const script=`import sqlite3,concurrent.futures,tempfile,os
p=tempfile.mktemp(suffix='.sqlite');c=sqlite3.connect(p);c.execute('CREATE TABLE yombal_invoice_links(id TEXT PRIMARY KEY,user_id TEXT,publication TEXT NOT NULL DEFAULT \\'legacy\\')');c.executemany('INSERT INTO yombal_invoice_links VALUES(?,?,?)',[(str(i),'u','draft') for i in range(12)]);c.commit();c.close()
def release(i):
 c=sqlite3.connect(p,timeout=10);c.execute("UPDATE yombal_invoice_links SET publication='free' WHERE id=? AND user_id=? AND publication='draft' AND (SELECT count(*) FROM yombal_invoice_links WHERE user_id=? AND publication IN ('free','legacy'))<3",(str(i),'u','u'));c.commit();c.close()
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:list(pool.map(release,range(12)))
c=sqlite3.connect(p);assert c.execute("SELECT count(*) FROM yombal_invoice_links WHERE publication='free'").fetchone()[0]==3;assert c.execute("SELECT count(*) FROM yombal_invoice_links WHERE publication='draft'").fetchone()[0]==9
c.execute("INSERT INTO yombal_invoice_links VALUES('more','u','draft')");c.execute("INSERT INTO yombal_invoice_links VALUES('pro','u','pro')");c.commit();c.close();release(0);c=sqlite3.connect(p);assert c.execute("SELECT count(*) FROM yombal_invoice_links WHERE publication='free'").fetchone()[0]==3;c.close();os.unlink(p)`;assert.doesNotThrow(()=>execFileSync('python',['-c',script],{stdio:'pipe'}));});
