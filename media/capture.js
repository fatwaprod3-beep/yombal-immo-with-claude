const {chromium,devices}=require('playwright');const fs=require('fs');
fs.mkdirSync('captures',{recursive:true});const log=[];const L=(...a)=>{console.log(...a);log.push(a.join(' '));};
(async()=>{const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});await ctx.addInitScript(()=>{try{localStorage.setItem('yombal-tour-done','1');localStorage.setItem('yombal-video-done','1')}catch{}});
 const p=await ctx.newPage();p.on('pageerror',e=>L('PAGEERROR',e.message));
 let ok=false;for(let i=0;i<40&&!ok;i++){await p.goto('https://yombal-immo.pro/?demo=1#factures',{waitUntil:'networkidle'});await p.waitForTimeout(2500);
  try{await p.locator('.document-center-tabs button:has-text("Contrats")').click({timeout:4000});await p.waitForTimeout(800);await p.locator('button:has-text("Créer un contrat")').first().click({timeout:4000});await p.waitForTimeout(1000);ok=await p.locator('.contract-kind').count()>0;}catch(e){}
  if(!ok){L('waiting deploy',i);await p.waitForTimeout(15000);}}
 L('wizard',ok);await p.screenshot({path:'captures/c1-type.jpg',type:'jpeg',quality:85});
 await p.locator('.contract-kind').nth(0).click();
 const opts=await p.locator('.contract-wizard [role=combobox], .contract-wizard select, .contract-wizard button[aria-haspopup]').count();L('choice controls',opts);
 // Choisir la première location via le composant Choice
 const choice=p.locator('.contract-wizard .field').filter({hasText:'Locataire et logement'}).locator('button, select').first();
 const tag=await choice.evaluate(e=>e.tagName);L('choice tag',tag);
 if(tag==='SELECT'){const v=await choice.evaluate(e=>e.options[1].value);await choice.selectOption(v);}else{await choice.click();await p.waitForTimeout(400);await p.locator('[role=option]').nth(1).click();}
 await p.waitForTimeout(500);await p.screenshot({path:'captures/c2-lease.jpg',type:'jpeg',quality:85});
 await p.locator('.contract-wizard button:has-text("Continuer")').click();await p.waitForTimeout(800);
 await p.screenshot({path:'captures/c3-edit.jpg',type:'jpeg',quality:85});
 L('articles',await p.locator('.contract-articles li').count());
 const [pop]=await Promise.all([p.waitForEvent('popup'),p.locator('.contract-wizard button:has-text("Aperçu")').click()]);
 await pop.waitForTimeout(2500);await pop.setViewportSize({width:1000,height:1300});
 const html=await pop.content();fs.writeFileSync('captures/contract.html',html);L('unfilled tokens',(html.match(/\{\{[a-z_]+\}\}/g)||[]).join(','));
 await pop.screenshot({path:'captures/c4-preview.jpg',type:'jpeg',quality:85,fullPage:true});await pop.close();
 await p.locator('.contract-wizard button:has-text("Créer le contrat")').click();await p.waitForTimeout(2000);
 L('rows',await p.locator('tr:has-text("Projet à signer")').count());
 await p.screenshot({path:'captures/c5-list.jpg',type:'jpeg',quality:85});
 try{const [dl]=await Promise.all([p.waitForEvent('download',{timeout:30000}),p.locator('button:has-text("Envoyer")').first().click()]);const path='captures/contrat.pdf';await dl.saveAs(path);L('pdf',dl.suggestedFilename(),fs.statSync(path).size);}catch(e){L('pdf error',e.message.slice(0,200));}
 const m=await (await b.newContext({...devices['iPhone 13']})).newPage();await m.addInitScript(()=>{try{localStorage.setItem('yombal-tour-done','1');localStorage.setItem('yombal-video-done','1')}catch{}});
 await m.goto('https://yombal-immo.pro/?demo=1#factures',{waitUntil:'networkidle'});await m.waitForTimeout(2500);
 try{await m.locator('.document-center-tabs button:has-text("Contrats")').click();await m.waitForTimeout(700);await m.locator('button:has-text("Créer un contrat")').first().click();await m.waitForTimeout(900);await m.screenshot({path:'captures/m-c1.jpg',type:'jpeg',quality:85});}catch(e){L('mobile',e.message.slice(0,150));}
 fs.writeFileSync('captures/log.txt',log.join('\n'));await b.close();})();
