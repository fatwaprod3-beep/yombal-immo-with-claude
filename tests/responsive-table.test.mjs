import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createElement as h} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ts from 'typescript';
const compiled=ts.transpileModule(readFileSync(new URL('../components/responsive-table.tsx',import.meta.url),'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX}}).outputText
  .replaceAll('"react/jsx-runtime"',JSON.stringify(import.meta.resolve('react/jsx-runtime')))
  .replaceAll("'react'",JSON.stringify(import.meta.resolve('react')));
const {default:ResponsiveTable}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
const render=(headers,rows)=>renderToStaticMarkup(h(ResponsiveTable,{label:'Loyers'},h('thead',null,h('tr',null,...headers)),h('tbody',null,...rows.map((cells,i)=>h('tr',{key:i},...cells)))));
test('mobile records retain table, row and column-header semantics',()=>{const html=render([h('th',null,'Locataire'),h('th',null,'Loyer')],[[h('td',null,'Aïda'),h('td',null,'125 000 F')]]);assert.match(html,/role="table" aria-label="Loyers"/);assert.equal((html.match(/role="columnheader" scope="col"/g)||[]).length,2);assert.equal((html.match(/role="cell"/g)||[]).length,2);assert.match(html,/data-label="Locataire">Aïda/);assert.match(html,/data-label="Loyer">125 000 F/);});
test('conditional columns keep labels aligned after hidden columns',()=>{const html=render([h('th',null,'Bien'),false,h('th',null,'Solde')],[[h('td',null,'Maison Teranga'),false,h('td',null,'0 F')]]);assert.match(html,/data-label="Solde">0 F/);assert.equal((html.match(/data-label=/g)||[]).length,2);});
test('empty action headers produce a usable mobile action area',()=>{const html=render([h('th',null,'Locataire'),h('th')],[[h('td',null,'Samba'),h('td',null,h('button',{type:'button'},'Encaisser'))]]);assert.match(html,/data-label="Actions"><button type="button">Encaisser/);});
test('nested header text labels every row without losing statuses or controls',()=>{const html=render([h('th',null,h('span',null,'Date'),h('span',null,'de paiement')),h('th',null,'État')],[[h('td',null,'19 octobre'),h('td',null,h('span',{className:'badge'},'Payé'))],[h('td',null,'20 octobre'),h('td',null,h('button',null,'Ouvrir'))]]);assert.equal((html.match(/data-label="Date de paiement"/g)||[]).length,2);assert.match(html,/class="badge">Payé/);assert.match(html,/<button>Ouvrir/);});
test('names and zero balances remain escaped and visible in mobile records',()=>{const html=render([h('th',null,'Nom'),h('th',null,'Solde')],[[h('td',null,'<script>nom</script>'),h('td',null,0)]]);assert.match(html,/&lt;script&gt;nom&lt;\/script&gt;/);assert.match(html,/data-label="Solde">0/);assert.ok(!html.includes('<script>'));});
