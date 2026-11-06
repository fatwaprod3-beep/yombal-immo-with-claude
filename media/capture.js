const {chromium,devices}=require('playwright');const fs=require('fs');
const B='https://yombal-immo.pro';fs.mkdirSync('captures',{recursive:true});
(async()=>{const b=await chromium.launch();
 const prep=async ctx=>{await ctx.addInitScript(()=>{try{localStorage.setItem('yombal-tour-done','1')}catch{}});};
 const dctx=await b.newContext({viewport:{width:1600,height:900},deviceScaleFactor:1.5});await prep(dctx);const d=await dctx.newPage();
 const shot=async(p,name,full=false)=>{await p.screenshot({path:'captures/'+name+'.jpg',type:'jpeg',quality:90,fullPage:full});console.log(name);};
 await d.goto(B+'/',{waitUntil:'networkidle'});await d.waitForTimeout(2500);await shot(d,'d-landing');await shot(d,'d-landing-full',true);
 for(const pg of ['accueil','locataires','loyers','rapports','documents','agenda','biens']){
  await d.goto(B+'/?demo=1#'+pg,{waitUntil:'networkidle'});await d.waitForTimeout(3000);await shot(d,'d-'+pg);if(pg==='accueil'||pg==='rapports')await shot(d,'d-'+pg+'-full',true);}
 try{await d.goto(B+'/?demo=1#loyers',{waitUntil:'networkidle'});await d.waitForTimeout(2500);await d.locator('button:has-text("Encaisser")').first().click();await d.waitForTimeout(1200);await shot(d,'d-encaisser');}catch(e){console.log('enc',e.message)}
 const mctx=await b.newContext({...devices['iPhone 13']});await prep(mctx);const m=await mctx.newPage();
 for(const pg of ['accueil','loyers','locataires','rapports']){await m.goto(B+'/?demo=1#'+pg,{waitUntil:'networkidle'});await m.waitForTimeout(3000);await shot(m,'m-'+pg);}
 await b.close();})();
