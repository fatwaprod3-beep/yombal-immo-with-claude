import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';

// Exercise history entries and effect cleanup without a browser dependency.
const encode=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64');
const react=encode('export const cleanups=[];export const useRef=v=>({current:v});export const useEffect=fn=>{cleanups.push(fn());};');
const {cleanups}=await import(react);
const source=ts.transpileModule(readFileSync(new URL('../components/use-overlay-history.ts',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replace("'react'",JSON.stringify(react));
const {useOverlayHistory,liveOverlay}=await import(encode(source));
function browser(mobile=true){
 const events=new EventTarget(),entries=[{state:{yombalDepth:1},url:'/#biens'}];let at=0;
 const history={get state(){return entries[at].state;},get url(){return entries[at].url;},get index(){return at;},pushState(state,unused,url){entries.splice(at+1);entries.push({state,url:url||entries[at].url});at++;},replaceState(state,unused,url){entries[at]={state,url:url||entries[at].url};},back(){queueMicrotask(()=>{if(at>0){at--;events.dispatchEvent(new Event('popstate'));}});}};
 globalThis.window={history,matchMedia:()=>({matches:mobile}),addEventListener:events.addEventListener.bind(events),removeEventListener:events.removeEventListener.bind(events)};
 return history;
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function mount(id,onClose=()=>{}){useOverlayHistory(true,id,onClose);return cleanups.pop();}

test('mobile Back closes a dialog and preserves its underlying page',async()=>{
 const history=browser();let closed=0,dispose;
 dispose=mount('property',()=>{closed++;dispose();});
 assert.equal(history.state.yombalOverlay,'property');
 history.back();await settle();
 assert.equal(closed,1);assert.equal(history.url,'/#biens');assert.equal(history.index,0);assert.equal(liveOverlay('property'),false);
});
test('Back closes a child dialog before the parent',async()=>{
 const history=browser();let parentClosed=0,childClosed=0,parent,child;
 parent=mount('parent',()=>{parentClosed++;parent();});child=mount('child',()=>{childClosed++;child();});
 history.back();await settle();
 assert.equal(childClosed,1);assert.equal(parentClosed,0);assert.equal(history.state.yombalOverlay,'parent');
 history.back();await settle();assert.equal(parentClosed,1);assert.equal(history.index,0);
});
test('replacing a wizard with its preview does not close the new preview',async()=>{
 const history=browser();const wizard=mount('wizard');wizard();
 const preview=mount('preview');await settle();
 assert.equal(history.index,1);assert.equal(history.state.yombalOverlay,'preview');assert.equal(liveOverlay('preview'),true);
 preview();await settle();assert.equal(history.index,0);
});
test('navigation from a dialog stays on the selected page after cleanup',async()=>{
 const history=browser();const dialog=mount('profile');
 history.replaceState({yombalDepth:2},'', '/#parametres');dialog();await settle();
 assert.equal(history.url,'/#parametres');assert.equal(history.index,1);assert.equal(history.state.yombalOverlay,undefined);
});
test('closing an ordinary dialog removes its extra history entry',async()=>{
 const history=browser();const dispose=mount('receipt');dispose();await settle();assert.equal(history.index,0);
});
test('desktop dialogs do not add mobile history entries',async()=>{
 const history=browser(false);const dispose=mount('desktop');assert.equal(history.index,0);dispose();await settle();assert.equal(history.index,0);
});
